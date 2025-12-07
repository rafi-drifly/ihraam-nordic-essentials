import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, Shield, Clock, MapPin, Euro } from "lucide-react";
const Shipping = () => {
  const {
    t
  } = useTranslation();
  const shippingZones = [{
    region: t('shipping.zones.sweden.region'),
    timeframe: t('shipping.zones.sweden.timeframe'),
    cost: t('shipping.zones.sweden.cost'),
    description: t('shipping.zones.sweden.description'),
    method: t('shipping.zones.sweden.method')
  }, {
    region: t('shipping.zones.nordic.region'),
    timeframe: t('shipping.zones.nordic.timeframe'),
    cost: t('shipping.zones.nordic.cost'),
    description: t('shipping.zones.nordic.description'),
    method: t('shipping.zones.nordic.method')
  }, {
    region: t('shipping.zones.eu.region'),
    timeframe: t('shipping.zones.eu.timeframe'),
    cost: t('shipping.zones.eu.cost'),
    description: t('shipping.zones.eu.description'),
    method: t('shipping.zones.eu.method')
  }];
  const features = [{
    icon: <Package className="h-6 w-6 text-primary" />,
    title: t('shipping.features.packaging.title'),
    description: t('shipping.features.packaging.description')
  }, {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: t('shipping.features.tracking.title'),
    description: t('shipping.features.tracking.description')
  }, {
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: t('shipping.features.processing.title'),
    description: t('shipping.features.processing.description')
  }, {
    icon: <Euro className="h-6 w-6 text-primary" />,
    title: t('shipping.features.free.title'),
    description: t('shipping.features.free.description')
  }];
  return <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t('shipping.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('shipping.subtitle')}
          </p>
        </div>

        {/* Shipping Zones */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">
            {t('shipping.zones.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shippingZones.map((zone, index) => <Card key={index} className="relative hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <Badge variant="secondary" className="text-sm">
                      {zone.timeframe}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{zone.region}</CardTitle>
                  <p className="text-2xl font-bold text-primary">{zone.cost}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-2">{zone.description}</p>
                  <p className="text-sm text-muted-foreground">{zone.method}</p>
                </CardContent>
              </Card>)}
          </div>

          <div className="mt-8 text-center space-y-4">
            

            {/* Pilgrimage Tip */}
            <div className="bg-primary/10 rounded-lg p-4 max-w-2xl mx-auto">
              <h4 className="font-semibold text-primary mb-2">{t('shipping.tip.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('shipping.tip.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">
            {t('shipping.features.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>)}
          </div>
        </div>

        {/* Detailed Information */}
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
                <h4 className="font-semibold text-foreground mb-2">{t('shipping.orderProcessing.times.title')}</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• {t('shipping.orderProcessing.times.weekday')}</li>
                  <li>• {t('shipping.orderProcessing.times.weekend')}</li>
                  <li>• {t('shipping.orderProcessing.times.quality')}</li>
                </ul>
              </div>

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
                <MapPin className="h-5 w-5 text-primary" />
                <span>{t('shipping.deliveryInfo.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t('shipping.deliveryInfo.methods.title')}</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• {t('shipping.deliveryInfo.methods.door')}</li>
                  <li>• {t('shipping.deliveryInfo.methods.signature')}</li>
                  <li>• {t('shipping.deliveryInfo.methods.safePlace')}</li>
                  <li>• {t('shipping.deliveryInfo.methods.poBox')}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">{t('shipping.deliveryInfo.tracking.title')}</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• {t('shipping.deliveryInfo.tracking.realTime')}</li>
                  <li>• {t('shipping.deliveryInfo.tracking.window')}</li>
                  <li>• {t('shipping.deliveryInfo.tracking.failed')}</li>
                  <li>• {t('shipping.deliveryInfo.tracking.support')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Special Circumstances */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>{t('shipping.special.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">{t('shipping.special.ramadan.title')}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('shipping.special.ramadan.description')}
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• {t('shipping.special.ramadan.hajj')}</li>
                  <li>• {t('shipping.special.ramadan.umrah')}</li>
                  <li>• {t('shipping.special.ramadan.express')}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">{t('shipping.special.holidays.title')}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('shipping.special.holidays.description')}
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• {t('shipping.special.holidays.christmas')}</li>
                  <li>• {t('shipping.special.holidays.easter')}</li>
                  <li>• {t('shipping.special.holidays.midsummer')}</li>
                  <li>• {t('shipping.special.holidays.notify')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact for Shipping */}
        <Card className="bg-muted text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {t('shipping.support.title')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {t('shipping.support.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:pureihraam@gmail.com" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                {t('shipping.support.email')}
              </a>
              <a href="https://wa.me/46720131476" className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted-foreground/10 transition-colors">
                {t('shipping.support.whatsapp')}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Shipping;