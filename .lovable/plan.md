

## Update Navigation: Replace Track Order with Support Our Mission

### Overview
Remove "Track Order" from the navbar and add "Support Our Mission" (donation page) in its place. Also add the donation page link to the footer's Quick Links section.

---

### Changes Required

#### 1. Navbar Update (`src/components/ui/navbar.tsx`)

**Current navigation array (lines 73-81):**
```javascript
const navigation = [
  { name: t('nav.home'), href: "/" },
  { name: t('nav.shop'), href: "/shop" },
  { name: t('nav.blog'), href: "/blog" },
  { name: t('nav.shipping'), href: "/shipping" },  
  { name: t('nav.trackOrder'), href: "/guest-order-lookup" },  // REMOVE
  { name: t('nav.about'), href: "/about" },
  { name: t('nav.contact'), href: "/contact" },
];
```

**Updated navigation array:**
```javascript
const navigation = [
  { name: t('nav.home'), href: "/" },
  { name: t('nav.shop'), href: "/shop" },
  { name: t('nav.blog'), href: "/blog" },
  { name: t('nav.shipping'), href: "/shipping" },  
  { name: t('nav.supportMission'), href: "/support-our-mission" },  // NEW
  { name: t('nav.about'), href: "/about" },
  { name: t('nav.contact'), href: "/contact" },
];
```

---

#### 2. Footer Update (`src/components/ui/footer.tsx`)

**Current quickLinks array (lines 24-32):**
```javascript
const quickLinks = [
  { name: t('footer.links.home'), href: "/" },
  { name: t('footer.links.shop'), href: "/shop" },
  { name: t('footer.links.blog'), href: "/blog" },
  { name: t('footer.links.shipping'), href: "/shipping" },
  { name: t('footer.links.partners'), href: "/partners" },
  { name: t('footer.links.about'), href: "/about" },
  { name: t('footer.links.contact'), href: "/contact" },
];
```

**Updated quickLinks array:**
```javascript
const quickLinks = [
  { name: t('footer.links.home'), href: "/" },
  { name: t('footer.links.shop'), href: "/shop" },
  { name: t('footer.links.blog'), href: "/blog" },
  { name: t('footer.links.shipping'), href: "/shipping" },
  { name: t('footer.links.partners'), href: "/partners" },
  { name: t('footer.links.supportMission'), href: "/support-our-mission" },  // NEW
  { name: t('footer.links.about'), href: "/about" },
  { name: t('footer.links.contact'), href: "/contact" },
];
```

---

#### 3. Translation Updates

Add footer link translations to all three language files:

**English (`src/i18n/locales/en.json`):**
```json
"footer": {
  "links": {
    // ... existing keys
    "supportMission": "Support Our Mission"
  }
}
```

**Swedish (`src/i18n/locales/sv.json`):**
```json
"footer": {
  "links": {
    "supportMission": "Stöd vårt uppdrag"
  }
}
```

**Norwegian (`src/i18n/locales/no.json`):**
```json
"footer": {
  "links": {
    "supportMission": "Støtt vårt oppdrag"
  }
}
```

---

### Summary

| File | Change |
|------|--------|
| `src/components/ui/navbar.tsx` | Replace `trackOrder` with `supportMission` link |
| `src/components/ui/footer.tsx` | Add `supportMission` to quickLinks array |
| `src/i18n/locales/en.json` | Add `footer.links.supportMission` key |
| `src/i18n/locales/sv.json` | Add `footer.links.supportMission` key |
| `src/i18n/locales/no.json` | Add `footer.links.supportMission` key |

**Note:** The Track Order page (`/guest-order-lookup`) will still be accessible via direct URL - it's just being removed from the main navigation to give the donation page more visibility.

