/**
 * Orders on the Cloudflare Worker (workers/api/src/orders.ts): the Stripe
 * webhook that saves paid orders, the customer's order lookup, and the one-off
 * copy of past orders from Stripe.
 *
 * Runs against a real SQLite database built from the Worker's migrations
 * (src/test/d1.ts), so the SQL is tested, not mocked.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker, { type Env } from "../../../workers/api/src/index";
import { orderFromSession, type StripeSession } from "../../../workers/api/src/orders";
import { signStripePayload, verifyStripeSignature } from "../../../workers/api/src/stripe";
import { orderConfirmationEmail } from "../../../workers/api/src/emails";
import { testD1 } from "@/test/d1";

const WHSEC = "whsec_test_secret";

type Sent = { url: string; body: unknown };

/** Stubs fetch: Stripe shipping rates and sessions, Resend, Klaviyo. Records what went out. */
function stubOutside(stripeSessions: StripeSession[] = [], hasMore = false) {
  const sent: Sent[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string, init: RequestInit = {}) => {
      const url = String(input);
      const body = typeof init.body === "string" && init.body.startsWith("{") ? JSON.parse(init.body) : init.body;
      sent.push({ url, body });
      if (url.startsWith("https://api.stripe.com/v1/shipping_rates/")) {
        return Response.json({ id: "shr_1", display_name: "Free pickup - Uppsala Mosque" });
      }
      if (url.startsWith("https://api.stripe.com/v1/checkout/sessions")) {
        return Response.json({ data: stripeSessions, has_more: hasMore });
      }
      return Response.json({ id: "ok" });
    }),
  );
  return sent;
}

function makeEnv(overrides: Partial<Env> = {}) {
  const db = testD1();
  const env = {
    DB: db,
    ALLOWED_ORIGINS: "https://www.pureihram.com",
    KLAVIYO_COMPANY_ID: "TGazgN",
    KLAVIYO_PREP_PACK_LIST_ID: "",
    RESEND_API_KEY: "re_test",
    STRIPE_SECRET_KEY: "sk_test_123",
    STRIPE_WEBHOOK_SECRET: WHSEC,
    ...overrides,
  } as Env;
  return { env, db };
}

/** A paid shop checkout, as Stripe sends it. */
function paidSession(overrides: Partial<StripeSession> = {}): StripeSession {
  return {
    id: `cs_live_${Math.random().toString(36).slice(2)}`,
    created: Math.floor(Date.now() / 1000),
    payment_status: "paid",
    payment_intent: "pi_123",
    amount_total: 4600,
    amount_subtotal: 3700,
    currency: "eur",
    customer_details: { email: "amina@example.com", name: "Amina Y", phone: "+46700000000", address: { country: "SE" } },
    collected_information: {
      shipping_details: {
        name: "Amina <b>Y</b>",
        address: { line1: "Storgatan 1", city: "Uppsala", postal_code: "75220", country: "SE" },
      },
    },
    shipping_cost: { amount_total: 900, shipping_rate: "shr_delivery" },
    metadata: {
      items: JSON.stringify([{ id: "36acffbc-41ea-4512-8621-174cd8d9b00c", quantity: 2 }]),
      total_quantity: "2",
      bundle_type: "2-pack",
      donation_amount: "0",
    },
    ...overrides,
  };
}

async function webhook(env: Env, session: StripeSession, type = "checkout.session.completed", eventId = `evt_${Math.random()}`) {
  const payload = JSON.stringify({ id: eventId, type, data: { object: session } });
  const signature = await signStripePayload(payload, WHSEC, Math.floor(Date.now() / 1000));
  return worker.fetch(
    new Request("https://pureihram-api.example/stripe-webhook", {
      method: "POST",
      headers: { "Stripe-Signature": signature, "Content-Type": "application/json" },
      body: payload,
    }),
    env,
  );
}

const orders = (db: ReturnType<typeof testD1>) => db.raw.prepare("SELECT * FROM orders ORDER BY created_at").all();

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("verifyStripeSignature", () => {
  const now = 1_800_000_000;
  it("accepts Stripe's signature over the exact body", async () => {
    const header = await signStripePayload('{"a":1}', WHSEC, now);
    expect(await verifyStripeSignature('{"a":1}', header, WHSEC, now)).toBe(true);
  });
  it("rejects an edited body, another secret, an old timestamp and no header", async () => {
    const header = await signStripePayload('{"a":1}', WHSEC, now);
    expect(await verifyStripeSignature('{"a":2}', header, WHSEC, now)).toBe(false);
    expect(await verifyStripeSignature('{"a":1}', header, "whsec_other", now)).toBe(false);
    expect(await verifyStripeSignature('{"a":1}', header, WHSEC, now + 301)).toBe(false);
    expect(await verifyStripeSignature('{"a":1}', null, WHSEC, now)).toBe(false);
  });
});

