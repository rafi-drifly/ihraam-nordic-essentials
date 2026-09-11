/**
 * Order money, read from what Stripe actually charged rather than rebuilt as
 * €19 a set, which stored every bundle above its charge (a €46 2-pack as €47).
 * Stripe's figures also survive a price change before a delayed webhook retry.
 *
 * No Deno-only imports, so vitest can cover it.
 */

export interface ChargedAmounts {
  /** session.amount_total, in cents: goods + donation + delivery. */
  amountTotalCents: number | null | undefined;
  /** session.amount_subtotal, in cents: the line items before delivery, i.e. goods + donation. */
  amountSubtotalCents: number | null | undefined;
  /** Delivery actually charged, in EUR. Zero for mosque collection. */
  shippingEur: number;
  /** Voluntary donation added at checkout, in EUR. */
  donationEur: number;
}

export interface OrderMoney {
  /** What the customer paid, in EUR. */
  totalEur: number;
  /** What the sets themselves cost, in EUR: the charge less delivery and donation. */
  goodsEur: number;
}

const toCents = (eur: number) => Math.round(eur * 100);

export function orderMoney(amounts: ChargedAmounts): OrderMoney {
  const shippingCents = toCents(amounts.shippingEur);
  const donationCents = toCents(amounts.donationEur);
  const { amountTotalCents: total, amountSubtotalCents: subtotal } = amounts;

  const goodsCents =
    typeof subtotal === "number"
      ? subtotal - donationCents
      : typeof total === "number"
        ? total - shippingCents - donationCents
        : 0;
  const safeGoodsCents = Math.max(0, goodsCents);

  const totalCents =
    typeof total === "number" ? total : safeGoodsCents + shippingCents + donationCents;

  return { totalEur: totalCents / 100, goodsEur: safeGoodsCents / 100 };
}

export interface OrderLine {
  id: string;
  quantity: number;
}

export interface PricedLine extends OrderLine {
  /** Price per set for display, rounded to the cent. Need not multiply back exactly. */
  unitPrice: number;
  /** This line's share of the goods. Across the order these always sum to the goods. */
  totalPrice: number;
}

/**
 * Share the goods across lines by quantity in whole cents, so the line totals
 * sum exactly to the charge: a 3-pack stores €55.00, not 18.33 × 3 = €54.99.
 */
export function priceLines(lines: OrderLine[], goodsEur: number): PricedLine[] {
  const goodsCents = toCents(goodsEur);
  const totalQty = lines.reduce((n, line) => n + line.quantity, 0);
  if (totalQty <= 0) return lines.map((line) => ({ ...line, unitPrice: 0, totalPrice: 0 }));

  // Largest remainder: floor each share, give leftover cents to the biggest remainders.
  const shares = lines.map((line) => {
    const exact = (goodsCents * line.quantity) / totalQty;
    return { cents: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let leftover = goodsCents - shares.reduce((n, share) => n + share.cents, 0);
  for (const share of [...shares].sort((a, b) => b.remainder - a.remainder)) {
    if (leftover <= 0) break;
    share.cents += 1;
    leftover -= 1;
  }

  return lines.map((line, i) => ({
    ...line,
    totalPrice: shares[i].cents / 100,
    unitPrice: line.quantity > 0 ? Math.round(shares[i].cents / line.quantity) / 100 : 0,
  }));
}
