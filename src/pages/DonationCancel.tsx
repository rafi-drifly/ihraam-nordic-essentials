import { useTranslation } from "react-i18next";
import { useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowRight, Mail, Heart } from "lucide-react";

const DonationCancel = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const getLocalePrefix = () => {
    if (location.pathname.startsWith('/sv')) return '/sv';
    if (location.pathname.startsWith('/no')) return '/no';
    return '';
  };
  const localePrefix = getLocalePrefix();

  return (
    <>
      <Helmet>
        <title>{t('donationCancel.seoTitle')}</title>
      </Helmet>

      <div className="min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-muted mb-6">
              <XCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('donationCancel.title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('donationCancel.subtitle')}
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-6">
                {t('donationCancel.message')}
              </p>
              
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  {t('donationCancel.noCharge')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-gradient-primary hover:opacity-90">
                  <Link to={`${localePrefix}/support-our-mission`}>
                    <Heart className="h-4 w-4 mr-2" />
                    {t('donationCancel.tryAgain')}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to={`${localePrefix}/shop`}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {t('donationCancel.browseProducts')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="border-muted">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    {t('donationCancel.needHelp.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('donationCancel.needHelp.message')}
                  </p>
                  <Button variant="link" className="h-auto p-0 text-primary" asChild>
                    <Link to={`${localePrefix}/contact`}>
                      {t('donationCancel.needHelp.contactUs')}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DonationCancel;
