
## Fix: Remove Duplicate Footer Keys in Translation Files

### Problem
All three locale files (`en.json`, `sv.json`, `no.json`) have a **duplicate `footer` key** at the end of the file. In JSON, when a key appears twice, the second one overwrites the first. The duplicate only contains `links.returns` and `returnsBadge`, so it replaces the full footer object (with description, quickLinks, serviceAreas, copyright, quote, etc.), breaking the entire footer.

### Fix

**`src/i18n/locales/en.json`** (lines 987-993)
Remove the trailing duplicate block:
```json
  "footer": {
    "links": {
      "returns": "Returns & Exchanges"
    },
    "returnsBadge": "14-day returns • Easy exchanges • Customer pays return shipping (change of mind)"
  }
```
The `returns` key and `returnsBadge` already exist in the original `footer` object at lines 28-39.

**`src/i18n/locales/sv.json`** (lines 987-993)
Remove the same trailing duplicate block (Swedish version). Already present at lines 28-39.

**`src/i18n/locales/no.json`** (lines 1027-1033)
Remove the same trailing duplicate block (Norwegian version). Already present at lines 28-39.

### Result
All footer text (description, quick links, service areas, copyright, quote, returns badge) will render correctly in all three languages.
