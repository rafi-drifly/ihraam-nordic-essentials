

## Pure Ihram — Design & UX Overhaul

A comprehensive update to colors, homepage, shop page, blog, footer, and content safety — without touching backend logic or checkout flow.

---

### 1. Update Design Tokens (Colors & Font)

**`src/index.css`** — Replace CSS custom properties to match the brand spec:

| Token | Current HSL | New hex → HSL |
|-------|------------|---------------|
| `--primary` | `180 50% 31%` | `#287777` → `180 51% 31%` (close, minor tweak) |
| `--foreground` | `180 25% 25%` | `#305050` (Deep teal) → `180 25% 25%` (keep) |
| `--muted` | `180 10% 96%` | `#F0F5F5` (Mist) → `168 18% 95%` |
| `--border` | `180 15% 92%` | `#D4E4E4` (Frost) → `180 20% 86%` |
| `--muted-foreground` | `180 8% 45%` | `#6A7C7C` (Stone) → `180 8% 45%` (keep) |
| `--accent` | `45 85% 55%` | `#EEBD2B` (Warm gold) → `45 82% 55%` |

Most values are already very close. The main change is `--border` and `--muted` to match Frost/Mist exactly.

**`tailwind.config.ts`** — Already uses Inter font. No change needed.

---

### 2. Homepage Rebuild (`src/pages/Home.tsx`)

Restructure into 5 clean sections:

1. **Hero** — Keep product image + text layout but:
   - Remove price from hero (move to Shop)
   - Headline: "Ihram for Hajj & Umrah — delivered from Sweden"
   - One CTA: "Shop Now"
   - One trust line below CTA: "Clear pricing · Sweden-based · 3–7 day delivery"

2. **Why Choose Pure Ihram** — 4 cards (replacing current benefits):
   - Simple to order
   - Sweden-based delivery
   - Honest pricing
   - Calm, respectful service

3. **Quick Links / Trust section** — Compact row with links to Shop, Shipping, Contact, Our Mission

4. **Featured Guides** — Keep 3 blog cards (already in place), cleaner styling

5. **Bottom CTA** — Keep but simplify copy

**Remove**: Quran verse section (lines 91-103), duplicate quote sections

**`src/i18n/locales/en.json`** (+ sv.json, no.json) — Update hero text, benefit titles, trust line, CTA copy.

---

### 3. Shop Page Cleanup (`src/pages/Shop.tsx`)

- **Remove fake reviews**: Delete the 5-star rating display and "(127 reviews)" badge (lines 286-289)
- **Remove fake aggregateRating** from JSON-LD schema (line 197)
- **Remove "Fast Delivery" badge** — replace with a subtle trust line under CTA
- **Add trust line under Add to Cart**: "Shipped from Sweden · Secure checkout via Stripe"
- **Keep** bundle cards, accordion details, image gallery — all working well
- **Review JSON-LD description**: Remove "cotton" reference, use safe wording
- **Keep care instructions** in accordion but add a note: content may vary by batch (safety per audit rules)

---

### 4. Content Safety Audit (`en.json` + components)

Items to fix:
- `shop.description`: mentions "cotton towel set" in JSON-LD → change to "Ihram cloth set"
- `contact.faq.included.answer`: says "white cotton pieces" → "white unstitched pieces"
- `contact.faq.returns.answer`: says "30 days" but footer badge says "14-day returns" → standardize to 14 days
- `shop.specifications.sizeValue`: "115 × 230 cm" vs contact FAQ "115cm x 200cm" → remove exact dimensions from FAQ or mark as approximate
- Remove `aggregateRating` from Shop JSON-LD (unverified)
- Footer copyright: "2025" → "2026"

---

### 5. Navigation — Already Correct

Current nav: Home, Shop, Guides, Our Mission, Contact. Redirects for `/guides` → `/blog` and `/support` → `/contact` are in place. No changes needed.

---

### 6. Blog Page Styling (`src/pages/Blog.tsx`)

- Remove the Quran verse quote section from the blog listing page
- Make blog cards cleaner: reduce shadow, use `border border-border` instead of heavy shadows
- Add links back to Shop and Contact at the bottom of the blog listing
- The blog cover images are existing PNGs — we cannot replace them without new assets, but we can style the cards to feel calmer (less shadow, rounded corners, muted overlays)

---

### 7. Footer Cleanup (`src/components/ui/footer.tsx`)

- Remove the italic Quran quote from the footer bottom (lines 113-115)
- Keep quick links, service areas, contact info
- Update copyright year to 2026

---

### 8. PromoBanner Update (`src/components/PromoBanner.tsx`)

- Current text: "New stock has arrived! Delivered within a day in Sweden"
- Update to: "Ihram sets from €20 — delivered across Europe"
- Simpler, factual, no hype

---

### 9. SEO Metadata Review (`src/components/SEOHead.tsx`)

- Default descriptions already look clean
- Verify Shop page Helmet meta doesn't say "cotton" → update description in Shop.tsx Helmet

---

### Files Modified

| File | Changes |
|------|---------|
| `src/index.css` | Update `--muted`, `--border` to match Mist/Frost |
| `src/pages/Home.tsx` | Restructure hero, remove Quran section, add trust row, update benefits |
| `src/pages/Shop.tsx` | Remove fake reviews/rating, clean JSON-LD, add trust line |
| `src/pages/Blog.tsx` | Cleaner card styling, remove quote, add bottom links |
| `src/components/ui/footer.tsx` | Remove quote, update year |
| `src/components/PromoBanner.tsx` | Update banner text |
| `src/i18n/locales/en.json` | Update hero copy, fix content conflicts, remove hype |
| `src/i18n/locales/sv.json` | Mirror en.json changes |
| `src/i18n/locales/no.json` | Mirror en.json changes |

No backend, edge function, or route changes needed.

