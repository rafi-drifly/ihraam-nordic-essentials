import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CalendarDays,
  Truck,
  RefreshCw,
  ShieldCheck,
  Mail,
  Package,
  MapPin,
  Clock,
  Camera,
  AlertTriangle,
} from "lucide-react";
import ReturnRequestDialog from "@/components/returns/ReturnRequestDialog";

type RequestType = "return" | "exchange" | "issue";

const Returns = () => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<RequestType>("return");

  const openDialog = (type: RequestType) => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const summaryCards = [
    {
      icon: <CalendarDays className="h-6 w-6 text-primary" />,
      title: t("returns.cards.withdrawal.title"),
      description: t("returns.cards.withdrawal.description"),
    },
    {
      icon: <Truck className="h-6 w-6 text-primary" />,
      title: t("returns.cards.shipping.title"),
      description: t("returns.cards.shipping.description"),
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-primary" />,
      title: t("returns.cards.exchanges.title"),
      description: t("returns.cards.exchanges.description"),
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: t("returns.cards.defective.title"),
      description: t("returns.cards.defective.description"),
    },
  ];

  const steps = [
    {
      icon: <Mail className="h-5 w-5 text-primary-foreground" />,
      title: t("returns.steps.step1.title"),
      description: t("returns.steps.step1.description"),
    },
    {
      icon: <Package className="h-5 w-5 text-primary-foreground" />,
      title: t("returns.steps.step2.title"),
      description: t("returns.steps.step2.description"),
    },
    {
      icon: <MapPin className="h-5 w-5 text-primary-foreground" />,
      title: t("returns.steps.step3.title"),
      description: t("returns.steps.step3.description"),
    },
    {
      icon: <Clock className="h-5 w-5 text-primary-foreground" />,
      title: t("returns.steps.step4.title"),
      description: t("returns.steps.step4.description"),
    },
  ];

  const faqItems = [
    { key: "triedOn", q: t("returns.faq.triedOn.question"), a: t("returns.faq.triedOn.answer") },
    { key: "whoPays", q: t("returns.faq.whoPays.question"), a: t("returns.faq.whoPays.answer") },
    { key: "refundTime", q: t("returns.faq.refundTime.question"), a: t("returns.faq.refundTime.answer") },
    { key: "sizeExchange", q: t("returns.faq.sizeExchange.question"), a: t("returns.faq.sizeExchange.answer") },
    { key: "originalShipping", q: t("returns.faq.originalShipping.question"), a: t("returns.faq.originalShipping.answer") },
    { key: "damaged", q: t("returns.faq.damaged.question"), a: t("returns.faq.damaged.answer") },
  ];

  return (
    <>
      <Helmet>
        <title>Returns &amp; Exchanges | PureIhram</title>
        <meta
          name="description"
          content="Read PureIhram's transparent return and exchange policy for Sweden and Nordic countries. 14-day withdrawal, easy size swaps, clear shipping rules."
        />
      </Helmet>

      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {t("returns.hero.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("returns.hero.subtitle")}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {summaryCards.map((card, i) => (
              <Card key={i} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">{card.icon}</div>
                  <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How to Return */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">
              {t("returns.howTo.title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mb-4">
                    <span className="text-primary-foreground font-bold">{i + 1}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button onClick={() => openDialog("return")} size="lg">
                {t("returns.howTo.cta")}
              </Button>
            </div>
          </div>

          {/* Return Address */}
          <div className="bg-primary/10 rounded-lg p-6 max-w-xl mx-auto text-center mb-16">
            <MapPin className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="font-semibold text-foreground mb-1">{t("returns.address.label")}</p>
            <p className="text-sm text-muted-foreground">Innovation Stable, 751 83 Uppsala, Sweden</p>
            <p className="text-xs text-muted-foreground mt-2 italic">{t("returns.address.trackNote")}</p>
          </div>

          {/* Exchanges Section */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                <span>{t("returns.exchanges.title")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {t("returns.exchanges.point1")}</li>
                <li>• {t("returns.exchanges.point2")}</li>
                <li>• {t("returns.exchanges.point3")}</li>
              </ul>
              <Button onClick={() => openDialog("exchange")} variant="outline">
                {t("returns.exchanges.cta")}
              </Button>
            </CardContent>
          </Card>

          {/* Refunds Section */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle>{t("returns.refunds.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• {t("returns.refunds.method")}</p>
              <p>• {t("returns.refunds.timeline")}</p>
              <p>• {t("returns.refunds.shippingRefund")}</p>
            </CardContent>
          </Card>

          {/* Condition / Hygiene */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle>{t("returns.conditions.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• {t("returns.conditions.inspect")}</p>
              <p>• {t("returns.conditions.valueReduction")}</p>
              <p>• {t("returns.conditions.unused")}</p>
            </CardContent>
          </Card>

          {/* Defective / Wrong Item */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <span>{t("returns.defective.title")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Camera className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  {t("returns.defective.photos")}
                </li>
                <li>• {t("returns.defective.weCover")}</li>
              </ul>
              <Button onClick={() => openDialog("issue")} variant="outline">
                {t("returns.defective.cta")}
              </Button>
            </CardContent>
          </Card>

          {/* FAQ */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">
              {t("returns.faq.title")}
            </h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item) => (
                  <AccordionItem key={item.key} value={item.key}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Box */}
          <Card className="bg-muted text-center">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                {t("returns.contact.title")}
              </h3>
              <p className="text-muted-foreground mb-2">
                {t("returns.contact.email")}: <a href="mailto:support@pureihraam.com" className="text-primary underline">support@pureihraam.com</a>
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {t("returns.contact.responseTime")}
              </p>
              <p className="text-xs text-muted-foreground italic">
                {t("returns.contact.orderReminder")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReturnRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultType={dialogType}
      />
    </>
  );
};

export default Returns;
