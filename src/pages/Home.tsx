import { useLocalePrefix } from "@/i18n/useLocale";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import spiritualMeaning from "@/assets/blog/spiritual-meaning.png";
import howToWear from "@/assets/blog/how-to-wear-ihram.png";
import sunnahActs from "@/assets/blog/sunnah-acts.png";
import SEOHead from "@/components/SEOHead";
import { HomeHero } from "@/components/home/HomeHero";
import { TheSet } from "@/components/home/TheSet";
import { TestimonialBlock } from "@/components/home/TestimonialBlock";
import { ProductOffersBlock } from "@/components/home/ProductOffersBlock";
import { HajjPrepPackForm } from "@/components/home/HajjPrepPackForm";
import { HowToWearTeaser } from "@/components/home/HowToWearTeaser";
import { HomepageFAQ, useFaqItems } from "@/components/home/HomepageFAQ";

const Home = () => {
  const { t, i18n } = useTranslation();
  const lang = (['sv', 'no'].includes(i18n.language) ? i18n.language : 'en') as 'en' | 'sv' | 'no';
  const localePrefix = useLocalePrefix();

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
      ? 'Lättviktig Ihram i mikrofiber. Två delar (Izaar + Ridaa). Skickas från Sverige.'
      : lang === 'no'
        ? 'Lett Ihram i mikrofiber. To deler (Izaar + Ridaa). Sendes fra Sverige.'
        : 'Lightweight microfiber Ihram. Two pieces (Izaar + Ridaa). Ships from Sweden across the EU.';

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

      {/* 1. What the cloth is for, and the one way in to buying it */}
      <HomeHero />

      {/* 2. What the set is: two pieces, the verified specs */}
      <TheSet />

      {/* 3. One buyer's words */}
      <TestimonialBlock />

      {/* 4. Choose a set: the price, said once, and shipping/returns beside it */}
      <ProductOffersBlock />

      {/* 5. How to wear Ihram */}
      <HowToWearTeaser />

      {/* 6. Lead magnet */}
      <HajjPrepPackForm />

      {/* 7. Featured guides */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-2xl">
            <h2 className="text-[2rem] font-normal leading-[1.2] tracking-[-0.01em] text-foreground lg:text-[2.5rem]">
              {t("home.guides.title")}
            </h2>
            <p className="mt-4 text-lg leading-[1.6] text-muted-foreground">
              {t("home.guides.subtitle")}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            {blogArticles.map((article) => (
              <article key={article.link} className="group">
                <Link to={article.link} tabIndex={-1} aria-hidden="true">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
                    <img
                      src={article.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                </Link>
                <h3 className="mt-6 text-lg font-bold leading-snug text-foreground">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-[1.6] text-foreground">
                  {article.description}
                </p>
                <Link
                  to={article.link}
                  aria-label={`${t("home.guides.readMore")}: ${article.title}`}
                  className="mt-4 inline-flex items-center gap-2 text-[0.9375rem] font-bold text-primary transition-colors hover:text-[#205A5A]"
                >
                  {t("home.guides.readMore")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-14">
            <Link
              to={`${localePrefix}/blog`}
              className="group inline-flex items-center gap-2 text-[0.9375rem] font-bold text-primary transition-colors hover:text-[#205A5A]"
            >
              {t("home.guides.viewAll")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <div className="border-t border-[#D3E1E1]">
        <HomepageFAQ />
      </div>

      {/* 8b. Resources / quick links: crawl depth and internal linking */}
      <section aria-labelledby="resources-heading" className="border-t border-[#D3E1E1] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 id="resources-heading" className="text-sm font-bold text-foreground">
            {t('home.resources.title', { defaultValue: 'Explore Pure Ihram' })}
          </h2>
          <nav aria-label={t('home.resources.title', { defaultValue: 'Explore Pure Ihram' })}>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
              <li><Link to={`${localePrefix}/shop`} className="text-foreground hover:text-primary transition-colors">{t('footer.links.shop')}</Link></li>
              <li><Link to={`${localePrefix}/shipping`} className="text-foreground hover:text-primary transition-colors">{t('footer.links.shipping', { defaultValue: 'Shipping & Delivery' })}</Link></li>
              <li><Link to={`${localePrefix}/returns`} className="text-foreground hover:text-primary transition-colors">{t('footer.links.returns')}</Link></li>
              <li><Link to={`${localePrefix}/about`} className="text-foreground hover:text-primary transition-colors">{t('nav.ourMission')}</Link></li>
              <li><Link to={`${localePrefix}/partners`} className="text-foreground hover:text-primary transition-colors">{t('footer.links.partners')}</Link></li>
              <li><Link to={`${localePrefix}/support-our-mission`} className="text-foreground hover:text-primary transition-colors">{t('footer.links.supportMission', { defaultValue: 'Support Our Mission' })}</Link></li>
              <li><Link to={`${localePrefix}/transparency`} className="text-foreground hover:text-primary transition-colors">{t('nav.transparency', { defaultValue: 'Transparency' })}</Link></li>
              <li><Link to={`${localePrefix}/blog`} className="text-foreground hover:text-primary transition-colors">{t('footer.links.blog')}</Link></li>
              <li><Link to={`${localePrefix}/contact`} className="text-foreground hover:text-primary transition-colors">{t('footer.links.contact')}</Link></li>
            </ul>
          </nav>
        </div>
      </section>

      {/* 9. Closing line, back to the one place to buy */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <h2 className="text-[2rem] font-normal leading-[1.2] tracking-[-0.01em] text-foreground lg:text-[2.5rem]">
            {t("home.finalCta.title")}
          </h2>
          <p className="mt-4 text-lg leading-[1.6] text-foreground">
            {t("home.finalCta.description")}
          </p>
          <a
            href="#sets"
            className="mt-10 inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-[0.9375rem] font-bold text-primary-foreground transition-colors hover:bg-[#205A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
          >
            {t("home.finalCta.button")}
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
