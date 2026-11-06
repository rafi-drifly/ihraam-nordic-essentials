import heroCloth from "@/assets/hero-product.avif";
import weaveDiamond from "@/assets/product/detail-8.avif";
import weavePlain from "@/assets/product/detail-5.avif";
import howToWear from "@/assets/blog/how-to-wear-ihram.png";

/**
 * The four photo places on the homepage, and the photo each one is waiting for.
 *
 * Rafi is shooting these himself. They must be his own photos of the real set:
 * never stock, never AI-generated, never a face (brand manual p. 17). Until a
 * shot exists, each place shows an image the site already had.
 *
 * To drop a new photo in:
 *   1. Put the file in src/assets/home/ (AVIF or JPEG, about 1600 px on the
 *      long side, exposure lifted so the white reads white).
 *   2. Import it here and set `src`, `width` and `height`.
 *   3. Set `fit` to "cover".
 *   4. Update the matching alt text in all four locale files (the key is in
 *      `altKey`), so it describes the new photo.
 * The frame keeps its shape, so nothing else on the page moves.
 */
export interface HomePhotoSlot {
  src: string;
  width: number;
  height: number;
  /** The photo this place is waiting for. */
  awaiting: string;
  /** Translation key of the alt text. */
  altKey: string;
  /** "cover" fills the frame; "contain" fits a drawing inside it on Mist. */
  fit: "cover" | "contain";
}

export const HOME_PHOTOS = {
  hero: {
    src: heroCloth,
    width: 800,
    height: 800,
    awaiting: "The set folded, in window light",
    altKey: "home.hero.imageAlt",
    fit: "cover",
  },
  cloth: {
    src: weaveDiamond,
    width: 800,
    height: 800,
    awaiting: "A hand resting on the fabric",
    altKey: "home.set.imageAlt",
    fit: "cover",
  },
  sets: {
    src: weavePlain,
    width: 800,
    height: 800,
    awaiting: "The set in its bag",
    altKey: "home.offers.imageAlt",
    fit: "cover",
  },
  wear: {
    src: howToWear,
    width: 1920,
    height: 1920,
    awaiting: "The set worn, seen from behind, no face",
    altKey: "home.howToWear.imageAlt",
    fit: "contain",
  },
} satisfies Record<string, HomePhotoSlot>;

export type HomePhotoName = keyof typeof HOME_PHOTOS;
