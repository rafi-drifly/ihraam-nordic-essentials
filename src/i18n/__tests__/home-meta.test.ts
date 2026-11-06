/**
 * The homepage title and description: what a searcher reads in Google before
 * they ever reach the site.
 *
 * They live in three places. scripts/prerender.mjs writes them into the HTML
 * Google downloads; SEOHead sets them again once the page's script runs, which
 * Google also executes; and index.html carries the English pair. Until Nov
 * 2026 the three disagreed ("€19 + €9 Shipping in Sweden" in the HTML, "from
 * €19" after load), and the French homepage swapped its French title for the
 * English one. The first two now read src/i18n/home-meta.json; this test
 * holds index.html to the same English text and checks the French page.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { MemoryRouter } from "react-router-dom";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { beforeAll, describe, expect, it } from "vitest";
import HOME_META from "../home-meta.json";
import manifest from "../locale-manifest.json";
import SEOHead from "@/components/SEOHead";

const ROOT = resolve(__dirname, "../../..");
const meta = HOME_META as Record<string, { title: string; description: string }>;

const unescape = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    resources: {},
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
});

describe("homepage title and description", () => {
  it("exist for every language the site serves", () => {
    for (const code of Object.keys(manifest)) {
      expect(meta[code]?.title, `${code} title`).toBeTruthy();
      expect(meta[code]?.description, `${code} description`).toBeTruthy();
    }
  });

  it("in index.html are the English pair, word for word", () => {
    const html = readFileSync(resolve(ROOT, "index.html"), "utf-8");
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
    expect(unescape(title ?? "")).toBe(meta.en.title);
    expect(unescape(description ?? "")).toBe(meta.en.description);
  });

  it("are what the prerender script writes, not a copy of its own", () => {
    const script = readFileSync(resolve(ROOT, "scripts/prerender.mjs"), "utf-8");
    expect(script).toContain("readJSON('src/i18n/home-meta.json')");
    expect(script).not.toMatch(/const HOME_TITLE\s*=/);
  });

  it("stay French on the French homepage once the page has loaded", async () => {
    await i18n.changeLanguage("fr");
    render(
      createElement(MemoryRouter, { initialEntries: ["/fr"] }, createElement(SEOHead)),
    );
    await waitFor(() => expect(document.title).toBe(meta.fr.title));
    const description = document.querySelector('meta[name="description"]')?.getAttribute("content");
    expect(description).toBe(meta.fr.description);
  });

  it("make no claim the brand manual forbids", () => {
    const text = JSON.stringify(meta).toLowerCase();
    for (const word of ["premium", "fast", "free returns", "pre-washed", "quality", "qualité"]) {
      expect(text, `"${word}" in the homepage title or description`).not.toContain(word);
    }
  });
});
