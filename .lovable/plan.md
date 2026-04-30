## Goal

Add Klarna as a checkout payment option alongside card on the Stripe-hosted checkout, so customers can choose Klarna (Pay Later / instalments) at the payment step.

## Change

One edit in `supabase/functions/create-checkout/index.ts` - add an explicit `payment_method_types` array to the Stripe Checkout Session call:

```ts
payment_method_types: ['card', 'klarna'],
```

Inserted right after the existing `currency: "eur"` line in the `stripe.checkout.sessions.create({...})` call.

## Why this is the only change needed

- Klarna is natively supported by Stripe Checkout - no new SDK, no new edge function, no UI work.
- The existing webhook (`stripe-webhook`) already creates orders on `checkout.session.completed` regardless of payment method, so Klarna orders flow through the same fulfilment path as card orders.
- Order confirmation email, inventory deduction, shipping review - all unchanged.
- You receive funds upfront from Stripe/Klarna; Klarna handles the customer's instalment plan and credit risk.

## One-time setup on your side (outside the code)

Before Klarna shows up in **live** mode, activate it in your Stripe dashboard:

1. Open https://dashboard.stripe.com/settings/payment_methods
2. Find Klarna, click **Turn on**, answer the brief business questions
3. Save

In **test mode** Klarna appears immediately with no activation needed - useful for verifying the flow right after deploy.

## Out of scope

- Multi-currency Klarna (native SEK/NOK Klarna for Nordic shoppers) - your checkout is EUR-only, so all customers see the EUR Klarna flow. Switching to local-currency Klarna would be a separate, larger change.
- No UI badge or "Pay with Klarna" marketing on the cart page yet - we can add that as a follow-up once you confirm Klarna is approved in your dashboard, to stay within the Amanah no-unverified-claims rule.

## Files touched

- `supabase/functions/create-checkout/index.ts` - one line added
