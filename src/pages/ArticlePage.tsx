import { useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import NotFound from "@/pages/NotFound";
import { trackBlogCtaClick } from "@/lib/analytics";
import { getBlogPost, pickLocale } from "@/content/blog/registry";
import "@/content/blog/blog-article.css";

const BASE_URL = "https://www.pureihram.com";

/**
 * Registry-driven long-form blog article.
 * Renders the localized body for a known slug, or a real 404 for unknown slugs
 * (previously every /blog/:slug rendered the same hard-coded article).
 */
const ArticlePage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const post = getBlogPost(slug);
  const locale = pickLocale(i18n.language);
  const localePrefix = locale === "sv" ? "/sv" : locale === "no" ? "/no" : "";

  // Intercept clicks on internal links inside the raw-HTML body so they use
  // client-side routing instead of a full page reload. Also tracks shop CTAs.
  const handleBodyClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      if (href.startsWith("/") && !href.startsWith("//")) {
        e.preventDefault();
        if (href.startsWith("/shop")) {
          trackBlogCtaClick(slug || "unknown", "shop_now");
        }
        navigate(`${localePrefix}${href}`);
      }
    },
    [navigate, localePrefix, slug],
  );

  if (!post) {
    return <NotFound />;
  }

  const tr = post.translations[locale] ?? post.translations.en;
  const canonicalPath = `/blog/${post.slug}`;
  const articleUrl = `${BASE_URL}${localePrefix}${canonicalPath}`;
  const publishedDate = new Date(post.datePublished).toLocaleDateString(
    locale === "sv" ? "sv-SE" : locale === "no" ? "nb-NO" : "en-GB",
    { year: "numeric", month: "long", day: "numeric" },
  );

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: tr.title,
    description: tr.excerpt,
    inLanguage: locale === "sv" ? "sv-SE" : locale === "no" ? "nb-NO" : "en",
    author: { "@type": "Organization", name: "Pure Ihram" },
    datePublished: post.datePublished,
    dateModified: post.datePublished,
    image: `${BASE_URL}/og-image.jpg`,
    publisher: {
      "@type": "Organization",
      name: "Pure Ihram",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/og-image.jpg` },
    },
    mainEntityOfPage: articleUrl,
    keywords: post.keywords,
  };

  const faqSchema =
    tr.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: tr.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  const jsonLd = faqSchema ? [articleSchema, faqSchema] : [articleSchema];
  const categoryLabel = t(`blog.categories.${post.category}`, post.category);

  return (
    <div className="py-12">
      <SEOHead
        title={`${tr.title} | Pure Ihram`}
        description={tr.excerpt}
        ogType="article"
        jsonLd={jsonLd}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`${localePrefix}/blog`}>
          <Button variant="ghost" className="mb-8 hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("blogPost.backToBlog")}
          </Button>
        </Link>

        <header className="mb-8">
          <Badge variant="secondary" className="mb-4">
            {categoryLabel}
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            {tr.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">{tr.excerpt}</p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Pure Ihram
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {post.readTime} min
            </div>
            <span>{publishedDate}</span>
          </div>
        </header>

        {/* eslint-disable-next-line react/no-danger */}
        <div
          className="blog-article"
          onClick={handleBodyClick}
          dangerouslySetInnerHTML={{ __html: tr.body }}
        />

        <div className="mt-12 rounded-2xl bg-gradient-subtle p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            {t("blogPost.readyForJourney")}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {t("blogPost.orderCta")}
          </p>
          <Link
            to={`${localePrefix}/shop`}
            onClick={() => trackBlogCtaClick(post.slug, "shop_now")}
          >
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              {t("blogPost.shopIhram")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
