

## Update Pricing: €19 / €37 / €55

New prices: Single €19, 2-Pack €37, 3-Pack €55.

Savings recalculation:
- 2-Pack: 2×19 = €38, bundle = €37 → saves €1 (plus shipping consolidation)
- 3-Pack: 3×19 = €57, bundle = €55 → saves €2. Vs 3 separate orders (3×19 + 3×9 = €84), bundle+shipping = €64 → saves €20

### Files to update

**1. `src/lib/bundles.ts`** — Core pricing
- `UNIT_PRICE`: 20 → 19
- Single: totalPrice 20 → 19
- 2-Pack: totalPrice 40 → 37, savings 0 → 1
- 3-Pack: totalPrice 60 → 55, savings 18 → 2 (product savings only; shipping savings shown separately)
- Fallback formula for qty>3: update `(60/3)` → `(55/3)`

**2. `src/i18n/locales/en.json`** — English copy
- `banner.newStock` / `banner.promoText`: "from €20" → "from €19"
- `home.benefits.affordable.description`: "From €20 per set" → "From €19 per set"
- `about.story.p2`: "price of just 20€" → "price of just €19"
- `mosque.breakdown.example.description`: "€18–€20" → "€17–€19"

**3. `src/i18n/locales/sv.json`** — Swedish copy
- `banner.newStock` / `banner.promoText`: "från €20" → "från €19"
- `home.benefits.affordable.description`: "Från €20" → "Från €19"
- `mosque.breakdown.example.description`: "€18–€20" → "€17–€19"

**4. `src/i18n/locales/no.json`** — Norwegian copy
- `banner.newStock` / `banner.promoText`: "fra €20" → "fra €19"
- `home.benefits.affordable.description`: "Fra €20" → "Fra €19"
- `mosque.breakdown.example.description`: "€18–€20" → "€17–€19"

**5. Supabase product table** — The `products.price` field in the database should also be updated to 19. This is used as a fallback in `create-checkout` when no `bundlePrice` is sent. This requires a migration.

**6. `supabase/functions/create-checkout/index.ts`** — No code changes needed; it already uses `bundlePrice` from the client, and the product DB price as fallback.

No other files need changes. The Shop page UI reads prices from `BUNDLES` dynamically.

