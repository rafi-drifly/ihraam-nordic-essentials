import { afterEach, describe, expect, it, vi } from "vitest";
import worker, { type Env } from "../../../workers/api/src/index";
import {
  COOKIE_NAME,
  handleLogin,
  hasValidSession,
  LOCKOUT_MS,
  makeSessionValue,
  SHORT_SESSION_MS,
} from "../../../workers/api/src/admin-session";
import { testD1 } from "@/test/d1";

const SUPABASE = "https://cimjybhmilaecqhnqrby.supabase.co";
const ORDER_ID = "75f84889-aff6-4822-8667-aaa26df189ee";
const PASSWORD = "correct horse battery staple";
const SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef";

afterEach(() => vi.unstubAllGlobals());

/** Everything the admin calls out to goes to `rest`. */
function stubFetch(rest: (url: string, init?: RequestInit) => Response | Promise<Response> = () => Response.json([])) {
  const mock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => rest(String(input), init));
  vi.stubGlobal("fetch", mock);
  return mock;
}

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
    ADMIN_PASSWORD: PASSWORD,
    ADMIN_SESSION_SECRET: SECRET,
    PUSH: {
      subscribe: vi.fn(async () => ({ ok: true })),
      unsubscribe: vi.fn(async () => undefined),
      sendTest: vi.fn(async () => ({ sent: 1, pruned: 0 })),
    },
    ...overrides,
  };
}

const raw = (env: Env) => (env.DB as ReturnType<typeof testD1>).raw;

async function sessionCookie(env: Env, remember = true): Promise<string> {
  return `${COOKIE_NAME}=${await makeSessionValue(env, remember)}`;
}

async function admin(path: string, init: RequestInit = {}, env = makeEnv(), signedIn = true) {
  const headers = new Headers(init.headers);
  if (signedIn) headers.set("Cookie", await sessionCookie(env));
  return worker.fetch(new Request(`https://www.pureihram.com/api/admin/${path}`, { ...init, headers }), env);
}

function postJson(body: unknown, headers: Record<string, string> = {}): RequestInit {
  return { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) };
}

function login(env: Env, body: unknown, ip = "203.0.113.7", base = "https://www.pureihram.com/api/admin") {
  return worker.fetch(
    new Request(`${base}/login`, postJson(body, { "CF-Connecting-IP": ip, Origin: new URL(base).origin })),
    env
  );
}

