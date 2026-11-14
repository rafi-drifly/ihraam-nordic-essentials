/**
 * Orders on Cloudflare.
 *
 *   POST /stripe-webhook        Stripe tells us a checkout was paid: save the order,
 *                               count the stock down, email the customer and the shop
 *   POST /order-lookup          a customer opens their order with number + token
 *   POST /import/stripe-orders  one-off: copy past orders from Stripe's history
 *
 * Takes over from the Supabase stripe-webhook and guest-order-lookup functions
 * (14 Nov 2026), after the Supabase project was paused and paid orders were no
 * longer recorded anywhere but Stripe.
 */

import { getBundleType } from "../../../supabase/functions/create-checkout/pricing";
import { orderMoney } from "../../../supabase/functions/stripe-webhook/totals";
import { PRODUCT } from "../../../src/lib/product";
import { lowStockEmail, orderConfirmationEmail, ownerOrderAlertEmail, sendEmail, type EmailOrder } from "./emails";
import { stripeApi, StripeError, verifyStripeSignature } from "./stripe";

export interface OrdersEnv {
  DB: D1Database;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  KLAVIYO_COMPANY_ID: string;
  /** Set only while the one-off import of past orders runs; unset, the route is gone. */
  IMPORT_TOKEN?: string;
}

export const PRODUCT_KEY = "ihram_set";
const LOW_STOCK_FALLBACK = 20;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The parts of a Stripe Checkout Session an order is built from. */
export interface StripeSession {
  id: string;
  created?: number;
  payment_status?: string;
  payment_intent?: string | { id: string } | null;
  amount_total?: number | null;
  amount_subtotal?: number | null;
  currency?: string | null;
  customer_email?: string | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
    address?: { country?: string | null } | null;
  } | null;
  // Newer API versions moved shipping_details under collected_information.
  shipping_details?: StripeShipping | null;
  collected_information?: { shipping_details?: StripeShipping | null } | null;
  shipping_cost?: {
    amount_total?: number | null;
    shipping_rate?: string | { id?: string; display_name?: string | null } | null;
  } | null;
  metadata?: Record<string, string> | null;
}

interface StripeShipping {
  name?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
}

export interface OrderRow extends EmailOrder {
  id: string;
  currency: string;
  shipping_country: string | null;
  extra_shipping_fee_eur: number;
  extra_shipping_status: string;
  notes: string | null;
  source: string;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
}

/** Whether a paid session is a shop order, as opposed to a donation or an extra delivery charge. */
export function sessionKind(session: StripeSession): "order" | "extra_shipping" | "donation" | "other" {
  const meta = session.metadata ?? {};
  if (meta.payment_type === "extra_shipping") return "extra_shipping";
  if (meta.standalone_donation === "true") return "donation";
  // Every basket the shop's checkout has ever made carries these; anything
  // else on the Stripe account is not a shop order.
  if (meta.items || meta.total_quantity) return "order";
  return "other";
}

