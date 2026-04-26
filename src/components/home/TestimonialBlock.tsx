import { useTranslation } from "react-i18next";
import { MapPin, Lock, RotateCcw } from "lucide-react";

export const TestimonialBlock = () => {
  const { t } = useTranslation();

  return (
    <section className="py-10 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-secondary/50 border border-border rounded-2xl p-6 lg:p-8">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0"
              aria-hidden="true"
            >
              MS
            </div>
            <div className="flex-1">
              <p className="text-foreground text-base lg:text-lg leading-relaxed mb-3">
                &ldquo;{t("home.testimonial.quote")}&rdquo;
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {t("home.testimonial.author")}
                </span>
                <span className="mx-2">·</span>
                {t("home.testimonial.location")}
                <span className="mx-2">·</span>
                {t("home.testimonial.verified")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
            <span>{t("home.testimonial.trust.shipping")}</span>
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Lock className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
            <span>{t("home.testimonial.trust.secure")}</span>
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <RotateCcw className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
            <span>{t("home.testimonial.trust.returns")}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
