/**
 * Homepage locale coverage test
 *
 * Asserts that the key visible homepage UI strings - the ones the user
 * actually sees when they switch the language dropdown to English, Swedish
 * or Norwegian - resolve to the correct language in our i18n resource
 * bundles.
 *
 * Why this shape: rendering the full Home page would pull in supabase,
 * router, helmet, cart provider, image assets, and edge function calls.
 * The contract that actually breaks when localization regresses is "the
 * `home.*` translation keys exist and contain language-specific text". So
 * we initialise i18n exactly the way the app does, then assert each key
 * resolves and its content is recognisably in the expected language.
 *
 * If a future change deletes a key, hardcodes English back into a
 * component, or forgets to translate a string in sv/no, this test fails
 * loudly with the missing key path.
 */

import { describe, it, expect, beforeAll } from "vitest";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en.json";
import sv from "../locales/sv.json";
import no from "../locales/no.json";

type Locale = "en" | "sv" | "no";

// Distinctive substrings that prove the rendered text is actually in the
// target language - not an English fallback, not a typo. Each one is taken
// from a different homepage section so coverage spans hero, offers, prep
// pack, benefits, FAQ, testimonial, how-to-wear teaser, shipping strip,
// guides, and final CTA.
const EXPECTATIONS: Record<Locale, Array<{ key: string; mustContain: string }>> = {
  en: [
    { key: "home.hero.title", mustContain: "Premium Ihram for Hajj" },
    { key: "home.hero.ctaShop", mustContain: "Shop Ihram" },
    { key: "home.offers.title", mustContain: "Choose your Ihram" },
    { key: "home.offers.twoPack.cta", mustContain: "Shop 2-Pack" },
    { key: "home.offers.shippingSuffix", mustContain: "shipping" },
    { key: "home.prepPack.submit", mustContain: "Send the Pack" },
    { key: "home.prepPack.disclaimer", mustContain: "No spam" },
    { key: "home.benefits.climate.title", mustContain: "Built for the climate" },
    { key: "home.faq.title", mustContain: "Frequently asked questions" },
    { key: "home.testimonial.verified", mustContain: "Verified buyer" },
    { key: "home.howToWear.cta", mustContain: "Read the full guide" },
    { key: "home.shipping.freeEu", mustContain: "Free EU shipping" },
    { key: "home.guides.viewAll", mustContain: "View all guides" },
    { key: "home.finalCta.title", mustContain: "Ready for Hajj 2026" },
  ],
  sv: [
    { key: "home.hero.title", mustContain: "Premium Ihram för Hajj" },
    { key: "home.hero.ctaShop", mustContain: "Handla Ihram" },
    { key: "home.offers.title", mustContain: "Välj din Ihram" },
    { key: "home.offers.twoPack.cta", mustContain: "Handla 2-Pack" },
    { key: "home.offers.shippingSuffix", mustContain: "frakt" },
    { key: "home.prepPack.submit", mustContain: "Skicka paketet" },
    { key: "home.prepPack.disclaimer", mustContain: "Ingen spam" },
    { key: "home.benefits.climate.title", mustContain: "Anpassad för klimatet" },
    { key: "home.faq.title", mustContain: "Vanliga frågor" },
    { key: "home.testimonial.verified", mustContain: "Verifierad köpare" },
    { key: "home.howToWear.cta", mustContain: "Läs hela guiden" },
    { key: "home.shipping.freeEu", mustContain: "Fri EU-frakt" },
    { key: "home.guides.viewAll", mustContain: "Visa alla guider" },
    { key: "home.finalCta.title", mustContain: "Redo för Hajj 2026" },
  ],
  no: [
    { key: "home.hero.title", mustContain: "Premium Ihram for Hajj" },
    { key: "home.hero.ctaShop", mustContain: "Handle Ihram" },
    { key: "home.offers.title", mustContain: "Velg din Ihram" },
    { key: "home.offers.twoPack.cta", mustContain: "Handle 2-Pack" },
    { key: "home.offers.shippingSuffix", mustContain: "frakt" },
    { key: "home.prepPack.submit", mustContain: "Send pakken" },
    { key: "home.prepPack.disclaimer", mustContain: "Ingen spam" },
    { key: "home.benefits.climate.title", mustContain: "Tilpasset klimaet" },
    { key: "home.faq.title", mustContain: "Ofte stilte spørsmål" },
    { key: "home.testimonial.verified", mustContain: "Verifisert kjøper" },
    { key: "home.howToWear.cta", mustContain: "Les hele guiden" },
    { key: "home.shipping.freeEu", mustContain: "Gratis EU-frakt" },
    { key: "home.guides.viewAll", mustContain: "Se alle guider" },
    { key: "home.finalCta.title", mustContain: "Klar for Hajj 2026" },
  ],
};

