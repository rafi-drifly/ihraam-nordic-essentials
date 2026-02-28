

## Fix Price, Shipping, Translation, and Material Inconsistencies

### Issue 1: Price Consistency (15 EUR to 20 EUR)

All occurrences of "15EUR" need to change to "20EUR" across all three locale files and the SEO component.

**`src/i18n/locales/en.json`** (4 changes):
- Line 48: `"priceAmount": "15€"` to `"20€"`
- Line 62: `"Quality Ihram (Ihraam) at just 15€ + shipping..."` to `"...at just 20€ + shipping..."`
- Line 90: `"High-quality Ihraam at just 15€ + shipping..."` to `"...at just 20€ + shipping..."`
- Line 135 (about.subtitle): `"affordable (15€ + shipping)"` to `"affordable (20€ + shipping)"`
- Line 139 (about.story.p2): `"accessible price of just 15€"` to `"...just 20€"`
- Line 158 (about.values.accessibility.description): `"Ihram (Ihraam) cloth at 15€"` to `"...at 20€"`

**`src/i18n/locales/sv.json`** (same keys, Swedish text):
- Line 48: `"priceAmount": "15€"` to `"20€"`
- Line 62: `"15€ + frakt"` to `"20€ + frakt"`
- Line 90: `"15€ + frakt"` to `"20€ + frakt"`
- Line 135 (about.subtitle): `"15€ + frakt"` to `"20€ + frakt"`
- About story p2 and values accessibility: all `15€` to `20€`

**`src/i18n/locales/no.json`** (same keys, Norwegian text):
- Same pattern as above -- all `15€` to `20€`

**`src/pages/Home.tsx`** (1 change):
- Line 161: hardcoded `"15€"` to `"20€"`

**`src/components/SEOHead.tsx`** (3 changes):
- Line 47: Swedish meta description `15€` to `20€`
- Line 50: Norwegian meta description `15€` to `20€`
- Line 52: English meta description `15€` to `20€`

---

### Issue 2: Shipping Page Outdated Prices

Update the shipping zone data in `en.json` (and `sv.json`, `no.json`):

**`src/i18n/locales/en.json`** shipping zones:
- Sweden cost: `"5€"` to `"€9 (1–2 sets) / Free (3+ sets)"`
- Sweden description: update to mention tiered pricing
- Nordic cost: `"9€"` to `"Calculated at checkout"`
- EU cost: `"10€"` to `"Calculated at checkout"`
- Remove outdated `"freeShipping"` line about "orders over 50EUR"
- Update `shipping.features.free.description` to `"Buy 3+ sets and get free delivery in Sweden"`

Same changes mirrored in `sv.json` and `no.json`.

---

### Issue 3: Swedish Translation for Shop Bundle Heading

The Shop page heading and subtitle (lines 242-246 in `Shop.tsx`) are hardcoded English strings, not using `t()`.

**`src/pages/Shop.tsx`**:
- Line 242: Replace `"Pure Ihram Sets — Simple bundles, fair delivery"` with `{t('shop.bundleHeading')}`
- Line 245: Replace the subtitle with `{t('shop.bundleSubtitle')}`

**`src/i18n/locales/en.json`** -- add new keys:
- `"shop.bundleHeading": "Pure Ihram Sets — Simple bundles, fair delivery"`
- `"shop.bundleSubtitle": "Save more when you buy 2 or 3. In Sweden: €9 delivery for 1–2 sets, free delivery from 3 sets."`

**`src/i18n/locales/sv.json`** -- add Swedish translations:
- `"shop.bundleHeading": "Pure Ihram Set — Enkla paket, rättvis leverans"`
- `"shop.bundleSubtitle": "Spara mer när du köper 2 eller 3. I Sverige: 9 € leverans för 1–2 set, fri leverans från 3 set."`

**`src/i18n/locales/no.json`** -- add Norwegian translations:
- `"shop.bundleHeading": "Pure Ihram Sett — Enkle pakker, rettferdig levering"`
- `"shop.bundleSubtitle": "Spar mer når du kjøper 2 eller 3. I Sverige: 9 € levering for 1–2 sett, gratis levering fra 3 sett."`

---

### Issue 4: Material Inconsistency (100% Cotton vs Microfiber Polyester)

The product description in the Supabase `products` table says "100% cotton". The shop spec table says "100% Microfiber Polyester". The Stripe checkout uses the DB description, so Google/Stripe shows "100% cotton".

**Database migration**: Update the product description to replace "100% cotton" with "100% Microfiber Polyester":

```sql
UPDATE products
SET description = 'Premium quality Ihraam set made from 100% Microfiber Polyester. Lightweight, comfortable, and perfectly suited for your sacred pilgrimage to Makkah. The set includes both the Izaar (lower garment) and Ridaa (upper garment), pre-cut to traditional specifications.'
WHERE id = '36acffbc-41ea-4512-8621-174cd8d9b00c';
```

Also update the `en.json` "comfortable" description and About page "quality" section that mentions "100% cotton":
- `home.whyChoose.comfortable.description`: "Premium 100% cotton fabric" to "Premium 100% Microfiber Polyester fabric"
- `home.benefits.lightweight.description`: "Made from premium cotton" to "Made from premium microfiber"
- `about.quality.cotton.title`: "Premium Cotton" to "Premium Microfiber"
- `about.quality.cotton.description`: "100% natural cotton fibers" to "100% Microfiber Polyester"

Same changes in `sv.json` and `no.json`.

---

### Summary of Files Changed

| File | Changes |
|------|---------|
| `src/i18n/locales/en.json` | Price 15 to 20, shipping costs, bundle keys, material references |
| `src/i18n/locales/sv.json` | Same + Swedish bundle heading/subtitle translations |
| `src/i18n/locales/no.json` | Same + Norwegian bundle heading/subtitle translations |
| `src/pages/Home.tsx` | Hardcoded "15EUR" to "20EUR" (line 161) |
| `src/pages/Shop.tsx` | Extract heading/subtitle to i18n keys |
| `src/components/SEOHead.tsx` | Update meta descriptions from 15 to 20 |
| Database migration | Update product description to "Microfiber Polyester" |
