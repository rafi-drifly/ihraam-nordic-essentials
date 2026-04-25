
## Homepage v2 - Implementation Plan

Apply the v2 doc to the live homepage, **respecting the brand rules** confirmed in our Q&A:
- No fake-urgency deadlines, no "2 days" promise (use 2-4 days)
- One named testimonial only - no star ratings or "5/5" claims
- Lead magnet wired to Resend (auto-send PDF), no entity name, no founder name yet
- All copy in English only for now (Swedish/Norwegian translations to follow in a later pass)

---

### 1. SEO meta tags - `src/components/SEOHead.tsx` + `src/pages/Home.tsx`

Replace the homepage `<head>` tags via the existing `SEOHead` component:
- **Title**: `Buy Ihram Online - Premium Pilgrimage Cloth from €19 | Pure Ihram`
- **Description**: `Premium Ihram cloth for Hajj & Umrah. From €19. Ships from Sweden, fast delivery across Europe.`
- **OG title**: `Pure Ihram - Premium Ihram Cloth for Hajj 2026`
- **OG description**: `Lightweight, comfortable Ihram from €19. Ships from Sweden across the EU. Get your Hajj 2026 set today.`

Add **Organization, Product, FAQPage JSON-LD** structured data on the homepage. (Existing canonical/www rules preserved.)

---

### 2. Promo banner - `src/components/PromoBanner.tsx` / `i18n/locales/en.json`

Update `banner.promoText` to:
> `Hajj 2026 - order in time. Ihram from €19, ships from Sweden across the EU.`

(Plain text, no countdown date, no emoji - matches existing banner rule.)

---

### 3. Hero rewrite - `src/pages/Home.tsx` + `en.json`

- **H1**: `Premium Ihram for Hajj 2026`
- **Highlight (line 2)**: `From €19, Shipped from Sweden`
- **Sub**: `Lightweight microfiber Ihram for pilgrims across Sweden, the Nordics and the EU. Free Hajj Prep Pack with every order.`
- **CTA**: `Shop Ihram - From €19`
- **Trust line**: `Ships from Sweden  ·  Stripe-secure checkout  ·  Free EU returns within 14 days`
- **Secondary text link** (under CTA): `Get the Free Hajj 2026 Prep Pack` → scrolls to lead-magnet section

---

### 4. NEW Social-proof block (under hero)

A new minimal `TestimonialBlock` component:
- Initials avatar in a teal circle ("MS")
- Quote: *"A really good experience. The quality met my expectations, and I'd happily recommend Pure Ihram to anyone preparing for Hajj or Umrah."*
- Attribution: `Mohsin Saleemi  ·  Västerås, Sweden  ·  Verified buyer`
- **No star icons, no "5/5" rating** (per memory rule)
- Below the quote: 3 plain trust chips with Lucide icons (no emoji): `MapPin Ships from Sweden - 2-4 day EU delivery` · `Lock Stripe-secure: Apple Pay, Klarna` · `RotateCcw 14-day free returns`

---

### 5. NEW Product offers block (3 cards)

A new `ProductOffersBlock` component on the homepage with the three SKUs, "Most Popular" highlight on the 2-pack:
| Card | Price | Copy |
|------|-------|------|
| Single Set | €19 | "One complete set (Izaar + Ridaa). Ideal for Umrah or first-time buyers." |
| 2-Pack (Most Popular) | €37 (save €1) | "Most pilgrims wear 2 Ihrams during Hajj - one for travel, one fresh." |
| 3-Pack (Best Value) | €55 (save €2) | "For family groups, mosque pre-orders, or extra spare." |

Each card "Add to cart" button uses the existing `useCart` hook with the matching SKU IDs from `lib/bundles.ts`. Below the grid, a single line: *"Free with every order: Pure Ihram Hajj 2026 Prep Pack - printable checklist, dua list, packing guide."*

---

### 6. Why Pure Ihram (4 value props) - update existing block

Rewrite the four existing benefits:
1. **Built for the Climate** - `Lightweight, breathable microfiber that stays cool and dries fast - made for Makkah heat.`
2. **Ships from Sweden** - `EU-based fulfilment means 2-4 day delivery, no customs surprises.`
3. **Quality-Checked Every Set** - `Every set inspected before it leaves our warehouse. If something's wrong, we replace it.`
4. **Built for European Pilgrims** - `Founded in Sweden to serve Muslims across the Nordics and EU - fair prices, fast shipping.`

