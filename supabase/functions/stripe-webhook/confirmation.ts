/**
 * The request body for send-order-confirmation, built from the saved order.
 *
 * The webhook used to send `{ order, customerEmail }`, but that function reads
 * `{ email, orderNumber, customerName, items, totalAmount, shippingAddress }`.
 * `items` arrived undefined, `items.map` threw, and no customer ever received a
 * confirmation - while the webhook logged "Confirmation email sent" anyway.
 *
 * No Deno-only imports, so vitest can cover it.
 */

export interface SavedOrder {
  order_number: string;
  total_amount: number | string;
  shipping_name?: string | null;
  shipping_address?: Record<string, unknown> | null;
  order_items?: Array<{
    quantity: number | string;
    unit_price: number | string;
    total_price: number | string;
    products?: { name?: string | null } | null;
  }> | null;
}

export interface ConfirmationItem {
  name: string;
  quantity: number;
  /** Per set, for display. */
  price: number;
  /** The line's share of the charge. Shown as the line total, never price × quantity. */
  total: number;
}

export interface ConfirmationPayload {
  email: string;
  orderNumber: string;
  customerName: string;
  items: ConfirmationItem[];
  totalAmount: number;
  shippingAddress: Record<string, unknown>;
}

// PostgREST can hand numeric columns back as strings; the email calls toFixed.
const num = (value: number | string | null | undefined) => Number(value ?? 0) || 0;

export function confirmationPayload(order: SavedOrder, email: string): ConfirmationPayload {
  return {
    email,
    orderNumber: order.order_number,
    customerName: order.shipping_name?.trim() || "Customer",
    items: (order.order_items ?? []).map((item) => ({
      name: item.products?.name?.trim() || "Pure Ihram set",
      quantity: num(item.quantity),
      price: num(item.unit_price),
      total: num(item.total_price),
    })),
    totalAmount: num(order.total_amount),
    shippingAddress: order.shipping_address ?? {},
  };
}