describe("POST /stripe-webhook", () => {
  it("waits (503) until the signing secret is set, so Stripe keeps the event", async () => {
    stubOutside();
    const { env } = makeEnv({ STRIPE_WEBHOOK_SECRET: undefined });
    expect((await webhook(env, paidSession())).status).toBe(503);
  });

  it("refuses an unsigned or forged request and saves nothing", async () => {
    stubOutside();
    const { env, db } = makeEnv();
    const response = await worker.fetch(
      new Request("https://pureihram-api.example/stripe-webhook", {
        method: "POST",
        headers: { "Stripe-Signature": "t=1,v1=deadbeef" },
        body: JSON.stringify({ id: "evt_x", type: "checkout.session.completed", data: { object: paidSession() } }),
      }),
      env,
    );
    expect(response.status).toBe(400);
    expect(orders(db)).toHaveLength(0);
  });

  it("saves a paid order with what Stripe charged, and emails the customer and the shop", async () => {
    const sent = stubOutside();
    const { env, db } = makeEnv();
    const response = await webhook(env, paidSession());
    expect(response.status).toBe(200);

    const [order] = orders(db);
    expect(order).toMatchObject({
      status: "paid",
      quantity: 2,
      total_amount: 46,
      goods_amount: 37,
      base_shipping_fee_eur: 9,
      delivery_method: "shipping",
      guest_email: "amina@example.com",
      customer_phone: "+46700000000",
      shipping_country: "SE",
      source: "webhook",
    });
    expect(String(order.order_number)).toMatch(/^ORD-\d+-[0-9A-F]{8}$/);
    expect(JSON.parse(String(order.shipping_address))).toMatchObject({ city: "Uppsala", country: "SE" });

    const emails = sent.filter((s) => s.url === "https://api.resend.com/emails").map((s) => s.body as { to: string[]; html: string });
    expect(emails.map((e) => e.to[0]).sort()).toEqual(["amina@example.com", "pureihraam@gmail.com"]);
    // A name typed at Stripe never reaches the markup unescaped.
    expect(emails.every((e) => !e.html.includes("<b>Y</b>"))).toBe(true);
    expect(sent.some((s) => s.url.startsWith("https://a.klaviyo.com/client/events"))).toBe(true);
  });

  it("puts an order outside Sweden up for delivery review", async () => {
    stubOutside();
    const { env, db } = makeEnv();
    await webhook(
      env,
      paidSession({
        collected_information: { shipping_details: { name: "Ola", address: { line1: "Gate 1", city: "Oslo", country: "NO" } } },
      }),
    );
    expect(orders(db)[0].status).toBe("paid_pending_shipping_review");
  });

  it("records a free mosque pickup by the option the customer chose", async () => {
    stubOutside();
    const { env, db } = makeEnv();
    await webhook(env, paidSession({ amount_total: 3700, shipping_cost: { amount_total: 0, shipping_rate: "shr_pickup" } }));
    expect(orders(db)[0]).toMatchObject({
      delivery_method: "pickup",
      pickup_location: "Free pickup - Uppsala Mosque",
      base_shipping_fee_eur: 0,
      total_amount: 37,
      status: "paid",
    });
  });

  it("saves an order once, however often Stripe sends it", async () => {
    stubOutside();
    const { env, db } = makeEnv();
    const session = paidSession();
    await webhook(env, session, "checkout.session.completed", "evt_1");
    expect(await (await webhook(env, session, "checkout.session.completed", "evt_1")).json()).toMatchObject({ duplicate: true });
    await webhook(env, session, "checkout.session.async_payment_succeeded", "evt_2");
    expect(orders(db)).toHaveLength(1);
  });

  it("waits for the money on a delayed payment, then saves the order", async () => {
    stubOutside();
    const { env, db } = makeEnv();
    const session = paidSession({ payment_status: "unpaid" });
    await webhook(env, session);
    expect(orders(db)).toHaveLength(0);
    await webhook(env, { ...session, payment_status: "paid" }, "checkout.session.async_payment_succeeded");
    expect(orders(db)).toHaveLength(1);
  });

  it("does not make an order of a donation or of something else on the Stripe account", async () => {
    stubOutside();
    const { env, db } = makeEnv();
    await webhook(env, paidSession({ metadata: { standalone_donation: "true", donation_amount: "10" } }));
    await webhook(env, paidSession({ metadata: {} }));
    expect(orders(db)).toHaveLength(0);
  });

  it("marks an order ready to ship when its extra delivery charge is paid", async () => {
    stubOutside();
    const { env, db } = makeEnv();
    await webhook(env, paidSession({ collected_information: { shipping_details: { address: { country: "DE" } } } }));
    const [order] = orders(db);
    await webhook(env, paidSession({ metadata: { payment_type: "extra_shipping", order_id: String(order.id) } }));
    expect(orders(db)[0]).toMatchObject({ status: "ready_to_ship", extra_shipping_status: "paid" });
  });

  it("counts stock down only once a count exists, and warns when it runs low", async () => {
    const sent = stubOutside();
    const { env, db } = makeEnv();
    await webhook(env, paidSession());
    expect(db.raw.prepare("SELECT COUNT(*) AS n FROM stock_movements").get()).toEqual({ n: 0 });

    db.raw.exec("INSERT INTO inventory (product_key, stock_on_hand, low_stock_threshold) VALUES ('ihram_set', 21, 20)");
    await webhook(env, paidSession());
    expect(db.raw.prepare("SELECT stock_on_hand FROM inventory").get()).toEqual({ stock_on_hand: 19 });
    expect(db.raw.prepare("SELECT delta, reason FROM stock_movements").get()).toEqual({ delta: -2, reason: "order_paid" });
    const subjects = sent.filter((s) => s.url === "https://api.resend.com/emails").map((s) => (s.body as { subject: string }).subject);
    expect(subjects).toContain("Low stock: 19 Ihram sets left");
  });
});

