/**
 * Order notifications for Pure Ihram, running entirely on Cloudflare.
 *
 * Stripe supports more than one webhook endpoint, so this Worker subscribes to
 * checkout.session.completed alongside the existing Supabase webhook rather
 * than replacing it. That is the whole safety story of this stage: the payment
 * path is untouched, and if anything here breaks, orders still record exactly
 * as they do today — the owner just does not get a buzz.
 *
 * Everything the notification needs is already in the session Stripe sends, so
 * this makes no Stripe API calls and needs no Stripe SDK.
 */

import { buildVapidAuthHeader, encryptPayload } from "./webpush";

export interface Env {
  PUSH_SUBSCRIPTIONS: KVNamespace;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_SUBJECT: string;
  ENROLMENT_SECRET: string;
  STRIPE_WEBHOOK_SECRET: string;
  ALLOWED_ORIGIN: string;
}

interface StoredSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
  createdAt: string;
}

const KEY_PREFIX = "sub:";
const TTL_SECONDS = 86400;
/** Stripe's own tolerance for replayed webhook timestamps. */
const SIGNATURE_TOLERANCE_SECONDS = 300;

function corsHeaders(env: Env): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, env: Env): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(env) },
  });
}

/** Comparison that does not leak how much of the secret matched. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function subscriptionKey(endpoint: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(endpoint));
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return KEY_PREFIX + hex;
}

/**
 * Verify a Stripe webhook signature using Web Crypto.
 *
 * Stripe's own SDK can do this, but only through its async path on Workers;
 * the header format is simple enough that doing it here avoids shipping the
 * whole SDK to verify one HMAC.
 */
