import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { BUNDLES } from "@/lib/bundles";
import { trackEvent } from "@/lib/analytics";
import { QUICK_ANSWER_ROWS } from "./bundleAdvisorFaq";

type Journey = "umrah" | "hajj";
type Party = "solo" | "pair" | "group";

/**
 * Answers the question pilgrims actually ask before buying: how many sets do I
 * need? The interactive picker is for people; the table underneath is always in
 * the DOM, unchanged by the picker, so crawlers and answer engines can read the
 * guidance without running any JavaScript.
 */
const RECOMMENDED_QTY: Record<Journey, Record<Party, number>> = {
  umrah: { solo: 1, pair: 2, group: 3 },
  hajj: { solo: 2, pair: 3, group: 3 },
};

interface BundleAdvisorProps {
  /** Selects the matching bundle card on the shop page. */
  onSelectQty?: (qty: number) => void;
}

export const BundleAdvisor = ({ onSelectQty }: BundleAdvisorProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [journey, setJourney] = useState<Journey>("umrah");
  const [party, setParty] = useState<Party>("solo");

  const localePrefix = location.pathname.startsWith("/sv")
    ? "/sv"
    : location.pathname.startsWith("/no")
      ? "/no"
      : "";

  const qty = RECOMMENDED_QTY[journey][party];
  const bundle = useMemo(
    () => BUNDLES.find((b) => b.qty === qty) ?? BUNDLES[0],
    [qty],
  );

  const handleChoose = () => {
    trackEvent("bundle_advisor_applied", { journey, party, recommended_qty: qty });
    onSelectQty?.(qty);
  };

  const optionClass = (active: boolean) =>
    `px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
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
      <p className="text-sm text-muted-foreground mb-5">
        {t("shop.advisor.subtitle")}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 mb-5">
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
            {t("shop.advisor.partyLabel")}
          </span>
          <div className="flex gap-2" role="group" aria-label={t("shop.advisor.partyLabel")}>
            {(["solo", "pair", "group"] as Party[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setParty(option)}
                aria-pressed={party === option}
                className={optionClass(party === option)}
              >
                {t(`shop.advisor.party.${option}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-muted p-4" aria-live="polite">
        <p className="text-sm text-muted-foreground mb-1">
          {t("shop.advisor.resultPrefix")}
        </p>
        <p className="text-lg font-semibold mb-1">
          {t("shop.advisor.resultBundle", {
            label: bundle.label,
            sets: t("shop.advisor.setCount", { count: bundle.qty }),
            price: bundle.totalPrice,
          })}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {t(`shop.advisor.reason.${journey}.${party}`)}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {onSelectQty && (
            <Button size="sm" onClick={handleChoose}>
              {t("shop.advisor.cta")}
            </Button>
          )}
          <Link
            to={`${localePrefix}/blog/how-many-ihrams-do-you-need-for-hajj`}
            className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1"
            onClick={() => trackEvent("bundle_advisor_guide_click", { journey, party })}
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
