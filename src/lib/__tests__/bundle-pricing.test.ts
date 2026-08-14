/**
 * Bundle pricing.
 *
 * The same basket used to cost three different amounts depending on the route
 * taken to checkout:
 *   - Cart page:   displayed 19 x qty, charged the bundle price (1 EUR apart)
 *   - Shop buy-now: charged the bundle price
 *   - Navbar cart:  sent no bundlePrice, so the server fell back to 19 x qty
 *                   and the advertised bundle discount silently vanished
 *
 * And because `bundlePrice` came from the browser and was charged verbatim, a
 * crafted request could name its own price. Pricing is now derived server-side
 * from the quantity, from this one table.
 */

import { describe, expect, it } from "vitest";
import { getBundlePrice, getBundleType, UNIT_PRICE } from "../../../supabase/functions/create-checkout/pricing";
import { BUNDLES } from "../bundles";

describe("published bundle prices", () => {
  it("matches what the site advertises", () => {
    expect(getBundlePrice(1)).toBe(19);
    expect(getBundlePrice(2)).toBe(37);
    expect(getBundlePrice(3)).toBe(55);
  });

  it("is what the shop cards render", () => {
    // The cards used to hardcode their own copy of these numbers.
    for (const bundle of BUNDLES) {
      expect(bundle.totalPrice, `${bundle.label}`).toBe(getBundlePrice(bundle.qty));
    }
  });

  it("discounts every bundle against buying singles", () => {
    for (const qty of [2, 3, 4, 6, 10]) {
      expect(getBundlePrice(qty), `${qty} sets`).toBeLessThan(UNIT_PRICE * qty);
    }
  });
});

describe("prices that reach Stripe", () => {
  it("never goes negative or non-finite, whatever the quantity", () => {
    for (const qty of [0, -1, -100, NaN, Infinity]) {
      const price = getBundlePrice(qty as number);
      expect(Number.isFinite(price), `qty=${qty}`).toBe(true);
      expect(price, `qty=${qty}`).toBeGreaterThanOrEqual(0);
    }
  });

  it("never gets cheaper as the basket grows", () => {
    for (let qty = 1; qty < 30; qty++) {
      expect(getBundlePrice(qty + 1), `${qty + 1} vs ${qty}`).toBeGreaterThanOrEqual(getBundlePrice(qty));
    }
  });

  it("charges above three sets rather than treating them as a 3-pack", () => {
    expect(getBundlePrice(4)).toBeGreaterThan(getBundlePrice(3));
    expect(getBundlePrice(10)).toBeGreaterThan(getBundlePrice(3));
  });

  it("ignores fractional quantities instead of charging a fraction", () => {
    expect(getBundlePrice(2.7)).toBe(getBundlePrice(2));
  });
});

describe("bundle labelling", () => {
  it("names each tier", () => {
    expect(getBundleType(1)).toBe("single");
    expect(getBundleType(2)).toBe("2-pack");
    expect(getBundleType(3)).toBe("3-pack");
    expect(getBundleType(9)).toBe("3-pack");
  });
});
