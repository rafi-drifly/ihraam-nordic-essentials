import { useTranslation } from "react-i18next";
import { useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Download, ArrowLeft, TrendingUp, Heart, Building2, Package, CreditCard, Users } from "lucide-react";

// Static data structure - easily updatable
const TRANSPARENCY_REPORTS = [
  {
    id: "2026-01",
    monthYear: "January 2026",
    donationsReceived: 1250.00,
    stripeFees: 45.50,
    shippingPackaging: 180.00,
    mosqueProgram: 400.00,
    needyProjects: 500.00,
    operations: 124.50,
    notes: "Supported 3 mosques in Sweden and funded winter relief in Syria.",
    proofLinks: []
  },
  {
    id: "2025-12",
    monthYear: "December 2025",
    donationsReceived: 980.00,
    stripeFees: 35.75,
    shippingPackaging: 150.00,
    mosqueProgram: 350.00,
    needyProjects: 380.00,
    operations: 64.25,
    notes: "Provided Ihram sets to 2 mosques in Norway. Supported food distribution in Gaza.",
    proofLinks: []
  }
];

const Transparency = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const getLocalePrefix = () => {
    if (location.pathname.startsWith('/sv')) return '/sv';
    if (location.pathname.startsWith('/no')) return '/no';
    return '';
  };
  const localePrefix = getLocalePrefix();

  // Calculate totals
  const totals = TRANSPARENCY_REPORTS.reduce((acc, report) => ({
    donations: acc.donations + report.donationsReceived,
    stripeFees: acc.stripeFees + report.stripeFees,
    shipping: acc.shipping + report.shippingPackaging,
    mosque: acc.mosque + report.mosqueProgram,
    needy: acc.needy + report.needyProjects,
    operations: acc.operations + report.operations
  }), { donations: 0, stripeFees: 0, shipping: 0, mosque: 0, needy: 0, operations: 0 });

  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`;

  return (
    <>
      <Helmet>
        <title>{t('transparency.seoTitle')}</title>
        <meta name="description" content={t('transparency.seoDescription')} />
      </Helmet>

      <div className="min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`${localePrefix}/support-our-mission`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('transparency.backToDonation')}
              </Link>
            </Button>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {t('transparency.hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('transparency.hero.subtitle')}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            <Card className="text-center">
              <CardContent className="pt-4 pb-3">
                <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">{t('transparency.summary.totalReceived')}</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(totals.donations)}</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4 pb-3">
                <Heart className="h-5 w-5 text-red-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">{t('transparency.summary.needyProjects')}</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(totals.needy)}</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4 pb-3">
                <Building2 className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">{t('transparency.summary.mosqueProgram')}</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(totals.mosque)}</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4 pb-3">
                <Package className="h-5 w-5 text-orange-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">{t('transparency.summary.shipping')}</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(totals.shipping)}</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4 pb-3">
                <CreditCard className="h-5 w-5 text-purple-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">{t('transparency.summary.stripeFees')}</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(totals.stripeFees)}</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4 pb-3">
                <Users className="h-5 w-5 text-gray-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">{t('transparency.summary.operations')}</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(totals.operations)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Reports */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">{t('transparency.reports.title')}</h2>
            
            <div className="space-y-6">
              {TRANSPARENCY_REPORTS.map((report) => (
                <Card key={report.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{report.monthYear}</CardTitle>
                      <Badge variant="secondary">
                        <FileText className="h-3 w-3 mr-1" />
                        {t('transparency.reports.verified')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">{t('transparency.reports.received')}</p>
                        <p className="text-sm font-semibold text-green-600">{formatCurrency(report.donationsReceived)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('transparency.reports.needy')}</p>
                        <p className="text-sm font-semibold">{formatCurrency(report.needyProjects)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('transparency.reports.mosque')}</p>
                        <p className="text-sm font-semibold">{formatCurrency(report.mosqueProgram)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('transparency.reports.shipping')}</p>
                        <p className="text-sm font-semibold">{formatCurrency(report.shippingPackaging)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('transparency.reports.stripe')}</p>
                        <p className="text-sm font-semibold">{formatCurrency(report.stripeFees)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('transparency.reports.ops')}</p>
                        <p className="text-sm font-semibold">{formatCurrency(report.operations)}</p>
                      </div>
                    </div>
                    
                    {report.notes && (
                      <div className="bg-muted/50 rounded-lg p-3 mt-4">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">{t('transparency.reports.notes')}:</span> {report.notes}
                        </p>
                      </div>
                    )}

                    {report.proofLinks.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {report.proofLinks.map((link, idx) => (
                          <Button key={idx} variant="outline" size="sm" asChild>
                            <a href={link} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3 w-3 mr-1" />
                              {t('transparency.reports.download')}
                            </a>
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Amanah Statement */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-3">{t('transparency.amanah.title')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('transparency.amanah.text')}
              </p>
              <p className="text-sm text-muted-foreground italic">
                {t('transparency.amanah.quote')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Transparency;
