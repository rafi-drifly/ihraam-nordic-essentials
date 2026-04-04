export interface Bundle {
  qty: number;
  label: string;
  totalPrice: number;
  shipping: number;
  savings: number;
  badge: string | null;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' | null;
}

// Single unit price = €19
export const UNIT_PRICE = 19;

// Bundles (shipping is base €9 for all of Europe)
export const BUNDLES: Bundle[] = [
  {
    qty: 1, label: 'Single', totalPrice: 19, shipping: 9, savings: 0,
    badge: null, badgeVariant: null,
  },
  {
    qty: 2, label: '2-Pack', totalPrice: 37, shipping: 9, savings: 1,
    badge: 'Best Value', badgeVariant: 'default',
  },
  {
    qty: 3, label: '3-Pack', totalPrice: 55, shipping: 9, savings: 2,
    badge: 'Most Popular', badgeVariant: 'secondary',
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
 */
export function getBundlePrice(qty: number): number {
  const bundle = BUNDLES.find(b => b.qty === qty);
  if (bundle) return bundle.totalPrice;
  if (qty > 3) return Math.round((55 / 3) * qty);
  return UNIT_PRICE * qty;
}

/**
 * Shipping disclosure text for non-SE countries
 */
export const SHIPPING_DISCLOSURE = {
  en: "If shipping to your address costs more than the €9 delivery fee shown at checkout, PureIhram.com will email you the difference with a secure payment link for your approval before we dispatch your order.",
  sv: "Om frakten till din adress kostar mer än leveransavgiften på €9 som visas i kassan, kommer PureIhram.com att e-posta dig skillnaden med en säker betalningslänk för ditt godkännande innan vi skickar din beställning.",
  no: "Hvis frakt til din adresse koster mer enn leveringsgebyret på €9 som vises ved kassen, vil PureIhram.com sende deg differansen med en sikker betalingslenke for din godkjenning før vi sender bestillingen din.",
};

/**
 * Customs disclosure for Norway (outside EU)
 */
export const CUSTOMS_DISCLOSURE = {
  en: "Norway is outside the EU. Import VAT/customs fees may apply on delivery.",
  sv: "Norge ligger utanför EU. Importmoms/tullavgifter kan tillkomma vid leverans.",
  no: "Norge er utenfor EU. Import-MVA/tollavgifter kan påløpe ved levering.",
};
