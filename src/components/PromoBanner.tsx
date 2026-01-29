import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'promo-banner-dismissed';

const PromoBanner = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

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

  if (!isVisible) return null;

  return (
    <div className="bg-primary text-primary-foreground sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 py-2 text-sm relative">
          <Sparkles className="h-4 w-4 flex-shrink-0" />
          <span className="text-center font-medium">
            {t('banner.newStock')}
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
