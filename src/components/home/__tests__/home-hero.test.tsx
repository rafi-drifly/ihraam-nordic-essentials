/**
 * The Arabic line above the homepage headline.
 *
 * It is the opening of the Talbiyah, copied from the brand manual v2.0 (p. 11).
 * A wrong or missing vowel mark in a phrase pilgrims recite is not a typo the
 * owner will tolerate, so the exact code points are pinned here: any edit to
 * the string has to be deliberate and has to change this test too.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HomeHero } from "../HomeHero";

// لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ, written out so an editor cannot silently normalise it.
const EXPECTED = [
  0x0644, 0x064e, 0x0628, 0x064e, 0x0651, 0x064a, 0x0652, 0x0643, 0x064e, // labbayka
  0x0020,
  0x0627, 0x0644, 0x0644, 0x064e, 0x0651, 0x0647, 0x064f, 0x0645, 0x064e, 0x0651, // allahumma
  0x0020,
  0x0644, 0x064e, 0x0628, 0x064e, 0x0651, 0x064a, 0x0652, 0x0643, 0x064e, // labbayka
];

const renderHero = () =>
  render(
    <MemoryRouter>
      <HomeHero />
    </MemoryRouter>,
  );

describe("the Talbiyah in the homepage hero", () => {
  it("is the manual's text, every vowel mark in place", () => {
    const { container } = renderHero();
    const arabic = container.querySelector('[lang="ar"]');
    expect(arabic).not.toBeNull();
    const codePoints = Array.from(arabic!.textContent ?? "").map((c) => c.codePointAt(0));
    expect(codePoints).toEqual(EXPECTED);
  });

  it("is marked as right-to-left Arabic and set in Amiri", () => {
    const { container } = renderHero();
    const arabic = container.querySelector('[lang="ar"]')!;
    expect(arabic.getAttribute("dir")).toBe("rtl");
    expect(arabic.className).toContain("font-arabic");
  });

  it("never stands alone: the transliteration and meaning follow it", () => {
    renderHero();
    // Without an i18n instance the keys render as-is, which is enough to prove
    // both lines are there.
    expect(screen.getByText(/home\.hero\.talbiyahTransliteration/)).toBeInTheDocument();
    expect(screen.getByText(/home\.hero\.talbiyahMeaning/)).toBeInTheDocument();
  });

  it("sends the main button to the set choice, not to a price", () => {
    renderHero();
    const cta = screen.getByRole("link", { name: "home.hero.cta" });
    expect(cta.getAttribute("href")).toBe("#sets");
  });

  it("has every one of its letters in the Amiri subset that index.html loads", () => {
    // index.html asks Google Fonts for only the letters this line uses. A
    // letter missing there would fall back to another Arabic font mid-word.
    const html = readFileSync(resolve(__dirname, "../../../../index.html"), "utf-8");
    const match = html.match(/family=Amiri:wght@700&text=([^&"]+)/);
    expect(match, "index.html no longer loads the Amiri subset").not.toBeNull();
    const loaded = new Set(Array.from(decodeURIComponent(match![1])).map((c) => c.codePointAt(0)));
    for (const cp of EXPECTED) {
      expect(loaded.has(cp), `U+${cp.toString(16).toUpperCase()} missing from the Amiri text= list`).toBe(true);
    }
  });
});
