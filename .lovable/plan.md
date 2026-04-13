

## Add PostHog Analytics Tracking

Integrate PostHog alongside existing GA4/GTM, replacing the current stub `trackEvent` analytics with real PostHog event capture plus new event types for contact, content, and B2B tracking.

### Files to change

**1. Install dependencies**
- `posthog-js` and `@posthog/react`

**2. `.env`** — Add two variables:
```
VITE_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_mddpTxJxg4TeoBhGhwSUBFSWdKiDitd2w3FfWBktGkR3
VITE_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

**3. `src/main.tsx`** — Wrap `<App />` with `<PostHogProvider>` using the env vars and the specified options (autocapture, pageview, pageleave all enabled).

**4. `src/lib/analytics.ts`** — Full rewrite. Replace the stub `trackEvent` with all the PostHog-backed functions specified: `trackViewItem`, `trackAddToCart`, `trackBeginCheckout`, `trackPurchase`, `trackWhatsAppClick`, `trackEmailClick`, `trackPhoneClick`, `trackContactFormSubmit`, `trackBlogCtaClick`, `trackShippingPageView`, `trackGuideToShopClick`, `trackPartnerPageView`, `trackMosqueSupportClick`, `trackGroupEnquirySubmit`, `identifyUser`, `resetUser`. Keep a backward-compatible `trackEvent` wrapper that calls `posthog.capture()` so existing call sites don't break.

**5. `src/pages/Shop.tsx`** — Replace `trackEvent('view_bundle_option')` with `trackViewItem()`. Replace add-to-cart `trackEvent` calls with `trackAddToCart()`. Replace checkout `trackEvent` with `trackBeginCheckout()`.

**6. `src/pages/Cart.tsx`** — Replace `trackEvent('checkout_started')` with `trackBeginCheckout()`. Replace upsell tracking.

**7. `src/components/shop/CartDrawer.tsx`** — Update upsell `trackEvent` call.

**8. `src/pages/OrderSuccess.tsx`** — Add `useEffect` calling `trackPurchase()` on mount.

**9. `src/components/WhatsAppButton.tsx`** — Add `onClick` handler calling `trackWhatsAppClick('floating_button')`.

**10. `src/pages/Contact.tsx`** — Add `trackContactFormSubmit(formData.subject)` on successful submission. Add `trackWhatsAppClick('contact_page')` / `trackEmailClick('contact_page')` / `trackPhoneClick('contact_page')` to relevant links.

**11. `src/pages/Shipping.tsx`** — Add `useEffect` calling `trackShippingPageView()`.

**12. `src/pages/Partners.tsx`** — Add `useEffect` calling `trackPartnerPageView()`.

**13. `src/pages/MosqueSupport.tsx`** — Add `trackMosqueSupportClick()` on CTA and `trackGroupEnquirySubmit()` on form submission.

**14. Blog pages** (`BlogPost.tsx`, `SunnahActsBlog.tsx`, `UmrahChecklistBlog.tsx`, `IhramMistakesBlog.tsx`, `UmrahDuasBlog.tsx`, `IhramSpiritualMeaningBlog.tsx`) — Add `trackBlogCtaClick()` on any shop/product CTA buttons.

### What stays unchanged
- All existing GA4 / GTM scripts remain untouched
- PostHog autocapture handles baseline click/form tracking automatically
- PostHog `capture_pageview: true` handles route-level tracking automatically
- No backend changes needed

