import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { stripLocale } from '@/i18n/locales';

const STORAGE_KEY = 'promo-banner-dismissed';

const PromoBanner = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  // The homepage shows the price once, beside its own buy button (Nov 2026
  // restyle). A price bar above it would be the second mention, so the bar
  // only runs on the other pages.
  const isHome = stripLocale(pathname) === '/';

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible || isHome) return null;

  return (
    <div className="bg-primary text-primary-foreground sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 py-2 text-sm relative px-8">
          <span className="text-center font-normal">
            {t('banner.promoText', 'Ihram sets from €20 - delivered across Europe')}
          </span>
          <button
            onClick={handleDismiss}
            className="absolute right-0 p-1 hover:bg-primary-foreground/10 rounded-full transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
