
## Fix: Footer Links Losing Language Context

### Problem
The footer component's locale prefix detection only checks for Swedish (`/sv`) routes. When viewing Norwegian pages (`/no`), the `localePrefix` returns an empty string, causing all footer links to point to English routes instead of Norwegian ones.

**Current code (line 10):**
```javascript
const localePrefix = location.pathname.startsWith('/sv') ? '/sv' : '';
```

This means:
- On `/sv/shop` -> links correctly go to `/sv/...`
- On `/no/shop` -> links incorrectly go to `/...` (English)

### Solution
Update the `localePrefix` logic to detect both Swedish and Norwegian route prefixes.

### File to Change

**`src/components/ui/footer.tsx`**

Update line 10 to check for both `/sv` and `/no` prefixes:

```javascript
// Get locale prefix for links
const getLocalePrefix = () => {
  if (location.pathname.startsWith('/sv')) return '/sv';
  if (location.pathname.startsWith('/no')) return '/no';
  return '';
};
const localePrefix = getLocalePrefix();
```

This ensures:
- On English routes (`/`, `/shop`, etc.) -> links go to `/...`
- On Swedish routes (`/sv`, `/sv/shop`, etc.) -> links go to `/sv/...`
- On Norwegian routes (`/no`, `/no/shop`, etc.) -> links go to `/no/...`

### Impact
- Single file change
- Maintains language context when navigating via footer links
- Consistent with how the navbar handles locale prefixes
