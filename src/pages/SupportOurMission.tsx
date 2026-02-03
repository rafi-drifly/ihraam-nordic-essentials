import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, Building2, BookOpen, Users, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DONATION_AMOUNTS = [2, 5, 10];

const SupportOurMission = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);

  const getLocalePrefix = () => {
    if (location.pathname.startsWith('/sv')) return '/sv';
    if (location.pathname.startsWith('/no')) return '/no';
    return '';
  };

  const getFinalAmount = (): number => {
    if (isCustom && customAmount) {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedAmount || 0;
  };

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount("");
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setSelectedAmount(null);
  };

  const handleDonate = async () => {
    const amount = getFinalAmount();
    if (amount < 1) {
      toast({
        title: t('common.error'),
        description: t('donation.minAmount'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-donation-checkout', {
        body: { amount }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error('Error creating donation checkout:', error);
      toast({
        title: t('common.error'),
        description: "Failed to create donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('donation.seoTitle')}</title>
        <meta name="description" content={t('donation.seoDescription')} />
      </Helmet>

      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-6">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {t('donation.hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('donation.hero.subtitle')}
            </p>
          </div>

          {/* Why Donate Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent/20 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('donation.why.affordable')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('donation.why.affordableDesc')}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent/20 mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('donation.why.masjids')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('donation.why.masjidsDesc')}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent/20 mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('donation.why.education')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('donation.why.educationDesc')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Transparency Notice */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  {t('donation.transparency')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Donation Options */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-center mb-6">
                {t('donation.chooseAmount')}
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {DONATION_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount && !isCustom ? "default" : "outline"}
                    size="lg"
                    className="h-16 text-lg"
                    onClick={() => handleAmountClick(amount)}
                  >
                    €{amount}
                  </Button>
                ))}
                <Button
                  variant={isCustom ? "default" : "outline"}
                  size="lg"
                  className="h-16 text-lg"
                  onClick={handleCustomClick}
                >
                  {t('donation.amounts.custom')}
                </Button>
              </div>

              {isCustom && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 max-w-xs mx-auto">
                    <span className="text-lg font-medium">€</span>
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder={t('donation.amounts.customPlaceholder')}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="text-center text-lg"
                    />
                  </div>
                </div>
              )}

              <Button
                size="lg"
                className="w-full bg-gradient-primary hover:opacity-90"
                onClick={handleDonate}
                disabled={loading || getFinalAmount() < 1}
              >
                <Heart className="h-5 w-5 mr-2" />
                {loading ? t('common.loading') : `${t('donation.cta')} – €${getFinalAmount().toFixed(2)}`}
              </Button>
            </CardContent>
          </Card>

          {/* Spiritual Quote */}
          <div className="text-center">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <blockquote className="text-lg italic text-muted-foreground">
                  {t('donation.quote')}
                </blockquote>
                <cite className="text-sm text-muted-foreground block mt-2">
                  {t('donation.quoteCite')}
                </cite>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportOurMission;
