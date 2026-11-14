import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAccessCertsCache, verifyAccessToken } from "../../../workers/api/src/access";
import worker, { type Env } from "../../../workers/api/src/index";
import { testD1 } from "@/test/d1";

const TEAM = "pureihram.cloudflareaccess.com";
const AUD = "aud-tag-123";
const CERTS_URL = `https://${TEAM}/cdn-cgi/access/certs`;
const SUPABASE = "https://cimjybhmilaecqhnqrby.supabase.co";
const ORDER_ID = "75f84889-aff6-4822-8667-aaa26df189ee";

let keyPair: CryptoKeyPair;
let publicJwk: JsonWebKey;

function b64url(bytes: Uint8Array | string): string {
  const raw = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes;
  return btoa(String.fromCharCode(...raw)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Signs a token the way Access does: RS256 over header.payload. */
async function makeToken(claims: Record<string, unknown>, kid = "key-1", signer = keyPair.privateKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", kid, typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({ aud: [AUD], iss: `https://${TEAM}`, exp: now + 3600, email: "rafi.drifly@gmail.com", ...claims })
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", signer, new TextEncoder().encode(`${header}.${payload}`));
  return `${header}.${payload}.${b64url(new Uint8Array(signature))}`;
}

const config = { teamDomain: TEAM, aud: AUD, adminEmails: ["rafi.drifly@gmail.com"] };

beforeAll(async () => {
  keyPair = (await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"]
  )) as CryptoKeyPair;
  publicJwk = { ...(await crypto.subtle.exportKey("jwk", keyPair.publicKey)), kid: "key-1" } as JsonWebKey;
});

beforeEach(() => clearAccessCertsCache());
afterEach(() => vi.unstubAllGlobals());

/** Answers the Access certs request; everything else goes to `rest`. */
function stubFetch(rest: (url: string, init?: RequestInit) => Response | Promise<Response> = () => Response.json([])) {
  const mock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url === CERTS_URL) return Response.json({ keys: [publicJwk] });
    return rest(url, init);
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

describe("verifyAccessToken", () => {
  it("accepts a genuine, current token for an allowed email", async () => {
    stubFetch();
    expect(await verifyAccessToken(await makeToken({}), config)).toBe("rafi.drifly@gmail.com");
  });

  it("rejects the wrong audience, issuer, an expired token, or another email", async () => {
    stubFetch();
    const past = Math.floor(Date.now() / 1000) - 10;
    expect(await verifyAccessToken(await makeToken({ aud: ["some-other-app"] }), config)).toBeNull();
    expect(await verifyAccessToken(await makeToken({ iss: "https://evil.cloudflareaccess.com" }), config)).toBeNull();
    expect(await verifyAccessToken(await makeToken({ exp: past }), config)).toBeNull();
    expect(await verifyAccessToken(await makeToken({ email: "someone@else.com" }), config)).toBeNull();
  });

  it("rejects a token signed by any other key", async () => {
    stubFetch();
    const stranger = (await crypto.subtle.generateKey(
      { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
      true,
      ["sign", "verify"]
    )) as CryptoKeyPair;
    expect(await verifyAccessToken(await makeToken({}, "key-1", stranger.privateKey), config)).toBeNull();
  });

  it("rejects a token whose payload was edited after signing", async () => {
    stubFetch();
    const [header, , signature] = (await makeToken({ email: "someone@else.com" })).split(".");
    const forged = b64url(JSON.stringify({ aud: [AUD], iss: `https://${TEAM}`, exp: 9999999999, email: "rafi.drifly@gmail.com" }));
    expect(await verifyAccessToken(`${header}.${forged}.${signature}`, config)).toBeNull();
  });

  it("refetches the keys once when it meets an unknown key id", async () => {
    const fetchMock = stubFetch();
    expect(await verifyAccessToken(await makeToken({}, "rotated-key"), config)).toBeNull();
    expect(fetchMock.mock.calls.filter(([url]) => String(url) === CERTS_URL)).toHaveLength(2);
  });

  it("treats garbage as not an admin rather than throwing", async () => {
    stubFetch();
    expect(await verifyAccessToken("not.a.token", config)).toBeNull();
    expect(await verifyAccessToken("nonsense", config)).toBeNull();
  });
});

// --- The admin routes, through the Worker's own entry point ---------------

function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    // Orders and stock live in D1 since Nov 2026: a real SQLite with the migrations.
    DB: testD1(),
    STRIPE_SECRET_KEY: "sk_test_123",
    RESEND_API_KEY: "re_test",
    ALLOWED_ORIGINS: "https://www.pureihram.com",
    KLAVIYO_COMPANY_ID: "TGazgN",
    KLAVIYO_PREP_PACK_LIST_ID: "",
    SUPABASE_URL: SUPABASE,
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    ACCESS_TEAM_DOMAIN: TEAM,
    ACCESS_AUD: AUD,
    ADMIN_EMAILS: "rafi.drifly@gmail.com",
    PUSH: {
      subscribe: vi.fn(async () => ({ ok: true })),
      unsubscribe: vi.fn(async () => undefined),
      sendTest: vi.fn(async () => ({ sent: 1, pruned: 0 })),
    },
    ...overrides,
  };
}

