/**
 * The customer's order confirmation, from saved order to rendered email.
 *
 * No customer had ever received one. The webhook sent send-order-confirmation
 * `{ order, customerEmail }`, the function read `{ email, items, ... }`, and
 * `items.map` threw on undefined - while the webhook logged "Confirmation email
 * sent". The two sides were never checked against each other; the first test
 * below does exactly that.
 */
import { describe, expect, it } from "vitest";
import { confirmationPayload, type SavedOrder } from "../../../supabase/functions/stripe-webhook/confirmation";
import { esc, renderOrderEmail } from "../../../supabase/functions/send-order-confirmation/email";

/** Shaped like the webhook's `orders` select with `order_items(*, products(name))`. */
const savedOrder = (overrides: Partial<SavedOrder> = {}): SavedOrder => ({
  order_number: "ORD-1788867992808-4A79B53E",
  total_amount: 28,
  shipping_name: "Redone Beshir Abdulhasib ",
  shipping_address: {
    name: "Redone Beshir Abdulhasib",
    line1: "Trondheimsgatan 34",
    line2: null,
    postal_code: "164 30",
    city: "Kista",
    country: "SE",
  },
  order_items: [
    { quantity: 1, unit_price: 19, total_price: 19, products: { name: "Pure Ihraam Cloth Set" } },
  ],
  ...overrides,
});

describe("the webhook and the email function agree on the request", () => {
  it("renders what the webhook sends, end to end", () => {
    const payload = confirmationPayload(savedOrder(), "customer@example.com");
    const html = renderOrderEmail(payload, new Date("2026-09-08T11:46:33Z"));
    expect(html).toContain("ORD-1788867992808-4A79B53E");
    expect(html).toContain("Pure Ihraam Cloth Set");
    expect(html).toContain("28.00€");
    expect(html).toContain("Trondheimsgatan 34");
  });

  it("sends the flat shape the email function reads, not { order, customerEmail }", () => {
    const payload = confirmationPayload(savedOrder(), "customer@example.com");
    expect(payload).toEqual({
      email: "customer@example.com",
      orderNumber: "ORD-1788867992808-4A79B53E",
      customerName: "Redone Beshir Abdulhasib",
      items: [{ name: "Pure Ihraam Cloth Set", quantity: 1, price: 19, total: 19 }],
      totalAmount: 28,
      shippingAddress: savedOrder().shipping_address,
    });
  });

  it("turns numeric strings from the database into numbers, since the email calls toFixed", () => {
    const payload = confirmationPayload(
      savedOrder({
        total_amount: "46.00",
        order_items: [{ quantity: "2", unit_price: "18.50", total_price: "37.00", products: { name: "Set" } }],
      }),
      "c@example.com",
    );
    expect(payload.totalAmount).toBe(46);
    expect(payload.items[0]).toEqual({ name: "Set", quantity: 2, price: 18.5, total: 37 });
    expect(() => renderOrderEmail(payload)).not.toThrow();
  });

  it("still addresses the customer when a name or product is missing", () => {
    const payload = confirmationPayload(
      savedOrder({ shipping_name: null, order_items: [{ quantity: 1, unit_price: 19, total_price: 19, products: null }] }),
      "c@example.com",
    );
    expect(payload.customerName).toBe("Customer");
    expect(payload.items[0].name).toBe("Pure Ihram set");
  });
});

describe("the rendered email", () => {
  const threePack = {
    email: "c@example.com",
    orderNumber: "ORD-1",
    customerName: "Aisha",
    items: [{ name: "Pure Ihraam Cloth Set", quantity: 3, price: 18.33, total: 55 }],
    totalAmount: 64,
    shippingAddress: { name: "Aisha", line1: "Street 1", postal_code: "111 22", city: "Stockholm", country: "SE" },
  };

  it("shows a 3-pack's line total as charged, not 18.33 × 3", () => {
    const html = renderOrderEmail(threePack);
    expect(html).toContain("55.00€");
    expect(html).not.toContain("54.99€");
    expect(html).toContain("64.00€");
  });

  it("falls back to price × quantity for a caller that sends no line total", () => {
    const { total: _dropped, ...noTotal } = threePack.items[0];
    const html = renderOrderEmail({ ...threePack, items: [{ ...noTotal, price: 19, quantity: 2 }] });
    expect(html).toContain("38.00€");
  });

  it("escapes anything a customer typed at checkout", () => {
    const hostile = '<img src=x onerror="alert(1)">';
    const html = renderOrderEmail({
      ...threePack,
      customerName: hostile,
      shippingAddress: { ...threePack.shippingAddress, line1: hostile, line2: hostile },
    });
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });

  it("copes with a missing address rather than throwing", () => {
    expect(() => renderOrderEmail({ ...threePack, shippingAddress: null })).not.toThrow();
  });

  it("escapes the five characters that matter in HTML", () => {
    expect(esc(`<a href="x">Tom & Jerry's</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;",
    );
    expect(esc(null)).toBe("");
  });
});
