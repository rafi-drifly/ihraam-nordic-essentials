/**
 * The admin's backend: /api/admin/*, behind the admin password.
 *
 * Stage 2 of the move off Supabase. The admin pages no longer log in to
 * Supabase or talk to it. They call these routes, which accept only a signed
 * session from the password login (admin-session.ts). Cloudflare Access did
 * this job from 14 to 16 Nov 2026, until the owner asked for a password like
 * the Yalla Jerky admin's.
 *
 * Since 14 Nov 2026 orders and stock live in D1 (migrations/0002_orders.sql),
 * written by the Stripe webhook in orders.ts, and the extra-delivery charge is
 * made with Stripe and emailed through Resend from here. Only the product
 * image routes still use Supabase (storage and the products row); they answer
 * 503 while it is paused or its key is unset. The live site no longer reads
 * product images from there.
 */

import { handleLogin, handleLogout, hasValidSession, sessionSetupProblem, type AdminSessionEnv } from "./admin-session";
import { extraShippingEmail, sendEmail } from "./emails";
import { parseOrderRow, PRODUCT_KEY } from "./orders";
import { stripeApi, StripeError } from "./stripe";

export interface PushAdminService {
  subscribe(
    subscription: { endpoint?: string; keys?: { p256dh?: string; auth?: string } },
    userAgent?: string
  ): Promise<{ ok: boolean; error?: string }>;
  unsubscribe(endpoint: string): Promise<void>;
  sendTest(): Promise<{ sent: number; pruned: number }>;
}

export interface AdminEnv extends AdminSessionEnv {
  SUPABASE_URL: string;
  /** Only the product image routes need this now. */
  SUPABASE_SERVICE_ROLE_KEY?: string;
  PUSH: PushAdminService;
  DB: D1Database;
  STRIPE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
}

const BUCKET = "product-images";
const SITE = "https://www.pureihram.com";
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
  if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new HttpError(503, "Product images need Supabase, which is not connected.");
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
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

// --- Routes --------------------------------------------------------------

