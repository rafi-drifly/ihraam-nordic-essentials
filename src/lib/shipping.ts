// Shipping rates per item in EUR
export const SHIPPING_RATES = {
  sweden: 9,   // €9 per item
  nordic: 9,   // €9 per item (NO, DK, FI)
  eu: 10,      // €10 per item
} as const;

export type ShippingRegion = keyof typeof SHIPPING_RATES;

/**
 * Calculate shipping cost based on quantity and region
 * @param quantity Number of items
 * @param region Shipping region (default: sweden)
 * @returns Shipping cost in EUR
 */
export function calculateShipping(quantity: number, region: ShippingRegion = 'sweden'): number {
  const rate = SHIPPING_RATES[region];
  const safeQuantity = Math.max(1, Math.floor(quantity)); // Minimum 1 item, no decimals
  return rate * safeQuantity;
}

/**
 * Get shipping rate per item for a region
 * @param region Shipping region (default: sweden)
 * @returns Rate per item in EUR
 */
export function getShippingRatePerItem(region: ShippingRegion = 'sweden'): number {
  return SHIPPING_RATES[region];
}
