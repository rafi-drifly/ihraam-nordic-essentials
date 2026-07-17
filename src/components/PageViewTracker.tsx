import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { trackPageView } from "@/lib/analytics";

/** Classify a path into a coarse page_type for analytics grouping. */
const pageType = (path: string): string => {
  const p = path.replace(/^\/(sv|no)/, "") || "/";
  if (p === "/") return "home";
  if (p === "/blog") return "blog_list";
  if (p.startsWith("/blog/")) return "blog_post";
  if (p === "/shop") return "shop";
  if (p === "/cart") return "cart";
  if (p.startsWith("/admin")) return "admin";
  return p.slice(1).split("/")[0] || "other";
};

/**
 * Fires a semantic page_view event on every SPA route change (in addition to
 * PostHog's automatic $pageview), tagged with page_type and locale.
 */
const PageViewTracker = () => {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const locale = ["sv", "no"].includes(i18n.language) ? i18n.language : "en";
    trackPageView({ path: location.pathname, pageType: pageType(location.pathname), locale });
  }, [location.pathname, i18n.language]);

  return null;
};

export default PageViewTracker;
