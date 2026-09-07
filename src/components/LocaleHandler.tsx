import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { localeFromPath } from '@/i18n/locales';

/**
 * Keeps the i18n language in step with the URL. Reads the locale manifest
 * rather than testing for '/sv' and '/no' by hand, so a new language needs no
 * change here. It also matches on a whole path segment, which the old
 * startsWith check did not: a future /nordic page would have been served in
 * Norwegian.
 */
const LocaleHandler = () => {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const wanted = localeFromPath(location.pathname);
    if (i18n.language !== wanted) i18n.changeLanguage(wanted);
  }, [location.pathname, i18n]);

  return null;
};

export default LocaleHandler;
