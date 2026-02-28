type EventName =
  | 'view_bundle_option'
  | 'add_to_cart_single'
  | 'add_to_cart_2pack'
  | 'add_to_cart_3pack'
  | 'cart_upsell_clicked'
  | 'checkout_started'
  | 'purchase_completed';

export function trackEvent(event: EventName, data?: Record<string, unknown>) {
  console.log(`[Analytics] ${event}`, data ?? {});
  // Future: wire to GA4, Plausible, etc.
}