// FAQ items live in an array; we assert the array shape and pick the first
// item as a sample of localized question/answer copy.
const FAQ_FIRST_QUESTION_CONTAINS: Record<Locale, string> = {
  en: "How many Ihram sets do I need",
  sv: "Hur många Ihram-set behöver jag",
  no: "Hvor mange Ihram-sett trenger jeg",
};

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      sv: { translation: sv },
      no: { translation: no },
    },
    lng: "en",
    fallbackLng: "en",
    supportedLngs: ["en", "sv", "no"],
    interpolation: { escapeValue: false },
  });
});

describe("Homepage localization", () => {
  for (const locale of ["en", "sv", "no"] as const) {
    describe(`${locale} locale`, () => {
      it("renders every key homepage string in the selected language", async () => {
        await i18n.changeLanguage(locale);

        for (const { key, mustContain } of EXPECTATIONS[locale]) {
          const value = i18n.t(key);
          // Catches missing keys (i18next returns the key path as fallback)
          expect(value, `Missing translation key: ${key} (locale=${locale})`).not.toBe(key);
          expect(value, `Empty translation: ${key} (locale=${locale})`).toBeTruthy();
          // Catches accidental English fallback for sv/no, and any drift in en.
          expect(
            String(value),
            `Expected ${locale} translation of "${key}" to contain "${mustContain}", got: "${value}"`,
          ).toContain(mustContain);
        }
      });

      it("has a 7-item FAQ array with localized question/answer pairs", async () => {
        await i18n.changeLanguage(locale);
        const items = i18n.t("home.faq.items", { returnObjects: true }) as Array<{ q: string; a: string }>;

        expect(Array.isArray(items)).toBe(true);
        expect(items).toHaveLength(7);
        for (let idx = 0; idx < items.length; idx++) {
          expect(items[idx].q, `FAQ item ${idx} missing q (locale=${locale})`).toBeTruthy();
          expect(items[idx].a, `FAQ item ${idx} missing a (locale=${locale})`).toBeTruthy();
        }
        expect(items[0].q).toContain(FAQ_FIRST_QUESTION_CONTAINS[locale]);
      });

      it("does not leak English copy into sv/no for translated sections", async () => {
        if (locale === "en") return; // n/a
        await i18n.changeLanguage(locale);

        // Pick a handful of strings that have very different English originals
        // and assert the translated value does NOT match the English source.
        const driftCandidates = [
          "home.hero.ctaShop",
          "home.offers.title",
          "home.prepPack.submit",
          "home.benefits.climate.title",
          "home.faq.title",
          "home.howToWear.cta",
          "home.shipping.freeEu",
          "home.finalCta.title",
        ];
        for (const key of driftCandidates) {
          const localized = i18n.t(key);
          await i18n.changeLanguage("en");
          const english = i18n.t(key);
          await i18n.changeLanguage(locale);
          expect(
            localized,
            `${locale} translation of "${key}" is identical to English ("${english}") - looks like an untranslated fallback.`,
          ).not.toBe(english);
        }
      });
    });
  }
});
