export interface Bundle {
  qty: number;
  label: string;
  totalPrice: number;
  shipping: number;
  savings: number;
  badge: string | null;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' | null;
}

// Single unit price = €20
export const UNIT_PRICE = 20;

export const BUNDLES: Bundle[] = [
  {
    qty: 1,
    label: 'Single',
    totalPrice: 20,
    shipping: 9,
    savings: 0,
    badge: null,
    badgeVariant: null,
  },
  {
    qty: 2,
    label: '2-Pack',
    totalPrice: 39,
    shipping: 9,
    savings: 10, // (2×20+9) - (39+9) = 1 product + 0 shipping saved => total saved vs 2 singles with shipping
    badge: 'Best Value',
    badgeVariant: 'default',
  },
  {
    qty: 3,
    label: '3-Pack',
    totalPrice: 57,
    shipping: 0,
    savings: 12, // (3×20+9) - (57+0) = 3 product + 9 shipping saved => total saved vs 3 singles with shipping
    badge: 'Free Delivery',
    badgeVariant: 'secondary',
  },
];

/**
 * Get the bundle type string for metadata
 */
export function getBundleType(qty: number): string {
  if (qty >= 3) return '3-pack';
  if (qty === 2) return '2-pack';
  return 'single';
}

/**
 * Get the bundle price for a given quantity.
 * For quantities matching a bundle, use the bundle price.
 * For other quantities, calculate proportionally.
 */
export function getBundlePrice(qty: number): number {
  const bundle = BUNDLES.find(b => b.qty === qty);
  if (bundle) return bundle.totalPrice;
  // For quantities > 3, use 3-pack price per unit
  if (qty > 3) return Math.round((57 / 3) * qty);
  return UNIT_PRICE * qty;
}
