## Goal

Wire up Klaviyo so the "Hajj 2026 Prep Pack" form actually delivers the guide email, fix the current "could not send the document" failure, and load Klaviyo's onsite tracking on every page so we can build flows/segments later.

## What's broken right now

The `send-prep-pack` edge function calls Resend, but the `RESEND_API_KEY` is invalid (401 in logs). That's why every submission errors. We're going to retire Resend for this flow and let **Klaviyo** handle the email send via a Flow triggered by an event we push from the edge function.

## Changes

### 1. Add Klaviyo onsite script to the site

File: `index.html`

Add the two `<script>` tags you provided into `<head>`. This loads the Klaviyo onsite SDK (`window.klaviyo`) on every page, enabling future popups, embedded forms, and identify calls.

### 2. Identify the subscriber to Klaviyo from the browser

File: `src/components/home/HajjPrepPackForm.tsx`

After PostHog identify (already there), also call:

```ts
window.klaviyo?.push(['identify', { email: trimmedLower }]);
window.klaviyo?.push(['track', 'Requested Hajj Prep Pack', {
  lead_magnet: 'hajj_prep_pack',
  source: 'homepage',
  locale,
}]);
```

This:
- Creates/updates the profile in Klaviyo with their email
- Fires a client-side event you can use as a Flow trigger or segment source

### 3. Replace Resend with Klaviyo on the server (the actual email send)

File: `supabase/functions/send-prep-pack/index.ts`

Rewrite the send path to use Klaviyo's server-side Events API instead of Resend:

- Remove the Resend `fetch` call and the inline HTML/text email entirely.
- Keep the Supabase `hajj_prep_subscribers` insert (idempotent).
- POST to `https://a.klaviyo.com/api/events/` with:
  - Header `Authorization: Klaviyo-API-Key ${KLAVIYO_PRIVATE_API_KEY}`
  - Header `revision: 2024-10-15`
  - Body: a JSON:API event payload with `metric.name = "Requested Hajj Prep Pack"`, `profile.email = email`, and `properties = { lead_magnet, source, locale, pdf_url }`.
- Optionally also subscribe them to a list via `POST /api/profile-subscription-bulk-create-jobs/` using `KLAVIYO_LIST_ID` so they enter the right audience.

The PDF link, subject line, copy, branding, and translations all move into a **Klaviyo Flow** triggered by the `Requested Hajj Prep Pack` metric. You (the user) build that flow once in the Klaviyo UI - no code redeploy needed to tweak email content after that.

### 4. Config

- `supabase/config.toml`: no change (function already has `verify_jwt = false`).
- Remove the `RESEND_API_KEY` dependency from this function. (The secret can stay for other functions like order confirmation if those still use Resend.)

## Secrets needed (you'll add these)

Before I can ship this, you need to add two Supabase Edge Function secrets:

1. **`KLAVIYO_PRIVATE_API_KEY`** - from Klaviyo: Account → Settings → API Keys → Create Private API Key. Needs scopes: `Events: Full`, `Profiles: Full`, and `Lists: Full` (only if using list subscription). Starts with `pk_`.
2. **`KLAVIYO_LIST_ID`** *(optional)* - from Klaviyo: Lists & Segments → your list → Settings → List ID (6-char code). Skip this if you only want to use the event-based Flow trigger and don't need them on a static list.

I'll prompt for these via `add_secret` when you approve the plan. Don't paste them in chat.

## What you need to do in Klaviyo after deploy

1. Public site key `TGazgN` is already in the script tag - good.
2. Create a Flow:
   - Trigger: Metric → `Requested Hajj Prep Pack`
   - Action: Send Email with the PDF link (`https://www.pureihram.com/hajj-2026-prep-pack.pdf`) and your branding/copy.
   - Set delay to "Immediately" so it behaves like the current transactional send.
3. (Optional) Build a segment from this metric for retargeting.

## Out of scope / not changing

- PostHog tracking - keeps working as-is.
- Order confirmation emails, contact form, shipping emails - still on Resend, untouched. (If you want those moved to Klaviyo too, that's a separate task.)
- No DB schema changes. `hajj_prep_subscribers` table stays as the source-of-truth backup.

## Risk notes

- If Klaviyo's API call fails, the function will return 502 and the user sees the same error UI. We'll log the Klaviyo response body for debugging.
- Klaviyo deliverability depends on you having a verified sending domain in Klaviyo. If you haven't set up `pureihram.com` (or a subdomain) for sending in Klaviyo yet, emails will go from a default Klaviyo address until you do.
