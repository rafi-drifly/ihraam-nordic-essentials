/**
 * The one product the shop sells.
 *
 * This used to be read from the Supabase `products` table on every visit to the
 * shop. When the Supabase project was paused (Nov 2026) that read failed and the
 * shop showed "Product not found", so nobody could buy. The shop has had exactly
 * one catalogue row since it opened, so it now lives here, shared by the shop
 * page, the homepage set choice and the checkout Worker (workers/api).
 *
 * Prices are not here: they come from getBundlePrice in
 * supabase/functions/create-checkout/pricing.ts, which the Worker also charges
 * from.
 */
export const PRODUCT = {
  /** The Supabase catalogue id, kept so old baskets and old orders still match. */
  id: "36acffbc-41ea-4512-8621-174cd8d9b00c",
  /** The catalogue name (brand manual p. 18). Shown on the shop page and in Stripe. */
  name: "Pure Ihraam Cloth Set",
  /**
   * Shown under the name on the Stripe payment page. Verified facts only
   * (brand manual pp. 15 and 18). The old catalogue row opened with "Premium
   * quality", which the manual forbids.
   */
  description:
    "Two unstitched white pieces, the Izaar and the Ridaa, in 100% microfiber polyester. 115 × 230 cm a piece, 1400 g a set.",
} as const;
