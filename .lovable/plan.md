# Add PostHog tracking to lead magnet flow

Two small additions so we can measure lead magnet performance and tie emails to PostHog profiles.

> Note: There is no separate "Dua Pocket Guide" form on the site — the existing lead magnet is the **Hajj Prep Pack** form (`HajjPrepPackForm.tsx`). I'll wire your snippet into that form, since it's the same pattern (email → free guide). If you actually want a second, distinct Dua Guide form, say the word and I'll scaffold one separately.

## A) HajjPrepPackForm — track submissions

File: `src/components/home/HajjPrepPackForm.tsx`

In `handleSubmit`, after email validation passes and before invoking the `send-prep-pack` edge function:

- `posthog.identify(trimmedEmail, { email, lead_magnet: 'hajj_prep_pack', first_seen_at: ISO timestamp })`
- `posthog.capture('hajj_prep_pack_requested', { email, lead_magnet: 'hajj_prep_pack', source: 'homepage', locale })`

In the `catch` block:
- `posthog.capture('hajj_prep_pack_request_failed', { email, error: message })`

(Using `hajj_prep_pack` as the lead-magnet slug to match the actual product. If you'd rather keep your `dua_pocket_guide` naming, I'll use that instead — just tell me.)

## B) Hero CTA — track clicks

File: `src/pages/Home.tsx`

The hero `<a href="#hajj-prep-pack">` ("Get the Free Hajj 2026 Prep Pack") gets an `onClick` that fires:

- `posthog.capture('hajj_prep_pack_cta_clicked', { location: 'hero_banner', destination: '#hajj-prep-pack' })`

## Technical notes

- PostHog is already initialised via `PostHogProvider` in `src/main.tsx`, so `import posthog from 'posthog-js'` works directly in any component — no extra setup.
- Email is lower-cased + trimmed before identify, so the same person across devices/sessions merges into one PostHog profile.
- No changes to the edge function, Supabase, or Klaviyo — purely client-side analytics.
- Lowercasing the email is a small behavioural change for the request payload sent to `send-prep-pack`. If you'd rather keep the original casing for the email send and only lowercase for PostHog, I'll split the two.

## Open question (optional)

Confirm the lead-magnet slug you want stored in PostHog:
1. `hajj_prep_pack` (matches the product name on the site) — recommended
2. `dua_pocket_guide` (matches the snippet you pasted)

Default if you don't reply: option 1.
