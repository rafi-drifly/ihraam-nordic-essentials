/**
 * The admin's backend: /api/admin/*, behind Cloudflare Access.
 *
 * Stage 2 of the move off Supabase. The admin pages no longer log in to
 * Supabase or talk to it. They call these routes, which accept only a valid
 * Access login (see access.ts) and then read and write Supabase with the
 * service role key. The data itself stays in Supabase until the payment path
 * moves, because the Stripe webhook there still writes orders and stock.
 */

import { accessTokenFrom, verifyAccessToken } from "./access";

export interface PushAdminService {
  subscribe(
    subscription: { endpoint?: string; keys?: { p256dh?: string; auth?: string } },
    userAgent?: string
  ): Promise<{ ok: boolean; error?: string }>;
  unsubscribe(endpoint: string): Promise<void>;
  sendTest(): Promise<{ sent: number; pruned: number }>;
}

export interface AdminEnv {
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  ADMIN_EMAILS: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  PUSH: PushAdminService;
}

const BUCKET = "product-images";
const PRODUCT_KEY = "ihram_set";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
/** products/<product id>/<name>-<width>.webp, exactly what the Images page writes. */
const IMAGE_PATH = /^products\/[0-9a-f-]{36}\/[A-Za-z0-9._-]+-\d{2,4}\.webp$/;

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function readJson<T>(request: Request): Promise<T> {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") throw new HttpError(400, "Expected a JSON body.");
  return body as T;
}

// --- Supabase, with the service role key --------------------------------

function supabaseHeaders(env: AdminEnv, extra: Record<string, string> = {}): Record<string, string> {
  const key = env.SUPABASE_SERVICE_ROLE_KEY!;
  return { apikey: key, Authorization: `Bearer ${key}`, ...extra };
}

async function rest<T>(env: AdminEnv, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: supabaseHeaders(env, {
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string>) ?? {}),
    }),
  });
  const text = await response.text();
  if (!response.ok) {
    console.error(`admin: Supabase ${init.method ?? "GET"} ${path.split("?")[0]} returned ${response.status}`, text.slice(0, 300));
    throw new HttpError(502, "The database rejected that request.");
  }
  return (text ? JSON.parse(text) : null) as T;
}

