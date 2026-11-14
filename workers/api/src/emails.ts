/**
 * The shop's emails, sent through Resend from @pureihram.com.
 *
 * Under Supabase these never reached anyone (the sender domain had no DKIM
 * record, and the confirmation function was called with the wrong body), so
 * this is the first version customers will actually receive. Rewritten from the
 * Supabase template with the brand manual's rules: no promise the shop does not
 * keep (it sends no tracking emails), the right greeting for every customer,
 * and every value a customer typed escaped before it goes into the markup.
 */

export const OWNER_INBOX = "pureihraam@gmail.com";
const SITE = "https://www.pureihram.com";
const SACRED_TEAL = "#287777";
const DEEP_TEAL = "#305050";
const MIST = "#F0F5F5";

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);
const eur = (value: number) => `€${value.toFixed(2)}`;

export interface EmailMessage {
  from: string;
  to: string[];
  subject: string;
  html: string;
  reply_to?: string;
}

/** Sends one email. Never throws: an email must not undo an order already saved. */
export async function sendEmail(apiKey: string | undefined, message: EmailMessage): Promise<boolean> {
  if (!apiKey) {
    console.error("email: RESEND_API_KEY is not set; not sent:", message.subject);
    return false;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(message),
    });
    if (!response.ok) {
      console.error(`email: Resend returned ${response.status} for "${message.subject}"`, (await response.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (error) {
    console.error("email: Resend request failed", error instanceof Error ? error.message : String(error));
    return false;
  }
}

export interface EmailOrder {
  order_number: string;
  lookup_token: string;
  shipping_name: string | null;
  guest_email: string | null;
  customer_phone: string | null;
  shipping_address: { name?: string; line1?: string; line2?: string; city?: string; postal_code?: string; country?: string } | null;
  quantity: number;
  bundle_type: string | null;
  goods_amount: number;
  base_shipping_fee_eur: number;
  donation_amount: number;
  total_amount: number;
  delivery_method: string;
  pickup_location: string | null;
  status: string;
  created_at: string;
}

export function lookupUrl(order: Pick<EmailOrder, "order_number" | "lookup_token">): string {
  return `${SITE}/guest-order-lookup?order=${encodeURIComponent(order.order_number)}&token=${encodeURIComponent(order.lookup_token)}`;
}

function addressLines(order: EmailOrder): string {
  const a = order.shipping_address ?? {};
  return [a.name, a.line1, a.line2, [a.postal_code, a.city].filter(Boolean).join(" "), a.country]
    .filter(Boolean)
    .map(esc)
    .join("<br>");
}

const setsLabel = (quantity: number) => (quantity === 1 ? "1 Ihram set (Izaar and Ridaa)" : `${quantity} Ihram sets (Izaar and Ridaa)`);

function frame(title: string, body: string): string {
  return `<div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: ${DEEP_TEAL};">
  <div style="background: ${SACRED_TEAL}; color: #ffffff; padding: 24px; text-align: center;">
    <p style="margin: 0; font-size: 14px; font-weight: 700;">Pure Ihram</p>
    <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 400;">${title}</h1>
  </div>
  <div style="padding: 28px 20px; line-height: 1.6;">${body}</div>
  <div style="padding: 16px 20px; text-align: center; font-size: 13px; color: ${DEEP_TEAL};">
    Pure Ihram · Sweden · <a href="mailto:${OWNER_INBOX}" style="color: ${SACRED_TEAL};">${OWNER_INBOX}</a>
  </div>
</div>`;
}

/** To the customer, once the payment has gone through. */
export function orderConfirmationEmail(order: EmailOrder): EmailMessage {
  const isPickup = order.delivery_method === "pickup";
  const name = order.shipping_name?.trim() || "";
  const delivery = isPickup
    ? `<p style="margin: 0;"><strong>Collection:</strong> ${esc(order.pickup_location || "Free mosque pickup")}</p>
       <p style="margin: 8px 0 0 0;">We will email you the details for collection.</p>`
    : `<p style="margin: 0;"><strong>Delivery to:</strong><br>${addressLines(order)}</p>
       <p style="margin: 8px 0 0 0;">Sweden: 3-7 business days. The Nordics and the EU: 7-14 business days.</p>`;

  const rows = [
    [setsLabel(order.quantity), eur(order.goods_amount)],
    [isPickup ? "Collection" : "Delivery", eur(order.base_shipping_fee_eur)],
    ...(order.donation_amount > 0 ? [["Donation, with thanks", eur(order.donation_amount)]] : []),
  ]
    .map(
      ([label, amount]) =>
        `<tr><td style="padding: 8px 0; border-bottom: 1px solid #D3E1E1;">${label}</td><td style="padding: 8px 0; border-bottom: 1px solid #D3E1E1; text-align: right;">${amount}</td></tr>`,
    )
    .join("");

  const body = `
    <p style="margin: 0 0 16px 0;">Assalamu alaikum${name ? ` ${esc(name)}` : ""},</p>
    <p style="margin: 0 0 20px 0;">Thank you for your order. We have received your payment and are preparing it now.</p>

    <div style="background: ${MIST}; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0;"><strong>Order number:</strong> ${esc(order.order_number)}</p>
      <p style="margin: 4px 0 0 0;"><strong>Date:</strong> ${esc(new Date(order.created_at).toISOString().slice(0, 10))}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      ${rows}
      <tr><td style="padding: 10px 0; font-weight: 700;">Total paid</td><td style="padding: 10px 0; text-align: right; font-weight: 700;">${eur(order.total_amount)}</td></tr>
    </table>

    <div style="background: ${MIST}; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">${delivery}</div>

    <p style="margin: 0 0 20px 0;"><strong>Before you fly:</strong> wash the set once at home before you travel.</p>

    <p style="margin: 0 0 20px 0;">You can check your order at any time here:<br>
      <a href="${esc(lookupUrl(order))}" style="color: ${SACRED_TEAL};">View your order</a></p>

    <div style="border: 1px solid #D3E1E1; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0 0 8px 0; font-weight: 700;">Free with your order: the Hajj &amp; Umrah Dua Pocket Guide</p>
      <p style="margin: 0 0 12px 0;">Duas for every stage of Hajj and Umrah, in Arabic, transliteration and English, in a printable pocket format.</p>
      <a href="${SITE}/hajj-2026-prep-pack.pdf" style="color: ${SACRED_TEAL}; font-weight: 700;">Download the guide (PDF)</a>
    </div>

    <p style="margin: 0;">Questions about your order? Just reply to this email.</p>
    <p style="margin: 16px 0 0 0;">JazakAllahu khairan for choosing Pure Ihram.</p>`;

  return {
    from: "Pure Ihram <orders@pureihram.com>",
    to: [order.guest_email ?? ""],
    reply_to: OWNER_INBOX,
    subject: `Your Pure Ihram order ${order.order_number}`,
    html: frame("Order confirmation", body),
  };
}

/** To the shop, with everything needed to send or hand over the order. */
export function ownerOrderAlertEmail(order: EmailOrder): EmailMessage {
  const isPickup = order.delivery_method === "pickup";
  const body = `
    <p style="margin: 0 0 4px 0;"><strong>${esc(order.order_number)}</strong> · ${esc(order.status)}</p>
    <p style="margin: 0 0 16px 0;">${order.quantity} set${order.quantity === 1 ? "" : "s"} (${esc(order.bundle_type ?? "")}) · total ${eur(order.total_amount)}${
      order.donation_amount > 0 ? ` · includes donation ${eur(order.donation_amount)}` : ""
    }</p>
    <p style="margin: 0;"><strong>Customer:</strong> ${esc(order.shipping_name ?? "")}</p>
    <p style="margin: 0;"><strong>Email:</strong> ${esc(order.guest_email ?? "")}</p>
    <p style="margin: 0 0 16px 0;"><strong>Phone:</strong> ${esc(order.customer_phone ?? "not given")}</p>
    ${
      isPickup
        ? `<p style="margin: 0;"><strong>Collection:</strong> ${esc(order.pickup_location ?? "mosque pickup")}</p>`
        : `<p style="margin: 0;"><strong>Ship to:</strong><br>${addressLines(order)}</p>
           <p style="margin: 8px 0 0 0;">Delivery charged: ${eur(order.base_shipping_fee_eur)}</p>`
    }`;
  return {
    from: "Pure Ihram Orders <noreply@pureihram.com>",
    to: [OWNER_INBOX],
    subject: `New order ${order.order_number}: ${order.quantity} set${order.quantity === 1 ? "" : "s"}${isPickup ? ", pickup" : ""}`,
    html: frame("New order", body),
  };
}

export function lowStockEmail(stock: number, threshold: number): EmailMessage {
  return {
    from: "Pure Ihram Alerts <noreply@pureihram.com>",
    to: [OWNER_INBOX],
    subject: `Low stock: ${stock} Ihram sets left`,
    html: frame(
      "Low stock",
      `<p style="margin: 0;">${stock} sets are left, at or below your alert level of ${threshold}.</p>`,
    ),
  };
}

/** To a customer outside Sweden, when the real delivery cost is more than the €9 paid. */
export function extraShippingEmail(order: EmailOrder, extraAmount: number, paymentUrl: string): EmailMessage {
  const a = order.shipping_address ?? {};
  const summary = [a.name, a.line1, a.city, a.country].filter(Boolean).map(esc).join(", ");
  const body = `
    <p style="margin: 0 0 16px 0;">Assalamu alaikum${order.shipping_name ? ` ${esc(order.shipping_name)}` : ""},</p>
    <p style="margin: 0 0 16px 0;">Thank you for your order. Delivery to your address costs more than the ${eur(order.base_shipping_fee_eur)} paid at checkout, so there is an extra delivery charge before we can send it.</p>
    <div style="background: ${MIST}; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0;"><strong>Order:</strong> ${esc(order.order_number)}</p>
      <p style="margin: 0;"><strong>Shipping to:</strong> ${summary}</p>
      <p style="margin: 8px 0 0 0; font-size: 20px;"><strong>Extra delivery: ${eur(extraAmount)}</strong></p>
    </div>
    <p style="margin: 0 0 20px 0; text-align: center;">
      <a href="${esc(paymentUrl)}" style="background: ${SACRED_TEAL}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 700; display: inline-block;">Pay ${eur(extraAmount)}</a>
    </p>
    <p style="margin: 0 0 16px 0;">We send your order as soon as this payment is through. If you would rather cancel the order instead, reply to this email and we will refund it.</p>
    <p style="margin: 0;">JazakAllahu khairan,<br>Pure Ihram</p>`;
  return {
    from: "Pure Ihram <orders@pureihram.com>",
    to: [order.guest_email ?? ""],
    reply_to: OWNER_INBOX,
    subject: `Extra delivery charge for order ${order.order_number}`,
    html: frame("Extra delivery charge", body),
  };
}
