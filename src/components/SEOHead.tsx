import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  titleKey?: string;
  descriptionKey?: string;
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

const SEOHead = ({ 
  titleKey, 
  descriptionKey, 
  title: customTitle, 
  description: customDescription,
  image = 'https://www.pureihram.com/og-image.jpg',
  noIndex = false 
}: SEOHeadProps) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const currentLang = i18n.language;
  
  const title = customTitle || (titleKey ? t(titleKey) : t('seo.home.title'));
  const description = customDescription || (descriptionKey ? t(descriptionKey) : t('seo.home.description'));
  
  const baseUrl = 'https://www.pureihram.com';
  const currentPath = location.pathname;
  
  // Generate alternate URLs for hreflang
  const getEnglishUrl = () => {
    if (currentPath.startsWith('/sv')) {
      // Map Swedish path to English
      const pathMapping: Record<string, string> = {
        '/sv': '/',
        '/sv/butik': '/shop',
        '/sv/blogg': '/blog',
        '/sv/om-oss': '/about',
        '/sv/kontakt': '/contact',
        '/sv/frakt': '/shipping',
        '/sv/varukorg': '/cart',
        '/sv/spara-order': '/guest-order-lookup',
        '/sv/blogg/hur-man-bar-ihram': '/blog/how-to-wear-ihram',
        '/sv/blogg/sunnah-handlingar-innan-ihram': '/blog/sunnah-acts-before-ihram',
        '/sv/blogg/checklista-umrah-forberedelse': '/blog/umrah-preparation-checklist',
        '/sv/blogg/vanliga-misstag-ihram': '/blog/common-mistakes-ihram',
        '/sv/blogg/viktiga-duas-umrah': '/blog/essential-duas-umrah',
        '/sv/blogg/andlig-betydelse-ihram': '/blog/spiritual-meaning-ihram',
      };
      return baseUrl + (pathMapping[currentPath] || currentPath.replace('/sv', ''));
    }
    return baseUrl + currentPath;
  };
  
  const getSwedishUrl = () => {
    if (!currentPath.startsWith('/sv')) {
      // Map English path to Swedish
      const pathMapping: Record<string, string> = {
        '/': '/sv',
        '/shop': '/sv/butik',
        '/blog': '/sv/blogg',
        '/about': '/sv/om-oss',
        '/contact': '/sv/kontakt',
        '/shipping': '/sv/frakt',
        '/cart': '/sv/varukorg',
        '/guest-order-lookup': '/sv/spara-order',
        '/blog/how-to-wear-ihram': '/sv/blogg/hur-man-bar-ihram',
        '/blog/sunnah-acts-before-ihram': '/sv/blogg/sunnah-handlingar-innan-ihram',
        '/blog/umrah-preparation-checklist': '/sv/blogg/checklista-umrah-forberedelse',
        '/blog/common-mistakes-ihram': '/sv/blogg/vanliga-misstag-ihram',
        '/blog/essential-duas-umrah': '/sv/blogg/viktiga-duas-umrah',
        '/blog/spiritual-meaning-ihram': '/sv/blogg/andlig-betydelse-ihram',
      };
      return baseUrl + (pathMapping[currentPath] || `/sv${currentPath}`);
    }
    return baseUrl + currentPath;
  };
  
  const canonicalUrl = baseUrl + currentPath;
  const englishUrl = getEnglishUrl();
  const swedishUrl = getSwedishUrl();

  return (
    <Helmet>
      <html lang={currentLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Hreflang tags */}
      <link rel="alternate" hrefLang="en" href={englishUrl} />
      <link rel="alternate" hrefLang="sv" href={swedishUrl} />
      <link rel="alternate" hrefLang="x-default" href={englishUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={currentLang === 'sv' ? 'sv_SE' : 'en_US'} />
      <meta property="og:locale:alternate" content={currentLang === 'sv' ? 'en_US' : 'sv_SE'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};

export default SEOHead;
