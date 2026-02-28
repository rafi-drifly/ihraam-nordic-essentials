

## Pricing + Bundle System for PureIhram

### Overview
Replace the current single-quantity selector on the Shop page with three selectable bundle cards (Single, 2-Pack, 3-Pack), add dynamic upsell banners in the Cart page and Cart Drawer, update shipping logic (new Sweden tiered rules), and update the Stripe checkout edge function to match.

### Current State
- **Product price in DB**: 15 EUR (needs updating to 20 EUR)
- **Shipping**: flat 9 EUR per item everywhere
- **Shop page**: quantity picker + "Add to Cart" / "Buy Now" buttons
- **Cart**: line items with subtotal/shipping/total, donation section
- **CartDrawer**: mini cart in a sheet, no upsell banners

---

### Changes

#### 1. Update product price in database
SQL migration to update the product price from 15 to 20 EUR.

#### 2. New shipping logic (`src/lib/shipping.ts`)
Replace the flat per-item rate with the new Sweden tiered rules:
- 1 item: 9 EUR
- 2 items: 9 EUR (flat, not per-item)
- 3+ items: 0 EUR (free)

For non-Sweden, keep "calculated at checkout" messaging. The `calculateShipping` function will accept quantity and return the correct amount.

#### 3. Bundle pricing config (`src/lib/bundles.ts` -- new file)
Define bundle configuration:

```text
BUNDLES = [
  { qty: 1, label: "Single",     unitPrice: 20, totalPrice: 20, shipping: 9,  savings: 0,  badge: null },
  { qty: 2, label: "2-Pack",     unitPrice: 19.5, totalPrice: 39, shipping: 9, savings: 1,  badge: "Best Value" },
  { qty: 3, label: "3-Pack",     unitPrice: 19, totalPrice: 57, shipping: 0, savings: 3,  badge: "Free Delivery" },
]
```

Savings calculated vs buying singles (e.g., 2-Pack saves 2x20 - 39 = 1 EUR product + the shipping difference).

#### 4. Redesign Shop page (`src/pages/Shop.tsx`)
Replace the quantity picker section with three selectable bundle cards:

- Each card is a bordered card, selected state highlighted
- Shows: bundle name, price, shipping note for Sweden, savings vs singles
- "Most popular" badge on 2-Pack
- Trust bullets beneath: "Soft, breathable, suitable for Hajj and Umrah", "Fast shipping within Sweden", "Transparent mission"
- "Add to Cart" button adds the selected bundle quantity
- "Buy Now" sends the bundle directly to Stripe checkout
- Update headline/subtext copy as specified
- Update meta description to reflect new pricing

#### 5. Cart page upsell banners (`src/pages/Cart.tsx`)
Add a dynamic upsell banner above the order summary:
- If 1 item in cart: "Add 1 more to keep shipping at 9 EUR (Best Value 2-Pack)"
- If 2 items: "Add 1 more to unlock FREE delivery (3-Pack)"
- Each banner has a CTA button that adds 1 more item to cart
- Update shipping display to use new tiered logic

#### 6. Cart Drawer upsell (`src/components/shop/CartDrawer.tsx`)
Same upsell banner logic as the cart page, displayed above the totals section. Update shipping calculation to use new logic.

#### 7. Update Stripe checkout edge function (`supabase/functions/create-checkout/index.ts`)
- Apply new shipping rules: qty 1 = 900 cents, qty 2 = 900 cents, qty >= 3 = 0 cents
- Add `bundle_type` to metadata: "single", "2-pack", or "3-pack"
- Use the bundle total price (not unit price x qty) for the product line item to ensure correct pricing for bundles

#### 8. Analytics tracking
Add a simple `trackEvent` utility function. Fire events at key points:
- `view_bundle_option`: when Shop page loads
- `add_to_cart_single` / `add_to_cart_2pack` / `add_to_cart_3pack`: on add to cart
- `cart_upsell_clicked`: when upsell CTA is clicked
- `checkout_started`: when checkout button is clicked

These will log to `console.log` initially (can be wired to GA4/Plausible later).

#### 9. i18n updates (`src/i18n/locales/en.json`)
Add new translation keys for bundle labels, upsell copy, trust bullets, shipping messages. Only update `en.json` (Swedish/Norwegian can be translated later).

---

### Technical Details

**Files created:**
- `src/lib/bundles.ts` -- bundle config and helpers
- `src/lib/analytics.ts` -- lightweight event tracking utility

**Files modified:**
- `src/lib/shipping.ts` -- new tiered Sweden shipping logic
- `src/pages/Shop.tsx` -- bundle cards UI, trust bullets, new copy
- `src/pages/Cart.tsx` -- upsell banner, updated shipping display
- `src/components/shop/CartDrawer.tsx` -- upsell banner, updated shipping
- `supabase/functions/create-checkout/index.ts` -- new shipping + bundle metadata
- `src/i18n/locales/en.json` -- new translation keys
- `src/hooks/useCart.tsx` -- no changes needed (already supports quantity)

**Database migration:**
- Update product price from 15 to 20 EUR

**Edge function redeployment:**
- `create-checkout` will be redeployed automatically

