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
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-32">
        <div className="lg:col-span-4">
          <h2 className="text-[2rem] font-normal leading-[1.2] tracking-[-0.01em] text-foreground lg:text-[2.5rem]">
            {t("home.faq.title")}
          </h2>
          <p className="mt-4 text-[0.9375rem] leading-[1.6] text-foreground">{t("home.faq.subtitle")}</p>
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue="item-0"
          className="w-full border-t border-[#D3E1E1] lg:col-span-8"
        >
          {items.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="border-[#D3E1E1]">
              <AccordionTrigger className="py-5 text-left text-base font-normal text-foreground hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[0.9375rem] leading-[1.6] text-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