function orderNumber(createdMs: number): string {
  return `ORD-${createdMs}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

/**
 * The order a paid session describes. Pure, so the tests and the import of
 * past orders build orders exactly as the webhook does.
 *
 * `shippingRateName` is the delivery option the customer picked on the Stripe
 * page, when it is known: a free option is one of the mosque collection points.
 */
export function orderFromSession(
  session: StripeSession,
  options: { shippingRateName?: string | null; source?: "webhook" | "stripe_import"; now?: Date } = {},
): OrderRow {
  const meta = session.metadata ?? {};
  const shipping = session.collected_information?.shipping_details ?? session.shipping_details ?? null;
  const address = shipping?.address ?? null;
  const country = address?.country ?? session.customer_details?.address?.country ?? null;

  const quantity = Math.max(1, parseInt(meta.total_quantity || "", 10) || 1);
  const donationEur = parseFloat(meta.donation_amount || "0") || 0;

  // What the customer chose at Stripe, not what the checkout offered.
  const shippingCents = session.shipping_cost?.amount_total;
  const shippingEur = typeof shippingCents === "number" ? shippingCents / 100 : parseFloat(meta.shipping_fee_applied || "9") || 0;
  const rateName =
    options.shippingRateName ??
    (typeof session.shipping_cost?.shipping_rate === "object" ? session.shipping_cost?.shipping_rate?.display_name : null) ??
    null;
  const isPickup = typeof shippingCents === "number" ? shippingCents === 0 : meta.delivery_method === "pickup";
  const pickupLocation = isPickup ? rateName || meta.pickup_location || "Free mosque pickup" : null;

  const { totalEur, goodsEur } = orderMoney({
    amountTotalCents: session.amount_total,
    amountSubtotalCents: session.amount_subtotal,
    shippingEur,
    donationEur,
  });

  const createdMs = session.created ? session.created * 1000 : (options.now ?? new Date()).getTime();
  // Sweden and collection need no review; elsewhere the real delivery cost is
  // checked before dispatch, as the checkout tells the customer.
  const status = isPickup || country === "SE" ? "paid" : "paid_pending_shipping_review";

  return {
    id: crypto.randomUUID(),
    order_number: orderNumber(createdMs),
    lookup_token: crypto.randomUUID(),
    status,
    guest_email: session.customer_details?.email ?? session.customer_email ?? null,
    customer_phone: session.customer_details?.phone ?? null,
    shipping_name: shipping?.name ?? session.customer_details?.name ?? null,
    shipping_country: country,
    shipping_address: address
      ? {
          name: shipping?.name ?? undefined,
          line1: address.line1 ?? undefined,
          line2: address.line2 ?? undefined,
          city: address.city ?? undefined,
          postal_code: address.postal_code ?? undefined,
          country: address.country ?? undefined,
        }
      : null,
    total_amount: totalEur,
    goods_amount: goodsEur,
    currency: (session.currency ?? "eur").toUpperCase(),
    donation_amount: donationEur,
    quantity,
    bundle_type: meta.bundle_type || getBundleType(quantity),
    base_shipping_fee_eur: shippingEur,
    extra_shipping_fee_eur: 0,
    extra_shipping_status: "not_required",
    delivery_method: isPickup ? "pickup" : "shipping",
    pickup_location: pickupLocation,
    notes: null,
    source: options.source ?? "webhook",
    stripe_session_id: session.id,
    stripe_payment_intent_id:
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
    created_at: new Date(createdMs).toISOString(),
  };
}

function insertOrder(db: D1Database, order: OrderRow): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO orders (id, order_number, lookup_token, status, guest_email, customer_phone, shipping_name,
         shipping_country, shipping_address, total_amount, goods_amount, currency, donation_amount, quantity,
         bundle_type, base_shipping_fee_eur, extra_shipping_fee_eur, extra_shipping_status, delivery_method,
         pickup_location, notes, source, stripe_session_id, stripe_payment_intent_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (stripe_session_id) DO NOTHING`,
    )
    .bind(
      order.id,
      order.order_number,
      order.lookup_token,
      order.status,
      order.guest_email,
      order.customer_phone,
      order.shipping_name,
      order.shipping_country,
      order.shipping_address ? JSON.stringify(order.shipping_address) : null,
      order.total_amount,
      order.goods_amount,
      order.currency,
      order.donation_amount,
      order.quantity,
      order.bundle_type,
      order.base_shipping_fee_eur,
      order.extra_shipping_fee_eur,
      order.extra_shipping_status,
      order.delivery_method,
      order.pickup_location,
      order.notes,
      order.source,
      order.stripe_session_id,
      order.stripe_payment_intent_id,
      order.created_at,
      order.created_at,
    );
}

const recordEvent = (db: D1Database, id: string, type: string) =>
  db.prepare("INSERT OR IGNORE INTO stripe_events (event_id, type) VALUES (?, ?)").bind(id, type);

