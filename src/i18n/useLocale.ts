import { useLocation } from "react-router-dom";
import { LOCALES, localeFromPath, type LocaleCode } from "./locales";

/**
 * The URL prefix for the language currently being viewed: "" for the default,
 * "/sv", "/no", and whatever else the manifest gains later.
 *
 * Nineteen components used to work this out with the same hard-coded ternary,
 * which meant a new language linked its visitors straight back into English
 * until all nineteen were found and edited. They call this instead.
 */
export function useLocalePrefix(): string {
  const location = useLocation();
  return LOCALES[localeFromPath(location.pathname)].prefix;
}

/** The language code currently being viewed. */
export function useLocaleCode(): LocaleCode {
  const location = useLocation();
  return localeFromPath(location.pathname);
}
