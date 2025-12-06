import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
}

const SEOHead = ({ title, description, path }: SEOHeadProps) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const currentLang = i18n.language;
  
  const baseUrl = 'https://pureihram.com';
  const currentPath = path || location.pathname;
  
  // Remove /sv prefix if present for canonical path
  const canonicalPath = currentPath.replace(/^\/sv/, '') || '/';
  
  // Generate URLs for hreflang
  const englishUrl = `${baseUrl}${canonicalPath}`;
  const swedishUrl = `${baseUrl}/sv${canonicalPath === '/' ? '' : canonicalPath}`;
  const currentUrl = currentLang === 'sv' ? swedishUrl : englishUrl;

  const defaultTitle = currentLang === 'sv' 
    ? 'Pure Ihram – Premium Ihram-Kläder för Hajj & Umrah | Köp Online i Sverige'
    : 'Pure Ihram – Premium Ihram Garments for Hajj & Umrah | Buy Online in Europe';
    
  const defaultDescription = currentLang === 'sv'
    ? 'Köp högkvalitativ Ihram (Ihraam) för endast 15€. Snabb leverans till Sverige, Norden och hela EU. 100% bomull, bekväm och traditionell design för din pilgrimsfärd.'
    : 'Buy high-quality Ihram (Ihraam) for just 15€. Fast delivery to Sweden, Nordics, and all EU. 100% cotton, comfortable and traditional design for your pilgrimage.';

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;

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
      <link rel="alternate" hrefLang="x-default" href={englishUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:locale" content={currentLang === 'sv' ? 'sv_SE' : 'en_US'} />
      <meta property="og:locale:alternate" content={currentLang === 'sv' ? 'en_US' : 'sv_SE'} />
      
      {/* Twitter */}
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
    </Helmet>
  );
};

export default SEOHead;
