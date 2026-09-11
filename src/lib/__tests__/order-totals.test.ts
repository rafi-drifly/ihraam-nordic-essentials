/**
 * What the order webhook records, against what Stripe charged.
 *
 * The webhook used to store 19 € × quantity + delivery, while checkout charges
 * bundle prices, so every bundle was recorded above the charge: a 2-pack paid
 * at 46 € was stored as 47 €, a 3-pack paid at 64 € as 66 €. The admin
 * revenue total, the owner's alert email and the customer's order lookup page
 * all read that stored number.
 */
import { describe, expect, it } from "vitest";
import { getBundlePrice } from "../../../supabase/functions/create-checkout/pricing";
import { orderMoney, priceLines } from "../../../supabase/functions/stripe-webhook/totals";

const cents = (eur: number) => Math.round(eur * 100);
const sumCents = (lines: { totalPrice: number }[]) =>
  lines.reduce((n, line) => n + cents(line.totalPrice), 0);

/** The amounts on a session built the way create-checkout builds one. */
function sessionFor(qty: number, { delivery = 9, donation = 0 } = {}) {
  const subtotal = cents(getBundlePrice(qty)) + cents(donation);
  return {
    amountSubtotalCents: subtotal,
    amountTotalCents: subtotal + cents(delivery),
    shippingEur: delivery,
    donationEur: donation,
  };
}

describe("the order total", () => {
  it("is exactly what Stripe charged, not 19 € a set", () => {
    // The live defect: stored as 47 € and 66 €.
    expect(orderMoney(sessionFor(2)).totalEur).toBe(46);
    expect(orderMoney(sessionFor(3)).totalEur).toBe(64);
  });

  it("matches the real single-set order from 8 Sep 2026", () => {
    // ORD-1788867992808-4A79B53E: 19 € + 9 € delivery, stored as 28 €.
    expect(orderMoney(sessionFor(1))).toEqual({ totalEur: 28, goodsEur: 19 });
  });

  it("drops the delivery charge for mosque collection", () => {
    expect(orderMoney(sessionFor(2, { delivery: 0 }))).toEqual({ totalEur: 37, goodsEur: 37 });
  });

  it("keeps a donation in the total but out of the goods", () => {
    expect(orderMoney(sessionFor(2, { donation: 5 }))).toEqual({ totalEur: 51, goodsEur: 37 });
  });

  it("agrees with the checkout's own price for every basket size", () => {
    for (let qty = 1; qty <= 20; qty++) {
      const money = orderMoney(sessionFor(qty));
      expect(money.goodsEur, `${qty} sets`).toBe(getBundlePrice(qty));
      expect(money.totalEur, `${qty} sets`).toBe(getBundlePrice(qty) + 9);
    }
  });

  it("still works out the goods if Stripe omits the subtotal", () => {
    const { amountTotalCents, shippingEur, donationEur } = sessionFor(3);
    expect(
      orderMoney({ amountTotalCents, amountSubtotalCents: null, shippingEur, donationEur }),
    ).toEqual({ totalEur: 64, goodsEur: 55 });
  });

  it("never records negative goods", () => {
    const money = orderMoney({
      amountTotalCents: 900,
      amountSubtotalCents: 0,
      shippingEur: 9,
      donationEur: 5,
    });
    expect(money.goodsEur).toBe(0);
  });
});

describe("the order lines", () => {
  it("sum to the goods for a bundle, not to 19 € a set", () => {
    const [line] = priceLines([{ id: "p", quantity: 3 }], 55);
    expect(line.totalPrice).toBe(55);
    // Display price only; 18.33 × 3 would be 54.99, which is why the line
    // total is stored separately rather than derived from it.
    expect(line.unitPrice).toBe(18.33);
  });

  it("splits one bundle across repeated lines without losing a cent", () => {
    // create-checkout resolves stale basket ids to the one product without
    // merging lines, so the same product can arrive as two entries.
    const lines = priceLines(
      [
        { id: "p", quantity: 1 },
        { id: "p", quantity: 2 },
      ],
      55,
    );
    expect(sumCents(lines)).toBe(5500);
    expect(lines.map((l) => l.totalPrice)).toEqual([18.33, 36.67]);
  });

  it("always adds up exactly, whatever the split", () => {
    for (const goods of [19, 37, 55, 73.33, 100, 183.34]) {
      for (const quantities of [[1], [1, 1], [1, 2], [2, 3, 4], [1, 1, 1, 1, 1, 1, 1]]) {
        const lines = priceLines(
          quantities.map((quantity, i) => ({ id: `p${i}`, quantity })),
          goods,
        );
        expect(sumCents(lines), `${goods} € over ${quantities}`).toBe(cents(goods));
      }
    }
  });

  it("keeps each line's id and quantity for order_items", () => {
    expect(priceLines([{ id: "abc", quantity: 2 }], 37)).toEqual([
      { id: "abc", quantity: 2, unitPrice: 18.5, totalPrice: 37 },
    ]);
  });
});
