/**
 * Push completed orders into Klaviyo.
 *
 * Klaviyo was already installed (onsite SDK plus a server-side integration for
 * prep-pack signups), but nothing ever told it about a purchase. Without a
 * "Placed Order" metric there is no post-purchase flow, no review request, and
 * an abandoned-cart flow has no purchase event to suppress against - so it
 * would email people who had already bought.
 *
 * Uses the same KLAVIYO_PRIVATE_API_KEY the prep-pack function already relies
 * on, so this needs no new credentials.
 *
 * Every failure here is swallowed. The customer has paid and the order is
 * already in the database; a marketing side effect must never fail the webhook
 * and make Stripe retry a delivered order.
 */

const KLAVIYO_REVISION = "2024-10-15";

export interface OrderForKlaviyo {
  email: string;
  orderNumber: string;
  orderId: string;
  totalAmount: number;
  currency: string;
  quantity: number;
  bundleType: string;
  shippingCountry: string | null;
  shippingName: string | null;
  donationAmount: number;
  isPickup: boolean;
}

/** Klaviyo's canonical purchase metric name. */
const PLACED_ORDER = "Placed Order";

export async function sendPlacedOrderToKlaviyo(order: OrderForKlaviyo): Promise<void> {
  const apiKey = Deno.env.get("KLAVIYO_PRIVATE_API_KEY");
  if (!apiKey) {
    console.warn("Klaviyo: KLAVIYO_PRIVATE_API_KEY not set, skipping Placed Order event");
    return;
  }
  if (!order.email) {
    console.warn("Klaviyo: order has no email, skipping Placed Order event");
    return;
  }

  try {
    const res = await fetch("https://a.klaviyo.com/api/events/", {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            // Deduplicates if Stripe delivers the same event twice.
            unique_id: order.orderId,
            value: order.totalAmount,
            value_currency: order.currency,
            properties: {
              order_number: order.orderNumber,
              order_id: order.orderId,
              quantity: order.quantity,
              bundle_type: order.bundleType,
              shipping_country: order.shippingCountry ?? "unknown",
              donation_amount: order.donationAmount,
              delivery_method: order.isPickup ? "mosque_pickup" : "shipping",
            },
            metric: { data: { type: "metric", attributes: { name: PLACED_ORDER } } },
            profile: {
              data: {
                type: "profile",
                attributes: {
                  email: order.email,
                  ...(order.shippingName ? { first_name: order.shippingName.split(" ")[0] } : {}),
                  properties: {
                    last_order_number: order.orderNumber,
                    last_shipping_country: order.shippingCountry ?? "unknown",
                  },
                },
              },
            },
          },
        },
      }),
    });

    if (!res.ok) {
      console.error("Klaviyo Placed Order failed:", res.status, await res.text());
    } else {
      await res.text();
      console.log("Klaviyo Placed Order sent for", order.orderNumber);
    }
  } catch (err) {
    // Never rethrow: a marketing event must not fail a paid order's webhook.
    console.error("Klaviyo Placed Order threw:", err);
  }
}
