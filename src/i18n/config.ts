import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { LOCALE_CODES, DEFAULT_LOCALE } from './locales';
import en from './locales/en.json';
import sv from './locales/sv.json';
import no from './locales/no.json';
import fr from './locales/fr.json';

/**
 * Translation files are imported explicitly so the bundler can see them, but
 * the list of supported languages comes from the locale manifest, which is the
 * single place a language is declared. Adding one means a JSON file, an import
 * here, and an entry in the manifest.
 */
const bundles: Record<string, Record<string, unknown>> = { en, sv, no, fr };

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: Object.fromEntries(
      LOCALE_CODES.filter((code) => bundles[code]).map((code) => [
        code,
        { translation: bundles[code] },
      ])
    ),
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: LOCALE_CODES.filter((code) => bundles[code]),
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  });

export default i18n;
