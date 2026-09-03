/**
 * Product image preparation.
 *
 * Photos off a phone are 3-4 MB, arbitrary aspect ratios and wrongly oriented
 * for a product grid. The shop renders product images in a square frame, so an
 * uncropped upload gets letterboxed on desktop and awkwardly cropped by the
 * browser on mobile. Everything here exists to make one upload look right in
 * both places: centre-crop to a square, then emit a few widths as WebP so the
 * page can pick the smallest one that fits.
 */

/** Widths emitted per image. 1600 covers a 2x desktop frame, 400 a phone thumb. */
export const VARIANT_WIDTHS = [400, 800, 1600] as const;
export type VariantWidth = (typeof VARIANT_WIDTHS)[number];

export const WEBP_QUALITY = 0.82;

export interface CropRect {
  sx: number;
  sy: number;
  size: number;
}

/**
 * The largest centred square that fits inside the source image.
 * Pure so the geometry can be tested without a canvas.
 */
export function computeCenterSquareCrop(width: number, height: number): CropRect {
  const size = Math.min(width, height);
  return {
    sx: Math.round((width - size) / 2),
    sy: Math.round((height - size) / 2),
    size,
  };
}

/**
 * Widths worth producing for a given source. Never upscales: a 500px photo
 * yields 400 only, rather than a blurry fake 1600.
 */
export function selectVariantWidths(sourceSquareSize: number): VariantWidth[] {
  const usable = VARIANT_WIDTHS.filter((w) => w <= sourceSquareSize);
  // Always emit something, even for a tiny source.
  return usable.length > 0 ? [...usable] : [VARIANT_WIDTHS[0]];
}

export interface ProcessedVariant {
  width: VariantWidth;
  blob: Blob;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image file."));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image encoding failed."))),
      "image/webp",
      WEBP_QUALITY,
    );
  });
}

/**
 * Centre-crops to a square and renders each variant width as WebP.
 * Returns largest-first so the caller can show the biggest as a preview.
 */
export async function processProductImage(file: File): Promise<ProcessedVariant[]> {
  const img = await loadImage(file);
  const crop = computeCenterSquareCrop(img.naturalWidth, img.naturalHeight);
  const widths = selectVariantWidths(crop.size);

  const out: ProcessedVariant[] = [];
  for (const width of widths) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = width;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable in this browser.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, crop.sx, crop.sy, crop.size, crop.size, 0, 0, width, width);
    out.push({ width, blob: await canvasToBlob(canvas) });
  }
  return out.sort((a, b) => b.width - a.width);
}

/** Storage object path for a variant, e.g. "products/<id>/hero-1600.webp". */
export function variantPath(productId: string, baseName: string, width: number): string {
  const safeBase = baseName
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "image";
  return `products/${productId}/${safeBase}-${width}.webp`;
}

/** srcset string for the stored variants of one image. */
export function buildSrcSet(urlsByWidth: Array<{ width: number; url: string }>): string {
  return urlsByWidth
    .slice()
    .sort((a, b) => a.width - b.width)
    .map((v) => `${v.url} ${v.width}w`)
    .join(", ");
}
