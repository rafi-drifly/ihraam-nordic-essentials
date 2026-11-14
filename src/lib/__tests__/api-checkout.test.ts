/**
 * Checkout on the Cloudflare Worker (workers/api/src/checkout.ts).
 *
 * Moved off Supabase in Nov 2026, when the paused project left the shop unable
 * to sell. These tests hold the Worker to what the Supabase create-checkout
 * function did: the price comes from the quantity and never from the browser,
 * delivery is €9 or free mosque pickup, and the metadata keys the order alert
 * Worker reads are unchanged.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import worker, { type Env } from "../../../workers/api/src/index";
import {
  buildSessionParams,
  parseCheckout,
  returnOrigin,
  toStripeForm,
  type CheckoutInput,
} from "../../../workers/api/src/checkout";
import { PRODUCT } from "../product";

const ORIGINS = "https://www.pureihram.com,https://pureihram.com";

function makeEnv(overrides: Partial<Env> = {}) {
  return {
    DB: {} as Env["DB"],
    ALLOWED_ORIGINS: ORIGINS,
    KLAVIYO_COMPANY_ID: "TGazgN",
    KLAVIYO_PREP_PACK_LIST_ID: "",
    STRIPE_SECRET_KEY: "sk_test_123",
    ...overrides,
  } as Env;
}

function post(body: unknown, origin = "https://www.pureihram.com") {
  return new Request("https://pureihram-api.example/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });
}

const basket = (quantity: number, extra: Record<string, unknown> = {}) => ({
  items: [{ id: PRODUCT.id, quantity }],
  locale: "en",
  ...extra,
});

function input(quantity: number, extra: Partial<CheckoutInput> = {}): CheckoutInput {
  const parsed = parseCheckout(basket(quantity));
  if ("error" in parsed) throw new Error(parsed.error);
  return { ...parsed.value, ...extra };
}

/** Stubs fetch so Stripe answers with `reply`, and records what was sent. */
function stubStripe(reply: { status: number; body: unknown }) {
  const calls: { url: string; init: RequestInit }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify(reply.body), { status: reply.status });
    }),
  );
  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parseCheckout", () => {
  it("accepts a basket and keeps only the language part of the locale", () => {
    const parsed = parseCheckout(basket(2, { locale: "sv-SE" }));
    expect(parsed.ok && parsed.value.lang).toBe("sv");
  });

  it("keeps the Supabase function's rules", () => {
    expect(parseCheckout({ items: [] })).toEqual({ ok: false, error: "Invalid items" });
    expect(parseCheckout({ items: [{ id: "", quantity: 1 }] })).toEqual({ ok: false, error: "Invalid item id" });
    expect(parseCheckout({ items: [{ id: "x", quantity: 0 }] })).toEqual({ ok: false, error: "Invalid item quantity" });
    expect(parseCheckout({ items: [{ id: "x", quantity: 51 }] }).ok).toBe(false);
    expect(parseCheckout(basket(1, { donation: -1 })).ok).toBe(false);
    expect(parseCheckout(basket(1, { locale: "english" })).ok).toBe(false);
    expect(parseCheckout(basket(1, { shippingCountry: "se" })).ok).toBe(false);
    expect(parseCheckout(basket(1, { pickupLocation: "gothenburg" })).ok).toBe(false);
  });

  it("accepts a SKU as the id: the price never depends on it", () => {
    expect(parseCheckout({ items: [{ id: "IHRAM-2", quantity: 2 }] }).ok).toBe(true);
  });

  it("never lets the cancel address leave the site", () => {
    const parsed = parseCheckout(basket(1, { cancelPath: "https://evil.example/" }));
    expect(parsed.ok && parsed.value.cancelPath).toBe("/cart");
    const shop = parseCheckout(basket(1, { cancelPath: "/sv/shop" }));
    expect(shop.ok && shop.value.cancelPath).toBe("/sv/shop");
  });
});

type LineItem = { price_data: { unit_amount: number }; quantity: number };
type ShippingOption = { shipping_rate_data: { display_name: string; fixed_amount: { amount: number } } };