async function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string
): Promise<boolean> {
  if (!header) return false;

  const parts = Object.fromEntries(
    header.split(",").map((piece) => {
      const index = piece.indexOf("=");
      return [piece.slice(0, index).trim(), piece.slice(index + 1).trim()];
    })
  ) as Record<string, string>;

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  // Reject stale signatures so a captured request cannot be replayed later.
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > SIGNATURE_TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`)
  );
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");

  return timingSafeEqual(expected, signature);
}

interface StripeSession {
  amount_total?: number | null;
  currency?: string | null;
  customer_details?: { name?: string | null } | null;
  shipping_details?: { name?: string | null; address?: { country?: string | null } | null } | null;
  customer_address?: { country?: string | null } | null;
  metadata?: Record<string, string> | null;
}

/** Exported for tests: the wording is the whole value of the feature. */
export function buildMessage(session: StripeSession): { title: string; body: string } {
  const currency = (session.currency ?? "eur").toUpperCase();
  const amount = ((session.amount_total ?? 0) / 100).toFixed(2);
  const symbol = currency === "EUR" ? "€" : `${currency} `;

  const metadata = session.metadata ?? {};
  const quantity = Number(metadata.total_quantity ?? "");
  const sets =
    Number.isFinite(quantity) && quantity > 0
      ? `${quantity} set${quantity === 1 ? "" : "s"} · `
      : "";

  const who = session.shipping_details?.name ?? session.customer_details?.name ?? "A customer";

  const isPickup = metadata.delivery_method === "pickup";
  const country =
    session.shipping_details?.address?.country ?? session.customer_address?.country ?? null;
  const where = isPickup
    ? metadata.pickup_location
      ? `collect · ${metadata.pickup_location}`
      : "collection"
    : country
      ? `ship to ${country}`
      : "delivery";

  return { title: `New order · ${symbol}${amount}`, body: `${sets}${who} · ${where}` };
}

async function loadSubscriptions(env: Env): Promise<{ key: string; sub: StoredSubscription }[]> {
  const listed = await env.PUSH_SUBSCRIPTIONS.list({ prefix: KEY_PREFIX });
  const entries = await Promise.all(
    listed.keys.map(async ({ name }) => {
      const sub = await env.PUSH_SUBSCRIPTIONS.get<StoredSubscription>(name, "json");
      return sub ? { key: name, sub } : null;
    })
  );
  return entries.filter((entry): entry is { key: string; sub: StoredSubscription } => entry !== null);
}

async function deliver(env: Env, payload: string): Promise<{ sent: number; pruned: number }> {
  const subscriptions = await loadSubscriptions(env);
  if (!subscriptions.length) return { sent: 0, pruned: 0 };

  let sent = 0;
  const dead: string[] = [];

  await Promise.all(
    subscriptions.map(async ({ key, sub }) => {
      try {
        const body = await encryptPayload(payload, sub.p256dh, sub.auth);
        const authorization = await buildVapidAuthHeader(
          sub.endpoint,
          env.VAPID_PUBLIC_KEY,
          env.VAPID_PRIVATE_KEY,
          env.VAPID_SUBJECT || "mailto:pureihraam@gmail.com"
        );

        const response = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            Authorization: authorization,
            "Content-Encoding": "aes128gcm",
            "Content-Type": "application/octet-stream",
            TTL: String(TTL_SECONDS),
          },
          body,
        });

        // 404/410 is the only way a push service tells you a device is gone.
        if (response.status === 404 || response.status === 410) {
          dead.push(key);
          return;
        }
        if (!response.ok) {
          console.error(`push: endpoint returned ${response.status}`);
          return;
        }
        sent += 1;
      } catch (error) {
        console.error("push: send failed", error instanceof Error ? error.message : error);
      }
    })
  );

  await Promise.all(dead.map((key) => env.PUSH_SUBSCRIPTIONS.delete(key)));
  return { sent, pruned: dead.length };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (url.pathname === "/health") {
      return json({ ok: true, configured: Boolean(env.VAPID_PRIVATE_KEY) }, 200, env);
    }

    // --- Stripe webhook -------------------------------------------------
    if (url.pathname === "/stripe" && request.method === "POST") {
      const raw = await request.text();
      const valid = await verifyStripeSignature(
        raw,
        request.headers.get("stripe-signature"),
        env.STRIPE_WEBHOOK_SECRET
      );
      if (!valid) {
        console.error("stripe: signature verification failed");
        return new Response("Invalid signature", { status: 400 });
      }

      let event: { type?: string; data?: { object?: StripeSession } };
      try {
        event = JSON.parse(raw);
      } catch {
        return new Response("Bad JSON", { status: 400 });
      }

      if (event.type !== "checkout.session.completed" || !event.data?.object) {
        // Acknowledge anything else so Stripe does not retry it.
        return new Response("Ignored", { status: 200 });
      }

      const { title, body } = buildMessage(event.data.object);
      const result = await deliver(
        env,
        JSON.stringify({ title, body, url: "/admin/orders", tag: `order-${Date.now()}` })
      );
      console.log(`push: delivered to ${result.sent}, pruned ${result.pruned}`);

      // Always 200: a failed notification must never make Stripe retry a
      // payment that the Supabase webhook has already recorded correctly.
      return new Response("OK", { status: 200 });
    }

    // --- Device enrolment -----------------------------------------------
    if (url.pathname === "/subscribe" && request.method === "POST") {
      const payload = (await request.json().catch(() => null)) as {
        secret?: string;
        subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
        userAgent?: string;
      } | null;

      if (!payload?.secret || !timingSafeEqual(payload.secret, env.ENROLMENT_SECRET)) {
        return json({ error: "That enrolment code is not right." }, 401, env);
      }

      const { endpoint, keys } = payload.subscription ?? {};
      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return json({ error: "Incomplete subscription." }, 400, env);
      }

      const record: StoredSubscription = {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: payload.userAgent?.slice(0, 300),
        createdAt: new Date().toISOString(),
      };
      await env.PUSH_SUBSCRIPTIONS.put(await subscriptionKey(endpoint), JSON.stringify(record));
      return json({ ok: true }, 200, env);
    }

    if (url.pathname === "/unsubscribe" && request.method === "POST") {
      const payload = (await request.json().catch(() => null)) as {
        secret?: string;
        endpoint?: string;
      } | null;

      if (!payload?.secret || !timingSafeEqual(payload.secret, env.ENROLMENT_SECRET)) {
        return json({ error: "That enrolment code is not right." }, 401, env);
      }
      if (!payload.endpoint) return json({ error: "Missing endpoint." }, 400, env);

      await env.PUSH_SUBSCRIPTIONS.delete(await subscriptionKey(payload.endpoint));
      return json({ ok: true }, 200, env);
    }

    // --- Send a test notification to every enrolled device ---------------
    if (url.pathname === "/test" && request.method === "POST") {
      const payload = (await request.json().catch(() => null)) as { secret?: string } | null;
      if (!payload?.secret || !timingSafeEqual(payload.secret, env.ENROLMENT_SECRET)) {
        return json({ error: "That enrolment code is not right." }, 401, env);
      }
      const result = await deliver(
        env,
        JSON.stringify({
          title: "Test · Pure Ihram",
          body: "Order alerts are working on this device.",
          url: "/admin/orders",
          tag: "pureihram-test",
        })
      );
      return json({ ok: true, ...result }, 200, env);
    }

    return json({ error: "Not found" }, 404, env);
  },
};
