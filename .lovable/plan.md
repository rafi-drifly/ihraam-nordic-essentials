

## Shorten Navigation Labels

### Overview
Update two navigation labels in the header to make the menu cleaner and easier to scan. Only the visible text changes - no URLs, routes, or page content will be modified.

---

### Changes

| Current Label | New Label | Route (unchanged) |
|---------------|-----------|-------------------|
| Guides & Knowledge | Guides | /blog |
| Support Our Mission | Support | /support-our-mission |

---

### Files to Update

#### 1. English Translations (`src/i18n/locales/en.json`)

**Lines 8 and 10:**
```json
"nav": {
  "home": "Home",
  "shop": "Shop",
  "blog": "Guides",                    // Changed from "Guides & Knowledge"
  "shipping": "Shipping",
  "supportMission": "Support",         // Changed from "Support Our Mission"
  "transparency": "Transparency",
  "donate": "Donate",
  "about": "About",
  "contact": "Contact"
}
```

#### 2. Swedish Translations (`src/i18n/locales/sv.json`)

**Lines 8 and 10:**
```json
"nav": {
  "home": "Hem",
  "shop": "Butik",
  "blog": "Guider",                    // Changed from "Guider & Kunskap"
  "shipping": "Frakt",
  "supportMission": "Stöd",            // Changed from "Stöd vårt uppdrag"
  "transparency": "Transparens",
  "donate": "Donera",
  "about": "Om Oss",
  "contact": "Kontakt"
}
```

#### 3. Norwegian Translations (`src/i18n/locales/no.json`)

**Lines 8 and 10:**
```json
"nav": {
  "home": "Hjem",
  "shop": "Butikk",
  "blog": "Guider",                    // Changed from "Guider & Kunnskap"
  "shipping": "Frakt",
  "supportMission": "Støtt",           // Changed from "Støtt vårt oppdrag"
  "transparency": "Åpenhet",
  "donate": "Doner",
  "about": "Om Oss",
  "contact": "Kontakt"
}
```

---

### What Stays the Same

| Item | Status |
|------|--------|
| All URLs/routes | Unchanged |
| Donate button text | Unchanged ("Donate") |
| Top notification banner | Unchanged |
| Footer link labels | Unchanged (keep longer labels) |
| Page titles and H1s | Unchanged |
| SEO metadata | Unchanged |

---

### Technical Notes

- The navbar component (`src/components/ui/navbar.tsx`) uses `t('nav.blog')` and `t('nav.supportMission')` - no code changes needed there
- Both desktop and mobile navigation will automatically reflect the new shorter labels
- The footer uses separate translation keys (`footer.links.*`) which remain unchanged