/** An order row as the admin and the emails read it: JSON address parsed. */
export function parseOrderRow(row: Record<string, unknown>): OrderRow {
  const address = typeof row.shipping_address === "string" ? safeJson(row.shipping_address) : row.shipping_address;
  return { ...(row as unknown as OrderRow), shipping_address: (address as OrderRow["shipping_address"]) ?? null };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** The delivery option the customer picked, by name; best-effort. */
async function shippingRateName(env: OrdersEnv, session: StripeSession): Promise<string | null> {
  const rate = session.shipping_cost?.shipping_rate;
  if (!rate) return null;
  if (typeof rate === "object") return rate.display_name ?? null;
  if (!env.STRIPE_SECRET_KEY) return null;
  try {
    const full = await stripeApi<{ display_name?: string }>(env.STRIPE_SECRET_KEY, "GET", `shipping_rates/${rate}`);
    return full.display_name ?? null;
  } catch (error) {
    console.error("orders: could not read the chosen delivery option", error instanceof Error ? error.message : error);
    return null;
  }
}

/** Klaviyo's "Placed Order", through the public client endpoint. Best-effort. */
async function placedOrderToKlaviyo(env: OrdersEnv, order: OrderRow): Promise<void> {
  if (!order.guest_email || !env.KLAVIYO_COMPANY_ID) return;
  try {
    const response = await fetch(`https://a.klaviyo.com/client/events?company_id=${encodeURIComponent(env.KLAVIYO_COMPANY_ID)}`, {
      method: "POST",
      headers: { "Content-Type": "application/vnd.api+json", Accept: "application/vnd.api+json", revision: "2026-10-15" },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            unique_id: order.id,
            value: order.total_amount,
            value_currency: order.currency,
            properties: {
              order_number: order.order_number,
              quantity: order.quantity,
              bundle_type: order.bundle_type,
              shipping_country: order.shipping_country ?? "unknown",
              donation_amount: order.donation_amount,
              delivery_method: order.delivery_method === "pickup" ? "mosque_pickup" : "shipping",
            },
            metric: { data: { type: "metric", attributes: { name: "Placed Order" } } },
            profile: { data: { type: "profile", attributes: { email: order.guest_email } } },
          },
        },
      }),
    });
    if (!response.ok) console.error(`orders: Klaviyo returned ${response.status}`, (await response.text()).slice(0, 200));
  } catch (error) {
    console.error("orders: Klaviyo request failed", error instanceof Error ? error.message : error);
  }
}

/**
 * Saves a paid shop order, counts the stock down and records the event, all
 * in one transaction: either all of it happened, or none of it and Stripe will
 * send the event again. Returns the order if it is new, null if it was already
 * saved (a redelivered event).
 */
export async function saveOrder(db: D1Database, order: OrderRow, eventId: string, eventType: string): Promise<OrderRow | null> {
  const existing = await db.prepare("SELECT id FROM orders WHERE stripe_session_id = ?").bind(order.stripe_session_id).first();
  if (existing) {
    await recordEvent(db, eventId, eventType).run();
    return null;
  }

  await db.batch([
    insertOrder(db, order),
    // Stock is only counted once Rafi has entered it in the admin; until then
    // there is no row and these two do nothing.
    db
      .prepare(
        "UPDATE inventory SET stock_on_hand = stock_on_hand - ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE product_key = ?",
      )
      .bind(order.quantity, PRODUCT_KEY),
    db
      .prepare(
        `INSERT INTO stock_movements (id, product_key, delta, reason, related_order_id)
         SELECT ?, ?, ?, 'order_paid', ? WHERE EXISTS (SELECT 1 FROM inventory WHERE product_key = ?)`,
      )
      .bind(crypto.randomUUID(), PRODUCT_KEY, -order.quantity, order.id, PRODUCT_KEY),
    recordEvent(db, eventId, eventType),
  ]);
  return order;
}

/** Emails and the marketing event for a newly saved order. Never throws. */
async function afterOrderSaved(env: OrdersEnv, order: OrderRow): Promise<void> {
  const sends: Promise<unknown>[] = [
    sendEmail(env.RESEND_API_KEY, ownerOrderAlertEmail(order)),
    placedOrderToKlaviyo(env, order),
  ];
  if (order.guest_email) sends.push(sendEmail(env.RESEND_API_KEY, orderConfirmationEmail(order)));

  const inventory = await env.DB.prepare("SELECT stock_on_hand, low_stock_threshold FROM inventory WHERE product_key = ?")
    .bind(PRODUCT_KEY)
    .first<{ stock_on_hand: number; low_stock_threshold: number | null }>()
    .catch(() => null);
  if (inventory) {
    const threshold = inventory.low_stock_threshold ?? LOW_STOCK_FALLBACK;
    if (inventory.stock_on_hand <= threshold) sends.push(sendEmail(env.RESEND_API_KEY, lowStockEmail(inventory.stock_on_hand, threshold)));
  }
  await Promise.allSettled(sends);
}

