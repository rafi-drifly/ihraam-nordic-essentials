

## Update Sweden (SE) Pricing, Bundles, and Messaging

### Overview
Update the Sweden bundle pricing, shipping rules, savings messaging, badge labels, upsell banners, and checkout logic to match the new pricing structure. Norway pricing remains unchanged.

---

### 1. Update `src/lib/bundles.ts` -- New SE bundle prices and badges

Current SE bundles:
- Single: €20, shipping €9, savings €0, no badge
- 2-Pack: €40, shipping €9, savings €9, badge "Best Value"
- 3-Pack: €60, shipping €0, savings €27, badge "Free Delivery"

New SE bundles:
- Single: €20, shipping €9, savings €0, no badge
- 2-Pack: €38, shipping €9, savings €2, badge "Best Value"
- 3-Pack: €60, shipping €9, savings €18 (vs 3 separate orders), badge "Most Popular"

Update `BUNDLES` array accordingly. The `getBundlePrice` function also needs updating to return €38 for qty 2.

### 2. Update `src/lib/shipping.ts` -- Flat €9 for all SE quantities

Change the Sweden shipping rule: remove the "free for 3+" logic. All SE orders pay €9 flat regardless of quantity.

```
// Before: if (safeQuantity >= 3) return 0;
// After:  return 9; (always for SE)
```

Also update `getShippingLabel` to remove the "Free delivery" case for Sweden.

### 3. Update `supabase/functions/create-checkout/index.ts` -- Match new shipping logic

Update `getShippingCents` so SE always returns 900 (€9) regardless of quantity. Update bundle price handling so qty 2 uses €38.

### 4. Update Shop page bundle cards (`src/pages/Shop.tsx`)

- Default selected bundle index: change from `1` (2-Pack) to `2` (3-Pack, "Most Popular")
- Update the badge logic: 3-Pack should show "Most Popular" (new translation key) instead of "Free Delivery"
- Add a shipping info line below bundle cards: "Sweden delivery: €9 per order (no extra fee for 2 or 3 sets)."
- Add a "Why bundles?" note: "Bundles help you pay delivery only once."
- For 3-Pack savings, show the breakdown: "3 separate single orders: €29 x 3 = €87. 3-Pack delivered: €69."
- For 2-Pack savings: "Save €2 vs buying 2 singles in one order"

### 5. Update Cart upsell banners (`src/pages/Cart.tsx` and `src/components/shop/CartDrawer.tsx`)

New SE upsell messages:
- qty=1: "Add 1 more -- still only €9 delivery (2-Pack Best Value)" with "Switch to 2-Pack" button
- qty=2: "Add 1 more -- still only €9 delivery (3-Pack Most Popular)" with "Switch to 3-Pack" button

### 6. Update translation files (`en.json`, `sv.json`, `no.json`)

New/updated keys:
- `shop.bundle.mostPopular`: "Most Popular" / "Mest Populär" / "Mest Populaer"
- `shop.bundle.youSave`: Update to generic "Save €{{amount}}" (used for 2-Pack)
- `shop.bundle.savingsVsSeparate`: "Save €{{amount}} vs ordering {{qty}} singles separately ({{qty}} deliveries)."
- `shop.bundle.savingsBreakdown`: "{{qty}} separate single orders: €{{singleDelivered}} x {{qty}} = €{{separateTotal}}. {{bundleLabel}} delivered: €{{bundleDelivered}}."
- `shop.bundle.shippingNote`: "Sweden delivery: €9 per order (no extra fee for 2 or 3 sets)."
- `shop.bundle.whyBundles`: "Bundles help you pay delivery only once."
- `cart.upsell.seQty1`: "Add 1 more -- still only €9 delivery (2-Pack Best Value)"
- `cart.upsell.seQty2`: "Add 1 more -- still only €9 delivery (3-Pack Most Popular)"

### 7. Files modified (summary)

| File | Change |
|------|--------|
| `src/lib/bundles.ts` | Update BUNDLES array (2-Pack price €38, 3-Pack shipping €9, new badges/savings) |
| `src/lib/shipping.ts` | SE always returns €9 (remove free-for-3+ logic) |
| `supabase/functions/create-checkout/index.ts` | SE shipping always 900 cents; handle €38 for 2-pack |
| `src/pages/Shop.tsx` | Default to 3-Pack, new badge logic, shipping note, why-bundles note, savings breakdown |
| `src/pages/Cart.tsx` | Updated upsell banner text for SE |
| `src/components/shop/CartDrawer.tsx` | Updated upsell banner text for SE |
| `src/i18n/locales/en.json` | New translation keys |
| `src/i18n/locales/sv.json` | New translation keys (Swedish) |
| `src/i18n/locales/no.json` | New translation keys (Norwegian) |

### Test cases after implementation
- SE Single: €20 + €9 = €29
- SE 2-Pack: €38 + €9 = €47
- SE 3-Pack: €60 + €9 = €69
- Norway pricing unchanged (€39/€49 shipping tiers)
- Promo code FREEDELIVERY-UPPSALA still zeroes shipping only

