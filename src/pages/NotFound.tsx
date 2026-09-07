import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

/**
 * The site is a single page app behind a catch-all, so an unknown URL is
 * answered with 200 and this component rather than a real 404. Left alone that
 * makes every typo an indexable page: it inherited the homepage's title and
 * description while advertising a canonical of its own, so a crawler could
 * file unlimited junk URLs as valid pages.
 *
 * The status code cannot be fixed from here without giving up the client-side
 * routing the shop depends on. The noindex can, and that is the half that
 * matters to search.
 */
const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.warn("404: no route for", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-6">
      <SEOHead
        title="Page not found | Pure Ihram"
        description="This page does not exist. Browse Ihram sets, guides and shipping information at Pure Ihram."
        noindex
      />
      <div className="max-w-md text-center space-y-4">
        <p className="text-5xl font-bold text-primary">404</p>
        <h1 className="text-xl font-semibold">{t("notFound.title", "This page does not exist")}</h1>
        <p className="text-muted-foreground">
          {t(
            "notFound.body",
            "The link may be out of date. Everything is still here from the shop or the guides."
          )}
        </p>
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          <Link to="/shop">
            <Button>{t("notFound.shop", "Shop Ihram sets")}</Button>
          </Link>
          <Link to="/blog">
            <Button variant="outline">{t("notFound.guides", "Umrah & Hajj guides")}</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost">{t("notFound.home", "Home")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
