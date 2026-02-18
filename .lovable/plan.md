

## Fix Missing Footer Translation Keys

The footer component references two translation keys that were never added to the locale files:
- `footer.links.returns` -- used for the "Returns & Exchanges" link
- `footer.returnsBadge` -- used for the trust badge text

### Changes

**`src/i18n/locales/en.json`** -- Add inside `footer.links`:
- `"returns": "Returns & Exchanges"`
- Add `"returnsBadge": "14-day returns · Easy exchanges · Customer pays return shipping (change of mind)"` inside `footer`

**`src/i18n/locales/sv.json`** -- Add:
- `"returns": "Returer & Byten"` inside `footer.links`
- `"returnsBadge": "14 dagars returrätt · Enkla byten · Kunden betalar returfrakten (ångerrätt)"` inside `footer`

**`src/i18n/locales/no.json`** -- Add:
- `"returns": "Retur & Bytte"` inside `footer.links`
- `"returnsBadge": "14 dagers returrett · Enkle bytter · Kunden betaler returfrakten (angrerett)"` inside `footer`

Three small edits, no new files.
