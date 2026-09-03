/**
 * Geometry and naming rules for product image uploads.
 *
 * The canvas work itself needs a real browser, so the parts that decide what
 * gets produced are kept pure and tested here: a wrong crop or an upscaled
 * variant is what makes a photo look bad on one of the two layouts.
 */

import { describe, expect, it } from "vitest";
import {
  buildSrcSet,
  computeCenterSquareCrop,
  selectVariantWidths,
  VARIANT_WIDTHS,
  variantPath,
} from "../imageProcessing";

describe("centre square crop", () => {
  it("takes the full frame when the source is already square", () => {
    expect(computeCenterSquareCrop(1000, 1000)).toEqual({ sx: 0, sy: 0, size: 1000 });
  });

  it("crops the sides of a landscape photo, evenly", () => {
    const crop = computeCenterSquareCrop(4000, 3000);
    expect(crop.size).toBe(3000);
    expect(crop.sy).toBe(0);
    expect(crop.sx).toBe(500); // (4000-3000)/2
  });

  it("crops top and bottom of a portrait photo, evenly", () => {
    const crop = computeCenterSquareCrop(3000, 4000);
    expect(crop.size).toBe(3000);
    expect(crop.sx).toBe(0);
    expect(crop.sy).toBe(500);
  });

  it("never reads outside the source image", () => {
    for (const [w, h] of [[4032, 3024], [1080, 1920], [640, 641], [4000, 4000]]) {
      const { sx, sy, size } = computeCenterSquareCrop(w, h);
      expect(sx).toBeGreaterThanOrEqual(0);
      expect(sy).toBeGreaterThanOrEqual(0);
      expect(sx + size).toBeLessThanOrEqual(w);
      expect(sy + size).toBeLessThanOrEqual(h);
    }
  });
});

describe("variant widths", () => {
  it("emits every width a large photo can support", () => {
    expect(selectVariantWidths(3000)).toEqual([...VARIANT_WIDTHS]);
  });

  it("never upscales beyond the source", () => {
    expect(selectVariantWidths(900)).toEqual([400, 800]);
    expect(selectVariantWidths(500)).toEqual([400]);
  });

  it("still produces one variant for a tiny source", () => {
    const widths = selectVariantWidths(120);
    expect(widths).toHaveLength(1);
    expect(widths[0]).toBe(400);
  });

  it("covers both layouts: a phone width and a 2x desktop frame", () => {
    const widths = selectVariantWidths(3000);
    expect(Math.min(...widths)).toBeLessThanOrEqual(400);
    expect(Math.max(...widths)).toBeGreaterThanOrEqual(1600);
  });
});

describe("storage paths", () => {
  it("namespaces by product and width", () => {
    expect(variantPath("abc", "Hero.JPG", 800)).toBe("products/abc/hero-800.webp");
  });

  it("sanitises names that would break a URL", () => {
    expect(variantPath("p1", "IMG 2043 (1).jpeg", 400)).toBe("products/p1/img-2043-1-400.webp");
    expect(variantPath("p1", "../../etc/passwd", 400)).toBe("products/p1/etc-passwd-400.webp");
  });

  it("falls back to a usable name when there is nothing left", () => {
    expect(variantPath("p1", "!!!.png", 400)).toBe("products/p1/image-400.webp");
  });
});

describe("srcset", () => {
  it("lists variants smallest first with width descriptors", () => {
    expect(
      buildSrcSet([
        { width: 1600, url: "/a-1600.webp" },
        { width: 400, url: "/a-400.webp" },
      ]),
    ).toBe("/a-400.webp 400w, /a-1600.webp 1600w");
  });
});
