
## Returns & Exchanges Page

### Overview
Create a comprehensive Returns & Exchanges page with all requested sections, a return/exchange request modal, footer updates, full i18n support (English + Swedish), and routing for all locale prefixes.

### New Files

**1. `src/pages/Returns.tsx`**
Full page with these sections:
- **Hero** -- "Returns & Exchanges" title with subtitle
- **Quick Summary Cards** (4 cards with icons) -- 14-day withdrawal, customer pays return shipping, easy exchanges, we cover defective/wrong item shipping
- **How to Return** (4 numbered steps) -- Email us, pack item, ship to address, refund after inspection
- **Exchanges Section** -- Size swaps info, customer pays both shipping legs, "Start an Exchange" CTA button
- **Refunds Section** -- Original payment method, 14-day timeline, standard shipping refunded (not express upgrades)
- **Condition / Hygiene & Fairness** -- Inspect like in-store, value reduction if overused, must be unused/unwashed
- **Wrong Item / Damaged / Defective** -- Photos + order number, we cover return shipping, "Report an Issue" CTA
- **FAQ Accordion** -- 6 questions as specified
- **Contact Box** -- support@pureihraam.com, 24-48 hour response, order number reminder

Uses `useTranslation()` for all text, follows the same layout patterns as `Shipping.tsx` (Card components, icons from lucide-react, consistent spacing).

**2. `src/components/returns/ReturnRequestDialog.tsx`**
A Dialog modal triggered by "Start a Return", "Start an Exchange", or "Report an Issue" buttons. Contains:
- Fields: Full name, Email, Order number, Request type (Return/Exchange/Issue), Reason dropdown (optional), Message textarea
- On submit: shows confirmation message with instructions to email support
- Pre-selects the request type based on which CTA was clicked

### Modified Files

**3. `src/App.tsx`**
- Import `Returns` page
- Add routes: `/returns`, `/sv/returns`, `/no/returns`

**4. `src/components/ui/footer.tsx`**
- Add "Returns & Exchanges" link to quickLinks array
- Add a compact trust snippet in the bottom section: "14-day returns | Easy exchanges | Customer pays return shipping (change of mind)"

**5. `src/i18n/locales/en.json`**
- Add `"returns"` section with all page text (hero, cards, steps, exchanges, refunds, conditions, defective, FAQ Q&As, contact box)
- Add `"footer.links.returns"` and `"footer.returnsBadge"` keys

**6. `src/i18n/locales/sv.json`**
- Add full Swedish translation of the `"returns"` section
- Add `"footer.links.returns"` and `"footer.returnsBadge"` keys in Swedish

**7. `src/i18n/locales/no.json`**
- Add `"footer.links.returns"` key (Norwegian, matching existing pattern)
- Add placeholder `"returns"` section (can mirror English for now)

### SEO
The page will include a `<SEOHead>` or `react-helmet` with:
- Title: "Returns & Exchanges | PureIhram"
- Description: "Read PureIhram's transparent return and exchange policy for Sweden and Nordic countries. 14-day withdrawal, easy size swaps, clear shipping rules."

### Technical Details

| Component | Pattern followed |
|---|---|
| Page layout | Same as `Shipping.tsx` -- max-w-7xl container, Cards, Badges, icons |
| Modal/Dialog | Uses existing `@radix-ui/react-dialog` via `src/components/ui/dialog.tsx` |
| Accordion FAQ | Uses existing `src/components/ui/accordion.tsx` |
| i18n | All strings via `t('returns.xxx')` keys |
| Routing | 3 routes added (en, sv, no) following existing pattern |
| Footer link | Added to `quickLinks` array alongside existing links |
| Return address | "Innovation Stable, 751 83 Uppsala, Sweden" displayed in a styled address block |
