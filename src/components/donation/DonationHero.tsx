import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Eye } from "lucide-react";

interface DonationHeroProps {
  onDonateClick: () => void;
  localePrefix: string;
}

const DonationHero = ({ onDonateClick, localePrefix }: DonationHeroProps) => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-8">
          <Heart className="h-10 w-10 text-primary" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          {t('donation.hero.title')}
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('donation.hero.subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 text-white px-8"
            onClick={onDonateClick}
          >
            <Heart className="h-5 w-5 mr-2" />
            {t('donation.cta')}
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            asChild
          >
            <Link to={`${localePrefix}/transparency`}>
              <Eye className="h-5 w-5 mr-2" />
              {t('donation.success.viewTransparency')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DonationHero;
