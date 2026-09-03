import { useTranslation } from "react-i18next";

/**
 * The three cases worth publishing as a plain answer, shared by the advisor's
 * static table and the Shop page's FAQPage schema so the two cannot drift.
 */
export const QUICK_ANSWER_ROWS: Array<{ key: string; qty: number }> = [
  { key: "umrahSolo", qty: 1 },
  { key: "hajjSolo", qty: 2 },
  { key: "group", qty: 3 },
];

/** FAQPage entries mirroring the advisor's static answers. */
export function useBundleAdvisorFaq() {
  const { t } = useTranslation();
  return QUICK_ANSWER_ROWS.map((row) => ({
    "@type": "Question",
    name: t(`shop.advisor.quickAnswer.${row.key}.q`),
    acceptedAnswer: {
      "@type": "Answer",
      text: t(`shop.advisor.quickAnswer.${row.key}.a`),
    },
  }));
}
