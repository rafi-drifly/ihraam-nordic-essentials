import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useLocalePrefix } from "@/i18n/useLocale";
import { trackEvent } from "@/lib/analytics";
import { HomePhoto } from "./HomePhoto";

/**
 * The opening words of the Talbiyah, which a pilgrim says on entering Ihram.
 *
 * Copied character for character from the brand manual v2.0, p. 11 (itself
 * "as in the May 2026 post"): lam-fatha, ba-fatha-shadda, ya-sukun, kaf-fatha;
 * alif, lam, lam-fatha-shadda, ha-damma, mim-fatha-shadda. Not translated and
 * not kept in the locale files, so it can never drift per language. Shown with
 * its transliteration and meaning beneath, never on its own (manual p. 11).
 */
const TALBIYAH_OPENING = "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ";

export const HomeHero = () => {
  const { t } = useTranslation();
  const localePrefix = useLocalePrefix();

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:pb-32 lg:pt-24">
        <div className="lg:col-span-6">
          <div className="mb-10 lg:mb-12">
            <p
              lang="ar"
              dir="rtl"
              className="text-left font-arabic text-[1.75rem] font-bold leading-[1.7] text-foreground lg:text-[2rem]"
            >
              {TALBIYAH_OPENING}
            </p>
            <p className="mt-1 text-[0.9375rem] leading-relaxed text-foreground">
              {t("home.hero.talbiyahTransliteration")}
              <span className="text-muted-foreground">
                {" · "}
                {t("home.hero.talbiyahMeaning")}
              </span>
            </p>
          </div>

          <h1 className="text-foreground">
            <span className="mb-4 block text-sm font-bold text-primary">
              {t("home.hero.title")}
            </span>{" "}
            <span className="block text-[2.5rem] font-normal leading-[1.2] tracking-[-0.02em] sm:text-[3rem] lg:text-[3.5rem]">
              {t("home.hero.headline")}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-[1.6] text-muted-foreground">
            {t("home.hero.description")}
          </p>

          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <a
              href="#sets"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-[0.9375rem] font-bold text-primary-foreground transition-colors hover:bg-[#205A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t("home.hero.cta")}
            </a>
            <Link
              to={`${localePrefix}/blog`}
              onClick={() => {
                trackEvent("hero_guides_cta_clicked", {
                  location: "hero",
                  destination: "/blog",
                });
              }}
              className="inline-flex items-center gap-1.5 text-[0.9375rem] text-primary transition-colors hover:text-[#205A5A]"
            >
              {t("home.hero.ctaPrepPack")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6">
          <HomePhoto name="hero" priority frameClassName="aspect-[4/3] lg:aspect-[4/5]" />
        </div>
      </div>
    </section>
  );
};
