import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ArrowRight, Home } from "lucide-react";

const DonationSuccess = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const getLocalePrefix = () => {
    if (location.pathname.startsWith('/sv')) return '/sv';
    if (location.pathname.startsWith('/no')) return '/no';
    return '';
  };

  const localePrefix = getLocalePrefix();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <Heart className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('donation.success.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('donation.success.subtitle')}
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-6">
              {t('donation.success.message')}
            </p>
            
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
              <blockquote className="text-sm italic text-muted-foreground">
                {t('donation.success.hadith')}
              </blockquote>
              <cite className="text-xs text-muted-foreground block mt-2">
                {t('donation.success.hadithCite')}
              </cite>
            </div>

            <p className="text-sm text-muted-foreground">
              {t('donation.success.impact')}
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link to={`${localePrefix}/shop`}>
              <ArrowRight className="h-4 w-4 mr-2" />
              {t('donation.success.browseProducts')}
            </Link>
          </Button>
          <Button asChild className="bg-gradient-primary hover:opacity-90">
            <Link to={`${localePrefix}/`}>
              <Home className="h-4 w-4 mr-2" />
              {t('donation.success.backHome')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DonationSuccess;
