

## Fix SEO Indexing Issues for pureihram.com

### Problem Summary

After investigating the codebase, I found several issues causing Google Search Console indexing problems:

1. **Broken blog links on Homepage creating duplicate/ghost pages** -- The Home.tsx component links to wrong blog slugs (e.g., `/blog/the-spiritual-meaning-of-ihram` instead of `/blog/spiritual-meaning-ihram`). These wrong URLs get caught by the wildcard route `/blog/:slug` and render the generic `BlogPost` component, creating duplicate thin content.

2. **www vs non-www mismatch** -- The sitemap uses `https://www.pureihram.com` but `SEOHead.tsx` generates canonical/hreflang URLs using `https://pureihram.com` (no www). This confuses Google.

3. **Norwegian locale not handled in blog pages** -- Blog components (`SunnahActsBlog`, `IhramMistakesBlog`, `BlogPost`) only detect Swedish (`/sv`) for locale prefix, completely ignoring Norwegian (`/no`). Internal links from Norwegian blog pages point to English versions.

4. **No page-specific SEO metadata on blog pages** -- Individual blog pages don't use `SEOHead` with custom title/description, relying only on the global default.

5. **Stale sitemap dates** -- All `lastmod` dates are `2025-02-03`, over a year old.

---

### Fix 1: Correct Homepage Blog Links (HIGH PRIORITY)

**File: `src/pages/Home.tsx`** (lines 41-77)

Fix the 4 broken blog article links:

| Current (wrong) | Correct |
|---|---|
| `/blog/the-spiritual-meaning-of-ihram` | `/blog/spiritual-meaning-ihram` |
| `/blog/sunnah-acts-before-entering-ihram` | `/blog/sunnah-acts-before-ihram` |
| `/blog/checklist-for-umrah-preparation` | `/blog/umrah-preparation-checklist` |
| `/blog/essential-duas-for-umrah` | `/blog/essential-duas-umrah` |
| `/blog/common-mistakes-pilgrims-make-in-ihram` | `/blog/common-mistakes-ihram` |

This eliminates the 3 duplicate URLs Google found (`/blog/common-mistakes`, `/blog/sunnah-acts`, `/blog/how-to-wear-ihram` short versions) because users/crawlers won't land on the wrong wildcard route anymore.

---

### Fix 2: Standardize Domain to www (HIGH PRIORITY)

**File: `src/components/SEOHead.tsx`**

Change `baseUrl` from `https://pureihram.com` to `https://www.pureihram.com` so canonical URLs and hreflang tags match the sitemap.

---

### Fix 3: Fix Norwegian Locale in All Blog Pages (HIGH PRIORITY)

**Files affected:**
- `src/pages/BlogPost.tsx` (line 11)
- `src/pages/SunnahActsBlog.tsx` (line 10)
- `src/pages/IhramMistakesBlog.tsx` (line 10)
- `src/pages/UmrahDuasBlog.tsx`
- `src/pages/IhramSpiritualMeaningBlog.tsx`
- `src/pages/UmrahChecklistBlog.tsx`

Change the locale detection from:
```ts
const localePrefix = i18n.language === 'sv' ? '/sv' : '';
```
to:
```ts
const localePrefix = i18n.language === 'sv' ? '/sv' : i18n.language === 'no' ? '/no' : '';
```

This ensures Norwegian blog pages link internally to other Norwegian pages correctly.

---

### Fix 4: Add Page-Specific SEO to All Blog Pages (MEDIUM PRIORITY)

Add `<SEOHead>` with unique title and description to each blog page component:

- **BlogPost.tsx** (How to Wear Ihram)
- **SunnahActsBlog.tsx**
- **IhramMistakesBlog.tsx**
- **UmrahChecklistBlog.tsx**
- **UmrahDuasBlog.tsx**
- **IhramSpiritualMeaningBlog.tsx**
- **Blog.tsx** (index page)
- **Partners.tsx**

Each will get a unique, keyword-rich `<title>` (under 60 chars) and `<meta description>` (150-160 chars). The existing `SEOHead` component already handles canonical URLs and hreflang tags automatically based on the current route.

---

### Fix 5: Update Sitemap Dates and Add Transparency Page (LOW PRIORITY)

**File: `public/sitemap.xml`**

- Update all `lastmod` dates to `2026-02-16` (today)
- Add missing `/transparency` page entries (EN, SV, NO versions) -- these exist as routes but are not in the sitemap

---

### Fix 6: Update robots.txt (LOW PRIORITY)

**File: `public/robots.txt`**

Verify the sitemap URL matches the www domain. Currently correct (`https://www.pureihram.com/sitemap.xml`).

---

### Technical Details

**Files to modify:**
1. `src/pages/Home.tsx` -- Fix 5 blog link URLs
2. `src/components/SEOHead.tsx` -- Change baseUrl to www
3. `src/pages/BlogPost.tsx` -- Fix locale + add SEOHead
4. `src/pages/SunnahActsBlog.tsx` -- Fix locale + add SEOHead
5. `src/pages/IhramMistakesBlog.tsx` -- Fix locale + add SEOHead
6. `src/pages/UmrahChecklistBlog.tsx` -- Fix locale + add SEOHead
7. `src/pages/UmrahDuasBlog.tsx` -- Fix locale + add SEOHead
8. `src/pages/IhramSpiritualMeaningBlog.tsx` -- Fix locale + add SEOHead
9. `src/pages/Blog.tsx` -- Add SEOHead
10. `src/pages/Partners.tsx` -- Add SEOHead
11. `public/sitemap.xml` -- Update dates, add transparency pages

**No new dependencies needed.**

### Post-Implementation

After publishing, you should:
- Resubmit the updated sitemap in Google Search Console
- Use the URL Inspection tool to request re-indexing of the previously problematic URLs
- Monitor the "Pages" report over the next 1-2 weeks for improvements