/** Calls one of the shop's Supabase functions as the service role. */
async function supabaseFunction<T>(env: AdminEnv, name: string, body: unknown): Promise<T> {
  const response = await fetch(`${env.SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: supabaseHeaders(env, { "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    console.error(`admin: ${name} returned ${response.status}`, data.error);
    throw new HttpError(502, data.error || `${name} failed.`);
  }
  return data;
}

// --- Routes --------------------------------------------------------------

async function route(request: Request, env: AdminEnv, path: string, email: string): Promise<Response> {
  const method = request.method;

  if (path === "me" && method === "GET") return json({ email });

  // Orders ---------------------------------------------------------------
  if (path === "orders" && method === "GET") {
    // Only real orders: the legacy rows from building the shop have no
    // Stripe payment against them.
    return json(
      await rest(env, "orders?select=*&stripe_payment_intent_id=not.is.null&order=created_at.desc&limit=100")
    );
  }

  const orderAction = path.match(/^orders\/([^/]+)\/(status|extra-shipping)$/);
  if (orderAction && method === "POST") {
    const [, id, action] = orderAction;
    if (!UUID.test(id)) throw new HttpError(400, "Not an order id.");

    if (action === "status") {
      const { status } = await readJson<{ status?: string }>(request);
      if (status !== "ready_to_ship" && status !== "shipped") throw new HttpError(400, "Unknown status.");
      await rest(env, `orders?id=eq.${id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ status, extra_shipping_status: "not_required" }),
      });
      return json({ ok: true });
    }

    // The payment link is created and emailed server-side, so the browser
    // never supplies a URL that goes out to a customer under the shop's name.
    const { extraAmount } = await readJson<{ extraAmount?: number }>(request);
    if (typeof extraAmount !== "number" || !(extraAmount > 0) || extraAmount > 500) {
      throw new HttpError(400, "Invalid amount.");
    }
    const payment = await supabaseFunction<{ url?: string }>(env, "create-extra-shipping-payment", {
      orderId: id,
      extraAmount,
    });
    if (!payment.url) throw new HttpError(502, "No payment link came back.");
    await supabaseFunction(env, "send-shipping-adjustment-email", {
      orderId: id,
      paymentUrl: payment.url,
      extraAmount,
    });
    return json({ ok: true });
  }

  // Inventory ------------------------------------------------------------
  if (path === "inventory" && method === "GET") {
    const [inventory] = await rest<unknown[]>(env, `inventory?select=*&product_key=eq.${PRODUCT_KEY}`);
    const movements = await rest(
      env,
      `stock_movements?select=*&product_key=eq.${PRODUCT_KEY}&order=created_at.desc&limit=20`
    );
    return json({ inventory: inventory ?? null, movements });
  }

  if (path === "inventory/adjust" && method === "POST") {
    const { delta } = await readJson<{ delta?: number }>(request);
    if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta!) > 10000) throw new HttpError(400, "Invalid amount.");
    // Read the stock here rather than trusting the page's copy, which can be
    // stale if an order came in while it was open.
    const [current] = await rest<{ stock_on_hand: number }[]>(
      env,
      `inventory?select=stock_on_hand&product_key=eq.${PRODUCT_KEY}`
    );
    if (!current) throw new HttpError(404, "No inventory row.");
    const stockOnHand = current.stock_on_hand + delta!;
    if (stockOnHand < 0) throw new HttpError(400, "Cannot have negative stock.");
    await rest(env, `inventory?product_key=eq.${PRODUCT_KEY}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ stock_on_hand: stockOnHand }),
    });
    await rest(env, "stock_movements", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ product_key: PRODUCT_KEY, delta, reason: "manual_adjustment" }),
    });
    return json({ ok: true, stock_on_hand: stockOnHand });
  }

  if (path === "inventory/threshold" && method === "POST") {
    const { threshold } = await readJson<{ threshold?: number }>(request);
    if (!Number.isInteger(threshold) || threshold! < 0 || threshold! > 10000) throw new HttpError(400, "Invalid threshold.");
    await rest(env, `inventory?product_key=eq.${PRODUCT_KEY}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ low_stock_threshold: threshold }),
    });
    return json({ ok: true });
  }

  // Product images -------------------------------------------------------
  if (path === "product" && method === "GET") {
    const [product] = await rest<unknown[]>(env, "products?select=id,name,images&is_active=eq.true&limit=1");
    if (!product) throw new HttpError(404, "No active product.");
    return json(product);
  }

  const productImages = path.match(/^products\/([^/]+)\/images$/);
  if (productImages && method === "POST") {
    const [, id] = productImages;
    if (!UUID.test(id)) throw new HttpError(400, "Not a product id.");
    const { images } = await readJson<{ images?: unknown }>(request);
    if (!Array.isArray(images) || !images.every((url) => typeof url === "string" && url.startsWith("https://"))) {
      throw new HttpError(400, "Images must be a list of https URLs.");
    }
    await rest(env, `products?id=eq.${id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ images }),
    });
    return json({ ok: true });
  }

  if (path.startsWith("images/") && method === "PUT") {
    const objectPath = path.slice("images/".length);
    if (!IMAGE_PATH.test(objectPath)) throw new HttpError(400, "Unexpected image path.");
    const response = await fetch(`${env.SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectPath}`, {
      method: "POST",
      headers: supabaseHeaders(env, { "Content-Type": "image/webp", "x-upsert": "true" }),
      body: await request.arrayBuffer(),
    });
    if (!response.ok) {
      console.error(`admin: storage upload returned ${response.status}`, (await response.text()).slice(0, 300));
      throw new HttpError(502, "Upload failed.");
    }
    return json({ url: `${env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}` });
  }

  if (path === "images/remove" && method === "POST") {
    const { paths } = await readJson<{ paths?: unknown }>(request);
    if (!Array.isArray(paths) || !paths.every((p) => typeof p === "string" && IMAGE_PATH.test(p))) {
      throw new HttpError(400, "Unexpected image path.");
    }
    const response = await fetch(`${env.SUPABASE_URL}/storage/v1/object/${BUCKET}`, {
      method: "DELETE",
      headers: supabaseHeaders(env, { "Content-Type": "application/json" }),
      body: JSON.stringify({ prefixes: paths }),
    });
    if (!response.ok) throw new HttpError(502, "Remove failed.");
    return json({ ok: true });
  }

  // Order alerts on this device --------------------------------------------
  if (path === "push/subscribe" && method === "POST") {
    const { subscription, userAgent } = await readJson<{
      subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
      userAgent?: string;
    }>(request);
    const result = await env.PUSH.subscribe(subscription ?? {}, userAgent);
    return result.ok ? json({ ok: true }) : json({ error: result.error }, 400);
  }

  if (path === "push/unsubscribe" && method === "POST") {
    const { endpoint } = await readJson<{ endpoint?: string }>(request);
    if (endpoint) await env.PUSH.unsubscribe(endpoint);
    return json({ ok: true });
  }

  if (path === "push/test" && method === "POST") {
    return json({ ok: true, ...(await env.PUSH.sendTest()) });
  }

  return json({ error: "Not found" }, 404);
}

/** Entry point for every /api/admin/* request. */
export async function handleAdmin(request: Request, env: AdminEnv, path: string): Promise<Response> {
  // Fail closed until Access and the database key are both configured.
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "Admin is not configured yet." }, 503);
  }

  const token = accessTokenFrom(request);
  const email = token
    ? await verifyAccessToken(token, {
        teamDomain: env.ACCESS_TEAM_DOMAIN,
        aud: env.ACCESS_AUD,
        adminEmails: env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean),
      }).catch((error: unknown) => {
        console.error("admin: could not verify Access token", error instanceof Error ? error.message : error);
        return null;
      })
    : null;
  if (!email) return json({ error: "Sign in through Cloudflare Access." }, 401);

  try {
    return await route(request, env, path, email);
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    console.error("admin: unexpected error", error instanceof Error ? error.message : error);
    return json({ error: "Something went wrong." }, 500);
  }
}
