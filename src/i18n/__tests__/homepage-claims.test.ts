/**
 * Words the homepage must never say, in any language.
 *
 * The brand manual v2.0 (p. 15) keeps a "Never say" list, and Rafi treats an
 * invented product claim as a religious wrong, not a style slip. These were
 * all on the site once and were taken off on 5 November 2026: the sets are not
 * pre-washed, returns are not free on a change of mind, "Premium" and
 * "eco-friendly" are unverified, and delivery is 3-7 / 7-14 business days.
 * This test keeps them off the homepage copy.
 */
import { describe, expect, it } from "vitest";
import en from "../locales/en.json";
import sv from "../locales/sv.json";
import no from "../locales/no.json";
import fr from "../locales/fr.json";

const NEVER = [
  "premium",
  "eco-friendly",
  "fast delivery",
  "free returns",
  "pre-washed",
  "prewashed",
  "förtvättad",
  "forvasket",
  "prélavé",
  "gratis retur",
  "retours gratuits",
  "miljövänlig",
  "miljøvennlig",
  // Returns cost the buyer the postage on a change of mind (Returns page,
  // manual p. 15), so they are never "no questions asked".
  "no questions asked",
  "inga frågor ställs",
  "ingen spørsmål stilt",
  "sans avoir à vous justifier",
  // Delivery is 3-7 / 7-14 business days; never sold as fast.
  "how fast",
  "hur snabbt",
  "hvor raskt",
  // Not on the verified list; Rafi had them removed on 6 Nov 2026. A ruling
  // on behalf of every school of fiqh is not ours to make, and "stays cool"
  // and the cotton comparison were never confirmed.
  "schools of fiqh",
  "fiqh-skol",
  "écoles de fiqh",
  "stays cool",
  "håller sig sval",
  "holder seg kjølig",
  "reste fraîche",
  "cotton",
  "bomull",
  "coton",
];

const strings = (node: unknown): string[] => {
  if (typeof node === "string") return [node];
  if (Array.isArray(node)) return node.flatMap(strings);
  if (node && typeof node === "object") return Object.values(node).flatMap(strings);
  return [];
};

describe("homepage copy makes no claim the manual forbids", () => {
  for (const [locale, bundle] of Object.entries({ en, sv, no, fr })) {
    it(`${locale}: none of the never-say words appear under home.*`, () => {
      const text = strings((bundle as { home: unknown }).home).join("\n").toLowerCase();
      for (const word of NEVER) {
        expect(text, `"${word}" found in ${locale} home copy`).not.toContain(word);
      }
    });
  }
});
