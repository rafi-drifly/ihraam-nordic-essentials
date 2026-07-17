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

export function trackBlogView(post: {
  slug: string;
  title: string;
  category: string;
  locale: string;
  readTime?: number;
}) {
  posthog.capture('blog_view', {
    blog_slug: post.slug,
    blog_title: post.title,
    category: post.category,
    locale: post.locale,
    read_time_min: post.readTime,
  });
}

/**
 * Fire a semantic page_view on every SPA route change (complements PostHog's
 * automatic $pageview). Gives clean per-page-type analytics + locale.
 */
export function trackPageView(details: { path: string; pageType: string; locale: string }) {
  posthog.capture('page_view', {
    path: details.path,
    page_type: details.pageType,
    locale: details.locale,
  });
  posthog.register({ locale: details.locale });
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
