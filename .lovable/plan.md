

## Expose Product Images via Supabase Storage for Google Merchant Center

### Current Situation
Product images are **not** stored in Supabase Storage -- they are local assets bundled by Vite (`src/assets/*.jpg` and `src/assets/product/*.avif`). The `products` table has an `images` column but it only contains local paths (`/src/assets/ihraam-product.jpg`, `/src/assets/ihraam-worn.jpg`), not public URLs.

There are currently **no storage buckets** in the Supabase project.

**Important note**: This project uses Vite/React, not Next.js, so there is no `/_next/image` optimizer. The issue is that Vite hashes filenames at build time and detail images are in AVIF format (unsupported by Google Merchant).

### Plan

**Step 1: Create a public Supabase Storage bucket**

Create a `product-images` bucket with public read access via SQL migration:
- Bucket: `product-images`, public: `true`
- RLS policy: allow public `SELECT` on `storage.objects` for this bucket

**Step 2: You upload your images manually**

After the bucket is created, you will need to upload your product images (as JPEG or WebP, NOT AVIF) to the bucket via the Supabase Dashboard. The resulting URLs will be:
```
https://cimjybhmilaecqhnqrby.supabase.co/storage/v1/object/public/product-images/main.jpg
https://cimjybhmilaecqhnqrby.supabase.co/storage/v1/object/public/product-images/detail-2.jpg
...
```

**Step 3: Update the `products` table**

Update the `images` array in the `products` table to contain the full Supabase Storage URLs instead of local paths.

**Step 4: Create an edge function `product-images`**

Since Lovable/Vite projects cannot create API routes like `/api/...`, we will create a Supabase Edge Function that returns the JSON format you described:

```json
{
  "product_id": "pure-ihram-hajj-towel-set",
  "image_link": "https://cimjybhmilaecqhnqrby.supabase.co/storage/v1/object/public/product-images/main.jpg",
  "additional_images": [
    "https://cimjybhmilaecqhnqrby.supabase.co/storage/v1/object/public/product-images/detail-2.jpg",
    ...
  ]
}
```

It will read from the `products` table `images` column to return the URLs dynamically.

**Step 5: Update Shop.tsx structured data**

Update the JSON-LD `image` array and `og:image` to use the Supabase Storage URLs from the product data instead of the hardcoded `og-image.jpg` path.

### What You Need To Do

After implementation, you will need to:
1. Convert your AVIF detail images to JPEG or WebP
2. Upload them to the `product-images` bucket in the Supabase Dashboard
3. Use the returned Supabase Storage URLs in your Google Merchant Center CSV feed

### Technical Details

- Storage bucket created via SQL migration with public access
- Edge function at `product-images` reads from the `products` table
- `verify_jwt = false` for the edge function (public endpoint)
- JSON-LD in Shop.tsx will dynamically use the storage URLs from the product record
- Config updated in `supabase/config.toml`

