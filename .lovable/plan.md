

## Update Stripe Checkout Shipping Notice

### Change

**File**: `supabase/functions/create-checkout/index.ts` (lines 168-172)

Replace the current shipping message logic with a single unified message for all countries:

```ts
const shippingMessage = "We ship to Sweden (3–7 business days). For orders outside Sweden, shipping costs may vary — we'll contact you with the exact delivery fee before dispatching.";
```

This removes the `isSweden` conditional and uses the same message for all customers, which is the requested text. The edge function will need redeployment after the change.

