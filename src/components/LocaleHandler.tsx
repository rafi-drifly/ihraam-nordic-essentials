import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LocaleHandler = () => {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Check if we're on a Swedish route
    const isSwedishRoute = location.pathname.startsWith('/sv');
    const currentLang = i18n.language;

    if (isSwedishRoute && currentLang !== 'sv') {
      i18n.changeLanguage('sv');
    } else if (!isSwedishRoute && currentLang === 'sv') {
      // Only change to English if explicitly on non-sv route
      // This allows manual language switching to persist
    }
  }, [location.pathname, i18n]);

  return null;
};

export default LocaleHandler;
