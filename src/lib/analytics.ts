import posthog from 'posthog-js'

/**
 * Hostnames whose traffic is real. Everything else - localhost, Lovable
 * preview URLs, any branch deploy - must stay out of the production PostHog
 * project, which is the only project this app is ever configured with.
 */
const ANALYTICS_HOSTNAMES = ['pureihram.com', 'www.pureihram.com'];

/**
 * Checked at call time rather than module load so it can be exercised in tests
 * and so a page cannot get stuck with a stale answer.
 *
 * Gating on the hostname rather than `import.meta.env.PROD` deliberately: the
 * repo also has a `build:dev` script, so build mode does not reliably mean
 * "this is the live storefront", whereas the domain does.
 */
export function isAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return ANALYTICS_HOSTNAMES.includes(window.location.hostname);
}

/** Single choke point. Nothing in this file should call posthog.capture directly. */
function capture(event: string, properties?: Record<string, unknown>) {
  if (!isAnalyticsEnabled()) return;
  posthog.capture(event, properties ?? {});
}

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
  capture(event, data ?? {});
}

// --- ECOMMERCE EVENTS ---

export function trackViewItem(product: {
  id: string;
  name: string;
  price: number;
  currency?: string;
}) {
  capture('view_item', {
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
  capture('add_to_cart', {
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
  capture('begin_checkout', {
    cart_total: cart.total,
    item_count: cart.item_count,
    currency: cart.currency || 'EUR',
  });
}

export function trackPurchase(order: {
  order_id: string;
  total?: number;
  item_count?: number;
  currency?: string;
  payment_method?: string;
}) {
  capture('purchase', {
    order_id: order.order_id,
    // Omitted rather than sent as 0 when the totals could not be recovered.
    // A zero drags reported revenue and AOV down and looks like a real sale of
    // nothing, which is exactly what the previously hardcoded 0 did.
    ...(typeof order.total === 'number' ? { revenue: order.total } : {}),
    ...(typeof order.item_count === 'number' ? { item_count: order.item_count } : {}),
    currency: order.currency || 'EUR',
    payment_method: order.payment_method || 'unknown',
  });
}

// --- CONTACT & SUPPORT EVENTS ---

export function trackWhatsAppClick(context: string) {
  capture('whatsapp_click', { click_context: context });
}

export function trackEmailClick(context: string) {
  capture('email_click', { click_context: context });
}

export function trackPhoneClick(context: string) {
  capture('phone_click', { click_context: context });
}

export function trackContactFormSubmit(subject?: string) {
  capture('contact_form_submit', { subject: subject || 'general' });
}

// --- CONTENT & NAVIGATION EVENTS ---

export function trackBlogCtaClick(blogSlug: string, ctaType: string) {
  capture('blog_cta_click', { blog_slug: blogSlug, cta_type: ctaType });
}

export function trackBlogView(post: {
  slug: string;
  title: string;
  category: string;
  locale: string;
  readTime?: number;
}) {
  capture('blog_view', {
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
  capture('page_view', {
    path: details.path,
    page_type: details.pageType,
    locale: details.locale,
  });
  if (isAnalyticsEnabled()) posthog.register({ locale: details.locale });
}

export function trackShippingPageView() {
  capture('shipping_page_view');
}

export function trackGuideToShopClick(source: string) {
  capture('guide_to_shop_click', { source });
}

// --- B2B EVENTS ---

export function trackPartnerPageView() {
  capture('partner_page_view');
}

export function trackMosqueSupportClick() {
  capture('mosque_support_click');
}

export function trackGroupEnquirySubmit(details?: {
  organization_type?: string;
  estimated_quantity?: number;
}) {
  capture('group_enquiry_submit', {
    organization_type: details?.organization_type || 'unknown',
    estimated_quantity: details?.estimated_quantity || 0,
  });
}

// --- USER IDENTIFICATION ---

export function identifyUser(email: string, properties?: Record<string, any>) {
  // Identifying off-production would create a real person profile from a
  // developer's test email, so this is gated like every other call.
  if (!isAnalyticsEnabled()) return;
  posthog.identify(email, { email, ...properties });
}

export function resetUser() {
  if (!isAnalyticsEnabled()) return;
  posthog.reset();
}
