

## Europe-Wide Shipping with Shipping Adjustment Approval

Expanding PureIhram from Sweden-only to all of Europe, with an admin workflow for requesting extra shipping fees when actual costs exceed the base delivery fee.

---

### Overview

**Current State**: Sweden-only (flat €9 shipping)  
**Target State**: All of Europe, €9 base fee shown, with approval workflow for additional shipping costs

---

### Database Changes

**New tables:**

1. `inventory` — Track stock on hand
   - `product_key` (text, PK) — e.g. "ihram_set"
   - `stock_on_hand` (int)
   - `low_stock_threshold` (int, default 20)
   - `updated_at` (timestamp)

2. `stripe_events` — Idempotency for webhooks
   - `event_id` (text, PK)
   - `created_at` (timestamp)

3. `stock_movements` — Audit log
   - `id` (uuid, PK)
   - `product_key` (text)
   - `delta` (int)
   - `reason` (text) — "order_paid", "manual_adjustment", "refund_restock"
   - `related_order_id` (uuid, nullable)
   - `created_at` (timestamp)

**Modify `orders` table** — Add columns:
- `stripe_session_id` (text)
- `stripe_payment_intent_id` (text)
- `shipping_name` (text)
- `shipping_country` (text)
- `bundle_type` (text)
- `quantity` (int)
- `base_shipping_fee_eur` (numeric, default 9)
- `extra_shipping_fee_eur` (numeric, default 0)
- `extra_shipping_status` (text, default "not_required")
- Update `status` column to support new values

---

### Edge Functions

1. **`create-checkout`** (update)
   - Expand `allowed_countries` to all European countries
   - Include `base_shipping_fee_eur` in metadata
   - Update shipping description text for non-SE countries

2. **`stripe-webhook`** (update)
   - Add idempotency check via `stripe_events` table
   - Extract and store shipping country, bundle_type, quantity, base_shipping_fee
   - Set status to `paid_pending_shipping_review` for non-SE orders
   - Decrement inventory atomically + log stock_movements
   - Send internal alert email to `support@pureihraam.com`
   - Check low stock threshold and send warning email if needed
   - Handle "Additional Shipping" payment completion

3. **`create-extra-shipping-payment`** (new)
   - Create Stripe Payment Link or Checkout Session for extra shipping
   - Store `order_id` in metadata
   - Return payment URL for admin to send to customer

4. **`send-shipping-adjustment-email`** (new)
   - Send email to customer explaining extra shipping cost
   - Include payment link

---

### Frontend Changes

1. **Shop page** — Add country selector (SE vs Rest of Europe)
   - Show disclosure text for non-SE: "If shipping costs more than €9, we'll email you for approval before dispatch"

2. **Cart page** — Pass selected country to checkout
   - Show same disclosure for non-SE destinations

3. **Order Success page** — Update confirmation text for Europe orders

4. **Admin pages** (new, password-protected)
   - `/admin/inventory` — View/edit stock, adjust threshold
   - `/admin/orders` — List orders with status badges, actions:
     - Mark ready to ship
     - Request extra shipping (enter amount, generate link, email customer)

---

### Security

- Admin pages protected by password (simple localStorage check for MVP)
- No public access to admin routes
- Service role key used for database writes in webhooks

---

### Summary of Files

| File | Action |
|------|--------|
| `src/lib/bundles.ts` | Minor update for Europe disclosure |
| `src/lib/shipping.ts` | Add Europe countries list |
| `src/pages/Shop.tsx` | Add country selector + disclosure |
| `src/pages/Cart.tsx` | Pass country, show disclosure |
| `src/pages/OrderSuccess.tsx` | Update messaging |
| `src/pages/admin/Inventory.tsx` | New admin page |
| `src/pages/admin/Orders.tsx` | New admin page |
| `src/pages/admin/AdminLogin.tsx` | Simple password gate |
| `src/App.tsx` | Add admin routes |
| `supabase/functions/create-checkout/index.ts` | Europe countries support |
| `supabase/functions/stripe-webhook/index.ts` | Idempotency, stock, alerts |
| `supabase/functions/create-extra-shipping-payment/index.ts` | New |
| `supabase/functions/send-shipping-adjustment-email/index.ts` | New |
| Database migration | New tables + order columns |

