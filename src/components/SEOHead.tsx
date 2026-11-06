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
import { isAdminPath } from '@/lib/adminPwa';
import {
  LOCALES,
  LOCALE_CODES,
  DEFAULT_LOCALE,
  stripLocale,
  type LocaleCode,
} from '@/i18n/locales';
import HOME_META from '@/i18n/home-meta.json';

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
// Locale facts come from the manifest so SEOHead never disagrees with the
// router or the prerender script about which languages exist.
const LOCALE_META = LOCALES;

const SEOHead = ({ title, description, path, jsonLd, noindex, ogType, image }: SEOHeadProps) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const langKey = (LOCALE_CODES.includes(i18n.language as LocaleCode)
    ? i18n.language
    : 'en') as LocaleCode;
  const meta = LOCALE_META[langKey];

  const currentPath = path || location.pathname;

  // Strip the locale prefix to get the shared path. Uses the manifest rather
  // than a /(sv|no)/ regex, so a new language needs no edit here.
  const canonicalPath = stripLocale(currentPath);

  // Trailing slash on locale roots (e.g. /sv/), but not on sub-paths, so
  // /sv/shop stays /sv/shop.
  const buildLocalizedUrl = (prefix: string) => {
    if (canonicalPath === '/') return `${BASE_URL}${prefix}/`;
    return `${BASE_URL}${prefix}${canonicalPath}`;
  };

  const urlFor = (code: LocaleCode) => buildLocalizedUrl(LOCALES[code].prefix);
  const currentUrl = urlFor(langKey);
  const defaultUrl = urlFor(DEFAULT_LOCALE);

  // One alternate per language in the manifest, plus x-default.
  const alternatesKey = JSON.stringify([
    ...LOCALE_CODES.map((code) => ({ hreflang: LOCALES[code].hreflang, href: urlFor(code) })),
    { hreflang: 'x-default', href: defaultUrl },
  ]);

  // The homepage title and description, from the file the prerender script
  // also reads. These used to be written out here a second time, had drifted
  // from the prerendered ones, and had no French at all.
  const homeMeta =
    (HOME_META as Record<string, { title: string; description: string }>)[langKey] ?? HOME_META.en;
  const getDefaultTitle = () => homeMeta.title;
  const getDefaultDescription = () => homeMeta.description;

  // The back office is not part of the storefront. Without this it inherits
  // the shop's homepage title, gains a canonical URL of its own and loses the
  // noindex baked into the prerendered HTML - and since Google renders
  // JavaScript, that is the version it would see.
  const admin = isAdminPath(currentPath);

  const finalTitle = admin ? 'Ihram Admin' : title || getDefaultTitle();
  const finalDescription = description || getDefaultDescription();

  // Alternate locales for og:locale:alternate (everything except current).
  const alternateOgLocales = LOCALE_CODES
    .filter((l) => l !== langKey)
    .map((l) => LOCALES[l].ogLocale);

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
    setRobots(admin || !!noindex);
    setCanonical(admin ? null : currentUrl);
    setAlternates(admin ? [] : (JSON.parse(alternatesKey) as Array<{ hreflang: string; href: string }>));
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
    admin, meta.htmlLang, meta.ogLocale, finalTitle, finalDescription, noindex, currentUrl,
    alternatesKey, finalOgType, finalImage,
    alternateOgLocalesKey, jsonLdKey,
  ]);

  return null;
};

export default SEOHead;
