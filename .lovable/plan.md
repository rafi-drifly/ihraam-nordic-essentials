

## Fix: Whitespace Gap, Pricing Mismatch in Meta Tags

### Issue 1: Massive whitespace gap on multiple pages

The outer `<div>` in `App.tsx` (line 148) already has `min-h-screen flex flex-col` with `<main className="flex-1">` — this correctly makes the layout fill the viewport. The problem is that individual page components (Home, Shop, Contact, etc.) **also** wrap their content in `<div className="min-h-screen">`, doubling the minimum height and creating a huge gap between the first and second sections.

**Fix:** Remove `min-h-screen` from the outermost wrapper `<div>` in these page components:

| File | Line | Change |
|------|------|--------|
| `src/pages/Home.tsx` | 61 | `min-h-screen` → remove |
| `src/pages/Shop.tsx` | 244 | `min-h-screen` → remove |
| `src/pages/Contact.tsx` | 126 | `min-h-screen` → remove |
| `src/pages/Shipping.tsx` | 57 | `min-h-screen` → remove |
| `src/pages/About.tsx` | 27 | `min-h-screen` → remove |
| `src/pages/Blog.tsx` | 100 | `min-h-screen` → remove |
| `src/pages/Cart.tsx` | 159 | `min-h-screen` → remove |
| `src/pages/Returns.tsx` | 103 | `min-h-screen` → remove |
| `src/pages/Partners.tsx` | 142 | `min-h-screen` → remove |
| `src/pages/BlogPost.tsx` | 24 | `min-h-screen` → remove |
| `src/pages/UmrahChecklistBlog.tsx` | 24 | `min-h-screen` → remove |
| `src/pages/UmrahDuasBlog.tsx` | 14 | `min-h-screen` → remove |
| `src/pages/IhramSpiritualMeaningBlog.tsx` | 14 | `min-h-screen` → remove |
| `src/pages/OrderSuccess.tsx` | 28 | `min-h-screen` → remove |
| `src/pages/Transparency.tsx` | 67 | `min-h-screen` → remove |
| `src/pages/MosqueSupport.tsx` | 100 | `min-h-screen` → remove |

Keep `min-h-screen` on loading/error states in Shop.tsx (lines 138, 149) and on `NotFound.tsx`, `AdminLogin.tsx`, and `Index.tsx` — those are full-page centered layouts where it's intentional.

### Issue 2: Pricing mismatch in `index.html` meta tags

`index.html` lines 25 and 31 say "Only 15€" — the actual price is €19. Also says "pure cotton" which is incorrect (it's microfiber polyester).

**Fix in `index.html`:**
- Line 25: Update meta description to `"Premium Ihram (Ihraam) cloth for Hajj & Umrah. From €19 per set. Fast delivery across Sweden, Nordics & EU. Lightweight, comfortable microfiber pilgrimage garments."`
- Line 31: Update OG description to `"Premium Ihram (Ihraam) cloth for pilgrims. From €19 per set. Fast delivery across Sweden, Nordics & EU."`
- Line 26: Remove "Cheap Ihram Cloth" from keywords — doesn't match brand tone

### Issue 3: No structured data (JSON-LD)

The Shop page (`src/pages/Shop.tsx` lines 164-197) **already has** Product JSON-LD with correct €19 pricing, availability, shipping details, and return policy. This is already in place — no changes needed.

### Summary

- ~16 files: remove redundant `min-h-screen`
- 1 file (`index.html`): fix outdated pricing and material claims in meta tags

