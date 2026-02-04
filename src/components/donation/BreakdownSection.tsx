import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Heart, Building2, Package, CreditCard, Users, Eye } from "lucide-react";

interface BreakdownSectionProps {
  localePrefix: string;
}

const BreakdownSection = ({ localePrefix }: BreakdownSectionProps) => {
  const { t } = useTranslation();

  // Placeholder breakdown - this can be updated from CMS
  const breakdown = [
    { icon: Heart, label: "Needy Projects", percentage: "40%", color: "text-red-500" },
    { icon: Building2, label: "Mosque Support", percentage: "30%", color: "text-blue-500" },
    { icon: Package, label: "Shipping/Packaging", percentage: "15%", color: "text-orange-500" },
    { icon: CreditCard, label: "Stripe Fees", percentage: "10%", color: "text-purple-500" },
    { icon: Users, label: "Operations", percentage: "5%", color: "text-gray-500" }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Where Your Donation Goes
          </h2>
        </div>

        {/* Amanah + Transparency Box */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('donation.transparency')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {breakdown.map((item, index) => (
            <Card key={index} className="text-center">
              <CardContent className="py-4 px-3">
                <item.icon className={`h-5 w-5 ${item.color} mx-auto mb-2`} />
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className="text-lg font-bold text-foreground">{item.percentage}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground mb-4">
          Percentages vary month to month; see transparency reports for exact figures.
        </p>

        <div className="text-center">
          <Button variant="outline" size="sm" asChild>
            <Link to={`${localePrefix}/transparency`}>
              <Eye className="h-4 w-4 mr-2" />
              View Full Transparency Reports
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BreakdownSection;
