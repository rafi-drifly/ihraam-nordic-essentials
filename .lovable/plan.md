

## Norway Shipping Adjustment Flow

### Current State
Norway (NO) is already in `EUROPE_COUNTRIES` and the shipping disclosure shows for non-SE countries. The extra shipping payment infrastructure (edge functions, admin UI) already exists. However, two critical gaps prevent the approval flow from working properly:

1. **Order status enum** only has `pending | paid | shipped | delivered | cancelled` — missing `paid_pending_shipping_review`, `awaiting_extra_shipping_payment`, `ready_to_ship`
2. **Webhook** sets ALL orders to `status: 'paid'` regardless of country (should be `paid_pending_shipping_review` for non-SE)
3. **No Norway-specific customs note** about import VAT

### Changes

#### 1. Database Migration
Add new values to the `order_status` enum:
- `paid_pending_shipping_review`
- `awaiting_extra_shipping_payment`
- `ready_to_ship`

#### 2. Stripe Webhook (`supabase/functions/stripe-webhook/index.ts`)
- Set `status = 'paid_pending_shipping_review'` for non-SE orders (including Norway)
- Set `status = 'paid'` for SE orders (no review needed)
- When extra shipping is paid, set `status = 'ready_to_ship'`

#### 3. Admin Orders UI (`src/pages/admin/Orders.tsx`)
- Add new status colors for `paid_pending_shipping_review`, `awaiting_extra_shipping_payment`, `ready_to_ship`
- Update filter logic to show pending-review orders prominently
- Show "Request Extra Shipping" button for `paid_pending_shipping_review` orders
- Show "Mark Ready to Ship" for `paid_pending_shipping_review` (when no extra needed)
- Update `handleMarkReadyToShip` to set `status: 'ready_to_ship'` instead of `'shipped'`

#### 4. Norway Customs Disclosure (`src/lib/bundles.ts`)
Add `CUSTOMS_DISCLOSURE` for Norway:
- en: "Norway is outside the EU. Import VAT/customs fees may apply on delivery."
- sv/no translations

#### 5. Shop + Cart UI
- Show customs note when `shippingCountry === 'NO'` in addition to the existing shipping disclosure
- Update `src/pages/Shop.tsx` and `src/pages/Cart.tsx`

#### 6. Types Update (`src/integrations/supabase/types.ts`)
Will auto-update after migration, but the admin page uses `string` type so no blocking issue.

### Files Modified
| File | Change |
|------|--------|
| DB migration | Add 3 enum values to `order_status` |
| `supabase/functions/stripe-webhook/index.ts` | Country-based status logic |
| `src/pages/admin/Orders.tsx` | New status handling + colors |
| `src/lib/bundles.ts` | Add `CUSTOMS_DISCLOSURE` |
| `src/pages/Shop.tsx` | Show customs note for NO |
| `src/pages/Cart.tsx` | Show customs note for NO |

