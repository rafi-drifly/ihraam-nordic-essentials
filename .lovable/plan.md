

## Validate FREEDELIVERY-UPPSALA Promo Code (Pre-Checkout)

### Problem
With `allow_promotion_codes: true`, Stripe handles promo codes on its own checkout page. The edge function never sees the code or the customer's city, so server-side validation there is impossible.

### Chosen Approach: Frontend Promo Code Input + Edge Function Validation

Move promo code handling from Stripe's UI to your own Cart page so the edge function can validate city + code before creating the session.

### Changes

#### 1. Cart Page (`src/pages/Cart.tsx`) -- Add promo code input
- Add a text input + "Apply" button for promo codes
- Store applied promo code in state
- Pass `promoCode` to the checkout function call
- Show success/error feedback when applying

#### 2. Cart Drawer (`src/components/shop/CartDrawer.tsx`) -- Same promo input
- Add condensed promo code input in the drawer
- Pass `promoCode` to checkout

#### 3. Edge Function (`supabase/functions/create-checkout/index.ts`)
- Add `promoCode` and `shippingCity` to `CheckoutRequest` interface
- Remove `allow_promotion_codes: true`
- Before session creation, validate:
  - If `promoCode === "FREEDELIVERY-UPPSALA"` (case-insensitive) and `shippingCountry !== 'SE'` or city doesn't match "Uppsala" (case-insensitive), return error: `"This promo code is only valid for Uppsala deliveries."`
  - If valid, set shipping to EUR0 and use Stripe `discounts` param with a coupon, or simply remove the shipping line item
- Since city isn't known pre-checkout (Stripe collects it), we need to either:
  - **Option A**: Ask for city on the Cart page (add a city input when promo is applied)
  - **Option B**: Trust `shippingCountry: 'SE'` as sufficient and skip city validation (simpler but less strict)

**Recommended**: Option A -- when user enters "FREEDELIVERY-UPPSALA", show a city confirmation input. Frontend sends `shippingCity: "Uppsala"` to edge function. Edge function validates match.

#### 4. Validation Logic in Edge Function
```text
if promoCode matches "FREEDELIVERY-UPPSALA" (case-insensitive):
  if shippingCity (lowercased) !== "uppsala":
    return 400 { error: "This promo code is only valid for Uppsala deliveries." }
  else:
    set shippingCents = 0
    (optionally apply a Stripe coupon via discounts param)
```

#### 5. Translations (`en.json`, `sv.json`, `no.json`)
- `cart.promo.placeholder`: "Enter promo code"
- `cart.promo.apply`: "Apply"
- `cart.promo.applied`: "Promo code applied!"
- `cart.promo.invalidCity`: "This promo code is only valid for Uppsala deliveries."
- `cart.promo.cityLabel`: "Confirm your city"

### Files Modified (5 files)
1. `src/pages/Cart.tsx` -- promo code input + city confirmation
2. `src/components/shop/CartDrawer.tsx` -- promo code input
3. `supabase/functions/create-checkout/index.ts` -- validation + remove `allow_promotion_codes`
4. `src/i18n/locales/en.json` -- new promo keys
5. `src/i18n/locales/sv.json` -- Swedish translations
6. `src/i18n/locales/no.json` -- Norwegian translations

### Important Note
This removes `allow_promotion_codes: true` from Stripe Checkout, meaning ALL promo codes must now be handled through your own Cart UI and edge function. Any future promo codes will also need validation logic in the edge function.
