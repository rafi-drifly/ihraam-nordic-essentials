// Shipping rates in EUR
export const SHIPPING_RATES = {
  sweden: 9,   // flat for 1-2 items, free for 3+
  norway_12: 39, // flat for 1-2 items
  norway_3plus: 49, // flat for 3+ items
  nordic: 9,   // per item (DK, FI)
  eu: 10,      // per item
} as const;

export type ShippingDestination = 'SE' | 'NO';
export type ShippingRegion = 'sweden' | 'norway' | 'nordic' | 'eu';

/**
 * Calculate shipping cost based on quantity and destination.
 * Sweden: 1-2 items €9 flat, 3+ free
 * Norway: 1-2 items €39 flat, 3+ items €49 flat
 */
export function calculateShipping(quantity: number, destination: ShippingDestination = 'SE'): number {
  const safeQuantity = Math.max(1, Math.floor(quantity));

  if (destination === 'NO') {
    return safeQuantity >= 3 ? 49 : 39;
  }

  // Sweden (default)
  if (safeQuantity >= 3) return 0;
  return 9; // €9 flat for 1 or 2 items
}

/**
 * Get shipping display text
 */
export function getShippingLabel(quantity: number, destination: ShippingDestination = 'SE'): string {
  if (destination === 'NO') {
    if (quantity >= 3) return '€49 delivery to Norway';
    return '€39 delivery to Norway';
  }
  if (quantity >= 3) return 'Free delivery in Sweden';
  if (quantity === 2) return 'Only €9 delivery in Sweden';
  return '€9 delivery in Sweden';
}

/**
 * Get shipping rate per item for a region (legacy compat)
 */
export function getShippingRatePerItem(region: 'sweden' | 'nordic' | 'eu' = 'sweden'): number {
  const rates = { sweden: 9, nordic: 9, eu: 10 };
  return rates[region];
}
