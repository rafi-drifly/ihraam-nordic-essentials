

## Fix Shipping References Across the Site

The site has incorrect hardcoded shipping claims ("€9 for 1-2 sets / Free for 3+ sets") that don't match the actual checkout logic (€9 flat base fee for all orders). Here's every change needed.

---

### 1. Locale Files — Remove False Claims

**`src/i18n/locales/en.json`** — Update these keys:

| Key | Current (wrong) | New (safe) |
|-----|-----------------|------------|
| `shipping.zones.sweden.cost` | `"€9 (1–2 sets) / Free (3+ sets)"` | `"Shown at checkout"` |
| `shipping.zones.sweden.description` | `"€9 flat delivery for 1–2 Ihram sets. Buy 3 or more and get free delivery in Sweden."` | `"Reliable delivery across Sweden with tracking included."` |
| `shipping.zones.nordic.description` | mentions "full tracking support" | `"Delivery to Norway, Denmark, and Finland. Shipping cost shown at checkout."` |
| `shipping.zones.eu.description` | mentions "customs pre-clearance" | `"Delivery across EU countries. Shipping cost shown at checkout."` |
| `shipping.zones.nordic.cost` | `"Calculated at checkout"` | `"Shown at checkout"` (consistent wording) |
| `shipping.zones.eu.cost` | `"Calculated at checkout"` | `"Shown at checkout"` |
| `shipping.freeShipping` | `"Buy 3+ Ihram sets and get free delivery in Sweden"` | Remove or change to `"Shipping cost is always shown clearly at checkout"` |
| `shipping.features.free.title` | `"Free Shipping"` | `"Clear Pricing"` |
| `shipping.features.free.description` | `"Buy 3+ sets and get free delivery in Sweden"` | `"Shipping cost is shown clearly before you pay"` |
| `contact.faq.shipping.answer` | `"...Free shipping on orders over 50€."` | `"Sweden: 3-7 business days, Nordic countries: 7-14 business days, EU: 7-14 business days. Shipping cost is shown at checkout."` |
| `shop.bundleSubtitle` | `"Save more when you buy 2 or 3. Sweden: €9 delivery per order."` | `"Save more when you buy 2 or 3. Shipping shown at checkout."` |
| `shop.bundle.shippingNote` | `"Sweden delivery: €9 per order (no extra fee for 2 or 3 sets)."` | `"Shipping is calculated based on your destination. Shown clearly at checkout."` |
| `shop.bundle.shippingBullet` | `"Sweden: €9 delivery per order"` | `"Shipping shown at checkout"` |
| `shop.bundle.trustShipping` | `"Fast shipping within Sweden"` | `"Ships from Sweden"` |

**`src/i18n/locales/sv.json`** and **`src/i18n/locales/no.json`** — Mirror the same changes in Swedish and Norwegian.

---

### 2. Shipping Page Rebuild (`src/pages/Shipping.tsx`)

Replace the current page with a cleaner structure:

1. **Header** — "Shipping & Delivery" + calm subtitle
2. **Shipped from Sweden** — Brief note that all orders ship from Sweden
3. **Where We Deliver** — 3 cards (Sweden, Nordics, EU) with timeframes only, no prices — cost line says "Shown at checkout"
4. **How Shipping Works** — Simple 4-step: Order → Processing (1-2 days) → Shipped with tracking → Delivered
5. **Planning Tip** — Keep the pilgrimage planning tip
6. **Questions?** — Contact CTA with email + WhatsApp

Remove: "Free Shipping" feature card, the overly detailed "Special Circumstances" section (Ramadan/holidays — keep a simple note instead), the verbose delivery methods section.

Replace the Euro icon feature with a "Clear Pricing" card.

---

### 3. Shop Page — Bundle Shipping Display (`src/pages/Shop.tsx`)

- Lines 314-316: The bundle cards show `+ €9 delivery 🇸🇪`. Change to show `+ shipping` without a hardcoded amount
- Lines 317-318: The "Total: €X" line — show only the product total, note shipping added at checkout
- Lines 338-344: Update shipping note text (driven by locale keys above)

---

### 4. `src/lib/shipping.ts` — Update Display Functions

- `getShippingLabel()`: Return `"Shipping shown at checkout"` instead of `"€9 delivery in Sweden"` / `"€9 base delivery fee"`
- Keep `calculateShipping()` and `SHIPPING_RATES` as-is (used by cart/checkout logic internally)

---

### 5. `src/lib/bundles.ts` — Bundle Card Shipping Display

- Remove `shipping: 9` from each bundle entry (or keep for internal calc but stop showing it in UI)
- Actually: keep the `shipping` field for checkout math, but the UI changes in Shop.tsx will stop displaying it as a fixed amount

---

### 6. Cart & CartDrawer

- `src/pages/Cart.tsx` and `src/components/shop/CartDrawer.tsx` already use `calculateShipping()` which returns 9. These are internal cart views before Stripe — keep as-is since the actual checkout handles the real amount. But update the display label via `getShippingLabel()`.

---

### Files Modified

| File | Changes |
|------|---------|
| `src/i18n/locales/en.json` | ~14 key updates removing false shipping claims |
| `src/i18n/locales/sv.json` | Mirror en.json shipping changes |
| `src/i18n/locales/no.json` | Mirror en.json shipping changes |
| `src/pages/Shipping.tsx` | Simplified, accurate structure |
| `src/pages/Shop.tsx` | Bundle cards show "+ shipping" not "+ €9" |
| `src/lib/shipping.ts` | Update `getShippingLabel()` |

No backend or checkout logic changes needed.

