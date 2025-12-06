import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import howToWearIhram from "@/assets/blog/how-to-wear-ihram.png";
import sunnahActs from "@/assets/blog/sunnah-acts.png";
import umrahChecklist from "@/assets/blog/umrah-checklist.png";
import commonMistakes from "@/assets/blog/common-mistakes.png";
import essentialDuas from "@/assets/blog/essential-duas.png";
import spiritualMeaning from "@/assets/blog/spiritual-meaning.png";

const Blog = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const localePrefix = location.pathname.startsWith('/sv') ? '/sv' : '';

  const blogPosts = [
    {
      id: 1,
      title: t('blog.posts.howToWear.title'),
      excerpt: t('blog.posts.howToWear.excerpt'),
      author: t('blog.posts.howToWear.author'),
      readTime: t('blog.posts.howToWear.readTime'),
      date: t('blog.posts.howToWear.date'),
      category: t('blog.categories.guide'),
      image: howToWearIhram,
      link: "/blog/how-to-wear-ihram"
    },
    {
      id: 2,
      title: t('blog.posts.sunnahActs.title'),
      excerpt: t('blog.posts.sunnahActs.excerpt'),
      author: t('blog.posts.sunnahActs.author'),
      readTime: t('blog.posts.sunnahActs.readTime'),
      date: t('blog.posts.sunnahActs.date'),
      category: t('blog.categories.sunnah'),
      image: sunnahActs,
      link: "/blog/sunnah-acts-before-ihram"
    },
    {
      id: 3,
      title: t('blog.posts.checklist.title'),
      excerpt: t('blog.posts.checklist.excerpt'),
      author: t('blog.posts.checklist.author'),
      readTime: t('blog.posts.checklist.readTime'),
      date: t('blog.posts.checklist.date'),
      category: t('blog.categories.preparation'),
      image: umrahChecklist,
      link: "/blog/umrah-preparation-checklist"
    },
    {
      id: 4,
      title: t('blog.posts.commonMistakes.title'),
      excerpt: t('blog.posts.commonMistakes.excerpt'),
      author: t('blog.posts.commonMistakes.author'),
      readTime: t('blog.posts.commonMistakes.readTime'),
      date: t('blog.posts.commonMistakes.date'),
      category: t('blog.categories.tips'),
      image: commonMistakes,
      link: "/blog/common-mistakes-ihram"
    },
    {
      id: 5,
      title: t('blog.posts.essentialDuas.title'),
      excerpt: t('blog.posts.essentialDuas.excerpt'),
      author: t('blog.posts.essentialDuas.author'),
      readTime: t('blog.posts.essentialDuas.readTime'),
      date: t('blog.posts.essentialDuas.date'),
      category: t('blog.categories.guide'),
      image: essentialDuas,
      link: "/blog/essential-duas-umrah"
    },
    {
      id: 6,
      title: t('blog.posts.spiritualMeaning.title'),
      excerpt: t('blog.posts.spiritualMeaning.excerpt'),
      author: t('blog.posts.spiritualMeaning.author'),
      readTime: t('blog.posts.spiritualMeaning.readTime'),
      date: t('blog.posts.spiritualMeaning.date'),
      category: t('blog.categories.spiritual'),
      image: spiritualMeaning,
      link: "/blog/spiritual-meaning-ihram"
    }
  ];

  const categories = [
    { key: "all", label: t('blog.categories.all') },
    { key: "guide", label: t('blog.categories.guide') },
    { key: "sunnah", label: t('blog.categories.sunnah') },
    { key: "preparation", label: t('blog.categories.preparation') },
    { key: "tips", label: t('blog.categories.tips') },
    { key: "spiritual", label: t('blog.categories.spiritual') }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t('blog.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('blog.subtitle')}
          </p>
        </div>

        {/* Islamic Quote */}
        <div className="mb-12">
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-8 text-center">
              <blockquote className="text-lg italic text-foreground mb-4">
                {t('blog.quranVerse')}
              </blockquote>
              <cite className="text-sm text-muted-foreground">{t('blog.quranVerseCite')}</cite>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={category.key === "all" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {blogPosts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="aspect-video bg-muted overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {post.readTime}
                  </div>
                </div>
                <Link to={`${localePrefix}${post.link}`}>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2 cursor-pointer">
                    {post.title}
                  </CardTitle>
                </Link>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    {post.author}
                  </div>
                  <Link to={`${localePrefix}${post.link}`}>
                    <Button size="sm" variant="ghost" className="group-hover:text-primary">
                      {t('blog.readMore')}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2">
                  {post.date}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Spiritual Quote Section */}
        <div className="mb-16">
          <Card className="bg-gradient-subtle border-0">
            <CardContent className="p-8 text-center">
              <blockquote className="text-xl italic text-foreground mb-4">
                {t('blog.hadithQuote')}
              </blockquote>
              <cite className="text-sm text-muted-foreground">{t('blog.hadithCite')}</cite>
            </CardContent>
          </Card>
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-muted">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {t('blog.newsletter.title')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {t('blog.newsletter.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder={t('blog.newsletter.placeholder')}
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              />
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                {t('blog.newsletter.subscribe')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Blog;
