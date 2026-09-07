/**
 * The one place a language is declared.
 *
 * Before this, adding a locale meant editing twenty-two files and writing out
 * twenty-five more routes by hand in App.tsx, once per language. Everything
 * that needs to know about languages now reads this instead: the router, the
 * language switcher, the locale handler, SEOHead, and the prerender script.
 *
 * The manifest is JSON rather than TypeScript because scripts/prerender.mjs
 * runs in plain Node and cannot import a .ts module. One file, both readers,
 * no chance of the build and the app disagreeing about what languages exist.
 */
import manifest from "./locale-manifest.json";

export interface LocaleMeta {
  /** URL prefix, empty for the default language. */
  prefix: string;
  /** Shown in the language switcher, in its own language. */
  name: string;
  /** <html lang="…"> */
  htmlLang: string;
  /** hreflang attribute value. */
  hreflang: string;
  /** og:locale value. */
  ogLocale: string;
  /** The language served without a prefix. Exactly one is marked. */
  default?: boolean;
}

export const LOCALES = manifest as Record<string, LocaleMeta>;

export type LocaleCode = keyof typeof manifest & string;

export const LOCALE_CODES = Object.keys(LOCALES) as LocaleCode[];

export const DEFAULT_LOCALE = (LOCALE_CODES.find((c) => LOCALES[c].default) ??
  LOCALE_CODES[0]) as LocaleCode;

/** Prefixed locales only, i.e. everything except the default. */
export const PREFIXED_LOCALES = LOCALE_CODES.filter((c) => LOCALES[c].prefix !== "");

/**
 * Which language a path is asking for. Matches on a whole segment so a future
 * "/nordic" page is never mistaken for the "/no" locale, which a plain
 * startsWith check would get wrong.
 */
export function localeFromPath(pathname: string): LocaleCode {
  const first = pathname.split("/")[1];
  const match = LOCALE_CODES.find((c) => LOCALES[c].prefix === `/${first}`);
  return match ?? DEFAULT_LOCALE;
}

/** The same page with its locale prefix removed, always starting with "/". */
export function stripLocale(pathname: string): string {
  const code = localeFromPath(pathname);
  const prefix = LOCALES[code].prefix;
  if (!prefix) return pathname || "/";
  return pathname.slice(prefix.length) || "/";
}

/** The same page in another language. */
export function localisePath(pathname: string, code: LocaleCode): string {
  const bare = stripLocale(pathname);
  const prefix = LOCALES[code].prefix;
  if (!prefix) return bare;
  return bare === "/" ? prefix : `${prefix}${bare}`;
}

/**
 * Build a route path for one locale. The root needs care: for the default
 * language it is "/", and for a prefixed one it is the bare prefix with no
 * trailing slash, which React Router treats as a different path.
 */
export function routePath(code: LocaleCode, relative: string): string {
  const prefix = LOCALES[code].prefix;
  if (relative === "") return prefix || "/";
  return `${prefix}/${relative}`;
}

/** Prefix for a language code, for components that know the language but not the path. */
export function prefixForLocale(code: string): string {
  return LOCALES[code]?.prefix ?? "";
}
