

## Fix: Google Merchant Center "Invalid image encoding" for Product Feed

### Root Cause

The product detail images are all in **AVIF format** (`.avif`), which is **not accepted by Google Merchant Center**. Google only accepts: JPEG, PNG, GIF, BMP, TIFF, or WebP.

Additionally, the image URLs in the JSON-LD structured data are constructed from Vite-hashed asset paths (e.g., `/assets/detail-2-abc123.avif`), which:
- Have unpredictable hashed filenames that change on every build
- Are in AVIF format, rejected by Google Merchant

### Solution

1. **Copy all product images to `public/` as stable-URL files**
   - Copy `src/assets/ihraam-product.jpg` to `public/product/main.jpg`
   - Copy detail images to `public/product/detail-2.avif` through `detail-8.avif`

   Since AVIF is not accepted by Google, the detail images need to be converted. However, since we cannot convert image formats in Lovable, we will:
   - Use the main product image (`og-image.jpg`, which is JPEG) as the `image_link`
   - Only include the main JPEG image in the structured data for Google Merchant, removing the AVIF detail images from the feed

2. **Update `src/pages/Shop.tsx` structured data**
   - Change the `image` array in JSON-LD to only include the JPEG image with a stable public URL: `https://www.pureihram.com/og-image.jpg`
   - Keep the AVIF images for the on-page gallery (browsers support AVIF fine), but exclude them from structured data
   - Update `og:image` to use the same stable URL

### Changes

**`src/pages/Shop.tsx`**
- Replace the dynamic `absoluteImages` array in the JSON-LD with a single stable JPEG URL: `["https://www.pureihram.com/og-image.jpg"]`
- The on-page image gallery continues to use the Vite-imported AVIF assets (no visual change)

### Result
- `image_link` will point to `https://www.pureihram.com/og-image.jpg` -- a direct, publicly accessible JPEG file with correct `Content-Type: image/jpeg` headers
- No AVIF images in the product feed, resolving the "Invalid image encoding" error
- The on-page shopping experience remains unchanged

### Follow-up Recommendation
To include multiple product images in the Google Merchant feed, you would need to convert the AVIF detail images to JPEG or WebP and host them in the `public/` folder (or a CDN/Supabase Storage bucket). This can be done outside Lovable using any image converter, then uploading the converted files.