describe("POST /order-lookup", () => {
  async function lookup(env: Env, body: unknown) {
    return worker.fetch(
      new Request("https://pureihram-api.example/order-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "https://www.pureihram.com" },
        body: JSON.stringify(body),
      }),
      env,
    );
  }

  it("opens an order with its number and token, and shows no email or street", async () => {
    stubOutside();
    const { env, db } = makeEnv();
    await webhook(env, paidSession());
    const [order] = orders(db);
    const response = await lookup(env, { orderNumber: order.order_number, lookupToken: order.lookup_token });
    expect(response.status).toBe(200);
    const { order: shown } = (await response.json()) as { order: Record<string, unknown> };
    expect(shown).toMatchObject({ order_number: order.order_number, status: "paid", total_amount: 46, shipping_region: "SE" });
    expect(JSON.stringify(shown)).not.toContain("amina@example.com");
    expect(JSON.stringify(shown)).not.toContain("Storgatan");
  });

  it("finds nothing with the wrong token, and refuses a malformed one", async () => {
    stubOutside();
    const { env, db } = makeEnv();
    await webhook(env, paidSession());
    const [order] = orders(db);
    expect((await lookup(env, { orderNumber: order.order_number, lookupToken: crypto.randomUUID() })).status).toBe(404);
    expect((await lookup(env, { orderNumber: order.order_number, lookupToken: "guess" })).status).toBe(400);
  });
});

describe("POST /import/stripe-orders", () => {
  function importRequest(token?: string, startingAfter?: string) {
    const url = `https://pureihram-api.example/import/stripe-orders${startingAfter ? `?starting_after=${startingAfter}` : ""}`;
    return new Request(url, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {} });
  }

  it("does not exist unless the import token is set and given", async () => {
    stubOutside();
    expect((await worker.fetch(importRequest("t"), makeEnv().env)).status).toBe(404);
    expect((await worker.fetch(importRequest("wrong"), makeEnv({ IMPORT_TOKEN: "t" }).env)).status).toBe(404);
  });

  it("copies paid shop orders, skips the rest, and answers with counts only", async () => {
    const day = 86_400;
    const old = paidSession({ created: Math.floor(Date.now() / 1000) - 60 * day });
    const recent = paidSession({ created: Math.floor(Date.now() / 1000) - 3 * day });
    const donation = paidSession({ metadata: { standalone_donation: "true" } });
    const unpaid = paidSession({ payment_status: "unpaid" });
    const sent = stubOutside([old, recent, donation, unpaid], true);
    const { env, db } = makeEnv({ IMPORT_TOKEN: "t" });

    const response = await worker.fetch(importRequest("t"), env);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body).toMatchObject({ seen: 4, imported: 2, not_an_order: 1, not_paid: 1, as_shipped: 1, as_paid: 1, next: unpaid.id });
    expect(JSON.stringify(body)).not.toContain("amina");

    const rows = orders(db);
    expect(rows.map((r) => r.status)).toEqual(["shipped", "paid"]);
    expect(rows.every((r) => r.source === "stripe_import")).toBe(true);
    // No email goes to anyone for an imported order.
    expect(sent.some((s) => s.url.includes("resend.com"))).toBe(false);

    // Running it again copies nothing twice.
    const again = (await (await worker.fetch(importRequest("t"), env)).json()) as Record<string, unknown>;
    expect(again).toMatchObject({ imported: 0, already_there: 2 });
  });
});

describe("the order confirmation email", () => {
  const order = orderFromSession(paidSession());

  it("says only what the shop does, and greets every customer correctly", () => {
    const { html, subject, reply_to } = orderConfirmationEmail(order);
    expect(subject).toBe(`Your Pure Ihram order ${order.order_number}`);
    expect(reply_to).toBe("pureihraam@gmail.com");
    for (const never of ["tracking", "pre-washed", "Premium", "fast", "free returns", "feeki", "sacred garment"]) {
      expect(html.toLowerCase()).not.toContain(never.toLowerCase());
    }
    expect(html).toContain("guest-order-lookup?order=");
    expect(html).toContain("€46.00");
  });

  it("names the pickup point instead of an address for a mosque pickup", () => {
    const pickup = orderFromSession(paidSession({ shipping_cost: { amount_total: 0, shipping_rate: { display_name: "Free pickup - Stockholm Mosque" } } }));
    const { html } = orderConfirmationEmail(pickup);
    expect(html).toContain("Free pickup - Stockholm Mosque");
    expect(html).not.toContain("Storgatan");
  });
});
