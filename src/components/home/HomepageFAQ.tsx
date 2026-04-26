import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FaqItem = { q: string; a: string };

/**
 * Hook returning the localized FAQ items. Used by both the on-page accordion
 * and the JSON-LD FAQ schema in Home.tsx so they stay in sync per locale.
 */
export const useFaqItems = (): FaqItem[] => {
  const { t } = useTranslation();
  const items = t("home.faq.items", { returnObjects: true });
  return Array.isArray(items) ? (items as FaqItem[]) : [];
};

export const HomepageFAQ = () => {
  const { t } = useTranslation();
  const items = useFaqItems();

  return (
    <section className="py-14 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            {t("home.faq.title")}
          </h2>
          <p className="text-muted-foreground">{t("home.faq.subtitle")}</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {items.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
