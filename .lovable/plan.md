## Problem

The "Get the free Hajj 2026 Prep Pack" form fails because the `send-prep-pack` edge function still uses Resend, and the Resend key returns `401 invalid`. You've now added the Klaviyo secrets, so we can cut over to Klaviyo as planned.

Detected secrets:
- `KLAVIYO_PRIVATE_API_KEY` ✓
- `KLAVIYO_Hajj_Guide_Subscribers` ✓ (will be read as the list ID)

## Changes

### 1. `supabase/functions/send-prep-pack/index.ts` - replace Resend with Klaviyo
- Keep the idempotent insert into `hajj_prep_subscribers`.
- Drop the Resend HTML/text email send.
- POST to `https://a.klaviyo.com/api/events/` with `metric.name = "Requested Hajj Prep Pack"`, `profile.email = email`, and properties `{ lead_magnet, source, locale, pdf_url }`. Headers: `Authorization: Klaviyo-API-Key <KLAVIYO_PRIVATE_API_KEY>`, `revision: 2024-10-15`, `Content-Type: application/json`.
- Subscribe the email to the list using `KLAVIYO_Hajj_Guide_Subscribers` via `POST /api/profile-subscription-bulk-create-jobs/` (consented, marketing channel = email).
- Log Klaviyo response bodies on failure; return 502 with a clean message so the toast remains accurate. Insert still succeeds even if Klaviyo fails (so we don't lose the lead).

### 2. `index.html` - load Klaviyo onsite SDK
Add the two Klaviyo onsite `<script>` tags (public site key `TGazgN`) into `<head>` so `window.klaviyo` is available across the site for future flows/popups.

### 3. `src/components/home/HajjPrepPackForm.tsx` - identify + track client-side
After the existing PostHog calls, also push:
```ts
window.klaviyo?.push(['identify', { email: trimmedLower }]);
window.klaviyo?.push(['track', 'Requested Hajj Prep Pack', {
  lead_magnet: 'hajj_prep_pack', source: 'homepage', locale,
}]);
```
Add a minimal `window.klaviyo` type declaration.

## What you do in Klaviyo (one-time)
1. Create a Flow triggered by metric **"Requested Hajj Prep Pack"** (or by "Added to List" on your list) that sends the Dua Pocket Guide email with the link `https://www.pureihram.com/hajj-2026-prep-pack.pdf`. Set delay to "Immediately".
2. Verify your sending domain in Klaviyo so emails come from `pureihram.com`.

## Out of scope
- Order confirmation, contact form, shipping emails (still on Resend - untouched).
- No DB schema changes.

## Risk
- If your Klaviyo Flow isn't published yet, the user gets the success toast but no email arrives. We'll still capture them in the DB and in Klaviyo as a profile, so no leads lost.
