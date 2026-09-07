import { describe, expect, it } from "vitest";
import manifest from "../locale-manifest.json";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_CODES,
  localeFromPath,
  localisePath,
  routePath,
  stripLocale,
} from "../locales";

/**
 * Adding a language used to mean editing twenty-two files and writing out
 * twenty-five more routes by hand. Everything now derives from the manifest,
 * and these tests exist so a half-finished addition fails here rather than
 * shipping a language whose pages quietly resolve to English.
 */
describe("the locale manifest", () => {
  it("declares exactly one prefix-less default", () => {
    const defaults = LOCALE_CODES.filter((c) => LOCALES[c].default);
    expect(defaults).toHaveLength(1);
    expect(LOCALES[defaults[0]].prefix).toBe("");
    expect(DEFAULT_LOCALE).toBe(defaults[0]);
  });

  it("gives every other language a distinct prefix starting with a slash", () => {
    const prefixes = LOCALE_CODES.filter((c) => c !== DEFAULT_LOCALE).map((c) => LOCALES[c].prefix);
    expect(new Set(prefixes).size).toBe(prefixes.length);
    for (const p of prefixes) expect(p).toMatch(/^\/[a-z-]+$/);
  });

  it("gives every language the metadata the head needs", () => {
    for (const code of LOCALE_CODES) {
      const m = LOCALES[code];
      expect(m.name, `${code} name`).toBeTruthy();
      expect(m.htmlLang, `${code} htmlLang`).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
      expect(m.hreflang, `${code} hreflang`).toBeTruthy();
      expect(m.ogLocale, `${code} ogLocale`).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
    }
  });

  it("still matches the shape prerender.mjs reads at build time", () => {
    // prerender.mjs parses this JSON directly; if the file grows a nested
    // shape the build breaks silently at 3am, not here.
    for (const value of Object.values(manifest)) {
      expect(typeof value).toBe("object");
      expect(value).toHaveProperty("prefix");
      expect(value).toHaveProperty("hreflang");
    }
  });
});

describe("reading the locale out of a path", () => {
  it("recognises each language by its prefix", () => {
    expect(localeFromPath("/sv/shop")).toBe("sv");
    expect(localeFromPath("/no/blog/miqat")).toBe("no");
    expect(localeFromPath("/shop")).toBe("en");
    expect(localeFromPath("/")).toBe("en");
  });

  it("matches a whole segment, not a prefix of a word", () => {
    // The old startsWith('/no') check served this page in Norwegian.
    expect(localeFromPath("/nordic-shipping")).toBe("en");
    expect(localeFromPath("/svalbard")).toBe("en");
  });
});

describe("moving a page between languages", () => {
  it("strips the prefix back to the shared path", () => {
    expect(stripLocale("/sv/shop")).toBe("/shop");
    expect(stripLocale("/no")).toBe("/");
    expect(stripLocale("/sv")).toBe("/");
    expect(stripLocale("/shop")).toBe("/shop");
    expect(stripLocale("/")).toBe("/");
  });

  it("keeps you on the same page when you switch language", () => {
    expect(localisePath("/sv/blog/what-happens-at-miqat", "no")).toBe(
      "/no/blog/what-happens-at-miqat"
    );
    expect(localisePath("/no/shop", "en")).toBe("/shop");
    expect(localisePath("/shop", "sv")).toBe("/sv/shop");
  });

  it("handles the root in both directions", () => {
    expect(localisePath("/", "sv")).toBe("/sv");
    expect(localisePath("/sv", "en")).toBe("/");
    expect(localisePath("/no", "sv")).toBe("/sv");
  });

  it("round-trips through every language without drifting", () => {
    for (const from of LOCALE_CODES) {
      for (const to of LOCALE_CODES) {
        const there = localisePath(routePath(from, "shop"), to);
        expect(localisePath(there, from)).toBe(routePath(from, "shop"));
      }
    }
  });
});

describe("route paths handed to the router", () => {
  it("puts the default language at the bare root", () => {
    expect(routePath("en", "")).toBe("/");
    expect(routePath("en", "shop")).toBe("/shop");
  });

  it("gives a prefixed language a root with no trailing slash", () => {
    // React Router treats /sv and /sv/ as different paths, and the prerendered
    // file lives at /sv.
    expect(routePath("sv", "")).toBe("/sv");
    expect(routePath("no", "")).toBe("/no");
  });

  it("never produces a double slash", () => {
    for (const code of LOCALE_CODES) {
      for (const rel of ["", "shop", "blog/what-happens-at-miqat"]) {
        expect(routePath(code, rel)).not.toMatch(/\/\//);
      }
    }
  });
});
