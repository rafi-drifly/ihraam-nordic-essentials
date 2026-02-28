

## Fix Stripe Checkout Descriptions for All Bundles

### Problem
The 3-Pack checkout looks different from Single and 2-Pack because:
1. No shipping line item appears (free delivery)
2. The product name is just "Ihram Set" with quantity 3, which doesn't reflect the bundle

### Solution
Update the `create-checkout` edge function to show bundle-aware product names in Stripe, making all bundles look consistent and clear.

### Changes

**`supabase/functions/create-checkout/index.ts`**

Update the line item creation (lines 92-111) to:
- Include the bundle type in the product name: "Ihram Set" for single, "Ihram Set -- 2-Pack (Best Value)" for 2-pack, "Ihram Set -- 3-Pack (Free Delivery)" for 3-pack
- Use `quantity: 1` with the full bundle price as `unit_amount` instead of splitting per-item -- so the customer sees one clean line like "Ihram Set -- 3-Pack (Free Delivery) ... EUR60.00" rather than "3 x EUR20.00"
- Keep the shipping line item logic the same (appears for 1-2 items, hidden for 3+)

This way all three options show a single, clear product line in Stripe checkout with the bundle name and total price.

### Files Modified
- `supabase/functions/create-checkout/index.ts` -- bundle-aware line item names and single-line pricing
