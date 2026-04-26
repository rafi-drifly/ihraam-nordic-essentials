## Plan: Pure Ihram Site-Wide Copy, SEO & Behavior Fixes

All 10 fixes are scoped to **text content, meta tags, and two interactive behaviors** — no styling, layout, color, or functional changes.

Localized strings (Partners pricing, About story, FAQs, blog dates, trust strip, etc.) live in `src/i18n/locales/{en,sv,no}.json`, so all three locales will be updated in lockstep to avoid English fallbacks.

---

### Fix 1 — Partners pricing table (`/partners`)

**File:** `src/pages/Partners.tsx`
- Line 257: `€15` → `€19`
- Line 265: `€18-€20` → `€19-€22`
- Line 269: `€5-€7` → `€6-€9`
- Line 282: `€500+` → `€600+`

**File:** `src/i18n/locales/{en,sv,no}.json` (`partners.pricing.example.description`)
- `"…sells at €17-€19 each:"` → `"…sells at €19-€22 each:"` (and SV/NO equivalents)

---

### Fix 2 — Remove "thousands" overclaim (`/about`)

**File:** `src/i18n/locales/{en,sv,no}.json`
- `about.story.p4` → "Today, we're proud to serve pilgrims across Sweden, the Nordic countries, and the European Union - ensuring that distance and cost never become barriers to spiritual fulfillment." (hyphen per typography memory; no em/en dashes)
- `partners.product.subtitle` ("Premium quality Ihram trusted by thousands of pilgrims") → "Premium quality Ihram for pilgrims across Europe" (and translated equivalents) — same overclaim

*Note:* Fix 4 will overwrite p4 entirely, but updating it here keeps consistency in case ordering shifts.

---

### Fix 3 — Remove "2-4 day" delivery promise (homepage only)

Update **all three locale files**:
- `home.testimonial.trust.shipping`: "Ships from Sweden - 2-4 day EU delivery" → "Ships from Sweden · Fast EU delivery" (SV: "Skickas från Sverige · Snabb EU-leverans"; NO: "Sendes fra Sverige · Rask EU-levering")
- `home.shipping.delivery`: "Standard EU delivery: 2-4 business days from Sweden" → "Fast EU delivery from Sweden" (with SV/NO equivalents)
- `home.benefits` description (line 63): "EU-based fulfilment means 2-4 day delivery, no customs surprises." → "EU-based fulfilment means fast delivery, no customs surprises."
- `home.faq.items` (line 113 — "How long does shipping take?"): replace "2-4 business days" portion with "Most EU customers receive their Ihram quickly - typical timing varies by destination, see our Shipping page for details."

**Shipping page (`/shipping`)** — left unchanged (3-7 SE, 7-14 EU stays).

---

### Fix 4 — Shorten About "Our Story" to 2 paragraphs (`/about`)

**File:** `src/i18n/locales/{en,sv,no}.json` (`about.story`)
- Replace `p1`-`p4` with two paragraphs (p3, p4 set to empty strings so `About.tsx` renders only the two filled `<p>` tags — `About.tsx` always renders all four; safer to keep keys but empty p3/p4 OR conditionally render).
- **Code change in `src/pages/About.tsx`** (lines ~52-55): switch the four hardcoded `<p>` tags to `.filter(Boolean).map(...)` over `[p1, p2, p3, p4]` so empty strings collapse cleanly.

New copy (EN):
- p1: "Pure Ihram started with a simple question: why are European Muslims paying excessive prices for basic pilgrimage cloth? We founded Pure Ihram in Sweden to fix that - premium Ihram at €19, shipped fast across the EU."
- p2: "Every sale is made with the sincere intention of earning ajr (reward) in the Akhirah. This isn't just commerce - it's service to our community, ensuring that cost and distance never stand between a believer and their pilgrimage."
- p3, p4: ""

SV and NO will be translated equivalents.

---

### Fix 5 — Shop page unique title + description (`/shop`)

**File:** `src/pages/Shop.tsx`
- Locate existing `<SEOHead>` (or add if missing) and set:
  - `title="Shop Ihram Sets - Single, 2-Pack & 3-Pack | Pure Ihram"`
  - `description="Choose your Ihram set: single (€19), 2-pack (€37), or 3-pack (€55). Lightweight microfiber, ships from Sweden. Secure Stripe checkout."`
- For SV/NO routes, derive localized variants via `i18n.language` (mirroring the pattern in `Partners.tsx` lines 132-142).

---

### Fix 6 — Homepage FAQ first item open by default

**File:** `src/components/home/HomepageFAQ.tsx`
- On `<Accordion type="single" collapsible …>`, add `defaultValue="item-0"`.

---

### Fix 7 — Blog dates → 2026

**File:** `src/i18n/locales/{en,sv,no}.json` (`blog.posts.*.date`)

