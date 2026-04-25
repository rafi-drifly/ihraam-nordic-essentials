## Goal

Rebuild the homepage pricing block per spec: 3 cards, 2-Pack first on mobile, "Most Popular" + "Best Value" badges, brand-true colors, accessible, with **honest savings copy based on shipping economics**.

## Pricing logic (locked, Amanah-compliant)

Prices stay **€19 / €37 / €55** site-wide (Stripe, Shop, schema, hero unchanged). Savings come from the single €9 shipping fee being shared across multiple sets:

| Bundle | Price + ship | Buying singly | Saving |
|---|---|---|---|
| Single | €19 + €9 = €28 | - | - |
| 2-Pack | €37 + €9 = €46 | 2 × €28 = €56 | **€10** |
| 3-Pack | €55 + €9 = €64 | 3 × €28 = €84 | **€20** |

A small subhead inside Cards 2 and 3 will clarify the "one shipping fee" mechanic so the savings are transparent and verifiable.

## Files

**Rewrite** `src/components/home/ProductOffersBlock.tsx`
- Remove old "Save €1 / Save €2" copy entirely.
- New layout per spec: max-width 1200px, 80px vertical padding, centered H2 + subhead, 3-col grid.
- Cards 1 & 3: white bg, 1px #E5E7EB border, 16px radius, 32px padding, hover lift -4px + shadow.
- Card 2 (highlighted): 2px #287777 border, soft teal shadow, no hover lift (already emphasized).
- Badges: pill, -14px from top, `aria-hidden`. "Most Popular" = white-on-teal. "Best Value" = near-black on gold #EEBD2B.
- Price line: `€19` 48px/700 + ` + shipping` 14px/400 inline, centered.
- Savings line on Cards 2 & 3: "Save €10" / "Save €20" in 16px/700 #287777, plus a 13px muted note "One shipping fee for all sets" so the saving is verifiable.
- Footer line below grid: "Free with every order: Pure Ihram Hajj 2026 Prep Pack - printable checklist, dua list, packing guide." (hyphen, not em dash).
- CTA buttons: full-width, 48px tall, #287777 / hover #205A5A, 16px/600 white text, 8px radius, focus ring 3px solid #EEBD2B with 2px offset.
- Whole-card click delegates to the inner CTA via a click handler on the card wrapper. Card is a `<div>` (not a button) to avoid nested-button a11y issue; CTA remains the only true interactive element. `aria-label` on the card describes the offer for screen readers.
- Add to cart via `useCart` (id `IHRAM-1` / `IHRAM-2` / `IHRAM-3`, name, price, image from existing hero asset), then `navigate(localePrefix + "/shop")` so user reviews cart + sees donation upsell before Stripe.

**Mobile order**: 2-Pack `order: -1` at `<768px` so it stacks first; Single Set second; 3-Pack third. Badges stay attached.

**Responsive**:
- 1024px+: 3 cols, 24px gap
- 768-1023px: 3 cols, 16px gap, 24px card padding
- under 768px: 1 col, full-width, 2-Pack first

**Brand tokens**: hard-coded hex per spec (#287777, #305050, #EEBD2B, #4B5563, #6B7280, #E5E7EB, #205A5A). White section background.

## Out of scope (not changing)

- `src/lib/bundles.ts` (still €19/€37/€55; the internal Shop math is unchanged - the homepage now expresses the shipping-inclusive saving, which is the more honest customer-facing number).
- `src/pages/Shop.tsx`, Stripe products, JSON-LD, hero "From €19" copy, locales.
- All other homepage sections.

## Verification

After build I'll confirm: prices/Stripe still match Shop, no em/en dashes introduced, no `min-h-screen`, focus ring visible on Tab, mobile order is 2-Pack -> Single -> 3-Pack.