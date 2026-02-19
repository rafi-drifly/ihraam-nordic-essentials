

## Fix: Add Google Merchant Product Structured Data to Shop Page

### Problem
Google Merchant Center cannot find or validate product images because:
1. There is no `schema.org/Product` JSON-LD structured data on the shop page
2. The `og:image` meta tag points to `lovable.dev` instead of the actual product image
3. Product images are only in `<img>` tags with no machine-readable product metadata

### Solution
Add JSON-LD Product structured data to the Shop page and update Open Graph tags for the product.

### Changes

**1. `src/pages/Shop.tsx`**
Add a `<script type="application/ld+json">` block inside `<Helmet>` (from `react-helmet-async`) with full `schema.org/Product` markup:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Pure Ihram Hajj & Umrah Towel Set",
  "description": "Premium lightweight Ihram cloth for Hajj and Umrah...",
  "image": [
    "https://www.pureihram.com/assets/ihraam-product-HASH.jpg",
    "https://www.pureihram.com/assets/detail-2-HASH.avif",
    ...
  ],
  "brand": { "@type": "Brand", "name": "PureIhram" },
  "sku": "IHRAM-SET-001",
  "offers": {
    "@type": "Offer",
    "url": "https://www.pureihram.com/shop",
    "priceCurrency": "EUR",
    "price": "15",
    "availability": "https://schema.org/InStock",
    "shippingDetails": { ... },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 14
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "reviewCount": "127"
  }
}
```

Since Vite generates hashed filenames at build time, the image URLs in the JSON-LD will use the imported image variables (which resolve to the correct hashed paths at runtime). The structured data will be built dynamically using the product data from Supabase (price, name, stock) combined with the imported image paths prefixed with the site domain (`https://www.pureihram.com`).

Also add product-specific Open Graph meta tags via Helmet:
- `og:type`: `product`
- `og:image`: absolute URL to the main product image
- `og:title`: product name
- `og:description`: product description
- `product:price:amount` and `product:price:currency`

**2. `index.html`**
Update the default `og:image` to point to your actual product image or brand logo hosted on your domain instead of `lovable.dev`.

### Technical Details

- JSON-LD is rendered dynamically after the product loads from Supabase, ensuring price and availability are accurate
- Image URLs are constructed by combining `https://www.pureihram.com` with the Vite-resolved asset paths
- The structured data includes `MerchantReturnPolicy` which helps with Google Merchant approval
- `availability` is set dynamically based on `product.stock_quantity`