(Founder claim softened to "Founded in Sweden" per your "skip founder name" choice.)

---

### 7. NEW Lead magnet block + Resend integration

**Frontend** (`HajjPrepPackBlock` component on homepage):
- Headline: `Going for Hajj 2026? Get our Free Pure Ihram Prep Pack.`
- Sub: `A printable checklist, dua list, and packing guide for first-time pilgrims. Free - even if you don't buy from us.`
- 3 bullets (12-item checklist, essential duas, day-by-day timeline)
- Email field + button `Send the Pack`
- Privacy note: `No spam. We'll send the pack and a few helpful Hajj tips before you go.`

**Backend**:
1. **New Supabase table** `hajj_prep_subscribers` (id, email unique, created_at, locale, source) with RLS - public insert, no public read.
2. **New edge function** `send-prep-pack` that:
   - Validates email with Zod
   - Inserts the email into `hajj_prep_subscribers` (idempotent on conflict)
   - Sends email via existing Resend integration (`RESEND_API_KEY` already in secrets) using `support@pureihraam.com` as the From address
   - Email body: short HTML thank-you with a download link to the Prep Pack PDF
3. **PDF asset placeholder**: I'll commit a placeholder PDF at `public/hajj-2026-prep-pack.pdf` with a note in chat that you should replace it with your real prep pack file. The download link will work as soon as you drop the real PDF at that path.

---

### 8. NEW "How to Wear Ihram" teaser block

Headline + sub + button linking to existing blog post `/blog/how-to-wear-ihram`. Uses the existing `howToWear` blog image.

---

### 9. NEW Shipping & returns reassurance strip

Five-item icon row (Lucide icons, no emoji):
- Free EU shipping on orders over €40
- Standard EU delivery: 2-4 business days from Sweden
- Express shipping at checkout
- 14-day free returns - no questions asked
- Stripe-secure checkout: Apple Pay, Google Pay, Klarna

---

### 10. NEW FAQ block (with FAQPage schema)

Accordion (existing `Accordion` UI component) with the 7 Q&A from the doc. Wrapped in JSON-LD `FAQPage` schema for Google rich results.

---

### 11. Final CTA section - update existing

- Headline: `Ready for Hajj 2026?`  *(softened from "5 weeks away")*
- Sub: `Get your Ihram delivered in days. From €19. Ships from Sweden.`
- CTA: `Shop Ihram - From €19`

---

### 12. Founder block - **SKIPPED** (per your choice)

No founder photo/name added. Will revisit when you confirm details.

---

### Files touched

- `src/pages/Home.tsx` - full rewrite
- `src/components/SEOHead.tsx` - extend to accept `jsonLd` prop array
- `src/components/PromoBanner.tsx` (text only via i18n)
- `src/i18n/locales/en.json` - all new strings
- **New** `src/components/home/TestimonialBlock.tsx`
- **New** `src/components/home/ProductOffersBlock.tsx`
- **New** `src/components/home/HajjPrepPackForm.tsx`
- **New** `src/components/home/HowToWearTeaser.tsx`
- **New** `src/components/home/ShippingReassuranceStrip.tsx`
- **New** `src/components/home/HomepageFAQ.tsx`
- **New migration**: `hajj_prep_subscribers` table + RLS
- **New edge function**: `supabase/functions/send-prep-pack/index.ts`
- **New asset placeholder**: `public/hajj-2026-prep-pack.pdf`

### What I will NOT do (per your decisions and brand rules)

- No "order by 15 May" deadline / no "2 days" delivery claim
- No star icons, no "5/5 verified" rating, no "trusted by pilgrims" overclaim
- No "Pure Ihram AB / Stockholm" entity line, no founder name/photo
- No Swedish/Norwegian translations in this pass (English only - flagging this for a follow-up loop)
- No emojis anywhere - Lucide icons only

### Open items you'll need to provide later

1. **Replace** `public/hajj-2026-prep-pack.pdf` with the real prep pack file
2. Confirm founder name/photo when ready (will add the founder block then)
3. Confirm legal entity for the footer (will update footer then)
4. Approve Swedish + Norwegian translations of the new copy in a follow-up loop