async function route(request: Request, env: AdminEnv, path: string): Promise<Response> {
  const method = request.method;

  if (path === "me" && method === "GET") return json({ signedIn: true });

  // Orders ---------------------------------------------------------------
  if (path === "orders" && method === "GET") {
    const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 200").all();
    return json(results.map(parseOrderRow));
  }

  const orderAction = path.match(/^orders\/([^/]+)\/(status|extra-shipping)$/);
  if (orderAction && method === "POST") {
    const [, id, action] = orderAction;
    if (!UUID.test(id)) throw new HttpError(400, "Not an order id.");
    const row = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first();
    if (!row) throw new HttpError(404, "No such order.");

    if (action === "status") {
      const { status } = await readJson<{ status?: string }>(request);
      if (status !== "ready_to_ship" && status !== "shipped") throw new HttpError(400, "Unknown status.");
      await env.DB.prepare(
        "UPDATE orders SET status = ?, extra_shipping_status = 'not_required', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?"
      )
        .bind(status, id)
        .run();
      return json({ ok: true });
    }

    // The payment link is created and emailed here, so the browser never
    // supplies a URL that goes out to a customer under the shop's name.
    const { extraAmount } = await readJson<{ extraAmount?: number }>(request);
    if (typeof extraAmount !== "number" || !(extraAmount > 0) || extraAmount > 500) {
      throw new HttpError(400, "Invalid amount.");
    }
    const order = parseOrderRow(row);
    if (!order.guest_email) throw new HttpError(400, "This order has no customer email.");
    if (!env.STRIPE_SECRET_KEY) throw new HttpError(503, "Stripe is not connected.");

    let session: { id: string; url?: string };
    try {
      session = await stripeApi(env.STRIPE_SECRET_KEY, "POST", "checkout/sessions", {
        mode: "payment",
        customer_email: order.guest_email,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Additional delivery charge",
                description: `Extra delivery cost for order ${order.order_number}`,
              },
              unit_amount: Math.round(extraAmount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${SITE}/order-success?extra_shipping=paid&order=${encodeURIComponent(order.order_number)}`,
        cancel_url: `${SITE}/order-success?extra_shipping=cancelled&order=${encodeURIComponent(order.order_number)}`,
        // The webhook reads these to mark the order ready to ship once paid.
        metadata: {
          payment_type: "extra_shipping",
          order_id: id,
          order_number: order.order_number,
          extra_amount_eur: String(extraAmount),
        },
      });
    } catch (error) {
      console.error("admin: Stripe refused the extra-delivery link", error instanceof StripeError ? error.message : error);
      throw new HttpError(502, "Stripe would not create the payment link.");
    }
    if (!session.url) throw new HttpError(502, "No payment link came back.");

    await env.DB.prepare(
      "UPDATE orders SET extra_shipping_fee_eur = ?, extra_shipping_status = 'requested', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?"
    )
      .bind(extraAmount, id)
      .run();

    if (!(await sendEmail(env.RESEND_API_KEY, extraShippingEmail(order, extraAmount, session.url)))) {
      throw new HttpError(502, "The payment link was made, but the email to the customer failed.");
    }
    return json({ ok: true });
  }

  // Inventory ------------------------------------------------------------
  if (path === "inventory" && method === "GET") {
    const inventory = await env.DB.prepare("SELECT * FROM inventory WHERE product_key = ?").bind(PRODUCT_KEY).first();
    const { results: movements } = await env.DB.prepare(
      "SELECT * FROM stock_movements WHERE product_key = ? ORDER BY created_at DESC LIMIT 20"
    )
      .bind(PRODUCT_KEY)
      .all();
    return json({ inventory: inventory ?? null, movements });
  }

  if (path === "inventory/adjust" && method === "POST") {
    const { delta } = await readJson<{ delta?: number }>(request);
    if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta!) > 10000) throw new HttpError(400, "Invalid amount.");
    // Read the stock here rather than trusting the page's copy, which can be
    // stale if an order came in while it was open. With no row yet (the count
    // could not be copied from the paused Supabase), the first adjustment
    // sets it: enter the sets you have as a positive number.
    const current = await env.DB.prepare("SELECT stock_on_hand FROM inventory WHERE product_key = ?")
      .bind(PRODUCT_KEY)
      .first<{ stock_on_hand: number }>();
    const stockOnHand = (current?.stock_on_hand ?? 0) + delta!;
    if (stockOnHand < 0) throw new HttpError(400, "Cannot have negative stock.");
    await env.DB.batch([
      current
        ? env.DB.prepare(
            "UPDATE inventory SET stock_on_hand = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE product_key = ?"
          ).bind(stockOnHand, PRODUCT_KEY)
        : env.DB.prepare("INSERT INTO inventory (product_key, stock_on_hand) VALUES (?, ?)").bind(PRODUCT_KEY, stockOnHand),
      env.DB.prepare(
        "INSERT INTO stock_movements (id, product_key, delta, reason) VALUES (?, ?, ?, 'manual_adjustment')"
      ).bind(crypto.randomUUID(), PRODUCT_KEY, delta),
    ]);
    return json({ ok: true, stock_on_hand: stockOnHand });
  }

  if (path === "inventory/threshold" && method === "POST") {
    const { threshold } = await readJson<{ threshold?: number }>(request);
    if (!Number.isInteger(threshold) || threshold! < 0 || threshold! > 10000) throw new HttpError(400, "Invalid threshold.");
    const result = await env.DB.prepare(
      "UPDATE inventory SET low_stock_threshold = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE product_key = ?"
    )
      .bind(threshold, PRODUCT_KEY)
      .run();
    if (!result.meta.changes) throw new HttpError(400, "Enter the stock count first.");
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
  // Anything that changes something must come from the admin's own pages. The
  // cookie's SameSite=Strict already keeps other sites out; this is a second lock.
  if (request.method !== "GET" && request.method !== "HEAD") {
    const origin = request.headers.get("Origin");
    if (origin && origin !== new URL(request.url).origin) return json({ error: "Not allowed." }, 403);
  }

  try {
    if (path === "login" && request.method === "POST") return await handleLogin(request, env);
    if (path === "logout" && request.method === "POST") return handleLogout(request);

    // Fail closed until the password and the signing secret are both set.
    const problem = sessionSetupProblem(env);
    if (problem) return json({ error: problem }, 503);
    if (!(await hasValidSession(request, env))) return json({ error: "Please sign in." }, 401);

    return await route(request, env, path);
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    console.error("admin: unexpected error", error instanceof Error ? error.message : error);
    return json({ error: "Something went wrong." }, 500);
  }
}
