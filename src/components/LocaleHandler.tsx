import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LocaleHandler = () => {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    // Detect locale from path
    const isSwedish = location.pathname.startsWith('/sv');
    const targetLang = isSwedish ? 'sv' : 'en';
    
    if (i18n.language !== targetLang) {
      i18n.changeLanguage(targetLang);
    }
    
    // Update HTML lang attribute
    document.documentElement.lang = targetLang;
  }, [location.pathname, i18n]);

  return null;
};

export default LocaleHandler;
