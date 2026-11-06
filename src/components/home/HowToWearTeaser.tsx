import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useLocalePrefix } from "@/i18n/useLocale";
import { HomePhoto } from "./HomePhoto";

export const HowToWearTeaser = () => {
  const { t } = useTranslation();
  // Was a hard-coded /sv and /no ternary, which sent French visitors to the
  // English guide.
  const localePrefix = useLocalePrefix();

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-32">
        <div className="lg:col-span-5">
          <HomePhoto name="wear" frameClassName="aspect-[4/5]" />
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <h2 className="text-[2rem] font-normal leading-[1.2] tracking-[-0.01em] text-foreground lg:text-[2.5rem]">
            {t("home.howToWear.title")}
          </h2>
          <p className="mt-6 text-lg leading-[1.6] text-muted-foreground">
            {t("home.howToWear.body")}
          </p>
          <Link
            to={`${localePrefix}/blog/how-to-wear-ihram`}
            className="group mt-8 inline-flex items-center gap-2 text-[0.9375rem] font-bold text-primary transition-colors hover:text-[#205A5A]"
          >
            {t("home.howToWear.cta")}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};
