import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ_ITEMS = [
  {
    q: "How many Ihram sets do I need for Hajj?",
    a: "Most pilgrims wear 2 - one for travel, one kept fresh for the major rites. We recommend our 2-Pack at €37.",
  },
  {
    q: "What is your Ihram made of?",
    a: "100% lightweight microfiber. It is breathable, fast-drying, and stays cool in Makkah's heat - better suited to Hajj weather than heavy cotton.",
  },
  {
    q: "How fast do you ship?",
    a: "Orders ship from Sweden within 1 business day. Most EU customers receive their Ihram in 2-4 business days.",
  },
  {
    q: "Do you ship outside the EU?",
    a: "Yes - we ship across Europe and beyond. Times and rates are calculated at checkout.",
  },
  {
    q: "Can I return my Ihram if it doesn't fit?",
    a: "Yes. If it is unworn, you have 14 days to return it for a full refund - no questions asked.",
  },
  {
    q: "Is Ihram allowed to have machine-stitched edges?",
    a: "Yes. The Sunnah is that Ihram be unstitched as a garment - meaning two separate pieces of cloth wrapped, not sewn into a shape like trousers. Hemmed edges to prevent fraying are not the same thing and are accepted by all schools of fiqh.",
  },
  {
    q: "Do you offer bulk pricing for mosques and Hajj agencies?",
    a: "Yes. For groups of 10+ pilgrims, contact us for custom pricing and group delivery.",
  },
];

export const HomepageFAQ = () => {
  return (
    <section className="py-14 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground">
            Quick answers to what most pilgrims ask before ordering.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, idx) => (
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
