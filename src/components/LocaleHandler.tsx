import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LocaleHandler = () => {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const path = location.pathname;
    const isSwedishRoute = path.startsWith('/sv');
    const isNorwegianRoute = path.startsWith('/no');
    const currentLang = i18n.language;

    if (isSwedishRoute && currentLang !== 'sv') {
      i18n.changeLanguage('sv');
    } else if (isNorwegianRoute && currentLang !== 'no') {
      i18n.changeLanguage('no');
    } else if (!isSwedishRoute && !isNorwegianRoute && currentLang !== 'en') {
      // On English routes, sync to English
      i18n.changeLanguage('en');
    }
  }, [location.pathname, i18n]);

  return null;
};

export default LocaleHandler;
