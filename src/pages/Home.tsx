import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Truck, DollarSign, Heart, ArrowRight } from "lucide-react";
import ihraamProduct from "@/assets/hero-product.avif";
import spiritualMeaning from "@/assets/blog/spiritual-meaning.png";
import howToWear from "@/assets/blog/how-to-wear-ihram.png";
import sunnahActs from "@/assets/blog/sunnah-acts.png";

const Home = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const localePrefix = location.pathname.startsWith('/sv') ? '/sv' : location.pathname.startsWith('/no') ? '/no' : '';

  const benefits = [
    {
      icon: <ShoppingBag className="h-6 w-6 text-primary" />,
      title: t('home.benefits.lightweight.title'),
      description: t('home.benefits.lightweight.description')
    },
    {
      icon: <Truck className="h-6 w-6 text-primary" />,
      title: t('home.benefits.fastDelivery.title'),
      description: t('home.benefits.fastDelivery.description')
    },
    {
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      title: t('home.benefits.affordable.title'),
      description: t('home.benefits.affordable.description')
    },
    {
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: t('home.benefits.intention.title'),
      description: t('home.benefits.intention.description')
    }
  ];

  const blogArticles = [
    {
      image: spiritualMeaning,
      title: t('home.guides.articles.spiritual.title'),
      description: t('home.guides.articles.spiritual.description'),
      link: `${localePrefix}/blog/spiritual-meaning-ihram`
    },
    {
      image: howToWear,
      title: t('home.guides.articles.howToWear.title'),
      description: t('home.guides.articles.howToWear.description'),
      link: `${localePrefix}/blog/how-to-wear-ihram`
    },
    {
      image: sunnahActs,
      title: t('home.guides.articles.sunnah.title'),
      description: t('home.guides.articles.sunnah.description'),
      link: `${localePrefix}/blog/sunnah-acts-before-ihram`
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-muted py-14 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                {t('home.hero.title')}
                <span className="block text-primary">{t('home.hero.titleHighlight')}</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t('home.hero.description')}
              </p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 transition-colors">
                <Link to={`${localePrefix}/shop`}>{t('home.hero.cta')}</Link>
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                {t('home.hero.trustLine')}
              </p>
            </div>

            <div className="animate-slide-up">
              <img src={ihraamProduct} alt="Pure white Ihram cloth laid flat" className="rounded-2xl shadow-lg w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Pure Ihram */}
      <section className="py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('home.benefits.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.benefits.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links / Trust Section */}
      <section className="py-10 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: t('nav.shop'), href: '/shop' },
              { label: t('nav.shipping') || 'Shipping', href: '/shipping' },
              { label: t('nav.contact'), href: '/contact' },
              { label: t('nav.ourMission'), href: '/about' },
            ].map((link) => (
              <Link
                key={link.href}
                to={`${localePrefix}${link.href}`}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2"
              >
                {link.label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('home.guides.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('home.guides.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {blogArticles.map((article, index) => (
              <Card key={index} className="group overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
                <div className="overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-3 leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-3">
                    {article.description}
                  </p>
                  <Link
                    to={article.link}
                    className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
                  >
                    {t('home.guides.readMore')} <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="group">
              <Link to={`${localePrefix}/blog`} className="inline-flex items-center gap-2">
                {t('home.guides.viewAll')}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-muted-foreground mb-6">{t('home.cta.description')}</p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 transition-colors">
            <Link to={`${localePrefix}/shop`}>{t('home.cta.button')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
