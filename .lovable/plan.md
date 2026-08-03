## Goal
Replace the public support address `support@pureihraam.com` with `pureihraam@gmail.com` everywhere it is shown to customers.

## Files to update (all occurrences of the old address)
- Pages: `src/pages/Contact.tsx` (contact card + mailto + 3 meta descriptions), `src/pages/Shipping.tsx`, `src/pages/Returns.tsx`, `src/pages/Partners.tsx`
- Components: `src/components/ui/footer.tsx`, `src/components/donation/GovernanceSection.tsx`, `src/components/donation/DonationFAQ.tsx`
- Locales: `src/i18n/locales/en.json`, `sv.json`, `no.json` (4 keys each: contact error body, returns process description, returns photos, returns dialog success message)
- Content: `src/content/blog/blog-data.json` + `buy-ihram-in-europe.{en,sv,no}.html` - here the sentence also says "note the double 'a' in support", which no longer applies, so that parenthetical gets removed
- Prerender meta: `scripts/prerender.mjs` (contact description, 3 languages)
- Edge functions (reply-to / order alerts / email footers): `supabase/functions/stripe-webhook/index.ts` (`ORDER_ALERT_EMAIL`), `supabase/functions/send-order-confirmation/index.ts` (bcc + footer link), `supabase/functions/send-shipping-adjustment-email/index.ts` (footer link)

## Left unchanged
The transactional *sender* addresses (`noreply@pureihram.com`) stay as they are - Resend can only send from a verified domain, so a Gmail address cannot be used as the "from". Only the address customers are told to write to changes.

## Technical notes
- Straight string replacement; no logic or layout changes.
- After the edits, run a repo-wide search to confirm zero remaining `support@pureihraam.com` hits, plus a typecheck.
