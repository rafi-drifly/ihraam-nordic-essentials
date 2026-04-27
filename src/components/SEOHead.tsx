import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

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

const SEOHead = ({ title, description, path, jsonLd }: SEOHeadProps) => {
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
    if (langKey === 'sv') return 'Köpa Ihram Online - Premium Pilgrimsklädnad från €19 | Pure Ihram';
    if (langKey === 'no') return 'Kjøpe Ihram Online - Premium Pilegrimsklær fra €19 | Pure Ihram';
    return 'Buy Ihram Online - Premium Pilgrimage Cloth from €19 | Pure Ihram';
  };

  const getDefaultDescription = () => {
    if (langKey === 'sv') {
      return 'Premium Ihram-tyg för Hajj och Umrah. Från €19. Levereras från Sverige, snabb leverans i hela Europa. Betrodd av pilgrimer inför Hajj 2026.';
    }
    if (langKey === 'no') {
      return 'Premium Ihram-stoff for Hajj og Umrah. Fra €19. Sendes fra Sverige, rask levering i hele Europa. Foretrukket av pilegrimer for Hajj 2026.';
    }
    return 'Premium Ihram cloth for Hajj & Umrah. From €19. Ships from Sweden, fast delivery across Europe. Trusted by pilgrims for Hajj 2026.';
  };

  const finalTitle = title || getDefaultTitle();
  const finalDescription = description || getDefaultDescription();

  // Alternate locales for og:locale:alternate (everything except current).
  const alternateOgLocales = (['en', 'sv', 'no'] as const)
    .filter((l) => l !== langKey)
    .map((l) => LOCALE_META[l].ogLocale);

  return (
    <Helmet>
      <html lang={meta.htmlLang} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Hreflang tags - BCP-47 region codes per SEO audit */}
      <link rel="alternate" hrefLang="en" href={englishUrl} />
      <link rel="alternate" hrefLang="sv-SE" href={swedishUrl} />
      <link rel="alternate" hrefLang="nb-NO" href={norwegianUrl} />
      <link rel="alternate" hrefLang="x-default" href={englishUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      <meta property="og:locale" content={meta.ogLocale} />
      {alternateOgLocales.map((locale) => (
        <meta key={locale} property="og:locale:alternate" content={locale} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />

      {/* Structured data */}
      {jsonLd?.map((schema, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
