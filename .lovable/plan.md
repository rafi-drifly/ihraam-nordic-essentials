

## Replace OG Image with Product Hero Image

### Problem
The current `og:image` in `index.html` points to `favicon.png`, which is a small icon -- not ideal for social sharing previews. Social platforms like Facebook, Twitter, and Google expect a large, high-quality image (ideally 1200x630px).

### Solution
Update `index.html` to use the hero product image (`ihraam-product.jpg`) instead of the favicon. Since this file is processed by Vite with a content hash, we need to place a dedicated OG image in the `public/` folder so it has a stable, predictable URL.

### Changes

**1. Copy/create `public/og-image.jpg`**
Copy `src/assets/ihraam-product.jpg` to `public/og-image.jpg`. Files in `public/` are served as-is without hashing, giving a stable URL: `https://www.pureihram.com/og-image.jpg`.

**2. Update `index.html`**
Change both `og:image` and `twitter:image` meta tags:

- `og:image`: `https://www.pureihram.com/favicon.png` --> `https://www.pureihram.com/og-image.jpg`
- `twitter:image`: `https://www.pureihram.com/favicon.png` --> `https://www.pureihram.com/og-image.jpg`

Two lines changed, one file copied.

