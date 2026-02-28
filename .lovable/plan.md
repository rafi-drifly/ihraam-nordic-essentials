

## Add Swedish and Norwegian Translations for Stripe Bundle Names

### Approach
Pass the user's current locale from the frontend to the `create-checkout` edge function, then use locale-specific bundle names in the Stripe line items.

### Changes

#### 1. Edge function: `supabase/functions/create-checkout/index.ts`

Add a `locale` field to the checkout request interface. Add a translation map for bundle labels:

```text
Locale  | 2-Pack label              | 3-Pack label
--------|---------------------------|---------------------------
en      | 2-Pack (Best Value)       | 3-Pack (Free Delivery)
sv      | 2-Pack (Basta Varde)      | 3-Pack (Fri Frakt)
no      | 2-Pack (Best Verdi)       | 3-Pack (Gratis Frakt)
```

Use the locale (defaulting to `"en"`) to pick the correct label when building `bundleName`.

#### 2. Frontend callers -- pass `locale`

Three files invoke `create-checkout` and need to include the current locale in the request body:

- **`src/pages/Shop.tsx`** -- already has `useTranslation()`, pass `i18n.language`
- **`src/pages/Cart.tsx`** -- add `useTranslation()` import, pass `i18n.language`
- **`src/components/ui/navbar.tsx`** -- add `useTranslation()` import, pass `i18n.language`

Each call adds `locale: i18n.language` (or derived from the URL prefix) to the request body.

### Files Modified
- `supabase/functions/create-checkout/index.ts` -- locale-aware bundle names
- `src/pages/Shop.tsx` -- pass locale
- `src/pages/Cart.tsx` -- pass locale
- `src/components/ui/navbar.tsx` -- pass locale
