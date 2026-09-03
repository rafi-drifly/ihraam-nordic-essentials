import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { getBundlePrice } from "@/lib/bundles";
import { trackEvent } from "@/lib/analytics";
import { MAX_TRAVELLERS, recommendedSets, SETS_PER_PERSON, type Journey } from "@/lib/setsAdvice";
import { QUICK_ANSWER_ROWS } from "./bundleAdvisorFaq";

/**
 * Answers the question pilgrims actually ask before buying: how many sets do I
 * need? The picker is for people; the answers underneath are always in the DOM,
 * unchanged by it, so crawlers and answer engines can read the guidance without
 * running any JavaScript.
 */
interface BundleAdvisorProps {
  /** Applies the recommended quantity, not a fixed bundle tier. */
  onApplyQty?: (qty: number) => void;
}

export const BundleAdvisor = ({ onApplyQty }: BundleAdvisorProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [journey, setJourney] = useState<Journey>("umrah");
  const [travellers, setTravellers] = useState(1);

  const localePrefix = location.pathname.startsWith("/sv")
    ? "/sv"
    : location.pathname.startsWith("/no")
      ? "/no"
      : "";

  const qty = recommendedSets(journey, travellers);
  const price = getBundlePrice(qty);

  const handleApply = () => {
    trackEvent("bundle_advisor_applied", { journey, travellers, recommended_qty: qty });
    onApplyQty?.(qty);
  };

  const optionClass = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-background text-foreground border-border hover:border-primary/50"
    }`;

  return (
    <section
      className="rounded-2xl border border-border bg-background p-6 mb-8"
      aria-labelledby="bundle-advisor-heading"
    >
      <h3 id="bundle-advisor-heading" className="text-xl font-semibold mb-1">
        {t("shop.advisor.title")}
      </h3>
      <p className="text-sm text-muted-foreground mb-5">{t("shop.advisor.subtitle")}</p>

      <div className="grid gap-5 sm:grid-cols-2 mb-5">
        <div>
          <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            {t("shop.advisor.journeyLabel")}
          </span>
          <div className="flex gap-2" role="group" aria-label={t("shop.advisor.journeyLabel")}>
            {(["umrah", "hajj"] as Journey[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setJourney(option)}
                aria-pressed={journey === option}
                className={optionClass(journey === option)}
              >
                {t(`shop.advisor.journey.${option}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            {t("shop.advisor.travellersLabel")}
          </span>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              aria-label={t("shop.advisor.fewerTravellers")}
              disabled={travellers <= 1}
              onClick={() => setTravellers((n) => Math.max(1, n - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="min-w-[2.5rem] text-center text-lg font-semibold" aria-live="polite">
              {travellers}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              aria-label={t("shop.advisor.moreTravellers")}
              disabled={travellers >= MAX_TRAVELLERS}
              onClick={() => setTravellers((n) => Math.min(MAX_TRAVELLERS, n + 1))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-muted p-4" aria-live="polite">
        <p className="text-sm text-muted-foreground mb-1">{t("shop.advisor.resultPrefix")}</p>
        <p className="text-lg font-semibold mb-1">
          {t("shop.advisor.resultSets", {
            sets: t("shop.advisor.setCount", { count: qty }),
            price,
          })}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {t(`shop.advisor.reason.${journey}`, {
            perPerson: SETS_PER_PERSON[journey],
            count: travellers,
          })}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {onApplyQty && (
            <Button size="sm" onClick={handleApply}>
              {t("shop.advisor.cta", { sets: t("shop.advisor.setCount", { count: qty }) })}
            </Button>
          )}
          <Link
            to={`${localePrefix}/blog/how-many-ihrams-do-you-need-for-hajj`}
            className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1"
            onClick={() => trackEvent("bundle_advisor_guide_click", { journey, travellers })}
          >
            {t("shop.advisor.guideLink")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Static so the answer is readable without JavaScript. */}
      <div className="mt-5">
        <h4 className="text-sm font-semibold mb-2">{t("shop.advisor.quickAnswerTitle")}</h4>
        <dl className="text-sm divide-y divide-border border-t border-border">
          {QUICK_ANSWER_ROWS.map((row) => (
            <div key={row.key} className="py-2 sm:flex sm:gap-4">
              <dt className="font-medium sm:w-1/3">{t(`shop.advisor.quickAnswer.${row.key}.q`)}</dt>
              <dd className="text-muted-foreground sm:w-2/3">
                {t(`shop.advisor.quickAnswer.${row.key}.a`)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};
