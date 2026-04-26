import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Wind, Truck, ShieldCheck, Heart } from "lucide-react";
import ihraamProduct from "@/assets/hero-product.avif";
import spiritualMeaning from "@/assets/blog/spiritual-meaning.png";
import howToWear from "@/assets/blog/how-to-wear-ihram.png";
import sunnahActs from "@/assets/blog/sunnah-acts.png";
import SEOHead from "@/components/SEOHead";
import { TestimonialBlock } from "@/components/home/TestimonialBlock";
import { ProductOffersBlock } from "@/components/home/ProductOffersBlock";
import { HajjPrepPackForm } from "@/components/home/HajjPrepPackForm";
import { HowToWearTeaser } from "@/components/home/HowToWearTeaser";
import { ShippingReassuranceStrip } from "@/components/home/ShippingReassuranceStrip";
import { HomepageFAQ, useFaqItems } from "@/components/home/HomepageFAQ";

const Home = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const lang = (['sv', 'no'].includes(i18n.language) ? i18n.language : 'en') as 'en' | 'sv' | 'no';
  const localePrefix = location.pathname.startsWith('/sv') ? '/sv' : location.pathname.startsWith('/no') ? '/no' : '';

  const benefits = [
    {
      icon: <Wind className="h-6 w-6 text-primary" />,
      title: t("home.benefits.climate.title"),
      description: t("home.benefits.climate.description"),
    },
    {
      icon: <Truck className="h-6 w-6 text-primary" />,
      title: t("home.benefits.shipsFromSweden.title"),
      description: t("home.benefits.shipsFromSweden.description"),
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: t("home.benefits.qualityChecked.title"),
      description: t("home.benefits.qualityChecked.description"),
    },
    {
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: t("home.benefits.builtForEU.title"),
      description: t("home.benefits.builtForEU.description"),
    },
  ];

  const blogArticles = [
    {
      image: spiritualMeaning,
      title: t("home.guides.articles.spiritual.title"),
      description: t("home.guides.articles.spiritual.description"),
      link: `${localePrefix}/blog/spiritual-meaning-ihram`,
    },
    {
      image: howToWear,
      title: t("home.guides.articles.howToWear.title"),
      description: t("home.guides.articles.howToWear.description"),
      link: `${localePrefix}/blog/how-to-wear-ihram`,
    },
    {
      image: sunnahActs,
      title: t("home.guides.articles.sunnah.title"),
      description: t("home.guides.articles.sunnah.description"),
      link: `${localePrefix}/blog/sunnah-acts-before-ihram`,
    },
  ];

  // Structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pure Ihram",
    url: "https://www.pureihram.com",
    logo: "https://www.pureihram.com/logo.png",
    address: {
      "@type": "PostalAddress",
      addressCountry: "SE",
      addressLocality: "Stockholm",
    },
  };

  const productDescription =
    lang === 'sv'
      ? 'Premium lättviktig mikrofiber Ihram. Två delar (Izaar + Ridaa). Skickas från Sverige.'
      : lang === 'no'
        ? 'Premium lett mikrofiber Ihram. To deler (Izaar + Ridaa). Sendes fra Sverige.'
        : 'Premium lightweight microfiber Ihram. Two pieces (Izaar + Ridaa). Ships from Sweden across the EU.';

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Pure Ihram - Single Set",
    image: "https://www.pureihram.com/products/single-set.jpg",
    description: productDescription,
    brand: { "@type": "Brand", name: "Pure Ihram" },
    offers: {
      "@type": "Offer",
      price: "19.00",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: "https://www.pureihram.com/shop",
    },
  };

  const faqItems = useFaqItems();
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div>
      <SEOHead jsonLd={[organizationSchema, productSchema, faqSchema]} />

      {/* 1. Hero Section */}
      <section className="bg-muted py-14 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                {t("home.hero.title")}
                <span className="block text-primary text-3xl lg:text-5xl mt-2">
                  {t("home.hero.highlight")}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t("home.hero.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 transition-colors">
                  <Link to={`${localePrefix}/shop`}>{t("home.hero.ctaShop")}</Link>
                </Button>
                <a
                  href="#hajj-prep-pack"
                  className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1"
                >
                  {t("home.hero.ctaPrepPack")} <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {t("home.hero.microcopy")}
              </p>
            </div>

            <div className="animate-slide-up">
              <img
                src={ihraamProduct}
                alt={t("home.hero.imageAlt")}
                className="rounded-2xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Social proof */}
      <TestimonialBlock />

      {/* 3. Product offers */}
      <ProductOffersBlock />

      {/* 4. Why Pure Ihram (4 value props) */}
      <section className="py-14 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t("home.benefits.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("home.benefits.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border border-border shadow-sm hover:shadow-md transition-shadow bg-background">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">{benefit.icon}</div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Lead magnet */}
      <HajjPrepPackForm />

      {/* 6. How to wear Ihram teaser */}
      <HowToWearTeaser />

      {/* 7. Shipping & returns reassurance */}
      <ShippingReassuranceStrip />

      {/* 8. Featured guides */}
      <section className="py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t("home.guides.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t("home.guides.subtitle")}
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
                    loading="lazy"
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
                    {t("home.guides.readMore")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="group">
              <Link to={`${localePrefix}/blog`} className="inline-flex items-center gap-2">
                {t("home.guides.viewAll")}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <HomepageFAQ />

      {/* 10. Final CTA */}
      <section className="py-14 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t("home.finalCta.title")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("home.finalCta.description")}
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 transition-colors">
            <Link to={`${localePrefix}/shop`}>{t("home.finalCta.button")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
