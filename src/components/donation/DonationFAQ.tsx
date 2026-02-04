import { useTranslation } from "react-i18next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const DonationFAQ = () => {
  const { t } = useTranslation();

  const faqs = [
    {
      question: "Are donations required to buy Ihram?",
      answer: "No. Donations are completely voluntary and are not required to make a purchase. You can buy Ihram at any time without donating."
    },
    {
      question: "Do donations cover shipping and fees?",
      answer: "Yes, donations may cover shipping/packaging costs and Stripe payment processing fees. We publish detailed breakdowns in our monthly transparency reports so you know exactly where funds go."
    },
    {
      question: "Is this Zakat?",
      answer: "By default, donations are treated as Sadaqah (voluntary charity). We do not currently offer a separate Zakat option. If you have questions about Zakat eligibility, please consult with a scholar."
    },
    {
      question: "Can I donate anonymously?",
      answer: "Yes. Simply check the 'Donate anonymously' box on the donation form. Your name will not be associated with your donation in any reports or communications."
    },
    {
      question: "Do I get a receipt?",
      answer: "Yes. Stripe automatically sends a receipt email for every transaction. You can also check 'Email me a receipt' in the form to receive confirmation from us directly."
    },
    {
      question: "What if I made a mistake or want a refund?",
      answer: "We understand mistakes happen. Contact us at support@pureihram.com within 14 days of your donation, and we'll process a refund. Please include your transaction details."
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </div>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-medium text-foreground">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default DonationFAQ;
