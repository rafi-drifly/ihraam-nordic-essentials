/**
 * Web Push notifications for new orders, sent to the shop owner.
 *
 * The wire protocol lives in webpush-crypto.ts; this module is only the
 * Supabase-facing half — which devices to notify, what to say, and cleaning up
 * endpoints the push service has retired.
 *
 * Every failure is swallowed, exactly as in the Klaviyo module. The customer
 * has paid and the order row already exists; a missed notification must never
 * fail the webhook and cause Stripe to retry a delivered order.
 */

import { buildVapidAuthHeader, encryptPayload } from "./webpush-crypto.ts";

export interface OrderForPush {
  orderNumber: string;
  totalAmount: number;
  currency: string;
  quantity: number | null;
  shippingName: string | null;
  shippingCountry: string | null;
  isPickup: boolean;
}

interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface QueryResult {
  data: Record<string, unknown>[] | null;
  error: { message: string } | null;
}

/**
 * Just the slice of the Supabase client this module touches. Structural typing
 * keeps the real client assignable without dragging its generated database
 * types into an edge function that only needs four calls.
 */
interface SupabaseLike {
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): PromiseLike<QueryResult>;
      in(column: string, values: string[]): PromiseLike<QueryResult>;
    };
    update(values: Record<string, unknown>): {
      eq(column: string, value: string): PromiseLike<unknown>;
    };
    delete(): {
      in(column: string, values: string[]): PromiseLike<unknown>;
    };
  };
}

const TTL_SECONDS = 86400;

/** Exported for tests: the wording is the whole value of the feature. */
export function buildMessage(order: OrderForPush): { title: string; body: string } {
  const symbol = order.currency === "EUR" ? "€" : `${order.currency} `;
  const amount = `${symbol}${order.totalAmount.toFixed(2)}`;
  const sets =
    order.quantity && order.quantity > 0
      ? `${order.quantity} set${order.quantity === 1 ? "" : "s"} · `
      : "";
  const who = order.shippingName ?? "A customer";
  const where = order.isPickup
    ? "collection"
    : order.shippingCountry
      ? `ship to ${order.shippingCountry}`
      : "delivery";

  return { title: `New order · ${amount}`, body: `${sets}${who} · ${where}` };
}

/**
 * Notify every device belonging to an admin. Endpoints the push service has
 * retired (404/410) are deleted — the only supported way to learn a
 * subscription is dead is to be told when you send to it.
 */
export async function sendOrderPush(
  supabaseClient: SupabaseLike,
  order: OrderForPush
): Promise<void> {
  try {
    const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!publicKey || !privateKey) {
      console.warn("Push: VAPID keys not set, skipping order notification");
      return;
    }
    const subject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:pureihraam@gmail.com";

    const { data: admins, error: adminError } = await supabaseClient
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    if (adminError || !admins?.length) {
      console.warn("Push: no admin users to notify", adminError?.message ?? "");
      return;
    }

    const adminIds = (admins as { user_id: string }[]).map((row) => row.user_id);
    const { data: subscriptions, error: subError } = await supabaseClient
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .in("user_id", adminIds);
    if (subError || !subscriptions?.length) {
      console.log("Push: no subscribed devices", subError?.message ?? "");
      return;
    }

    const { title, body } = buildMessage(order);
    const payload = JSON.stringify({
      title,
      body,
      url: "/admin/orders",
      tag: `order-${order.orderNumber}`,
    });

    const dead: string[] = [];

    await Promise.all(
      (subscriptions as SubscriptionRow[]).map(async (sub) => {
        try {
          const encrypted = await encryptPayload(payload, sub.p256dh, sub.auth);
          const authorization = await buildVapidAuthHeader(
            sub.endpoint,
            publicKey,
            privateKey,
            subject
          );

          const response = await fetch(sub.endpoint, {
            method: "POST",
            headers: {
              Authorization: authorization,
              "Content-Encoding": "aes128gcm",
              "Content-Type": "application/octet-stream",
              TTL: String(TTL_SECONDS),
            },
            body: encrypted,
          });

          if (response.status === 404 || response.status === 410) {
            dead.push(sub.id);
            return;
          }
          if (!response.ok) {
            console.error(`Push: endpoint returned ${response.status}`);
            return;
          }
          await supabaseClient
            .from("push_subscriptions")
            .update({ last_success_at: new Date().toISOString(), failure_count: 0 })
            .eq("id", sub.id);
        } catch (error) {
          console.error("Push: send failed", error instanceof Error ? error.message : error);
        }
      })
    );

    if (dead.length) {
      await supabaseClient.from("push_subscriptions").delete().in("id", dead);
      console.log(`Push: pruned ${dead.length} expired subscription(s)`);
    }
  } catch (error) {
    console.error("Push: unexpected failure", error instanceof Error ? error.message : error);
  }
}
