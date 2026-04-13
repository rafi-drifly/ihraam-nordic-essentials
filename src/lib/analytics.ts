import posthog from 'posthog-js'

// Backward-compatible wrapper for existing call sites
type LegacyEventName =
  | 'view_bundle_option'
  | 'add_to_cart_single'
  | 'add_to_cart_2pack'
  | 'add_to_cart_3pack'
  | 'cart_upsell_clicked'
  | 'checkout_started'
  | 'purchase_completed';

export function trackEvent(event: LegacyEventName | string, data?: Record<string, unknown>) {
  posthog.capture(event, data ?? {});
}

// --- ECOMMERCE EVENTS ---

export function trackViewItem(product: {
  id: string;
  name: string;
  price: number;
  currency?: string;
}) {
  posthog.capture('view_item', {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    currency: product.currency || 'EUR',
  });
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  currency?: string;
}) {
  posthog.capture('add_to_cart', {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    quantity: product.quantity,
    currency: product.currency || 'EUR',
    cart_value: product.price * product.quantity,
  });
}

export function trackBeginCheckout(cart: {
  total: number;
  item_count: number;
  currency?: string;
}) {
  posthog.capture('begin_checkout', {
    cart_total: cart.total,
    item_count: cart.item_count,
    currency: cart.currency || 'EUR',
  });
}

export function trackPurchase(order: {
  order_id: string;
  total: number;
  item_count: number;
  currency?: string;
  payment_method?: string;
}) {
  posthog.capture('purchase', {
    order_id: order.order_id,
    revenue: order.total,
    item_count: order.item_count,
    currency: order.currency || 'EUR',
    payment_method: order.payment_method || 'unknown',
  });
}

// --- CONTACT & SUPPORT EVENTS ---

export function trackWhatsAppClick(context: string) {
  posthog.capture('whatsapp_click', { click_context: context });
}

export function trackEmailClick(context: string) {
  posthog.capture('email_click', { click_context: context });
}

export function trackPhoneClick(context: string) {
  posthog.capture('phone_click', { click_context: context });
}

export function trackContactFormSubmit(subject?: string) {
  posthog.capture('contact_form_submit', { subject: subject || 'general' });
}

// --- CONTENT & NAVIGATION EVENTS ---

export function trackBlogCtaClick(blogSlug: string, ctaType: string) {
  posthog.capture('blog_cta_click', { blog_slug: blogSlug, cta_type: ctaType });
}

export function trackShippingPageView() {
  posthog.capture('shipping_page_view');
}

export function trackGuideToShopClick(source: string) {
  posthog.capture('guide_to_shop_click', { source });
}

// --- B2B EVENTS ---

export function trackPartnerPageView() {
  posthog.capture('partner_page_view');
}

export function trackMosqueSupportClick() {
  posthog.capture('mosque_support_click');
}

export function trackGroupEnquirySubmit(details?: {
  organization_type?: string;
  estimated_quantity?: number;
}) {
  posthog.capture('group_enquiry_submit', {
    organization_type: details?.organization_type || 'unknown',
    estimated_quantity: details?.estimated_quantity || 0,
  });
}

// --- USER IDENTIFICATION ---

export function identifyUser(email: string, properties?: Record<string, any>) {
  posthog.identify(email, { email, ...properties });
}

export function resetUser() {
  posthog.reset();
}
