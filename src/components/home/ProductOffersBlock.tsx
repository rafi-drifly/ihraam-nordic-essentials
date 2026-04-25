import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Offer {
  title: string;
  price: string;
  saves?: string;
  description: string;
  badge?: string;
  highlighted?: boolean;
}

const OFFERS: Offer[] = [
  {
    title: "Single Set",
    price: "€19",
    description: "One complete set (Izaar + Ridaa). Ideal for Umrah or first-time buyers.",
  },
  {
    title: "2-Pack",
    price: "€37",
    saves: "Save €1",
    description: "Most pilgrims wear 2 Ihrams during Hajj - one for travel, one fresh.",
    badge: "Most Popular",
    highlighted: true,
  },
  {
    title: "3-Pack",
    price: "€55",
    saves: "Save €2",
    description: "For family groups, mosque pre-orders, or an extra spare.",
    badge: "Best Value",
  },
];

export const ProductOffersBlock = () => {
  const location = useLocation();
  const localePrefix = location.pathname.startsWith("/sv")
    ? "/sv"
    : location.pathname.startsWith("/no")
    ? "/no"
    : "";

  return (
    <section className="py-14 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Choose your Ihram
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Single sets for Umrah, bundles for Hajj. + shipping calculated at checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OFFERS.map((offer) => (
            <Card
              key={offer.title}
              className={`relative border shadow-sm hover:shadow-md transition-shadow ${
                offer.highlighted ? "border-primary border-2" : "border-border"
              }`}
            >
              {offer.badge && (
                <Badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                  variant={offer.highlighted ? "default" : "secondary"}
                >
                  {offer.badge}
                </Badge>
              )}
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">{offer.title}</h3>
                <div className="mb-1">
                  <span className="text-4xl font-bold text-foreground">{offer.price}</span>
                  <span className="text-sm text-muted-foreground"> + shipping</span>
                </div>
                {offer.saves && (
                  <p className="text-sm text-primary font-medium mb-3">{offer.saves}</p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 min-h-[3.5rem]">
                  {offer.description}
                </p>
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <Link to={`${localePrefix}/shop`}>Shop now</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Free with every order: Pure Ihram Hajj 2026 Prep Pack - printable checklist, dua list,
          packing guide.
        </p>
      </div>
    </section>
  );
};
