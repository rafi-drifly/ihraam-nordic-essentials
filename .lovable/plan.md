# SEO & i18n Head Fixes - Audit Response

This plan addresses every item in the 25 April audit that is fixable on a client-rendered Vite + React SPA. The structural SSR/pre-render item (#8) is explicitly out of scope and stays on the July roadmap.

## Findings from current code

- `index.html` ships English-only head with: duplicate GA4 (`G-WD5SLJDED8` + `G-8EFBK4ECRN`), `<meta name="keywords">`, no hreflang, English canonical hardcoded.
- `<SEOHead />` is mounted globally in `App.tsx` and uses `react-helmet-async`, so it does update `<title>`, description, canonical, hreflang, OG, and JSON-LD client-side per route. However:
  - hreflang uses `hrefLang="sv"` / `"no"` — audit requires `sv-SE` / `nb-NO`.
  - Canonicals do not use trailing slash on locale roots (audit wants `/sv/` and `/no/`).
  - Static `<html lang="en">` is never rewritten (Helmet `<html lang>` does work client-side, already in SEOHead, but the initial HTML still says `en` for crawlers).
  - No `og:locale:alternate`, no `og:type`, no `twitter:card` in SEOHead.
  - JSON-LD lives only in `Home.tsx` (Organization, Product, FAQPage) and a few blog pages. It WILL render on `/sv` and `/no` because all three routes render `<Home />`, but values aren't localized.

## Changes

### 1. `index.html` - clean static defaults
- Remove duplicate GA4 line `gtag('config', 'G-8EFBK4ECRN')` - keep only `G-WD5SLJDED8` (per memory: GTM is the canonical layer, single GA4 stream).
- Remove `<meta name="keywords">` entirely.
- Add `<meta property="og:type" content="website">`, `<meta property="og:url" content="https://www.pureihram.com/">`, `<meta property="og:locale" content="en_GB">`, and `og:locale:alternate` for `sv_SE` and `nb_NO`.
- Add `<meta name="twitter:card" content="summary_large_image">`.
- Update default `<title>` and description to match audit copy:
  - Title: `Buy Ihram Online - Premium Pilgrimage Cloth from €19 | Pure Ihram`
  - Description: `Premium Ihram cloth for Hajj & Umrah. From €19. Ships from Sweden, fast delivery across Europe. Trusted by pilgrims for Hajj 2026.`
- Keep favicons, fonts, GTM block, manifest as-is.

### 2. `src/components/SEOHead.tsx` - upgrade per-route head
- Switch hreflang codes: `sv` → `sv-SE`, `no` → `nb-NO` (keep `en` and `x-default`).
- Build canonical/hreflang URLs with trailing slash on locale roots: `/sv/` and `/no/` (English root stays `/`).
- Update `<html lang>` via Helmet to `sv-SE` / `nb-NO` / `en` (currently passes raw `i18n.language`).
- Add to default emit:
  - `<meta property="og:type" content="website">`
  - `<meta property="og:image" content="https://www.pureihram.com/og-image.jpg">`
  - `<meta property="og:locale:alternate">` for the two non-current locales.
  - `<meta name="twitter:card" content="summary_large_image">`
  - `<meta name="twitter:image" content="https://www.pureihram.com/og-image.jpg">`
- Update default English title/description strings to match audit copy (keep current Swedish/Norwegian translations, with one tweak: align Norwegian title casing).

### 3. `src/pages/Home.tsx` - localize JSON-LD + adopt audit titles
- Pass explicit `title` and `description` props to `<SEOHead>` per locale (use `useTranslation()` so the existing `LocaleHandler` switches them):
  - EN: as in audit.
  - SV: `Köpa Ihram Online - Premium Pilgrimsklädnad från €19 | Pure Ihram`
  - NO: `Kjøpe Ihram Online - Premium Pilegrimsklær fra €19 | Pure Ihram`
- Localize the Product schema `description` and Organization `address.addressLocality` ("Stockholm").
- Keep the existing FAQPage schema (already wired to FAQ_ITEMS). FAQ content localization is out of scope for this pass (separate i18n task).

### 4. No router changes
- Audit wants canonicals like `https://www.pureihram.com/sv/` (trailing slash). React Router treats `/sv` and `/sv/` as the same route, so no route additions needed - we just emit the trailing-slash form in canonical/hreflang.

## Out of scope (acknowledged)

- **SSR / pre-rendering** (audit item #8): requires migrating off Vite SPA to a pre-render step or SSR framework. Tracked as July/August roadmap. Today's fixes still help Googlebot (which renders JS) and all social/OG scrapers that respect Helmet-injected tags after hydration via Lovable's edge.
- **Body content visual verification**: the audit reviewer asked for screenshots of `/`, `/sv`, `/no`. After deploy, you can share those for sign-off; no code change needed.
- **Full homepage i18n** (Home.tsx hardcoded English copy): already proposed in the prior i18n plan and remains pending separate approval.

## Files touched

- `index.html`
- `src/components/SEOHead.tsx`
- `src/pages/Home.tsx`

## Verification steps after deploy

1. View source on `/`, `/sv`, `/no` → confirm hreflang block, single GA4, no keywords meta, correct canonical with trailing slash.
2. Run Google Rich Results Test on `/` → Organization, Product, FAQPage all detected.
3. Run Facebook Sharing Debugger on all three URLs → og:locale and og:image present per locale.
