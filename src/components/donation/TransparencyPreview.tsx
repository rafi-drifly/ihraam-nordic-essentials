import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, ArrowRight } from "lucide-react";

interface TransparencyPreviewProps {
  localePrefix: string;
}

// Latest report preview data
const LATEST_REPORT = {
  month: "January 2026",
  donationsReceived: 1250.00,
  spentOnPrograms: 900.00,
  shippingPackaging: 180.00,
  stripeFees: 45.50,
  note: "Supported 3 mosques in Sweden and funded winter relief in Syria."
};

const TransparencyPreview = ({ localePrefix }: TransparencyPreviewProps) => {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Eye className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Latest Update
            </h2>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{LATEST_REPORT.month}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                {t('transparency.reports.verified')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Donations Received</p>
                <p className="text-lg font-semibold text-green-600">€{LATEST_REPORT.donationsReceived.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Spent on Programs</p>
                <p className="text-lg font-semibold">€{LATEST_REPORT.spentOnPrograms.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Shipping/Packaging</p>
                <p className="text-lg font-semibold">€{LATEST_REPORT.shippingPackaging.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stripe Fees</p>
                <p className="text-lg font-semibold">€{LATEST_REPORT.stripeFees.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Note:</span> {LATEST_REPORT.note}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button asChild>
            <Link to={`${localePrefix}/transparency`}>
              View Full Transparency Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TransparencyPreview;
