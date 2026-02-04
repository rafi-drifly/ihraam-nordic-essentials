import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const MobileDonationBar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Get locale prefix for links
  const getLocalePrefix = () => {
    if (location.pathname.startsWith('/sv')) return '/sv';
    if (location.pathname.startsWith('/no')) return '/no';
    return '';
  };
  const localePrefix = getLocalePrefix();

  // Hide on donation-related pages to avoid redundancy
  const hiddenPaths = ['/support-our-mission', '/donation-success', '/donation-cancel', '/transparency'];
  const currentPath = location.pathname.replace(/^\/(sv|no)/, '') || '/';
  if (hiddenPaths.includes(currentPath)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background border-t border-border shadow-lg pb-safe">
      <div className="px-4 py-3">
        <Button
          asChild
          className="w-full bg-gradient-primary hover:opacity-90 text-white font-medium"
          size="lg"
        >
          <Link to={`${localePrefix}/support-our-mission`}>
            <Heart className="h-5 w-5 mr-2" />
            {t('donation.cta')}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default MobileDonationBar;
