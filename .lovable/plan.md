## Goal

Make the /shop page reflect the same pricing structure shown in the new homepage `ProductOffersBlock` (the screenshot you attached): correct savings copy (€10 / €20), "One shipping fee for all sets" subline, "Most Popular" / "Best Value" badges, and the same brand styling - while keeping all of /shop's existing product functionality (gallery, specifications accordions, Stripe Buy Now, country selector, schema.org JSON-LD, etc.).

## Current state on /shop (verified)

In `src/pages/Shop.tsx` lines ~285-330, the bundle selector is a 3-card row inside the right product column with these issues:

- Uses `BUNDLES` from `src/lib/bundles.ts`, where `savings: 1` (2-pack) and `savings: 2` (3-pack) - **wrong numbers**, contradicting the new homepage (€10 / €20).
- Renders vague copy via `t('shop.bundle.save2Pack')` ("Save on shipping - one delivery instead of two") and `t('shop.bundle.savingsVsSeparate', {...})` instead of the concrete "Save €10" + "One shipping fee for all sets" lines from the screenshot.
- Visual treatment is small radio-style cards, not the prominent pricing tiles from the homepage.
- Also surfaces "Save €X vs ordering N singles" math that the new design intentionally drops in favor of the cleaner "Save €10" / "Save €20" line.

## Proposed changes

### 1. Fix the savings source of truth

In `src/lib/bundles.ts`:

- Update `BUNDLES`: `2-Pack` → `savings: 10`, `3-Pack` → `savings: 20`.
- Swap the badges so they match the homepage / screenshot:
  - 2-Pack → `badge: 'Most Popular'`
  - 3-Pack → `badge: 'Best Value'`
- Keep `totalPrice` (€19 / €37 / €55) and `shipping: 9` unchanged - pricing is locked site-wide.

This single-source-of-truth fix prevents the homepage and shop from drifting again.

### 2. Replace the in-column bundle selector on /shop with a styled tier block

In `src/pages/Shop.tsx`:

- Replace the small selector grid (≈ lines 285-330) with a 3-card pricing tier UI that visually matches the homepage `ProductOffersBlock`:
  - Same teal `#287777` highlighted border on the selected (default = 2-Pack) card.
  - "Most Popular" teal pill on 2-Pack, "Best Value" gold (#EEBD2B) pill on 3-Pack.
  - Big `€19 / €37 / €55` price + `+ shipping` muted suffix.
  - For 2-Pack and 3-Pack: `Save €10` / `Save €20` in teal with subline "One shipping fee for all sets".
  - Single Set keeps an empty `min-height` placeholder so the three cards line up.
  - Mobile order: 2-Pack first, then Single, then 3-Pack (same as homepage).
- Crucially: cards stay **selectable** (clicking a card sets `selectedBundle`) so the existing "Add to Cart" and "Buy Now" buttons below continue to work with the chosen tier. The CTA buttons themselves are not duplicated - only the tier picker is restyled. This preserves Stripe Buy Now / cart flow intact.
- Remove the now-redundant `t('shop.bundle.save2Pack')` and `t('shop.bundle.savingsVsSeparate', ...)` lines from the cards.
- Keep the existing `whyBundles` italic note and country/shipping disclosure logic underneath untouched.

### 3. Translation updates

In `src/i18n/locales/{en,sv,no}.json`, add (or repurpose) a small set of keys used by the new tier UI so it works in all three locales:

- `shop.bundle.saveAmount` → `"Save €{{amount}}"` (sv: `"Spara €{{amount}}"`, no: `"Spar €{{amount}}"`)
- `shop.bundle.oneShippingFee` → `"One shipping fee for all sets"` (sv: `"En fraktavgift för alla set"`, no: `"Én fraktavgift for alle sett"`)
- `shop.bundle.mostPopular` and `shop.bundle.bestValue` already exist - reuse as-is.

The unused `save2Pack` and `savingsVsSeparate` keys will be left in place (harmless, avoids breaking anything else that might reference them) but no longer rendered.

### 4. Sync the homepage component to the same source

In `src/components/home/ProductOffersBlock.tsx`, the savings (10 / 20) are currently hardcoded in the `OFFERS` array. After step 1, this stays visually identical but I'll add a brief code comment noting that `BUNDLES` in `src/lib/bundles.ts` is the authoritative source so future edits go in one place. No visual change.

## Out of scope (no changes)

- Pricing values (€19 / €37 / €55) and €9 base shipping - locked.
- Stripe checkout flow, product gallery, JSON-LD, accordions, country selector - all untouched.
- Cart drawer / cart page - already use `BUNDLES`, will automatically pick up the corrected savings if displayed anywhere.

## Verification after implementation

1. `/` (homepage) - "Choose your Ihram" block looks identical to your screenshot (no regression).
2. `/shop` - bundle tiles visually match the homepage; selecting a tile updates the price shown on the "Add to Cart" / "Buy Now" buttons; Buy Now still redirects to Stripe.
3. `/sv/shop` and `/no/shop` - savings strings render in Swedish / Norwegian respectively.
4. Run `bunx vitest run` to confirm the existing checkout-flow test still passes (payload shape is unchanged).