| Key | New value (EN) |
|---|---|
| `howToWear.date` | `March 15, 2026` |
| `sunnahActs.date` | `March 10, 2026` |
| `checklist.date` | `March 5, 2026` |
| `commonMistakes.date` | `February 28, 2026` |
| `essentialDuas.date` | `February 20, 2026` |
| `spiritualMeaning.date` | `February 15, 2026` |

SV equivalents: "15 mars 2026", "10 mars 2026", "5 mars 2026", "28 februari 2026", "20 februari 2026", "15 februari 2026".
NO equivalents: same format ("15. mars 2026", etc.).

These keys feed both the Blog index cards and the SunnahActs/Checklist post pages — fully covered.

---

### Fix 8 — Partners hero CTAs scroll to form

Already implemented! `src/pages/Partners.tsx` lines 166 and 169 both call `onClick={scrollToForm}`, and `scrollToForm` (line 102) uses `behavior: 'smooth'`. **Verify the form section has `id="contact-form"`** — read lower portion of file and add the id if missing. No other change needed.

---

### Fix 9 — Contact FAQ "belts/sandals" answer

**File:** `src/i18n/locales/{en,sv,no}.json` (`contact.faq.accessories.answer`)
- EN: "Currently we specialise in Ihram cloth sets. For other pilgrimage essentials, we recommend checking with your local Islamic store or travel agency."
- SV/NO: translated equivalents.

---

### Fix 10 — Unique titles + meta descriptions for all pages

For each page below, ensure `<SEOHead title=… description=… />` is present with the specified values. Use `i18n.language` to switch between EN/SV/NO variants (following the `Partners.tsx` pattern).

| Page | File | Title (EN) | Description (EN) |
|---|---|---|---|
| Home `/` | `src/pages/Home.tsx` | (keep current default from `SEOHead.tsx`) | (keep current) |
| Shop `/shop` | `src/pages/Shop.tsx` | Already covered in Fix 5 | Already covered in Fix 5 |
| About `/about` | `src/pages/About.tsx` | `About Pure Ihram - Our Mission & Values \| Sweden-Based Ihram Store` | `Pure Ihram was founded in Sweden to make quality Ihram cloth affordable for every European Muslim. €19 per set, honest pricing, fast shipping.` |
| Shipping `/shipping` | `src/pages/Shipping.tsx` | `Shipping & Delivery - Fast EU Shipping from Sweden \| Pure Ihram` | `Fast, reliable Ihram delivery across Sweden, the Nordics, and the EU. Orders processed in 1-2 business days with full tracking.` |
| Contact `/contact` | `src/pages/Contact.tsx` | `Contact Pure Ihram - Email, WhatsApp & Phone Support` | `Get in touch with Pure Ihram. Email support@pureihraam.com, WhatsApp +46720131476, or use our contact form.` |
| Partners `/partners` | `src/pages/Partners.tsx` | `B2B Partnership - Wholesale Ihram for Mosques & Agencies \| Pure Ihram` | `Partner with Pure Ihram to offer wholesale Ihram sets to your mosque, agency, or travel group. Halal income, quality product, EU-wide shipping.` |
| Blog `/blog` | `src/pages/Blog.tsx` | `Hajj & Umrah Guides - Pilgrimage Knowledge \| Pure Ihram` | `Practical guides for Hajj and Umrah - how to wear Ihram, Sunnah acts, essential duas, packing checklists, and spiritual preparation.` |

For pages currently missing `<SEOHead>` (About, Shipping, Contact), add the import and component at the top of the JSX tree.

For each, add SV and NO localized variants (translated titles and descriptions).

Per typography memory: use hyphens (`-`) not em/en dashes throughout.

---

### Files modified

- `src/pages/Partners.tsx` (Fix 1: pricing values; Fix 8: verify `id="contact-form"`; Fix 10: title/description)
- `src/pages/About.tsx` (Fix 4: render filter; Fix 10: SEOHead)
- `src/pages/Shop.tsx` (Fix 5: SEOHead)
- `src/pages/Shipping.tsx` (Fix 10: SEOHead)
- `src/pages/Contact.tsx` (Fix 10: SEOHead)
- `src/pages/Blog.tsx` (Fix 10: update SEOHead title/description)
- `src/components/home/HomepageFAQ.tsx` (Fix 6: defaultValue)
- `src/i18n/locales/en.json` (Fixes 1, 2, 3, 4, 7, 9)
- `src/i18n/locales/sv.json` (same as en, in Swedish)
- `src/i18n/locales/no.json` (same as en, in Norwegian)

### Verification after implementation

- Run `bun tsc --noEmit` and `bunx vitest run` to confirm no regressions (i18n locale test from previous loop will validate keys still resolve per language).
- Visually confirm: Partners shows €19/€6-€9/€600+; About has 2 paragraphs without "thousands"; Homepage FAQ first item open; Blog cards show 2026 dates.
