## Goal

Use the uploaded `PureIhram_Hajj_Dua_Pocket_Guide.pdf` as the free Hajj guide that gets delivered to:
1. **Anyone who requests it** via the homepage email form (already wired - just needs the real PDF).
2. **Every customer who buys an Ihram** (new - automatically attached to the order confirmation email as a thank-you bonus).

This is the cleanest, lowest-friction approach: one PDF file, two delivery paths, no new infrastructure.

## Why this approach

The site already has the entire free-guide flow built:
- `HajjPrepPackForm` component on the homepage collects emails.
- `send-prep-pack` edge function emails a download link to the PDF at `/hajj-2026-prep-pack.pdf`.
- A subscriber table (`hajj_prep_subscribers`) stores opt-ins.

The only problem: `public/hajj-2026-prep-pack.pdf` is currently a **placeholder PDF** ("Replace this file with the real PDF"). Swapping in your real guide instantly activates the entire existing flow - no code changes needed for path #1.

For path #2 (post-purchase delivery), the cleanest place to add it is the existing `send-order-confirmation` edge function that already runs after every successful Stripe payment. We add a "Free gift" section with a download button to the existing order confirmation email - the customer gets one email instead of two, and it feels like a thoughtful bonus rather than a marketing email.

## Changes

### 1. Replace the placeholder PDF
Copy the uploaded `PureIhram_Hajj_Dua_Pocket_Guide.pdf` to `public/hajj-2026-prep-pack.pdf` (overwriting the placeholder). Keep the same filename so the existing signup flow and email links continue to work without any other changes.

The file will be served at `https://www.pureihram.com/hajj-2026-prep-pack.pdf`.

### 2. Add the guide as a bonus in order confirmation emails
Edit `supabase/functions/send-order-confirmation/index.ts` to add a new section above the shipping info block:

> **Your free gift: Hajj Dua Pocket Guide**
> As our thank-you, here is the Pure Ihram Dua Pocket Guide - duas for every step of Hajj and Umrah, in a printable pocket format.
> [Download the Pocket Guide (PDF)] - styled button linking to the same PDF URL.

Plain-text version updated to match (per Amanah/honesty rules - factual, no marketing fluff).

No new edge function, no attachment handling, no new env vars. The PDF is served as a public static asset and linked in both emails.

### 3. Light copy refresh on the homepage form (optional)
The `HajjPrepPackForm` currently advertises "checklist, duas, timeline" bullets. The real guide is a **dua pocket guide** (55 pages of duas). Update the three bullets in `src/i18n/locales/{en,sv,no}.json` under `home.prepPack.bullets` to accurately describe the actual guide:
- Duas for every stage of Hajj and Umrah
- Printable pocket format
- Free, no spam - one email and you have it

Also update `home.prepPack.title` / `subtitle` from "Hajj 2026 Prep Pack" wording to "Free Hajj Dua Pocket Guide" so the page matches what people actually receive (Amanah rule: no unverified claims).

The email subject and body in `send-prep-pack/index.ts` get the same accuracy fix ("Your free Pure Ihram Dua Pocket Guide").

### Files touched
- `public/hajj-2026-prep-pack.pdf` - replaced with the real guide
- `supabase/functions/send-order-confirmation/index.ts` - add free-gift section
- `supabase/functions/send-prep-pack/index.ts` - update subject/body copy to match the actual guide
- `src/i18n/locales/en.json`, `sv.json`, `no.json` - update prep-pack bullets/title/subtitle

## Why not email attachments?

Two reasons we link to the PDF rather than attach it:
1. The current Resend setup doesn't attach files, and a 55-page PDF would push some emails close to inbox size limits and hurt deliverability.
2. A hosted link lets you update the guide later (fix a typo, add content) without re-emailing anyone.

## Out of scope (for now)
- No automated drip sequence ("Day 5 before Hajj…") - that's marketing, not transactional, and would need separate infrastructure.
- No gated download page or login - the link is open, matching how the free signup already works.
- No tracking of who downloaded vs. who didn't - can be added later if you want it.
