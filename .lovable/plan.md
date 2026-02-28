
## Implement Norway (NO) Shipping + Destination Selector

### Overview
Add Norway-specific shipping rules (1-2 sets = EUR39, 3+ sets = EUR49), a "Delivering to" country selector, destination-aware bundle cards, Norway-specific upsell banners, and a customs notice at checkout. Language defaults the destination but users can override it.

### Architecture Decision: Destination State
Introduce a **shipping destination** concept (`'SE' | 'NO'`) stored in React context or a simple Zustand/localStorage-backed state. Norwegian locale defaults to `'NO'`, Swedish/English defaults to `'SE'`. The user can change it via a dropdown on the Shop page.

---

### Changes by File

#### 1. `src/lib/shipping.ts` -- Add Norway rules
- Add `'norway'` to `SHIPPING_RATES` and a new shipping calculation:
  - qty 1-2: EUR39 flat
  - qty 3+: EUR49 flat
- Update `calculateShipping()` to handle `'norway'` region
- Add `getShippingLabelNorway()` helper

#### 2. `src/lib/bundles.ts` -- Destination-aware bundles
- Keep `BUNDLES` as the Sweden defaults
- Add a `BUNDLES_NO` array with Norway shipping values:
  - Single: totalPrice 20, shipping 39, savings 0
  - 2-Pack: totalPrice 40, shipping 39, savings 20 (vs 2x(20+39)=118, bundle=79, save 39... actually savings = difference in shipping: 2 singles would be 2x39=78 shipping vs 39 flat = save EUR39 -- but that's misleading. Better: savings vs "single delivered price x qty". Single delivered = 59, so 2x59=118, 2-pack delivered = 40+39=79, save EUR39. 3-pack: 3x59=177, 3-pack delivered=60+49=109, save EUR68)
  - 3-Pack: totalPrice 60, shipping 49, savings 68
- Export a `getBundlesForDestination(dest)` function

#### 3. New: `src/hooks/useShippingDestination.ts` -- Destination state
- Simple hook using localStorage + state
- Default: `'SE'` unless locale is `'no'` (then default `'NO'`)
- Provides `destination`, `setDestination`

#### 4. `src/pages/Shop.tsx` -- Major UI updates
- Import `useShippingDestination` hook
- Add a "Delivering to: [Sweden v / Norway v]" dropdown selector above bundle cards
- Use destination-aware bundles array instead of static `BUNDLES`
- Show flag emoji (SE/NO) next to shipping line in bundle cards
- For Norway: show "EUR39 levering" / "EUR49 levering" instead of free delivery
- Add customs notice text below bundle cards when destination is NO
- Pass `shippingCountry` to the checkout function call

#### 5. `src/pages/Cart.tsx` -- Destination-aware cart
- Import `useShippingDestination`
- Calculate shipping based on destination
- Update upsell banners for Norway:
  - qty=1: "Add 1 more -- shipping stays the same (Best Value 2-Pack)"
  - qty=2: "Buying 3? Shipping becomes EUR49 -- still best value per set."
- Show customs notice for Norway destination
- Pass `shippingCountry` to checkout

#### 6. `src/components/shop/CartDrawer.tsx` -- Destination-aware drawer
- Same shipping + upsell logic as Cart.tsx but condensed
- Pass `shippingCountry` through to checkout

#### 7. `src/components/ui/navbar.tsx` -- Pass destination to checkout
- Pass `shippingCountry` in checkout request body

#### 8. `supabase/functions/create-checkout/index.ts` -- Norway shipping in Stripe
- Accept new `shippingCountry` field in request body (default `'SE'`)
- New `getShippingCents(qty, country)`:
  - SE: existing logic (1-2=900, 3+=0)
  - NO: 1-2=3900, 3+=4900
- Update shipping line item description for Norway
- Add customs `custom_text` note for Norway: "Norway is outside the EU. Import VAT/customs fees may apply on delivery."
- Update metadata: `shipping_country` from request

#### 9. `src/i18n/locales/en.json` -- New keys
- `shop.destination.label`: "Delivering to:"
- `shop.destination.sweden`: "Sweden"
- `shop.destination.norway`: "Norway"
- `shop.destination.norwayCustomsNote`: "Norway is outside the EU. Import VAT/customs fees may apply on delivery."
- `shop.destination.norwayShippingSame`: "Shipping stays the same for 1-2 sets."
- `cart.upsell.noQty1`: "Add 1 more -- shipping stays the same (Best Value 2-Pack)"
- `cart.upsell.noQty2`: "Buying 3? Shipping becomes EUR49 -- still best value per set."

#### 10. `src/i18n/locales/sv.json` -- Swedish translations for new keys

#### 11. `src/i18n/locales/no.json` -- Norwegian translations for new keys
- Default destination to Norway when locale is NO

---

### Checkout Flow
1. Frontend sends `shippingCountry: 'SE' | 'NO'` alongside existing `items`, `bundlePrice`, `locale`
2. Edge function uses country to calculate correct shipping cents
3. Stripe session includes correct shipping amount and customs note for NO

### Test Cases Covered
- NO qty 1: product EUR20 + shipping EUR39 = EUR59
- NO qty 2: product EUR40 + shipping EUR39 = EUR79  
- NO qty 3: product EUR60 + shipping EUR49 = EUR109
- SE logic unchanged

### Files Modified (11 files)
1. `src/lib/shipping.ts`
2. `src/lib/bundles.ts`
3. `src/hooks/useShippingDestination.ts` (new)
4. `src/pages/Shop.tsx`
5. `src/pages/Cart.tsx`
6. `src/components/shop/CartDrawer.tsx`
7. `src/components/ui/navbar.tsx`
8. `supabase/functions/create-checkout/index.ts`
9. `src/i18n/locales/en.json`
10. `src/i18n/locales/sv.json`
11. `src/i18n/locales/no.json`
