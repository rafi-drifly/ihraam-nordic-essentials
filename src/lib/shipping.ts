// Shipping rates in EUR
export const SHIPPING_RATES = {
  sweden: 9,   // flat per order
  nordic: 9,   // per item (DK, FI)
  eu: 10,      // per item
} as const;

/**
 * Calculate shipping cost — Sweden only, flat €9.
 */
export function calculateShipping(quantity: number): number {
  return 9;
}

/**
 * Get shipping display text
 */
export function getShippingLabel(quantity: number): string {
  return '€9 delivery in Sweden';
}

/**
 * Get shipping rate per item for a region (legacy compat)
 */
export function getShippingRatePerItem(region: 'sweden' | 'nordic' | 'eu' = 'sweden'): number {
  const rates = { sweden: 9, nordic: 9, eu: 10 };
  return rates[region];
}
