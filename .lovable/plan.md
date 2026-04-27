## Goal

Resolve the 16 "not indexed" pages reported in Google Search Console by strengthening crawl signals (sitemap, internal links, canonicals), adding unique titles/descriptions to every page, and enriching product structured data.

## Findings from audit

- **Routes (App.tsx):** 23 unique paths × 3 locales (en, sv, no) = ~69 indexable URLs. Sitemap currently lists 24 EN + Swedish/Norwegian copies but is missing `/returns`, `/mosque-support`, `/guest-order-lookup`, and the 3 NO blog posts have inconsistent coverage. All `<lastmod>` are stale `2026-02-16`.
- **Canonicals:** `SEOHead` (which emits canonical + hreflang + JSON-LD) is used on Home, About, Blog, Contact, Partners, Shipping, and all blog post pages. Missing on **Shop, Returns, Transparency, MosqueSupport, SupportOurMission, DonationSuccess, DonationCancel** (those use raw `<Helmet>` with title/description only — no canonical, no hreflang).
- **Robots/noindex:** No `noindex`/`nofollow` anywhere in `src/`, `public/`, or `index.html`. `robots.txt` already allows all and references the sitemap. ✓
- **Internal linking:** Navbar has 5 items (Home, Shop, Blog, Our Mission, Contact). Footer has Home, Shop, Blog, About, Contact, Returns, Partners. **Not linked from nav/footer:** `/shipping`, `/support-our-mission`, `/transparency`, `/mosque-support`. These are likely the "Discovered – Not Indexed" pages because Google sees them in the sitemap but rarely on pages.
- **Shop product schema:** Already has Product JSON-LD with offers, brand, shipping, return policy. Description is one short sentence — should be expanded to 150–200 words and made unique per locale. SKU is generic.
- **index.html:** Static `<title>` and meta description ship in the initial HTML (good for crawlers before JS runs), but OG description still says "2-4 days" — should align with current "Fast EU delivery" copy per memory.

## Changes

### 1. Add `SEOHead` to all pages currently missing canonicals
Replace the bare `<Helmet>` blocks with `<SEOHead title={...} description={...} />` (which auto-emits canonical, hreflang, OG locale alternates, and accepts `jsonLd`). Pages to update:

- `src/pages/Shop.tsx` — keep the rich Product JSON-LD; pass it through `SEOHead`'s `jsonLd` prop instead of inline `<script>` so canonical/hreflang are added.
- `src/pages/Returns.tsx`
- `src/pages/Transparency.tsx`
- `src/pages/MosqueSupport.tsx`
- `src/pages/SupportOurMission.tsx`
- `src/pages/DonationSuccess.tsx` and `src/pages/DonationCancel.tsx` — add SEOHead with `noindex` (transactional confirmation pages, intentionally excluded).

For each, add localized titles + 150–160 char descriptions in `en.json` / `sv.json` / `no.json` under existing keys (`returns.seoTitle`, `returns.seoDescription`, etc. — many already exist; we'll add only what's missing).

### 2. Enrich Shop product description and structured data
In `src/pages/Shop.tsx`:
- Expand the JSON-LD `description` to a 180-word unique paragraph per locale (en/sv/no) covering material, two-piece composition, sizing approach, intended use (Hajj/Umrah), origin (ships from Sweden), care, and EU delivery.
- Replace generic `IHRAM-SET-001` SKU with bundle-aware SKUs and add `aggregateRating`/`review` only if real data exists (skip for now per "no unverified claims" memory).
- Ensure the main product `<img>` has a descriptive `alt` (currently "Pure Ihram Hajj Towel Set" — upgrade to "White microfiber Ihram set for men – Izaar and Ridaa, ships from Sweden").
- Add `og:type="product"` and per-locale OG title/description (already present, refine).

### 3. Update `public/sitemap.xml`
- Bump every `<lastmod>` to today's date (`2026-04-27`).
- Set priorities: homepage `1.0`, `/shop` `0.9`, blog posts `0.8`, other pages `0.6`.
- Add the 4 missing URL entries (× 3 locales): `/returns`, `/transparency`, `/mosque-support`, `/shipping` (verify all locales present).
- Remove or `noindex` purely transactional pages (`/order-success`, `/donation-success`, `/donation-cancel`, `/guest-order-lookup`) — keep them OUT of sitemap (they already are).
- Confirm consistent `xhtml:link` alternates on every entry.

### 4. Strengthen internal linking from the homepage
In `src/pages/Home.tsx`, add a small "Resources" / link strip near the FAQ or Final CTA that links to:
- `/shop`, `/shipping`, `/returns`, `/about`, `/partners`, `/support-our-mission`, `/transparency`, `/blog`

This ensures every sitemap URL is reachable in ≤2 clicks from `/`. Style as a plain text-link grid consistent with the Swedish-minimalist aesthetic (no icons, no emojis, no new colors). Localize labels via existing i18n keys.

Also add a one-line "Shipping & returns" link inside the existing `ShippingReassuranceStrip` pointing to `/shipping` and `/returns` if not already present.

### 5. Footer additions
Add `Shipping`, `Support our mission`, and `Transparency` to the footer `quickLinks` array in `src/components/ui/footer.tsx` so they appear on every page (boosts crawl priority for the "Discovered – not indexed" set).

### 6. `index.html` cleanup
Update the static OG description to match current copy: replace "Ships from Sweden in 2-4 days" → "Ships from Sweden, fast delivery across Europe." (consistent with memory rule and SEOHead defaults).

### 7. `robots.txt`
Already correct (Allow + Sitemap reference). No change needed; will verify file contents are unchanged.

### 8. Verify no accidental noindex
Confirmed via grep — none exist. Will keep `DonationSuccess`/`DonationCancel` intentionally `noindex` (added in step 1).

## Files to edit

- `src/pages/Shop.tsx` (SEOHead + richer description + alt)
- `src/pages/Returns.tsx`
- `src/pages/Transparency.tsx`
- `src/pages/MosqueSupport.tsx`
- `src/pages/SupportOurMission.tsx`
- `src/pages/DonationSuccess.tsx`
- `src/pages/DonationCancel.tsx`
- `src/pages/Home.tsx` (resources link strip)
- `src/components/SEOHead.tsx` (add optional `noindex` prop)
- `src/components/ui/footer.tsx` (add 3 quick links)
- `public/sitemap.xml` (refresh lastmod, priorities, add missing URLs)
- `index.html` (OG description tweak)
- `src/i18n/locales/en.json`, `sv.json`, `no.json` (add any missing seoTitle/seoDescription keys + footer/home link labels + expanded shop product description)

## Out of scope

- Server-side rendering / pre-rendering (this is a Vite SPA; Google does render JS, but we are not switching frameworks per the framework memory).
- Auto-generating sitemap from routes at build time — keeping it as a static file maintained alongside routes.
- Adding fake reviews/ratings to product schema (forbidden by "no unverified claims" policy).

## Verification after implementation

1. `bun tsc --noEmit` — type check.
2. `bunx vitest run` — existing locale + checkout tests must pass.
3. Spot-check `/`, `/shop`, `/returns`, `/sv`, `/no/blog/how-to-wear-ihram` in DOM for: unique `<title>`, unique meta description, `<link rel="canonical">`, hreflang triples, and (Shop only) Product JSON-LD with rich description.
