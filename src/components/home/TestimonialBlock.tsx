import { useTranslation } from "react-i18next";

/**
 * One buyer's own words, set as a quiet quote. No box, no initials badge, and
 * no trust row: shipping, payment and returns are said once, by the set choice.
 */
export const TestimonialBlock = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-white">
      <figure className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
        <blockquote className="text-[1.375rem] font-normal leading-[1.5] text-foreground lg:text-[1.75rem]">
          <p>&ldquo;{t("home.testimonial.quote")}&rdquo;</p>
        </blockquote>
        <figcaption className="mt-8 text-sm text-foreground">
          <span className="font-bold">{t("home.testimonial.author")}</span>
          <span className="mx-2" aria-hidden="true">·</span>
          {t("home.testimonial.location")}
          <span className="mx-2" aria-hidden="true">·</span>
          {t("home.testimonial.verified")}
        </figcaption>
      </figure>
    </section>
  );
};
