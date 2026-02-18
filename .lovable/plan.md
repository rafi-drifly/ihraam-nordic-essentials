

## Add New Google Analytics Tag

### What's Changing

Add your new Google Analytics tag (`G-8EFBK4ECRN`) to `index.html` alongside the existing tag (`G-WD5SLJDED8`).

Since both tags share the same `gtag()` function and `dataLayer`, the cleanest approach is to add a second `gtag('config', ...)` line rather than duplicating the entire script block.

### File: `index.html`

- Add `gtag('config', 'G-8EFBK4ECRN');` on line 33, right after the existing `gtag('config', 'G-WD5SLJDED8');`
- This sends page view data to both GA4 properties simultaneously

### Additional Cleanup (while we're in this file)

- **Line 14**: Fix the canonical URL from `https://pureihram.com/` to `https://www.pureihram.com/` -- this was missed in the earlier SEO fix (the `SEOHead` React component overrides it dynamically, but the static HTML fallback should also be correct)

No new files or dependencies needed. Single file change.

