## Why the page stays in English

The language switcher works (URL flips to `/sv` or `/no`, `i18n.language` updates, page `<title>` already renders in Swedish), but every visible string in the homepage body is **hardcoded English literals**. `Home.tsx` imports `useTranslation` only to read `i18n.language` - it never calls `t()`. Same for several home subcomponents.

## Scope

Localize the following so they react to `i18n.language`:

1. **`src/pages/Home.tsx`** - hero title/highlight/description/CTA/microcopy, all 4 "Why Pure Ihram" benefit cards (icon stays, text via `t()`), "Guides for first-time pilgrims" section (heading, subtitle, 3 article titles + descriptions, "Read more", "View all guides"), final "Ready for Hajj 2026?" CTA section.
2. **`src/components/home/HomepageFAQ.tsx`** - section heading + subtitle, plus all 7 FAQ Q&A items. Keep `FAQ_ITEMS` as a hook that reads from `t()` so the JSON-LD `faqSchema` in `Home.tsx` keeps working with localized text.
3. **`src/components/home/TestimonialBlock.tsx`** - testimonial heading and quote.
4. **`src/components/home/HowToWearTeaser.tsx`** - heading, body, link label.
5. **`src/components/home/ShippingReassuranceStrip.tsx`** - the 3 reassurance items.

Already correctly localized (no changes): `ProductOffersBlock`, `HajjPrepPackForm`, `Navbar`, `Footer`, `SEOHead`, page `<title>`/meta.

## Translation key additions

The `home.*` namespace already exists in `en.json`, `sv.json`, `no.json` with `hero`, `benefits`, `cta` partly populated. We will:

- **Reuse existing keys** where the copy matches what's currently on screen (e.g., `home.benefits.*`).
- **Update existing English copy** where needed to match current homepage strings (e.g., the hero now says "Premium Ihram for Hajj 2026" and "From €19, shipped from Sweden", not the older copy in the JSON).
- **Add missing keys** under a clear structure:
  - `home.hero.{title, highlight, description, ctaShop, ctaPrepPack, microcopy}`
  - `home.benefits.{title, subtitle, climate.*, shipsFromSweden.*, qualityChecked.*, builtForEU.*}` (rename current 4 keys to match the actual icons/content shown)
  - `home.guides.{title, subtitle, readMore, viewAll, articles.spiritual.*, articles.howToWear.*, articles.sunnah.*}`
  - `home.finalCta.{title, description, button}`
  - `home.faq.{title, subtitle, items: [{q, a} x7]}` (array - read with `t('home.faq.items', { returnObjects: true })`)
  - `home.testimonial.{title, quote, author, location}` (matching whatever `TestimonialBlock` currently shows)
  - `home.howToWear.{title, body, cta}`
  - `home.shipping.{ships.*, returns.*, support.*}`

All three locale files (`en.json`, `sv.json`, `no.json`) get the same keys with proper Swedish/Norwegian translations. Strings will follow the existing memory rules (hyphens only, no em/en dashes; "Amanah" honesty - no unverified claims; €19/€37/€55 pricing language consistent).

## JSON-LD note

The `faqSchema` in `Home.tsx` uses `FAQ_ITEMS` from `HomepageFAQ.tsx`. After conversion, we'll either:
- Export a function `useFaqItems()` that returns the localized array, then build `faqSchema` from it inside `Home.tsx` so the schema's question/answer text matches the displayed locale, or
- Keep schema English-only and only localize the visible UI (simpler; safer for SEO since hreflang already differentiates).

I'll use **option 1** (localize schema too) - matches the audit direction of localizing each route fully.

## Out of scope

- Translating other pages (Shop already uses `t()`; About, Contact, etc. were verified earlier to be fine).
- Fixing the 22 orphan keys still flagged in `no.json` from the earlier audit (separate cleanup; not blocking the user-visible homepage issue).
- SSR / pre-rendering (roadmap item).

## Verification

After implementation:
- Visit `/`, `/sv`, `/no` - hero, benefits, FAQ, testimonial, teasers, final CTA all read in the correct language.
- Switch via the language dropdown - body re-renders without a hard reload.
- `bunx vitest run` still passes (checkout-flow tests don't touch homepage copy).
- TypeScript compiles cleanly.