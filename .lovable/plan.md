

## Fix Favicon — Always Show PureIhram Green "I"

### Problem
The current `favicon.ico` is only 635 bytes with a single 16x16 image that appears mostly transparent — likely the Lovable default or a corrupted generation. New visitors see the Lovable logo because browsers cache `/favicon.ico` and the file itself is wrong.

### Solution

1. **Regenerate `favicon.ico` properly** from `public/favicon.png` (1024×1024 source) with multiple sizes (16, 32, 48, 64) using high-quality resampling (LANCZOS).

2. **Regenerate `favicon-32.png` and `favicon-192.png`** from the same source to ensure consistency.

3. **Add cache-busting query strings** to all favicon `<link>` tags in `index.html` so browsers fetch the new files instead of serving a cached Lovable icon:
   ```html
   <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png?v=2" />
   <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=2" />
   <link rel="icon" href="/favicon.ico?v=2" type="image/x-icon" />
   <link rel="shortcut icon" href="/favicon.ico?v=2" type="image/x-icon" />
   ```

4. **Add an Apple Touch Icon** link for iOS devices:
   ```html
   <link rel="apple-touch-icon" sizes="192x192" href="/favicon-192.png?v=2" />
   ```

### Files Modified
| File | Change |
|------|--------|
| `public/favicon.ico` | Regenerated with proper multi-size ICO |
| `public/favicon-32.png` | Regenerated from source |
| `public/favicon-192.png` | Regenerated from source |
| `index.html` | Cache-busting `?v=2` on all favicon links + apple-touch-icon |

