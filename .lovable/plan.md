

## Update Bundle Pricing and Shipping Incentives

### What Changes

The bundle system already exists. This updates the pricing, savings, default selection, upsell copy, and checkout metadata.

### Changes

#### 1. Update bundle config (`src/lib/bundles.ts`)

| Field | Current | New |
|-------|---------|-----|
| 2-Pack totalPrice | 39 | 38 |
| 2-Pack savings | 10 | 11 |
| 3-Pack totalPrice | 57 | 60 |
| 3-Pack savings | 12 | 27 |

Savings calculation (vs buying singles with shipping):
- 2-Pack: (2x29) - (38+9) = 58 - 47 = **11**
- 3-Pack: (3x29) - (60+0) = 87 - 60 = **27**

Also update `getBundlePrice` to use 60 instead of 57 for qty >= 3.

#### 2. Default bundle selection (`src/pages/Shop.tsx`)

Change `useState<number>(0)` to `useState<number>(1)` so 2-Pack is selected by default.

#### 3. Cart upsell copy (`src/pages/Cart.tsx` and `src/components/shop/CartDrawer.tsx`)

Update upsell banners:
- 1 item: "Add 1 more to keep shipping at EUR9 (Best Value 2-Pack)" with button "Switch to 2-Pack"
- 2 items: "Add 1 more to unlock FREE delivery (3-Pack)" with button "Switch to 3-Pack"

#### 4. Checkout metadata (`supabase/functions/create-checkout/index.ts`)

Add `shipping_country` and `shipping_fee_applied` to the Stripe session metadata. Since shipping address is collected by Stripe (not known at session creation), set `shipping_country: "SE"` (assumed Sweden for now) and `shipping_fee_applied: (shippingCents / 100).toString()`.

#### 5. Update checkout edge function pricing

The checkout currently uses the DB product price (EUR20) x quantity. For bundles (2-pack at EUR38, 3-pack at EUR60), we need to pass the bundle price from the frontend and use it as `unit_amount` in the line item instead of the DB price.

Add a `bundlePrice` field to the checkout request body. The edge function will use `bundlePrice / quantity` as the unit amount when provided, falling back to the DB price otherwise.

### Files Modified

- `src/lib/bundles.ts` -- updated prices and savings
- `src/pages/Shop.tsx` -- default selection to index 1
- `src/pages/Cart.tsx` -- upsell button text
- `src/components/shop/CartDrawer.tsx` -- upsell button text
- `supabase/functions/create-checkout/index.ts` -- bundle pricing + extra metadata fields

### Test Cases

- Sweden + Single: EUR20 + EUR9 = EUR29
- Sweden + 2-Pack: EUR38 + EUR9 = EUR47
- Sweden + 3-Pack: EUR60 + EUR0 = EUR60
- Non-Sweden: shipping not hardcoded (calculated at Stripe checkout)
