

## Add Country Flag Emojis

Currently the selector shows 🇸🇪 for Sweden and 🌍 for everything else. Replace with actual flag emojis per country.

### Changes

**`src/lib/shipping.ts`** — Add a `COUNTRY_FLAGS` map:
```ts
export const COUNTRY_FLAGS: Record<EuropeCountry, string> = {
  AT: '🇦🇹', BE: '🇧🇪', BG: '🇧🇬', HR: '🇭🇷', CY: '🇨🇾',
  CZ: '🇨🇿', DK: '🇩🇰', EE: '🇪🇪', FI: '🇫🇮', FR: '🇫🇷',
  DE: '🇩🇪', GR: '🇬🇷', HU: '🇭🇺', IE: '🇮🇪', IT: '🇮🇹',
  LV: '🇱🇻', LT: '🇱🇹', LU: '🇱🇺', MT: '🇲🇹', NL: '🇳🇱',
  PL: '🇵🇱', PT: '🇵🇹', RO: '🇷🇴', SK: '🇸🇰', SI: '🇸🇮',
  ES: '🇪🇸', SE: '🇸🇪', GB: '🇬🇧', NO: '🇳🇴', IS: '🇮🇸',
  LI: '🇱🇮', CH: '🇨🇭',
};
```

**`src/pages/Shop.tsx`** and **`src/pages/Cart.tsx`** — Import `COUNTRY_FLAGS` and replace `{code === 'SE' ? '🇸🇪 ' : '🌍 '}` with `{COUNTRY_FLAGS[code]} `.

