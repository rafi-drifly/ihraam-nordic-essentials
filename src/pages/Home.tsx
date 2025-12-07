import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Check, Truck, Heart, Star, ArrowRight, Building2 } from "lucide-react";
import ihraamProduct from "@/assets/hero-product.avif";
import heroPattern from "@/assets/hero-pattern.jpg";
import spiritualMeaning from "@/assets/blog/spiritual-meaning.png";
import howToWear from "@/assets/blog/how-to-wear-ihram.png";
import sunnahActs from "@/assets/blog/sunnah-acts.png";
import umrahChecklist from "@/assets/blog/umrah-checklist.png";
import essentialDuas from "@/assets/blog/essential-duas.png";
import commonMistakes from "@/assets/blog/common-mistakes.png";

const Home = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: <Check className="h-6 w-6 text-primary" />,
      title: t('home.benefits.lightweight.title'),
      description: t('home.benefits.lightweight.description')
    },
    {
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: t('home.benefits.intention.title'),
      description: t('home.benefits.intention.description')
    },
    {
      icon: <Truck className="h-6 w-6 text-primary" />,
      title: t('home.benefits.fastDelivery.title'),
      description: t('home.benefits.fastDelivery.description')
    },
    {
      icon: <Star className="h-6 w-6 text-primary" />,
      title: t('home.benefits.affordable.title'),
      description: t('home.benefits.affordable.description')
    }
  ];

  const blogArticles = [
    {
      image: spiritualMeaning,
      title: t('home.guides.articles.spiritual.title'),
      description: t('home.guides.articles.spiritual.description'),
      link: "/blog/the-spiritual-meaning-of-ihram"
    },
    {
      image: howToWear,
      title: t('home.guides.articles.howToWear.title'),
      description: t('home.guides.articles.howToWear.description'),
      link: "/blog/how-to-wear-ihram"
    },
    {
      image: sunnahActs,
      title: t('home.guides.articles.sunnah.title'),
      description: t('home.guides.articles.sunnah.description'),
      link: "/blog/sunnah-acts-before-entering-ihram"
    },
    {
      image: umrahChecklist,
      title: t('home.guides.articles.checklist.title'),
      description: t('home.guides.articles.checklist.description'),
      link: "/blog/checklist-for-umrah-preparation"
    },
    {
      image: essentialDuas,
      title: t('home.guides.articles.duas.title'),
      description: t('home.guides.articles.duas.description'),
      link: "/blog/essential-duas-for-umrah"
    },
    {
      image: commonMistakes,
      title: t('home.guides.articles.mistakes.title'),
      description: t('home.guides.articles.mistakes.description'),
      link: "/blog/common-mistakes-pilgrims-make-in-ihram"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative bg-gradient-hero py-20 lg:py-32 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8)), url(${heroPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                {t('home.hero.title')}
                <span className="block text-primary">{t('home.hero.titleHighlight')}</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                {t('home.hero.price')} <span className="font-bold text-accent">{t('home.hero.priceAmount')}</span> {t('home.hero.priceSuffix')}
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t('home.hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
                  <Link to="/shop">{t('home.hero.cta')}</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/about">{t('home.hero.learnMore')}</Link>
                </Button>
              </div>
              <Link 
                to="/partners"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mt-4 text-sm"
              >
                <Building2 className="h-4 w-4" />
                {t('home.hero.partnersLink')}
              </Link>
            </div>

            {/* Product Images */}
            <div className="animate-slide-up">
              <div className="relative">
                <img src={ihraamProduct} alt="Pure white Ihram (Ihraam) cloth laid flat" className="rounded-2xl shadow-2xl w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quran Verse Section */}
      <section className="py-16 bg-accent/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="border-accent/20 bg-background/50">
            <CardContent className="p-8">
              <blockquote className="text-xl lg:text-2xl italic text-foreground mb-4 leading-relaxed">
                {t('home.quranVerse1')}
              </blockquote>
              <cite className="text-sm text-muted-foreground">{t('home.quranVerse1Cite')}</cite>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Product Highlights Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('home.whyChoose.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.whyChoose.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-primary mb-2">15€</div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{t('home.whyChoose.affordable.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('home.whyChoose.affordable.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{t('home.whyChoose.comfortable.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('home.whyChoose.comfortable.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">🚚</div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{t('home.whyChoose.delivery.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('home.whyChoose.delivery.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('home.benefits.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.benefits.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
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

      {/* Final Hadith Section */}
      <section className="py-16 bg-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="border-0 bg-background/80">
            <CardContent className="p-8">
              <blockquote className="text-xl lg:text-2xl italic text-foreground mb-4 leading-relaxed">
                {t('home.quranVerse2')}
              </blockquote>
              <cite className="text-sm text-muted-foreground">{t('home.quranVerse2Cite')}</cite>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Guides & Knowledge Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
              {t('home.guides.title')}
            </h2>
            <div className="w-20 h-1 bg-gradient-primary mx-auto mb-6 rounded-full"></div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('home.guides.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {blogArticles.map((article, index) => (
              <Card key={index} className="group overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl">
                <div className="overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3 leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-3">
                    {article.description}
                  </p>
                  <Link
                    to={article.link}
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
                  >
                    {t('home.guides.readMore')} <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View All CTA */}
          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="group">
              <Link to="/blog" className="inline-flex items-center gap-2">
                {t('home.guides.viewAll')}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {t('home.cta.description')}
          </p>
          <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
            <Link to="/shop">{t('home.cta.button')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
