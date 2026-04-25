import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  jsonLd?: Record<string, unknown>[];
}

const SEOHead = ({ title, description, path, jsonLd }: SEOHeadProps) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const currentLang = i18n.language;

  const baseUrl = 'https://www.pureihram.com';
  const currentPath = path || location.pathname;

  // Remove locale prefix for canonical path
  const canonicalPath = currentPath.replace(/^\/(sv|no)/, '') || '/';

  // Generate URLs for hreflang
  const englishUrl = `${baseUrl}${canonicalPath}`;
  const swedishUrl = `${baseUrl}/sv${canonicalPath === '/' ? '' : canonicalPath}`;
  const norwegianUrl = `${baseUrl}/no${canonicalPath === '/' ? '' : canonicalPath}`;

  const getCurrentUrl = () => {
    if (currentLang === 'sv') return swedishUrl;
    if (currentLang === 'no') return norwegianUrl;
    return englishUrl;
  };

  const currentUrl = getCurrentUrl();

  const getDefaultTitle = () => {
    if (currentLang === 'sv') {
      return 'Köp Ihram Online - Premium Pilgrimskläder från €19 | Pure Ihram';
    }
    if (currentLang === 'no') {
      return 'Kjøp Ihram Online - Premium Pilegrimsklær fra €19 | Pure Ihram';
    }
    return 'Buy Ihram Online - Premium Pilgrimage Cloth from €19 | Pure Ihram';
  };

  const getDefaultDescription = () => {
    if (currentLang === 'sv') {
      return 'Premium Ihram för Hajj och Umrah. Från €19. Skickas från Sverige, snabb leverans i hela Europa.';
    }
    if (currentLang === 'no') {
      return 'Premium Ihram for Hajj og Umrah. Fra €19. Sendes fra Sverige, rask levering i hele Europa.';
    }
    return 'Premium Ihram cloth for Hajj & Umrah. From €19. Ships from Sweden, fast delivery across Europe.';
  };

  const getLocale = () => {
    if (currentLang === 'sv') return 'sv_SE';
    if (currentLang === 'no') return 'nb_NO';
    return 'en_US';
  };

  const finalTitle = title || getDefaultTitle();
  const finalDescription = description || getDefaultDescription();

  return (
    <Helmet>
      <html lang={currentLang} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Hreflang tags for SEO */}
      <link rel="alternate" hrefLang="en" href={englishUrl} />
      <link rel="alternate" hrefLang="sv" href={swedishUrl} />
      <link rel="alternate" hrefLang="no" href={norwegianUrl} />
      <link rel="alternate" hrefLang="x-default" href={englishUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:locale" content={getLocale()} />

      {/* Twitter */}
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />

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