function plain(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export async function handleStripeWebhook(request: Request, env: OrdersEnv): Promise<Response> {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    // 503, not 200: Stripe keeps the event and retries once the secret is set.
    console.error("stripe-webhook: STRIPE_WEBHOOK_SECRET is not set");
    return plain({ error: "Webhook not configured" }, 503);
  }

  const payload = await request.text();
  if (!(await verifyStripeSignature(payload, request.headers.get("Stripe-Signature"), env.STRIPE_WEBHOOK_SECRET))) {
    console.error("stripe-webhook: signature check failed");
    return plain({ error: "Invalid signature" }, 400);
  }

  const event = JSON.parse(payload) as { id: string; type: string; data?: { object?: StripeSession } };
  const seen = await env.DB.prepare("SELECT event_id FROM stripe_events WHERE event_id = ?").bind(event.id).first();
  if (seen) return plain({ received: true, duplicate: true }, 200);

  const handled = event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded";
  const session = event.data?.object;
  if (!handled || !session?.id) {
    await recordEvent(env.DB, event.id, event.type).run();
    return plain({ received: true, ignored: event.type }, 200);
  }

  // A delayed payment method reports "completed" before the money is in; the
  // order is saved when async_payment_succeeded follows.
  if (session.payment_status === "unpaid") {
    await recordEvent(env.DB, event.id, event.type).run();
    return plain({ received: true, awaiting_payment: true }, 200);
  }

  const kind = sessionKind(session);
  if (kind === "extra_shipping") {
    const orderId = session.metadata?.order_id ?? "";
    await env.DB.batch([
      env.DB.prepare(
        "UPDATE orders SET extra_shipping_status = 'paid', status = 'ready_to_ship', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
      ).bind(orderId),
      recordEvent(env.DB, event.id, event.type),
    ]);
    console.log("stripe-webhook: extra delivery paid for order", orderId);
    return plain({ received: true, type: "extra_shipping_paid" }, 200);
  }
  if (kind !== "order") {
    await recordEvent(env.DB, event.id, event.type).run();
    return plain({ received: true, type: kind }, 200);
  }

  const order = orderFromSession(session, { shippingRateName: await shippingRateName(env, session) });
  const saved = await saveOrder(env.DB, order, event.id, event.type);
  if (!saved) return plain({ received: true, duplicate: true }, 200);

  console.log("stripe-webhook: order saved", saved.order_number, saved.status);
  await afterOrderSaved(env, saved);
  return plain({ received: true }, 200);
}

// --- Order lookup ---------------------------------------------------------

/** What a customer sees of their order: no email, no street address. */
export function publicOrder(order: OrderRow) {
  const unitPrice = order.quantity > 0 ? Math.round((order.goods_amount * 100) / order.quantity) / 100 : 0;
  return {
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    total_amount: order.total_amount,
    currency: order.currency,
    created_at: order.created_at,
    order_items: [
      {
        id: order.id,
        quantity: order.quantity,
        unit_price: unitPrice,
        total_price: order.goods_amount,
        products: { name: PRODUCT.name, description: PRODUCT.description, price: unitPrice },
      },
    ],
    payments: [
      { id: order.stripe_payment_intent_id ?? order.id, status: "succeeded", amount: order.total_amount, currency: order.currency, created_at: order.created_at },
    ],
    shipping_region: order.delivery_method === "pickup" ? order.pickup_location ?? "Pickup" : order.shipping_country ?? "N/A",
  };
}