async function admin(path: string, init: RequestInit = {}, env = makeEnv(), withToken = true) {
  const headers = new Headers(init.headers);
  if (withToken) headers.set("Cf-Access-Jwt-Assertion", await makeToken({}));
  return worker.fetch(new Request(`https://www.pureihram.com/api/admin/${path}`, { ...init, headers }), env);
}

function postJson(body: unknown): RequestInit {
  return { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

describe("/api/admin gate", () => {
  it("answers 503 until Access is configured, and no longer needs Supabase", async () => {
    stubFetch();
    expect((await admin("me", {}, makeEnv({ ACCESS_AUD: "" }))).status).toBe(503);
    expect((await admin("me", {}, makeEnv({ SUPABASE_SERVICE_ROLE_KEY: undefined }))).status).toBe(200);
  });

  it("refuses a request with no Access token", async () => {
    const fetchMock = stubFetch();
    const response = await admin("orders", {}, makeEnv(), false);
    expect(response.status).toBe(401);
    // Nothing reached the database.
    expect(fetchMock.mock.calls.some(([url]) => String(url).startsWith(SUPABASE))).toBe(false);
  });

  it("accepts the token from the CF_Authorization cookie too", async () => {
    stubFetch();
    const token = await makeToken({});
    const response = await worker.fetch(
      new Request("https://www.pureihram.com/api/admin/me", { headers: { Cookie: `other=1; CF_Authorization=${token}` } }),
      makeEnv()
    );
    expect(await response.json()).toEqual({ email: "rafi.drifly@gmail.com" });
  });
});

describe("/api/admin routes", () => {
  /** One order in D1, as the Stripe webhook saves it. */
  function seedOrder(env: Env, overrides: Record<string, unknown> = {}) {
    const row = {
      id: ORDER_ID,
      order_number: "ORD-1-ABCDEF12",
      lookup_token: "6f1c2b8e-5d4a-4c3b-9a1e-2f3d4c5b6a7e",
      status: "paid_pending_shipping_review",
      guest_email: "karim@example.com",
      shipping_name: "Karim",
      shipping_country: "DE",
      shipping_address: JSON.stringify({ name: "Karim", line1: "Hauptstr. 1", city: "Berlin", country: "DE" }),
      total_amount: 28,
      goods_amount: 19,
      quantity: 1,
      base_shipping_fee_eur: 9,
      stripe_session_id: "cs_live_1",
      ...overrides,
    };
    const cols = Object.keys(row);
    (env.DB as ReturnType<typeof testD1>).raw
      .prepare(`INSERT INTO orders (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`)
      .run(...Object.values(row));
  }
  const raw = (env: Env) => (env.DB as ReturnType<typeof testD1>).raw;

  it("lists orders from D1, newest first, with the address as an object", async () => {
    stubFetch();
    const env = makeEnv();
    seedOrder(env);
    const response = await admin("orders", {}, env);
    const [order] = (await response.json()) as Array<Record<string, unknown>>;
    expect(order).toMatchObject({ id: ORDER_ID, order_number: "ORD-1-ABCDEF12", shipping_address: { city: "Berlin" } });
  });

  it("only allows the two dispatch statuses", async () => {
    stubFetch();
    const env = makeEnv();
    seedOrder(env);
    expect((await admin(`orders/${ORDER_ID}/status`, postJson({ status: "refunded" }), env)).status).toBe(400);
    expect((await admin(`orders/not-a-uuid/status`, postJson({ status: "shipped" }), env)).status).toBe(400);
    expect((await admin(`orders/75f84889-aff6-4822-8667-000000000000/status`, postJson({ status: "shipped" }), env)).status).toBe(404);

    expect((await admin(`orders/${ORDER_ID}/status`, postJson({ status: "shipped" }), env)).status).toBe(200);
    expect(raw(env).prepare("SELECT status, extra_shipping_status FROM orders").get()).toEqual({
      status: "shipped",
      extra_shipping_status: "not_required",
    });
  });

  it("creates the extra-delivery link with Stripe and emails that link, not one from the browser", async () => {
    const fetchMock = stubFetch((url) =>
      url.startsWith("https://api.stripe.com/v1/checkout/sessions")
        ? Response.json({ id: "cs_extra", url: "https://checkout.stripe.com/c/pay/real" })
        : Response.json({ id: "email_1" })
    );
    const env = makeEnv();
    seedOrder(env);
    const response = await admin(
      `orders/${ORDER_ID}/extra-shipping`,
      postJson({ extraAmount: 6, paymentUrl: "https://phishing.example" }),
      env
    );
    expect(response.status).toBe(200);

    const stripeCall = fetchMock.mock.calls.find(([u]) => String(u).startsWith("https://api.stripe.com"))!;
    const form = decodeURIComponent(String(stripeCall[1]!.body));
    expect(form).toContain("line_items[0][price_data][unit_amount]=600");
    expect(form).toContain("metadata[payment_type]=extra_shipping");
    expect(form).toContain(`metadata[order_id]=${ORDER_ID}`);

    const emailCall = fetchMock.mock.calls.find(([u]) => String(u) === "https://api.resend.com/emails")!;
    const email = JSON.parse(emailCall[1]!.body as string) as { to: string[]; html: string };
    expect(email.to).toEqual(["karim@example.com"]);
    expect(email.html).toContain("https://checkout.stripe.com/c/pay/real");
    expect(email.html).not.toContain("phishing.example");
    expect(raw(env).prepare("SELECT extra_shipping_fee_eur, extra_shipping_status FROM orders").get()).toEqual({
      extra_shipping_fee_eur: 6,
      extra_shipping_status: "requested",
    });
  });

  it("starts the stock count with the first adjustment, then refuses to go negative", async () => {
    stubFetch();
    const env = makeEnv();
    expect(await (await admin("inventory", {}, env)).json()).toEqual({ inventory: null, movements: [] });
    // No count yet: a threshold has nothing to apply to, and stock cannot start below zero.
    expect((await admin("inventory/threshold", postJson({ threshold: 10 }), env)).status).toBe(400);
    expect((await admin("inventory/adjust", postJson({ delta: -1 }), env)).status).toBe(400);

    expect(await (await admin("inventory/adjust", postJson({ delta: 3 }), env)).json()).toEqual({ ok: true, stock_on_hand: 3 });
    expect((await admin("inventory/adjust", postJson({ delta: -5 }), env)).status).toBe(400);
    expect(await (await admin("inventory/adjust", postJson({ delta: -2 }), env)).json()).toEqual({ ok: true, stock_on_hand: 1 });
    expect((await admin("inventory/threshold", postJson({ threshold: 10 }), env)).status).toBe(200);

    const { inventory, movements } = (await (await admin("inventory", {}, env)).json()) as {
      inventory: { stock_on_hand: number; low_stock_threshold: number };
      movements: Array<{ delta: number; reason: string }>;
    };
    expect(inventory).toMatchObject({ stock_on_hand: 1, low_stock_threshold: 10 });
    expect(movements.map((m) => [m.delta, m.reason]).sort()).toEqual([
      [-2, "manual_adjustment"],
      [3, "manual_adjustment"],
    ]);
  });

  it("uploads images only to the product folder, and returns the public URL", async () => {
    const fetchMock = stubFetch(() => Response.json({ Key: "ok" }));
    const path = "products/36acffbc-41ea-4512-8621-174cd8d9b00c/cloth-1200.webp";
    // "../" is collapsed by URL parsing before it ever reaches the admin routes.
    expect((await admin("images/../../etc/passwd", { method: "PUT", body: "x" })).status).toBe(404);
    expect((await admin("images/products/not-a-product/run.sh", { method: "PUT", body: "x" })).status).toBe(400);
    expect(fetchMock.mock.calls.some(([u]) => String(u).includes("/storage/"))).toBe(false);

    const response = await admin(`images/${path}`, { method: "PUT", body: new Uint8Array([1, 2, 3]) });
    expect(await response.json()).toEqual({ url: `${SUPABASE}/storage/v1/object/public/product-images/${path}` });
    const upload = fetchMock.mock.calls.find(([u]) => String(u).includes("/storage/v1/object/product-images/"))!;
    expect(new Headers(upload[1]!.headers).get("x-upsert")).toBe("true");
  });

  it("enrols and tests a device through the push service, no enrolment code", async () => {
    stubFetch();
    const env = makeEnv();
    const subscription = { endpoint: "https://push.example/abc", keys: { p256dh: "p", auth: "a" } };
    expect((await admin("push/subscribe", postJson({ subscription, userAgent: "iPhone" }), env)).status).toBe(200);
    expect(env.PUSH.subscribe).toHaveBeenCalledWith(subscription, "iPhone");
    expect(await (await admin("push/test", { method: "POST" }, env)).json()).toEqual({ ok: true, sent: 1, pruned: 0 });
  });
});
