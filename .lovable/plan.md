

## Website Audit Fixes — Minimalism & UX Improvements

Implementing the critical and high/medium-priority items from the audit report across navigation, homepage, shop page, and design.

---

### 1. Fix Critical 404s: /guides and /support

**Problem**: No routes exist for `/guides` or `/support`.
- `/guides` → add redirect route to `/blog` (which is already labeled "Guides" in nav)
- `/support` → add redirect route to `/contact`
- Add same for locale prefixes (`/sv/guides`, `/no/guides`, etc.)

**File**: `src/App.tsx` — add `<Navigate>` routes

---

### 2. Simplify Navigation (8 → 5 items)

**Current**: Home, Shop, Guides, Shipping, Support, Transparency, About, Contact
**Target**: Home, Shop, Guides, Our Mission, Contact

**File**: `src/components/ui/navbar.tsx`
- Remove: Shipping, Support Mission, Transparency, About from nav array
- Keep: Home, Shop, Blog (labeled "Guides"), new "Our Mission" link → `/about` (will serve as combined About+Transparency)
- Add Contact

**File**: `src/i18n/locales/en.json`, `sv.json`, `no.json`
- Add `nav.ourMission` translation key

---

### 3. Homepage — Hero Cleanup

**File**: `src/pages/Home.tsx`

- **Remove decorative background pattern**: Change hero to plain `bg-[#FAFAFA]` — remove the `heroPattern` import and `backgroundImage` style
- **Single CTA**: Remove the "Learn More" outline button. Move "For Mosques & Agencies" link to footer only
- **Merge two "Why Choose" sections** into one: Keep the benefits section (4 cards with Lucide icons), remove the whyChoose section (3 cards with emojis 🌟🚚)
- **Remove second Quran quote** (quranVerse2 block, lines 226-238)
- **Reduce guide cards from 6 to 3**: Show only first 3 articles, keep "View All" link
- **Compact bottom CTA**: Remove subtitle paragraph, keep one line + button

---

### 4. Promo Banner — Remove Emojis

**File**: `src/components/PromoBanner.tsx`
- Remove `Sparkles` icon
- Update banner to plain text style

**File**: `src/i18n/locales/en.json`, `sv.json`, `no.json`
- Remove 🎉 emoji from `banner.newStock` text

---

### 5. Shop Page — Minimalism

**File**: `src/pages/Shop.tsx`

- **Remove Spiritual Reminder card** (lines 494-503) — move to Guides/About
- **Replace emojis** in shipping info card (📦) with Lucide `Package` icon text
- **Make specs, care instructions, shipping info collapsible** using Accordion component
- **Simplify page header** if a custom one is shown

---

### 6. Design & Spacing Refinements

**File**: `src/pages/Home.tsx`
- Reduce section `py-20` → `py-12` or `py-14` throughout homepage
- Remove card borders where possible (already `border-0` on some)

**File**: `src/components/WhatsAppButton.tsx`
- Restrict visibility to `/shop`, `/contact`, and `/cart` pages only

---

### 7. Footer — Update Links

**File**: `src/components/ui/footer.tsx`
- Remove redundant links (Shipping as standalone, Partners)
- Keep: Home, Shop, Guides, Our Mission, Contact, Returns

---

### Summary of Files Modified

| File | Changes |
|------|---------|
| `src/App.tsx` | Add /guides → /blog and /support → /contact redirects |
| `src/components/ui/navbar.tsx` | Reduce nav to 5 items |
| `src/pages/Home.tsx` | Remove pattern bg, merge sections, reduce cards, compact CTA |
| `src/components/PromoBanner.tsx` | Remove sparkle icon, clean text |
| `src/pages/Shop.tsx` | Remove spiritual reminder, add accordions for specs |
| `src/components/WhatsAppButton.tsx` | Show only on Shop/Contact/Cart |
| `src/components/ui/footer.tsx` | Simplify quick links |
| `src/i18n/locales/en.json` | Update banner text, add ourMission key |
| `src/i18n/locales/sv.json` | Same |
| `src/i18n/locales/no.json` | Same |

No database changes needed. No edge function changes needed.

