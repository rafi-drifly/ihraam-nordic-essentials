
## Plan: Add Norwegian Language Support

### Overview
Add Norwegian as a third language option to the website, accessible via `/no/*` routes, with a proper language selector dropdown to handle three languages elegantly.

### Files to Change

#### 1. Create Translation File: `src/i18n/locales/no.json`
Create a complete Norwegian translation file based on the English version. This will include all 674+ translation keys covering:
- Navigation, footer, banner
- Home page content
- About, Contact, Shipping pages
- Shop and Cart content
- Blog articles and guides
- Order tracking and success pages

Sample translations:
- "Home" -> "Hjem"
- "Shop" -> "Butikk"  
- "Shipping" -> "Frakt"
- "New stock has arrived!" -> "Nytt lager har ankommet!"

#### 2. Update i18n Config: `src/i18n/config.ts`
- Import the new Norwegian translation file
- Add `no` to resources and supportedLngs array

```text
resources: {
  en: { translation: en },
  sv: { translation: sv },
  no: { translation: no }  // NEW
},
supportedLngs: ['en', 'sv', 'no']  // Updated
```

#### 3. Update Language Switcher: `src/components/LanguageSwitcher.tsx`
Convert from a simple toggle button to a dropdown menu supporting three languages:

```text
+------------------+
| EN | SV | NO    |  <- Language options
+------------------+
```

Changes:
- Use a Popover/DropdownMenu component for language selection
- Show current language with a globe icon
- Display all three options with language names
- Handle route switching for `/`, `/sv/*`, and `/no/*` paths

#### 4. Update Locale Handler: `src/components/LocaleHandler.tsx`
- Add detection for `/no` route prefix
- Sync i18n language with Norwegian routes

#### 5. Update SEO Component: `src/components/SEOHead.tsx`
- Add Norwegian URL generation
- Include `hreflang="no"` tag
- Update locale alternates for Open Graph

#### 6. Update Routes: `src/App.tsx`
Add all Norwegian route variants:
- `/no` -> Home
- `/no/shop` -> Shop
- `/no/blog` -> Blog
- `/no/blog/[slug]` -> Blog posts
- `/no/about` -> About
- `/no/contact` -> Contact
- `/no/shipping` -> Shipping
- `/no/partners` -> Partners
- `/no/order-success` -> Order Success
- `/no/guest-order-lookup` -> Guest Order Lookup
- `/no/cart` -> Cart

#### 7. Update Sitemap: `public/sitemap.xml`
Add Norwegian pages with proper hreflang attributes:
- Add `hreflang="no"` links to all existing URL entries
- Add new `/no/*` URL entries with cross-language references

---

### Technical Details

| Component | Current | After Change |
|-----------|---------|--------------|
| Languages | 2 (en, sv) | 3 (en, sv, no) |
| Route prefixes | `/`, `/sv` | `/`, `/sv`, `/no` |
| Switcher UI | Toggle button | Dropdown menu |
| Translation files | 2 | 3 |

### Language Mapping
| English | Swedish | Norwegian |
|---------|---------|-----------|
| Home | Hem | Hjem |
| Shop | Butik | Butikk |
| Blog | Guider & Kunskap | Guider & Kunnskap |
| Shipping | Frakt | Frakt |
| Track Order | Spara Order | Spor Bestilling |
| About | Om Oss | Om Oss |
| Contact | Kontakt | Kontakt |

### Scope
This is a significant change involving:
- 1 new translation file (~674 lines)
- Updates to 6 existing files
- 14 new route definitions
- Updated sitemap with ~40 new hreflang entries
