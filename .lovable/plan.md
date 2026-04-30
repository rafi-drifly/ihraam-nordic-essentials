## Goal

Replace the current Hajj Dua Pocket Guide PDF at `public/hajj-2026-prep-pack.pdf` with the newly uploaded v2 version, keeping the same filename so all existing delivery flows continue to work without any other changes.

## Why this is a one-step job

Both delivery paths (homepage email signup and post-purchase order confirmation) link to the same fixed URL:

```
https://www.pureihram.com/hajj-2026-prep-pack.pdf
```

By overwriting the file in place and keeping the filename identical, every link already sent and every link sent in the future automatically serves the new version. No edge function redeploys, no database changes, no env var updates.

## Changes

1. Copy the uploaded v2 PDF over `public/hajj-2026-prep-pack.pdf` (overwrite).
2. Verify the file is in place (size, page count) so we know the swap succeeded.

## Out of scope

- No copy changes - the existing wording ("Hajj & Umrah Dua Pocket Guide") still accurately describes the v2 file.
- No edge function changes - they already point at the right URL.
- No version suffix in the filename - keeping `hajj-2026-prep-pack.pdf` preserves all previously sent download links.

## After this

You're done with the guide work and clear to move on to paid marketing.
