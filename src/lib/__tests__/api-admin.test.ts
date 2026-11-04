import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAccessCertsCache, verifyAccessToken } from "../../../workers/api/src/access";
import worker, { type Env } from "../../../workers/api/src/index";

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
    DB: {} as Env["DB"],
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
  it("answers 503 until Access and the database key are configured", async () => {
    stubFetch();
    expect((await admin("me", {}, makeEnv({ ACCESS_AUD: "" }))).status).toBe(503);
    expect((await admin("me", {}, makeEnv({ SUPABASE_SERVICE_ROLE_KEY: undefined }))).status).toBe(503);
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
  it("lists only real orders, with the service role key", async () => {
    const fetchMock = stubFetch(() => Response.json([{ id: ORDER_ID }]));
    const response = await admin("orders");
    expect(await response.json()).toEqual([{ id: ORDER_ID }]);
    const [url, init] = fetchMock.mock.calls.find(([u]) => String(u).includes("/rest/v1/orders"))!;
    expect(String(url)).toContain("stripe_payment_intent_id=not.is.null");
    expect(new Headers(init!.headers).get("apikey")).toBe("service-role-key");
  });

  it("only allows the two dispatch statuses", async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));
    expect((await admin(`orders/${ORDER_ID}/status`, postJson({ status: "refunded" }))).status).toBe(400);
    expect((await admin(`orders/not-a-uuid/status`, postJson({ status: "shipped" }))).status).toBe(400);

    expect((await admin(`orders/${ORDER_ID}/status`, postJson({ status: "shipped" }))).status).toBe(200);
    const [url, init] = fetchMock.mock.calls.find(([u]) => String(u).includes("/rest/v1/orders"))!;
    expect(String(url)).toBe(`${SUPABASE}/rest/v1/orders?id=eq.${ORDER_ID}`);
    expect(JSON.parse(init!.body as string)).toEqual({ status: "shipped", extra_shipping_status: "not_required" });
  });

  it("creates the extra-shipping link server-side and emails that link, not one from the browser", async () => {
    const fetchMock = stubFetch((url) =>
      url.endsWith("/create-extra-shipping-payment")
        ? Response.json({ url: "https://checkout.stripe.com/c/pay/real" })
        : Response.json({ success: true })
    );
    const response = await admin(
      `orders/${ORDER_ID}/extra-shipping`,
      postJson({ extraAmount: 6, paymentUrl: "https://phishing.example" })
    );
    expect(response.status).toBe(200);
    const emailCall = fetchMock.mock.calls.find(([u]) => String(u).endsWith("/send-shipping-adjustment-email"))!;
    expect(JSON.parse(emailCall[1]!.body as string)).toEqual({
      orderId: ORDER_ID,
      paymentUrl: "https://checkout.stripe.com/c/pay/real",
      extraAmount: 6,
    });
    expect(new Headers(emailCall[1]!.headers).get("Authorization")).toBe("Bearer service-role-key");
  });

  it("adjusts stock from the database's own count and refuses to go negative", async () => {
    const fetchMock = stubFetch((url, init) =>
      (init?.method ?? "GET") === "GET" ? Response.json([{ stock_on_hand: 3 }]) : new Response(null, { status: 201 })
    );
    expect((await admin("inventory/adjust", postJson({ delta: -5 }))).status).toBe(400);

    const response = await admin("inventory/adjust", postJson({ delta: -2 }));
    expect(await response.json()).toEqual({ ok: true, stock_on_hand: 1 });
    const movement = fetchMock.mock.calls.find(([u]) => String(u).endsWith("/rest/v1/stock_movements"))!;
    expect(JSON.parse(movement[1]!.body as string)).toEqual({
      product_key: "ihram_set",
      delta: -2,
      reason: "manual_adjustment",
    });
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
