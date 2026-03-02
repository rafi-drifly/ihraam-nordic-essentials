## Sweden-Only Checkout Update

Restrict the entire platform to Sweden (SE) shipping only. Remove Norway destination option and all NO-specific logic. Revert 2-Pack price to EUR 38 and update savings copy per the spec.

---

### 1. Bundle Pricing (`src/lib/bundles.ts`)

- Keep savings at **9** for 2-Pack, **18** for 3-Pack
- Remove `BUNDLES_NO` array entirely
- Remove `getBundlesForDestination` function (just export `BUNDLES`)
- Remove `ShippingDestination` import

### 2. Shipping (`src/lib/shipping.ts`)

- Remove `ShippingDestination` type (or make it just `'SE'`)
- Remove all Norway logic from `calculateShipping`, `getShippingLabel`
- Simplify to always return flat EUR 9
- Remove `norway_12`, `norway_3plus` from `SHIPPING_RATES`

### 3. Remove Destination Hook (`src/hooks/useShippingDestination.ts`)

- Either delete the file or simplify it to always return `'SE'`
- Recommended: simplify to a no-op hook returning `{ destination: 'SE' }` to minimize downstream breakage

### 4. Shop Page (`src/pages/Shop.tsx`)

- Remove the "Delivering to" `<Select>` dropdown (lines 293-304)
- Remove all `destination === 'NO'` conditional blocks (Norway customs notice, Norway savings, Norway shipping notes)
- Remove `destFlag` variable
- Update shipping info card: remove Norway bullet point (line 476)
- Update JSON-LD schema: change `shippingDestination.addressCountry` from `["SE", "NO", "DK", "FI"]` to `["SE"]`
- Update `applicableCountry` in return policy to `["SE"]`
- Update savings copy to match spec:
  - 2-Pack: `save2Pack` key with "Save EUR 9 vs buying 2 singles in one order."
  - 3-Pack: `savingsVsSeparate` key with "Save EUR 18 vs ordering 3 singles separately (3 deliveries)."

### 5. Cart Page (`src/pages/Cart.tsx`)

- Remove Norway upsell banners (lines 128-160)
- Remove Norway customs notice (lines 342-349)
- Remove `destination` from shipping display -- hardcode Sweden
- Keep promo code logic as-is (FREEDELIVERY-UPPSALA is Sweden-only anyway)

### 6. Edge Function (`supabase/functions/create-checkout/index.ts`)

- Change `shipping_address_collection.allowed_countries` from `['SE', 'NO', 'DK', 'FI', 'DE', 'NL', 'BE', 'FR', 'AT', 'IT', 'ES']` to `['SE']` only
- Remove Norway shipping logic from `getShippingCents` -- always return 900 (EUR 9)
- Remove Norway-specific `shippingAddressMessage`
- Simplify `getShippingDescription` to Sweden only
- Keep metadata fields (`shipping_country`, `shipping_fee_eur`, etc.)

### 7. Localization Files (`en.json`, `sv.json`, `no.json`)

- Update `save2Pack` to: "Save EUR 9 vs buying 2 singles in one order."
- Update `savingsVsSeparate` to: "Save EUR 18 vs ordering 3 singles separately (3 deliveries)."
- Remove or keep Norway-specific translation keys (they won't be referenced, but harmless to leave)
- Update shipping info strings to remove Norway references

### 8. Shipping Info Card

- Remove the Norway bullet from the shipping info section
- Keep Sweden and EU/Nordic bullets

---

### Technical Notes

- The `useShippingDestination` hook is used in Shop.tsx and Cart.tsx. Simplifying it to always return `'SE'` is the safest approach.
- The `create-checkout` edge function will need redeployment after changes.
- The `ShippingDestination` type change may affect Cart.tsx import -- will update accordingly.
- No database changes needed.
- Existing order/webhook logic is unaffected (orders, stock, email all remain the same).