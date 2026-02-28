// Shipping rates for Sweden (tiered) in EUR
// 1 item: €9, 2 items: €9 flat, 3+ items: free
export const SHIPPING_RATES = {
  sweden: 9,   // base rate
  nordic: 9,   // per item (NO, DK, FI)
  eu: 10,      // per item
} as const;

export type ShippingRegion = keyof typeof SHIPPING_RATES;

/**
 * Calculate shipping cost based on quantity using Sweden tiered rules:
 * - 1 item: €9
 * - 2 items: €9 (flat, not per-item)
 * - 3+ items: €0 (free)
 */
export function calculateShipping(quantity: number, region: ShippingRegion = 'sweden'): number {
  const safeQuantity = Math.max(1, Math.floor(quantity));

  if (region === 'sweden') {
    if (safeQuantity >= 3) return 0;
    return 9; // €9 flat for 1 or 2 items
  }

  // Non-Sweden: keep per-item rate
  const rate = SHIPPING_RATES[region];
  return rate * safeQuantity;
}

/**
 * Get shipping display text for Sweden
 */
export function getShippingLabel(quantity: number): string {
  if (quantity >= 3) return 'Free delivery in Sweden';
  if (quantity === 2) return 'Only €9 delivery in Sweden';
  return '€9 delivery in Sweden';
}

/**
 * Get shipping rate per item for a region
 */
export function getShippingRatePerItem(region: ShippingRegion = 'sweden'): number {
  return SHIPPING_RATES[region];
}
