## Diagnosis

The Stripe edge function itself is **healthy** - server logs show successful `cs_live_...` sessions being created within seconds of the user's failed click. The failure is purely client-side:

```
FunctionsFetchError: Failed to send a request to the Edge Function
TypeError: Failed to fetch
```

This `TypeError: Failed to fetch` means the browser **blocked the request before it left the device** - almost always a CORS preflight rejection.

### Root cause

`@supabase/supabase-js` now sends extra request headers on every Edge Function call:
- `x-supabase-client-platform`
- `x-supabase-client-platform-version`
- `x-supabase-client-runtime`
- `x-supabase-client-runtime-version`

But every edge function in this project still declares the old, narrow allow-list:
```ts
"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
```

When the browser's CORS preflight sees a request header that isn't in the server's `Access-Control-Allow-Headers` response, it cancels the actual fetch -> `TypeError: Failed to fetch` on the client, while the server never logs anything (which matches what we see: the user's failed click has **no corresponding entry** in the create-checkout logs).

The successful sessions in the logs (qty 3, qty 5) are likely from a different client/SDK version (e.g. an admin/server context) - the public website's bundled SDK is now newer and trips the preflight.

### The fix

Widen `Access-Control-Allow-Headers` on every edge function to match the current Supabase guidance:

```
authorization, x-client-info, apikey, content-type,
x-supabase-client-platform, x-supabase-client-platform-version,
x-supabase-client-runtime, x-supabase-client-runtime-version
```

### Files to update

All edge functions share the same outdated CORS block - update each one:

1. `supabase/functions/create-checkout/index.ts` (the one breaking checkout)
2. `supabase/functions/create-donation-checkout/index.ts`
3. `supabase/functions/create-extra-shipping-payment/index.ts`
4. `supabase/functions/contact-form/index.ts`
5. `supabase/functions/guest-order-lookup/index.ts`
6. `supabase/functions/product-images/index.ts`
7. `supabase/functions/send-order-confirmation/index.ts`
8. `supabase/functions/send-prep-pack/index.ts`
9. `supabase/functions/send-shipping-adjustment-email/index.ts`
10. `supabase/functions/stripe-webhook/index.ts` (Stripe -> server, no browser CORS issue, but harmless to align)

For each, change the `corsHeaders` constant only - no logic changes.

### Verification

After deploy:
1. Trigger "Buy Now with Stripe" on `/shop` from the preview
2. Confirm the network tab shows a successful POST to `/functions/v1/create-checkout` (no `(failed) net::ERR_FAILED`)
3. Confirm a new `Checkout request:` line appears in the create-checkout logs matching the click timestamp
4. Confirm the browser is redirected to `https://checkout.stripe.com/...`

### What this is NOT

- Not a Stripe key issue: live sessions are being created successfully server-side using the existing `STRIPE_SECRET_KEY`.
- Not a payment-mode mismatch: `cs_live_` prefix confirms live key is correctly loaded.
- Not a price/SKU bug: the request body shape is correct in the logs.
- No frontend code change required - `Shop.tsx` and `ProductOffersBlock.tsx` are calling `supabase.functions.invoke('create-checkout')` correctly.

No database changes, no new secrets, no UI changes.