import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import sv from './locales/sv.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sv: { translation: sv }
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'sv'],
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
      caches: ['localStorage']
    }
  });

export default i18n;

// Route mappings for locale-aware navigation
export const routeMapping: Record<string, Record<string, string>> = {
  en: {
    '/': '/',
    '/shop': '/shop',
    '/blog': '/blog',
    '/about': '/about',
    '/contact': '/contact',
    '/shipping': '/shipping',
    '/cart': '/cart',
    '/guest-order-lookup': '/guest-order-lookup',
    '/order-success': '/order-success',
    '/blog/how-to-wear-ihram': '/blog/how-to-wear-ihram',
    '/blog/sunnah-acts-before-ihram': '/blog/sunnah-acts-before-ihram',
    '/blog/umrah-preparation-checklist': '/blog/umrah-preparation-checklist',
    '/blog/common-mistakes-ihram': '/blog/common-mistakes-ihram',
    '/blog/essential-duas-umrah': '/blog/essential-duas-umrah',
    '/blog/spiritual-meaning-ihram': '/blog/spiritual-meaning-ihram',
  },
  sv: {
    '/': '/sv',
    '/shop': '/sv/butik',
    '/blog': '/sv/blogg',
    '/about': '/sv/om-oss',
    '/contact': '/sv/kontakt',
    '/shipping': '/sv/frakt',
    '/cart': '/sv/varukorg',
    '/guest-order-lookup': '/sv/spara-order',
    '/order-success': '/sv/order-bekraftelse',
    '/blog/how-to-wear-ihram': '/sv/blogg/hur-man-bar-ihram',
    '/blog/sunnah-acts-before-ihram': '/sv/blogg/sunnah-handlingar-innan-ihram',
    '/blog/umrah-preparation-checklist': '/sv/blogg/checklista-umrah-forberedelse',
    '/blog/common-mistakes-ihram': '/sv/blogg/vanliga-misstag-ihram',
    '/blog/essential-duas-umrah': '/sv/blogg/viktiga-duas-umrah',
    '/blog/spiritual-meaning-ihram': '/sv/blogg/andlig-betydelse-ihram',
  }
};

// Reverse mapping for getting English route from Swedish route
export const reverseRouteMapping: Record<string, string> = Object.entries(routeMapping.sv).reduce(
  (acc, [en, sv]) => ({ ...acc, [sv]: en }),
  {}
);

// Get localized path
export const getLocalizedPath = (path: string, locale: string): string => {
  if (locale === 'en') {
    // If we're switching to English and current path is Swedish, find the English equivalent
    const englishPath = reverseRouteMapping[path];
    return englishPath || path;
  }
  // Switching to Swedish
  const svPath = routeMapping.sv[path];
  return svPath || `/sv${path}`;
};

// Get current locale from path
export const getLocaleFromPath = (path: string): string => {
  return path.startsWith('/sv') ? 'sv' : 'en';
};
