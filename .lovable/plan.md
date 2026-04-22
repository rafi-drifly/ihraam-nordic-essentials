

## Pure Ihram Brand Manual (PDF)

Generate a polished multi-page PDF brand manual at `/mnt/documents/PureIhram-Brand-Manual.pdf` covering the wordmark logo, favicon system, colors, typography, and voice — so marketing materials stay consistent.

### Contents

1. **Cover** - "Pure Ihram Brand Manual", version, date, wordmark.
2. **Brand essence** - Positioning, voice principles (sincere, calm, transparent — no hype, no fake urgency, no unverified claims).
3. **Logo (wordmark)** - Inter Bold "Pure Ihram", clear-space rule (height of "P"), minimum sizes (20mm print / 120px digital), approved variants (teal / white / black), misuse examples.
4. **Favicon & icon system** - The green "I" mark, full icon suite from `/public/` (favicon.ico, favicon-16/32/192, apple-touch-icon, android-chrome 192/512), when to use the mark vs wordmark, cache-busting `?v=N` convention.
5. **Color palette** - HEX, RGB, HSL + usage ratios:
   - Sacred Teal `#287777` (primary)
   - Deep Teal `#305050` (headers)
   - Warm Gold `#EEBD2B` (price/key callouts only)
   - Mist `#F0F5F5` (background)
   - Frost `#D4E4E4` (borders)
   - Stone `#6A7C7C` (body)
   - Pure White `#FFFFFF`
6. **Typography** - Inter family (300-700), type scale, pairing rules.
7. **Voice & tone** - Approved patterns ("unstitched cloth", "white pieces", "microfiber"), forbidden patterns (star ratings, "trusted by", fake urgency, "cheap", unverified dimensions), standardized facts (support@pureihraam.com, www.pureihram.com, 2026 copyright).
8. **Application examples** - Web header lockup, social avatar, email signature, OG share card.
9. **File index** - Every brand asset in `/public/` with filename, dimensions, intended use.

### Technical approach

- Python + `reportlab`, embedding actual favicon PNGs from `/public/`
- Render wordmark typographically in Inter Bold (no separate SVG exists in repo)
- Use real brand HEX values throughout
- QA: convert each PDF page to JPEG at 150dpi and visually inspect every page for overflow, contrast, and alignment; iterate until clean
- Deliver via `<lov-artifact>` for download

No website code changes — standalone reference document only.

