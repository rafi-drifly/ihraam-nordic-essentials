import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Shield, Clock, MapPin, CheckCircle, ShoppingCart } from "lucide-react";
import { trackShippingPageView } from "@/lib/analytics";

const Shipping = () => {
  const { t } = useTranslation();

  useEffect(() => { trackShippingPageView(); }, []);

  const shippingZones = [
    {
      region: t('shipping.zones.sweden.region'),
      timeframe: t('shipping.zones.sweden.timeframe'),
      cost: t('shipping.zones.sweden.cost'),
      description: t('shipping.zones.sweden.description'),
      method: t('shipping.zones.sweden.method'),
    },
    {
      region: t('shipping.zones.nordic.region'),
      timeframe: t('shipping.zones.nordic.timeframe'),
      cost: t('shipping.zones.nordic.cost'),
      description: t('shipping.zones.nordic.description'),
      method: t('shipping.zones.nordic.method'),
    },
    {
      region: t('shipping.zones.eu.region'),
      timeframe: t('shipping.zones.eu.timeframe'),
      cost: t('shipping.zones.eu.cost'),
      description: t('shipping.zones.eu.description'),
      method: t('shipping.zones.eu.method'),
    },
  ];

  const steps = [
    {
      icon: <ShoppingCart className="h-6 w-6 text-primary" />,
      title: t('shipping.features.packaging.title', 'Place Your Order'),
      description: t('shipping.steps.order', 'Choose your bundle and complete checkout securely via Stripe.'),
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: t('shipping.features.processing.title'),
      description: t('shipping.features.processing.description'),
    },
    {
      icon: <Package className="h-6 w-6 text-primary" />,
      title: t('shipping.features.tracking.title'),
      description: t('shipping.features.tracking.description'),
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      title: t('shipping.features.free.title'),
      description: t('shipping.features.free.description'),
    },
  ];

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t('shipping.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('shipping.subtitle', 'All orders ship from Sweden. Shipping cost is shown clearly at checkout.')}
          </p>
        </div>

        {/* Shipped from Sweden */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-3">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">
              {t('shipping.shippedFrom', 'All orders are packed and shipped from Sweden')}
            </span>
          </div>
        </div>

        {/* Where We Deliver */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">
            {t('shipping.zones.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shippingZones.map((zone, index) => (
              <Card key={index} className="relative hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <Badge variant="secondary" className="text-sm">
                      {zone.timeframe}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{zone.region}</CardTitle>
                  <p className="text-lg font-semibold text-primary">{zone.cost}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-2">{zone.description}</p>
                  <p className="text-sm text-muted-foreground">{zone.method}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How Shipping Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">
            {t('shipping.howItWorks', 'How Shipping Works')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Planning Tip */}
        <div className="mb-16">
          <div className="bg-primary/10 rounded-lg p-6 max-w-2xl mx-auto text-center">
            <h4 className="font-semibold text-primary mb-2">{t('shipping.tip.title')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('shipping.tip.description')}
            </p>
          </div>
        </div>

        {/* Order Processing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-primary" />
                <span>{t('shipping.orderProcessing.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t('shipping.orderProcessing.next.title')}</h4>
                <ol className="space-y-1 text-sm text-muted-foreground">
                  <li>1. {t('shipping.orderProcessing.next.step1')}</li>
                  <li>2. {t('shipping.orderProcessing.next.step2')}</li>
                  <li>3. {t('shipping.orderProcessing.next.step3')}</li>
                  <li>4. {t('shipping.orderProcessing.next.step4')}</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>{t('shipping.deliveryInfo.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t('shipping.deliveryInfo.tracking.title')}</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• {t('shipping.deliveryInfo.tracking.realTime')}</li>
                  <li>• {t('shipping.deliveryInfo.tracking.window')}</li>
                  <li>• {t('shipping.deliveryInfo.tracking.support')}</li>
                </ul>
              </div>
              <div>
                <p className="text-sm text-muted-foreground italic">
                  {t('shipping.peakNote', 'During peak seasons (Hajj/Ramadan), we recommend ordering 2–3 weeks before your departure.')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions / Contact CTA */}
        <Card className="bg-muted text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {t('shipping.support.title')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {t('shipping.support.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@pureihraam.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                {t('shipping.support.email')}
              </a>
              <a
                href="https://wa.me/46720131476"
                className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted-foreground/10 transition-colors"
              >
                {t('shipping.support.whatsapp')}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Shipping;
