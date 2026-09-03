import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  setAlternates,
  setCanonical,
  setDescription,
  setHtmlLang,
  setJsonLd,
  setNamed,
  setOgLocaleAlternates,
  setProperty,
  setRobots,
  setTitle,
} from '@/lib/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  jsonLd?: Record<string, unknown>[];
  /** When true, emits <meta name="robots" content="noindex, follow"> for transactional pages. */
  noindex?: boolean;
  /** Optional override for og:type (e.g. "product", "article"). Defaults to "website". */
  ogType?: string;
  /** Optional override for og:image. */
  image?: string;
}

const BASE_URL = 'https://www.pureihram.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;

// Map our internal i18n codes to BCP-47 region codes used by hreflang and og:locale.
const LOCALE_META: Record<'en' | 'sv' | 'no', { htmlLang: string; hreflang: string; ogLocale: string }> = {
  en: { htmlLang: 'en', hreflang: 'en', ogLocale: 'en_GB' },
  sv: { htmlLang: 'sv-SE', hreflang: 'sv-SE', ogLocale: 'sv_SE' },
  no: { htmlLang: 'nb-NO', hreflang: 'nb-NO', ogLocale: 'nb_NO' },
};

const SEOHead = ({ title, description, path, jsonLd, noindex, ogType, image }: SEOHeadProps) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const langKey = (['sv', 'no'].includes(i18n.language) ? i18n.language : 'en') as 'en' | 'sv' | 'no';
  const meta = LOCALE_META[langKey];

  const currentPath = path || location.pathname;

  // Strip locale prefix to get the canonical (English) path.
  const canonicalPath = currentPath.replace(/^\/(sv|no)/, '') || '/';

  // Trailing slash on locale roots per audit (e.g. /sv/, /no/), but NOT on
  // sub-paths (so /sv/shop stays /sv/shop, not /sv/shop/).
  const buildLocalizedUrl = (prefix: '' | '/sv' | '/no') => {
    if (canonicalPath === '/') {
      return prefix === '' ? `${BASE_URL}/` : `${BASE_URL}${prefix}/`;
    }
    return `${BASE_URL}${prefix}${canonicalPath}`;
  };

  const englishUrl = buildLocalizedUrl('');
  const swedishUrl = buildLocalizedUrl('/sv');
  const norwegianUrl = buildLocalizedUrl('/no');

  const currentUrl = langKey === 'sv' ? swedishUrl : langKey === 'no' ? norwegianUrl : englishUrl;

  const getDefaultTitle = () => {
    if (langKey === 'sv') return 'Köp Ihram Online från €19 | Pure Ihram';
    if (langKey === 'no') return 'Kjøp Ihram Online fra €19 | Pure Ihram';
    return 'Buy Ihram Online from €19 | Pure Ihram';
  };

  const getDefaultDescription = () => {
    if (langKey === 'sv') {
      return 'Premium Ihram-tyg för Umrah och Hajj. €19 + €9 frakt inom Sverige, 3-7 arbetsdagar. Gratis avhämtning i Uppsala och Stockholm.';
    }
    if (langKey === 'no') {
      return 'Premium Ihram-stoff for Umrah og Hajj. Fra €19, sendes fra Sverige. Frakt til Norge bekreftes før sending, eller hent gratis i Uppsala og Stockholm.';
    }
    return 'Premium Ihram cloth for Umrah & Hajj. €19 + €9 shipping within Sweden, 3-7 days. Free pickup in Uppsala and Stockholm.';
  };

  const finalTitle = title || getDefaultTitle();
  const finalDescription = description || getDefaultDescription();

  // Alternate locales for og:locale:alternate (everything except current).
  const alternateOgLocales = (['en', 'sv', 'no'] as const)
    .filter((l) => l !== langKey)
    .map((l) => LOCALE_META[l].ogLocale);

  const finalImage = image || DEFAULT_OG_IMAGE;
  const finalOgType = ogType || 'website';

  // Serialised once so a fresh array literal with identical contents does not
  // retrigger the effect, and so the dependency array stays statically checkable.
  const alternateOgLocalesKey = JSON.stringify(alternateOgLocales);
  const jsonLdKey = JSON.stringify(jsonLd ?? []);

  // Written straight to the head. react-helmet-async was mounted but inert on
  // this app, so nothing below ever reached the document; see src/lib/head.ts.
  useEffect(() => {
    setHtmlLang(meta.htmlLang);
    setTitle(finalTitle);
    setDescription(finalDescription);
    setRobots(!!noindex);
    setCanonical(currentUrl);
    setAlternates([
      { hreflang: 'en', href: englishUrl },
      { hreflang: 'sv-SE', href: swedishUrl },
      { hreflang: 'nb-NO', href: norwegianUrl },
      { hreflang: 'x-default', href: englishUrl },
    ]);
    setProperty('og:title', finalTitle);
    setProperty('og:description', finalDescription);
    setProperty('og:type', finalOgType);
    setProperty('og:url', currentUrl);
    setProperty('og:image', finalImage);
    setProperty('og:locale', meta.ogLocale);
    setOgLocaleAlternates(JSON.parse(alternateOgLocalesKey) as string[]);
    setNamed('twitter:card', 'summary_large_image');
    setNamed('twitter:title', finalTitle);
    setNamed('twitter:description', finalDescription);
    setNamed('twitter:image', finalImage);
    setJsonLd(JSON.parse(jsonLdKey) as Array<Record<string, unknown>>);
  }, [
    meta.htmlLang, meta.ogLocale, finalTitle, finalDescription, noindex, currentUrl,
    englishUrl, swedishUrl, norwegianUrl, finalOgType, finalImage,
    alternateOgLocalesKey, jsonLdKey,
  ]);

  return null;
};

export default SEOHead;