describe("buildSessionParams", () => {
  const items = (p: Record<string, unknown>) => p.line_items as LineItem[];

  it.each([
    [1, 1900],
    [2, 3700],
    [3, 5500],
  ])("charges the bundle price for %i set(s), from the shared price list", (qty, cents) => {
    const params = buildSessionParams(input(qty), "https://www.pureihram.com");
    expect(items(params)[0].price_data.unit_amount).toBe(cents);
    expect(items(params)[0].quantity).toBe(1);
  });

  it("ignores a price the browser sends", () => {
    const params = buildSessionParams(input(2, { bundlePrice: 1 }), "https://www.pureihram.com");
    expect(items(params)[0].price_data.unit_amount).toBe(3700);
  });

  it("offers €9 delivery or free pickup at either mosque", () => {
    const params = buildSessionParams(input(1), "https://www.pureihram.com");
    const options = (params.shipping_options as ShippingOption[]).map((o) => [
      o.shipping_rate_data.display_name,
      o.shipping_rate_data.fixed_amount.amount,
    ]);
    expect(options).toEqual([
      ["Delivery to your address", 900],
      ["Free pickup - Uppsala Mosque", 0],
      ["Free pickup - Stockholm Mosque", 0],
    ]);
  });

  it("writes the metadata the order alert reads", () => {
    const meta = buildSessionParams(input(3), "https://www.pureihram.com").metadata as Record<string, string>;
    expect(meta.total_quantity).toBe("3");
    expect(meta.delivery_method).toBe("shipping");
    expect(meta.bundle_type).toBe("3-pack");
    expect(JSON.parse(meta.items)).toEqual([{ id: PRODUCT.id, quantity: 3 }]);
  });

  it("names the pack plainly, with no unverified claims on the Stripe page", () => {
    const text = JSON.stringify(buildSessionParams(input(2, { lang: "fr" }), "https://www.pureihram.com"));
    expect(text).toContain(`${PRODUCT.name} - Lot de 2`);
    for (const banned of ["Premium", "Best Value", "Most Popular", "qualité", "cotton"]) {
      expect(text).not.toContain(banned);
    }
  });

  it("returns the customer to the site they came from", () => {
    const params = buildSessionParams(input(1, { cancelPath: "/shop" }), "https://www.pureihram.com");
    expect(params.success_url).toBe("https://www.pureihram.com/order-success?session_id={CHECKOUT_SESSION_ID}");
    expect(params.cancel_url).toBe("https://www.pureihram.com/shop");
  });
});

describe("returnOrigin", () => {
  it("uses the request's origin only when it is the shop's own", () => {
    const env = { ALLOWED_ORIGINS: ORIGINS };
    expect(returnOrigin("https://pureihram.com", env)).toBe("https://pureihram.com");
    expect(returnOrigin("http://localhost:5178", env)).toBe("http://localhost:5178");
    expect(returnOrigin("https://evil.example", env)).toBe("https://www.pureihram.com");
    expect(returnOrigin(null, env)).toBe("https://www.pureihram.com");
  });
});

describe("toStripeForm", () => {
  it("encodes nested objects and arrays the way Stripe reads them", () => {
    const body = toStripeForm({
      mode: "payment",
      line_items: [{ price_data: { unit_amount: 3700 }, quantity: 1 }],
      payment_method_types: ["card", "klarna"],
      phone_number_collection: { enabled: true },
      skipped: undefined,
    });
    const pairs = decodeURIComponent(body).split("&");
    expect(pairs).toEqual([
      "mode=payment",
      "line_items[0][price_data][unit_amount]=3700",
      "line_items[0][quantity]=1",
      "payment_method_types[0]=card",
      "payment_method_types[1]=klarna",
      "phone_number_collection[enabled]=true",
    ]);
  });
});

describe("POST /checkout", () => {
  it("returns the Stripe page address", async () => {
    const calls = stubStripe({ status: 200, body: { id: "cs_test_1", url: "https://checkout.stripe.com/c/pay/cs_test_1" } });
    const response = await worker.fetch(post(basket(2)), makeEnv());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: "https://checkout.stripe.com/c/pay/cs_test_1" });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://api.stripe.com/v1/checkout/sessions");
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer sk_test_123");
    expect(headers["Stripe-Version"]).toBe("2025-08-27.basil");
    expect(decodeURIComponent(String(calls[0].init.body))).toContain("line_items[0][price_data][unit_amount]=3700");
  });

  it("answers under /api/ on www.pureihram.com too", async () => {
    stubStripe({ status: 200, body: { id: "cs_test_2", url: "https://checkout.stripe.com/c/pay/cs_test_2" } });
    const request = new Request("https://www.pureihram.com/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://www.pureihram.com" },
      body: JSON.stringify(basket(1)),
    });
    expect((await worker.fetch(request, makeEnv())).status).toBe(200);
  });

  it("refuses a bad basket before calling Stripe", async () => {
    const calls = stubStripe({ status: 200, body: {} });
    const response = await worker.fetch(post({ items: [] }), makeEnv());
    expect(response.status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it("says checkout is unavailable when the Stripe key is missing", async () => {
    const calls = stubStripe({ status: 200, body: {} });
    const response = await worker.fetch(post(basket(1)), makeEnv({ STRIPE_SECRET_KEY: undefined }));
    expect(response.status).toBe(503);
    expect(calls).toHaveLength(0);
  });

  it("gives the customer a plain message when Stripe refuses, never Stripe's text", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    stubStripe({ status: 401, body: { error: { type: "invalid_request_error", message: "Invalid API Key provided: sk_test_***123" } } });
    const response = await worker.fetch(post(basket(1)), makeEnv());
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(JSON.stringify(body)).not.toContain("sk_");
    expect(body).toEqual({ error: "Could not start checkout. Please try again." });
  });

  it("reports whether checkout is configured on /health", async () => {
    const health = await worker.fetch(new Request("https://pureihram-api.example/health"), makeEnv());
    expect(await health.json()).toMatchObject({ checkoutConfigured: true });
    const off = await worker.fetch(
      new Request("https://pureihram-api.example/health"),
      makeEnv({ STRIPE_SECRET_KEY: undefined }),
    );
    expect(await off.json()).toMatchObject({ checkoutConfigured: false });
  });
});
