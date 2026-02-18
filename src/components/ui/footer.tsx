import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  const location = useLocation();
  
  // Get locale prefix for links
  const getLocalePrefix = () => {
    if (location.pathname.startsWith('/sv')) return '/sv';
    if (location.pathname.startsWith('/no')) return '/no';
    return '';
  };
  const localePrefix = getLocalePrefix();

  const getLocalizedHref = (href: string) => {
    if (href === '/') {
      return localePrefix || '/';
    }
    return `${localePrefix}${href}`;
  };

  const quickLinks = [
    { name: t('footer.links.home'), href: "/" },
    { name: t('footer.links.shop'), href: "/shop" },
    { name: t('footer.links.blog'), href: "/blog" },
    { name: t('footer.links.shipping'), href: "/shipping" },
    { name: t('footer.links.partners'), href: "/partners" },
    { name: t('footer.links.supportMission'), href: "/support-our-mission" },
    { name: t('footer.links.about'), href: "/about" },
    { name: t('footer.links.contact'), href: "/contact" },
  ];

  return (
    <footer className="bg-muted border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span className="text-xl font-bold text-foreground">Pure Ihram</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={getLocalizedHref(link.href)}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.serviceAreas')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>🇸🇪 {t('footer.areas.sweden')}</li>
              <li>🇳🇴 {t('footer.areas.norway')}</li>
              <li>🇩🇰 {t('footer.areas.denmark')}</li>
              <li>🇫🇮 {t('footer.areas.finland')}</li>
              <li>🇪🇺 {t('footer.areas.eu')}</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.contact')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground text-sm">support@pureihraam.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground text-sm">+46720131476</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground text-sm">Sweden</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            {t('footer.copyright')}
          </p>
          <div className="mt-4 md:mt-0">
            <p className="text-muted-foreground text-xs italic max-w-md">
              {t('footer.quote')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
