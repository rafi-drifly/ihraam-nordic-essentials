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
      return 'Pure Ihram – Premium Ihram-Kläder för Hajj & Umrah | Köp Online i Sverige';
    }
    if (currentLang === 'no') {
      return 'Pure Ihram – Premium Ihram-Klær for Hajj & Umrah | Kjøp Online i Norge';
    }
    return 'Pure Ihram – Premium Ihram Garments for Hajj & Umrah | Buy Online in Europe';
  };
    
  const getDefaultDescription = () => {
    if (currentLang === 'sv') {
      return 'Köp högkvalitativ Ihram (Ihraam) för endast 15€. Snabb leverans till Sverige, Norden och hela EU. 100% bomull, bekväm och traditionell design för din pilgrimsfärd.';
    }
    if (currentLang === 'no') {
      return 'Kjøp høykvalitets Ihram (Ihraam) for kun 15€. Rask levering til Norge, Norden og hele EU. 100% bomull, komfortabel og tradisjonell design for din pilegrimsreise.';
    }
    return 'Buy high-quality Ihram (Ihraam) for just 15€. Fast delivery to Sweden, Nordics, and all EU. 100% cotton, comfortable and traditional design for your pilgrimage.';
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
    </Helmet>
  );
};

export default SEOHead;
