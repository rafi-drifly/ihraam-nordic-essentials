import { useTranslation } from "react-i18next";
import { HomePhoto } from "./HomePhoto";

// Every line is on the brand manual's verified list (p. 15) or its product
// page (p. 18). Nothing goes in here that Rafi has not confirmed.
const SPECS = ["material", "size", "washing", "included"] as const;

/** What the set is: one idea, one photo. Replaces the old icon-card row. */
export const TheSet = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-secondary">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-32">
        <div className="lg:col-span-5">
          <HomePhoto name="cloth" frameClassName="aspect-[4/5]" />
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <p className="mb-4 text-sm font-bold text-primary">{t("home.set.eyebrow")}</p>
          <h2 className="text-[2rem] font-normal leading-[1.2] tracking-[-0.01em] text-foreground lg:text-[2.5rem]">
            {t("home.set.title")}
          </h2>
          <p className="mt-6 text-lg leading-[1.6] text-foreground">{t("home.set.body")}</p>

          <dl className="mt-10 border-t border-[#D3E1E1]">
            {SPECS.map((key) => (
              <div
                key={key}
                className="grid grid-cols-1 gap-1 border-b border-[#D3E1E1] py-4 sm:grid-cols-3 sm:gap-6"
              >
                <dt className="text-sm font-bold text-foreground">
                  {t(`home.set.specs.${key}.label`)}
                </dt>
                <dd className="text-[0.9375rem] leading-[1.6] text-foreground sm:col-span-2">
                  {t(`home.set.specs.${key}.value`)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};
