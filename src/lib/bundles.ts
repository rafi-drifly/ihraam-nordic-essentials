import type { ShippingDestination } from './shipping';

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

// Sweden bundles (default)
export const BUNDLES: Bundle[] = [
  {
    qty: 1, label: 'Single', totalPrice: 20, shipping: 9, savings: 0,
    badge: null, badgeVariant: null,
  },
  {
    qty: 2, label: '2-Pack', totalPrice: 38, shipping: 9, savings: 9,
    badge: 'Best Value', badgeVariant: 'default',
  },
  {
    qty: 3, label: '3-Pack', totalPrice: 60, shipping: 9, savings: 18,
    badge: 'Most Popular', badgeVariant: 'secondary',
  },
];

// Norway bundles
// Savings = (qty × single_delivered_NO) - (bundle_total + bundle_shipping)
// Single delivered NO = 20 + 39 = 59
export const BUNDLES_NO: Bundle[] = [
  {
    qty: 1, label: 'Single', totalPrice: 20, shipping: 39, savings: 0,
    badge: null, badgeVariant: null,
  },
  {
    qty: 2, label: '2-Pack', totalPrice: 40, shipping: 39,
    savings: 39, // 2×59=118 - (40+39)=79 = 39
    badge: 'Best Value', badgeVariant: 'default',
  },
  {
    qty: 3, label: '3-Pack', totalPrice: 60, shipping: 49,
    savings: 68, // 3×59=177 - (60+49)=109 = 68
    badge: null, badgeVariant: null,
  },
];

/**
 * Get bundles array for a given destination
 */
export function getBundlesForDestination(destination: ShippingDestination = 'SE'): Bundle[] {
  return destination === 'NO' ? BUNDLES_NO : BUNDLES;
}

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
 */
export function getBundlePrice(qty: number): number {
  const bundle = BUNDLES.find(b => b.qty === qty);
  if (bundle) return bundle.totalPrice;
  if (qty > 3) return Math.round((60 / 3) * qty);
  return UNIT_PRICE * qty;
}
