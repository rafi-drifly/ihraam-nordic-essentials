/**
 * Bundle pricing.
 *
 * Lives with the checkout function that charges it, and is imported by the
 * client through src/lib/bundles.ts, so the cart, the shop cards and Stripe
 * can never quote three different numbers for the same basket.
 *
 * No Deno-only imports, so vitest can cover it.
 */

/** Price of a single set, in EUR. */
export const UNIT_PRICE = 19;

/** Total price for a whole basket, in EUR, keyed by number of sets. */
const BUNDLE_TOTALS: Record<number, number> = {
  1: 19,
  2: 37, // saves 1 EUR on goods, 10 EUR once the single delivery fee is counted
  3: 55,
};

/** Per-set rate applied beyond the published bundles. */
const RATE_ABOVE_THREE = BUNDLE_TOTALS[3] / 3;

export function getBundleType(qty: number): string {
  if (qty >= 3) return '3-pack';
  if (qty === 2) return '2-pack';
  return 'single';
}

/**
 * What the customer pays for the goods, before delivery and any donation.
 * Never returns a negative or non-finite number, so it is safe to charge.
 */
export function getBundlePrice(qty: number): number {
  if (!Number.isFinite(qty) || qty <= 0) return 0;
  const whole = Math.floor(qty);
  const published = BUNDLE_TOTALS[whole];
  if (published !== undefined) return published;
  if (whole > 3) return Math.round(RATE_ABOVE_THREE * whole);
  return UNIT_PRICE * whole;
}
