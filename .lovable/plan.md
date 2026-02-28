
## Add Promotion Code Support to Stripe Checkout

### Change
Add `allow_promotion_codes: true` to the `stripe.checkout.sessions.create()` call in `supabase/functions/create-checkout/index.ts`.

### File: `supabase/functions/create-checkout/index.ts`
At line 168 (after `currency: "eur",`), insert:
```
allow_promotion_codes: true,
```

This enables the promo code input field in Stripe Checkout so customers can enter codes like `FREEDELIVERY-UPPSALA`.

No other logic changes needed. The edge function will be redeployed after the edit.

### Important
Promotion codes must be created in the Stripe Dashboard under **Products > Coupons > Promotion Codes** for customers to use them.