describe("admin password login", () => {
  it("answers 503 until a long enough password and the signing secret are set", async () => {
    stubFetch();
    expect((await admin("me", {}, makeEnv({ ADMIN_PASSWORD: undefined }), false)).status).toBe(503);
    expect((await login(makeEnv({ ADMIN_PASSWORD: "short" }), { password: "short" })).status).toBe(503);
    expect((await admin("me", {}, makeEnv({ ADMIN_SESSION_SECRET: undefined }), false)).status).toBe(503);
    // Supabase is not needed to sign in or read orders.
    expect((await admin("me", {}, makeEnv({ SUPABASE_SERVICE_ROLE_KEY: undefined }))).status).toBe(200);
  });

  it("refuses every admin route without a session, before touching anything", async () => {
    const fetchMock = stubFetch();
    const response = await admin("orders", {}, makeEnv(), false);
    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers the right password with a cookie the page cannot read, kept 30 days when asked", async () => {
    const env = makeEnv();
    const response = await login(env, { password: `  ${PASSWORD} `, remember: true });
    expect(response.status).toBe(200);
    const setCookie = response.headers.get("Set-Cookie")!;
    expect(setCookie).toMatch(new RegExp(`^${COOKIE_NAME}=v1\\.`));
    for (const part of ["Path=/api/admin", "HttpOnly", "Secure", "SameSite=Strict", "Max-Age=2592000"]) {
      expect(setCookie).toContain(part);
    }
    // That cookie opens the admin.
    const me = await worker.fetch(
      new Request("https://www.pureihram.com/api/admin/me", { headers: { Cookie: `other=1; ${setCookie.split(";")[0]}` } }),
      env
    );
    expect(await me.json()).toEqual({ signedIn: true });
  });

  it("without 'keep me signed in' the cookie ends with the browser and the session within 12 hours", async () => {
    const env = makeEnv();
    const setCookie = (await login(env, { password: PASSWORD, remember: false })).headers.get("Set-Cookie")!;
    expect(setCookie).not.toContain("Max-Age");
    const cookie = setCookie.split(";")[0];
    const request = new Request("https://www.pureihram.com/api/admin/me", { headers: { Cookie: cookie } });
    expect(await hasValidSession(request, env)).toBe(true);
    expect(await hasValidSession(request, env, Date.now() + SHORT_SESSION_MS + 1000)).toBe(false);
  });

  it("uses the workers.dev path for a cookie set there", async () => {
    const response = await login(makeEnv(), { password: PASSWORD }, "203.0.113.7", "https://pureihram-api.example/admin");
    expect(response.headers.get("Set-Cookie")).toContain("Path=/admin;");
  });

  it("refuses an edited, expired or old-password session", async () => {
    stubFetch();
    const env = makeEnv();
    const value = await makeSessionValue(env, true);
    const [, expires, signature] = value.split(".");
    const asCookie = (v: string) => ({ headers: { Cookie: `${COOKIE_NAME}=${v}` } });

    // Pushing the expiry later breaks the signature.
    const edited = `v1.${Number(expires) + 1000}.${signature}`;
    expect((await admin("me", asCookie(edited), env, false)).status).toBe(401);
    // An expired one, though genuinely signed.
    const expired = await makeSessionValue(env, false, Date.now() - SHORT_SESSION_MS - 1000);
    expect((await admin("me", asCookie(expired), env, false)).status).toBe(401);
    // Changing the password signs every device out.
    expect((await admin("me", asCookie(value), makeEnv({ ADMIN_PASSWORD: "a brand new password" }), false)).status).toBe(401);
    // A session signed with another secret.
    expect((await admin("me", asCookie(value), makeEnv({ ADMIN_SESSION_SECRET: SECRET.replace("0", "9") }), false)).status).toBe(401);
    expect((await admin("me", asCookie("garbage"), env, false)).status).toBe(401);
    // The real one still works.
    expect((await admin("me", asCookie(value), env, false)).status).toBe(200);
  });

  it("locks an address out after 5 wrong passwords, even for the right one, for 15 minutes", async () => {
    const env = makeEnv();
    const messages: string[] = [];
    for (let i = 0; i < 5; i++) {
      const response = await login(env, { password: "wrong password!!" });
      messages.push(((await response.json()) as { error: string }).error);
    }
    expect(messages[0]).toBe("Wrong password. 4 tries left before a 15-minute wait.");
    expect(messages[3]).toBe("Wrong password. 1 try left before a 15-minute wait.");
    expect(messages[4]).toMatch(/^Too many wrong passwords/);

    const locked = await login(env, { password: PASSWORD });
    expect(locked.status).toBe(429);
    expect(locked.headers.get("Set-Cookie")).toBeNull();
    // Another address is not affected.
    expect((await login(env, { password: PASSWORD }, "198.51.100.1")).status).toBe(200);

    // After 15 minutes the right password works, and clears the count.
    const later = Date.now() + LOCKOUT_MS + 1000;
    const request = new Request("https://www.pureihram.com/api/admin/login", {
      ...postJson({ password: PASSWORD }, { "CF-Connecting-IP": "203.0.113.7" }),
    });
    expect((await handleLogin(request, env, later)).status).toBe(200);
    expect(raw(env).prepare("SELECT COUNT(*) AS n FROM admin_login_failures WHERE ip = '203.0.113.7'").get()).toEqual({ n: 0 });
  });

  it("refuses an empty or absurdly long guess as a wrong password", async () => {
    const env = makeEnv();
    expect((await login(env, {})).status).toBe(401);
    expect((await login(env, { password: "x".repeat(500) })).status).toBe(401);
    expect(raw(env).prepare("SELECT COUNT(*) AS n FROM admin_login_failures").get()).toEqual({ n: 2 });
  });

  it("signs out by clearing the cookie", async () => {
    const response = await admin("logout", { method: "POST" });
    expect(response.headers.get("Set-Cookie")).toContain("Max-Age=0");
  });

  it("refuses a change sent from another site, even with a session", async () => {
    stubFetch();
    const env = makeEnv();
    const response = await admin("inventory/adjust", postJson({ delta: 5 }, { Origin: "https://evil.example" }), env);
    expect(response.status).toBe(403);
    expect(raw(env).prepare("SELECT COUNT(*) AS n FROM stock_movements").get()).toEqual({ n: 0 });
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
    raw(env)
      .prepare(`INSERT INTO orders (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`)
      .run(...Object.values(row));
  }

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
