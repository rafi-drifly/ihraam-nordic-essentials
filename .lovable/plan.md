

## Install Google Tag Manager (GTM-PJJH38CH)

### File: `index.html`

Two additions:

1. **In `<head>` (as high as possible, before existing gtag scripts):** Insert the GTM head snippet right after the opening `<head>` and `<meta charset>` tag (around line 4).

2. **Right after `<body>` tag:** Insert the GTM noscript fallback immediately after `<body>` (around line 35).

### Notes
- The existing Google Analytics gtag scripts (G-WD5SLJDED8 and G-8EFBK4ECRN) will remain -- they work independently of GTM.
- Since this is a single-page app, all routes automatically get GTM since there's only one `index.html`.
- No other files need changes.