export async function handleOrderLookup(
  request: Request,
  env: OrdersEnv,
  json: (body: unknown, status: number) => Response,
): Promise<Response> {
  const body = (await request.json().catch(() => null)) as { orderNumber?: unknown; lookupToken?: unknown } | null;
  const orderNumber = typeof body?.orderNumber === "string" ? body.orderNumber.trim() : "";
  const lookupToken = typeof body?.lookupToken === "string" ? body.lookupToken.trim() : "";
  if (!orderNumber || !lookupToken) return json({ error: "Order number and lookup token are required" }, 400);
  if (orderNumber.length > 64 || !UUID.test(lookupToken)) return json({ error: "Invalid lookup token format" }, 400);

  const row = await env.DB.prepare("SELECT * FROM orders WHERE order_number = ? AND lookup_token = ?")
    .bind(orderNumber, lookupToken)
    .first();
  if (!row) return json({ error: "Order not found. Please check your order number and lookup token." }, 404);
  return json({ success: true, order: publicOrder(parseOrderRow(row)) }, 200);
}

// --- One-off import of past orders from Stripe -----------------------------

/**
 * Orders older than this were almost certainly sent long ago; they are
 * imported as shipped so the admin does not list them as waiting. Newer ones
 * come in as paid, so Rafi checks each of them.
 */
const IMPORT_SHIPPED_AFTER_DAYS = 21;

/**
 * Copies one page of Stripe's completed checkouts into D1. Call it again with
 * the returned `next` until `next` is null. Answers with counts only, never
 * customer details. Only reachable while the IMPORT_TOKEN secret is set.
 */
export async function handleStripeImport(request: Request, env: OrdersEnv): Promise<Response> {
  if (!env.IMPORT_TOKEN) return plain({ error: "Not found" }, 404);
  if (request.headers.get("Authorization") !== `Bearer ${env.IMPORT_TOKEN}`) return plain({ error: "Not found" }, 404);
  if (!env.STRIPE_SECRET_KEY) return plain({ error: "STRIPE_SECRET_KEY is not set" }, 503);

  const startingAfter = new URL(request.url).searchParams.get("starting_after") ?? undefined;
  let page: { data: StripeSession[]; has_more: boolean };
  try {
    page = await stripeApi(env.STRIPE_SECRET_KEY, "GET", "checkout/sessions", {
      status: "complete",
      limit: 25,
      starting_after: startingAfter,
      expand: ["data.shipping_cost.shipping_rate"],
    });
  } catch (error) {
    const message = error instanceof StripeError ? error.message : String(error);
    return plain({ error: message }, 502);
  }

  const now = Date.now();
  const counts = { seen: page.data.length, imported: 0, already_there: 0, not_paid: 0, not_an_order: 0, as_shipped: 0, as_paid: 0 };
  const statements: D1PreparedStatement[] = [];
  let oldest: string | null = null;
  let newest: string | null = null;

  for (const session of page.data) {
    if (session.payment_status !== "paid") {
      counts.not_paid++;
      continue;
    }
    if (sessionKind(session) !== "order") {
      counts.not_an_order++;
      continue;
    }
    const exists = await env.DB.prepare("SELECT 1 FROM orders WHERE stripe_session_id = ?").bind(session.id).first();
    if (exists) {
      counts.already_there++;
      continue;
    }
    const order = orderFromSession(session, { source: "stripe_import" });
    const ageDays = (now - Date.parse(order.created_at)) / 86_400_000;
    if (ageDays > IMPORT_SHIPPED_AFTER_DAYS) {
      order.status = "shipped";
      order.notes = "Copied from Stripe on 14 Nov 2026 while Supabase was paused. Marked shipped on import because of its age; Supabase held the real status.";
      counts.as_shipped++;
    } else {
      order.notes = "Copied from Stripe on 14 Nov 2026 while Supabase was paused. Check whether it has been sent.";
      counts.as_paid++;
    }
    statements.push(insertOrder(env.DB, order));
    counts.imported++;
    oldest = !oldest || order.created_at < oldest ? order.created_at : oldest;
    newest = !newest || order.created_at > newest ? order.created_at : newest;
  }
  if (statements.length > 0) await env.DB.batch(statements);

  const last = page.data[page.data.length - 1];
  return plain({ ...counts, oldest, newest, next: page.has_more && last ? last.id : null }, 200);
}
