/**
 * The order confirmation email, as HTML.
 *
 * Kept apart from the handler so it can be tested: the line total is the
 * order's own share of the charge, and every value a customer typed is escaped.
 * A 3-pack printed 18.33 x 3 = 54.99 EUR under the old price x quantity sum, and
 * a name typed at Stripe went into the markup as-is.
 *
 * No Deno-only imports, so vitest can cover it.
 */

export interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
  /** Line total. Falls back to price x quantity only for older callers. */
  total?: number;
}

export interface OrderEmailRequest {
  email: string;
  orderNumber: string;
  customerName: string;
  items: OrderEmailItem[];
  totalAmount: number;
  shippingAddress: Record<string, unknown> | null;
}

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escape anything a customer could have typed before it goes into the markup. */
export function esc(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

export function renderOrderEmail(order: OrderEmailRequest, orderDate = new Date()): string {
  const { customerName, orderNumber, items, totalAmount } = order;
  const address = (order.shippingAddress ?? {}) as Record<string, unknown>;

  const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${esc(item.name)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)}€</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.total ?? item.price * item.quantity).toFixed(2)}€</td>
      </tr>
    `).join('');

  return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0f766e, #059669); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Order Confirmation</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your order!</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #0f766e; margin-bottom: 10px;">Dear ${esc(customerName)},</h2>
            <p style="line-height: 1.6; margin-bottom: 20px;">
              We have received your order and are preparing it for shipment. You will receive another email 
              with tracking information once your order has been shipped.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #0f766e; margin: 0 0 10px 0;">Order Details</h3>
              <p style="margin: 5px 0;"><strong>Order Number:</strong> ${esc(orderNumber)}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${orderDate.toLocaleDateString()}</p>
            </div>
            
            <h3 style="color: #0f766e; margin-bottom: 15px;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                  <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                  <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                  <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr style="font-weight: bold; background: #f8f9fa;">
                  <td colspan="3" style="padding: 12px 8px; text-align: right;">Total Amount:</td>
                  <td style="padding: 12px 8px; text-align: right;">${totalAmount.toFixed(2)}€</td>
                </tr>
              </tbody>
            </table>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #0f766e; margin: 0 0 10px 0;">Shipping Address</h3>
              <p style="margin: 0; line-height: 1.4;">
                ${esc(address.name)}<br>
                ${esc(address.line1)}<br>
                ${address.line2 ? `${esc(address.line2)}<br>` : ''}
                ${esc(address.postal_code)} ${esc(address.city)}<br>
                ${esc(address.country)}
              </p>
            </div>

            <div style="background: #f0fdfa; border: 1px solid #99f6e4; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <h3 style="color: #0f766e; margin: 0 0 8px 0;">Your free gift: Hajj &amp; Umrah Dua Pocket Guide</h3>
              <p style="margin: 0 0 16px 0; line-height: 1.6; color: #134e4a;">
                As our thank-you, here is the Pure Ihram Dua Pocket Guide - duas for every stage of Hajj and Umrah, in Arabic, transliteration and English, in a printable pocket format.
              </p>
              <a href="https://www.pureihram.com/hajj-2026-prep-pack.pdf"
                 style="background:#0f766e; color:#ffffff; text-decoration:none; padding:12px 22px; border-radius:6px; font-weight:600; display:inline-block;">
                Download the Pocket Guide (PDF)
              </a>
            </div>
            
            <div style="background: #e6fffa; border-left: 4px solid #0f766e; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #0f766e; margin: 0 0 10px 0;">Shipping Information</h3>
              <p style="margin: 0; line-height: 1.6;">
                <strong>🇸🇪 Sweden:</strong> 3-7 business days<br>
                <strong>🇪🇺 Nordic & EU:</strong> 7-14 business days<br>
                <strong>📦 Tracking:</strong> You'll receive tracking information once shipped
              </p>
            </div>
            
            <p style="line-height: 1.6; margin-bottom: 20px;">
              May this sacred garment serve you well on your pilgrimage. If you have any questions about your order, 
              please don't hesitate to contact us.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px;">
                Barakallahu feeki for choosing Pure Ihram<br>
                <a href="mailto:pureihraam@gmail.com" style="color: #0f766e;">pureihraam@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      `;
}
