import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, Shield, Clock, MapPin, Euro } from "lucide-react";

const Shipping = () => {
  const shippingZones = [
    {
      region: "Sweden 🇸🇪",
      timeframe: "3-7 business days",
      cost: "49 SEK",
      description: "Fast domestic shipping across all regions of Sweden. Order by 2 PM for same-day processing.",
      method: "PostNord, DHL, or UPS"
    },
    {
      region: "Nordic Countries 🇳🇴🇩🇰🇫🇮",
      timeframe: "7-14 business days", 
      cost: "89 SEK",
      description: "Reliable delivery to Norway, Denmark, and Finland with full tracking support.",
      method: "International carriers"
    },
    {
      region: "European Union 🇪🇺",
      timeframe: "7-14 business days",
      cost: "99 SEK", 
      description: "Comprehensive coverage across all EU member countries with customs pre-clearance.",
      method: "Express international shipping"
    }
  ];

  const features = [
    {
      icon: <Package className="h-6 w-6 text-primary" />,
      title: "Secure Packaging",
      description: "Your Ihram is carefully packaged in protective, eco-friendly materials"
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Tracking Included",
      description: "Full tracking information provided for all shipments"
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Processing Time",
      description: "Orders processed within 1-2 business days"
    },
    {
      icon: <Euro className="h-6 w-6 text-primary" />,
      title: "Free Shipping",
      description: "Orders over 50€ qualify for free shipping"
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Shipping & Delivery
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Fast, reliable delivery across Sweden, the Nordics, and Europe. 
            Your Ihram will arrive in perfect condition, ready for your sacred journey.
          </p>
        </div>

        {/* Shipping Zones */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">
            Delivery Zones & Timeframes
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
                  <p className="text-2xl font-bold text-primary">{zone.cost}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-2">{zone.description}</p>
                  <p className="text-sm text-muted-foreground">{zone.method}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-accent/10 px-4 py-2 rounded-lg">
              <Truck className="h-5 w-5 text-accent" />
              <span className="text-accent font-medium">
                Free shipping on orders over 50€ to all destinations
              </span>
            </div>
            
            {/* Pilgrimage Tip */}
            <div className="bg-primary/10 rounded-lg p-4 max-w-2xl mx-auto">
              <h4 className="font-semibold text-primary mb-2">💡 Pilgrimage Planning Tip</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Order your Ihram at least 3-4 weeks before travel</strong> to avoid last-minute stress 
                and ensure you have time for any adjustments or replacements if needed.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">
            Shipping Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
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
              </Card>
            ))}
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-primary" />
                <span>Order Processing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Processing Times</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Monday-Friday orders: Processed same day if ordered before 2 PM CET</li>
                  <li>• Weekend orders: Processed next business day</li>
                  <li>• Quality check and packaging: 24-48 hours</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">What Happens Next?</h4>
                <ol className="space-y-1 text-sm text-muted-foreground">
                  <li>1. Order confirmation email sent immediately</li>
                  <li>2. Processing notification within 24 hours</li>
                  <li>3. Shipping confirmation with tracking number</li>
                  <li>4. Delivery to your address</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Delivery Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Delivery Methods</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Standard delivery to your door</li>
                  <li>• Signature required for orders over 200€</li>
                  <li>• Safe place delivery available upon request</li>
                  <li>• PO Box delivery not available</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">Tracking & Updates</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Real-time tracking via SMS and email</li>
                  <li>• Delivery window notifications</li>
                  <li>• Failed delivery rescheduling options</li>
                  <li>• Customer service support</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Special Circumstances */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Special Circumstances & Holiday Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Ramadan & Hajj Season</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  During peak pilgrimage seasons, we experience higher order volumes. 
                  We recommend ordering at least 2-3 weeks before your departure date.
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Hajj season: Order 3+ weeks early</li>
                  <li>• Umrah (Ramadan): Order 2+ weeks early</li>
                  <li>• Express shipping available upon request</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-3">Holiday Periods</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Shipping may be delayed during major holidays in Sweden and destination countries.
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Christmas/New Year: 2-3 days extra</li>
                  <li>• Easter holidays: 1-2 days extra</li>
                  <li>• Midsummer (Sweden): Processing delayed</li>
                  <li>• We'll notify you of any delays</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact for Shipping */}
        <Card className="bg-muted text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Questions About Shipping?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our customer service team is here to help with any shipping questions 
              or special delivery requirements for your pilgrimage preparations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:pureihraam@gmail.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Email Support
              </a>
              <a
                href="https://wa.me/46720131476"
                className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted-foreground/10 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Shipping;