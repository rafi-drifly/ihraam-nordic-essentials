import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Award } from "lucide-react";

const About = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: t('about.values.purity.title'),
      description: t('about.values.purity.description')
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: t('about.values.accessibility.title'),
      description: t('about.values.accessibility.description')
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: t('about.values.trust.title'),
      description: t('about.values.trust.description')
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t('about.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">{t('about.story.title')}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t('about.story.p1')}</p>
              <p>{t('about.story.p2')}</p>
              <p>{t('about.story.p3')}</p>
              <p>{t('about.story.p4')}</p>
            </div>
          </div>

          <div className="bg-muted rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">{t('about.promise.title')}</h3>
            <blockquote className="text-lg italic text-muted-foreground leading-relaxed">
              {t('about.promise.text')}
            </blockquote>

            <div className="mt-8 p-6 bg-accent/10 rounded-lg">
              <blockquote className="text-lg italic text-foreground text-center mb-3">
                {t('about.promise.hadith')}
              </blockquote>
              <cite className="text-sm text-center text-muted-foreground block">{t('about.promise.hadithCite')}</cite>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t('about.values.title')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('about.values.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quality Section */}
        <div className="bg-muted rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">{t('about.quality.title')}</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>{t('about.quality.p1')}</p>
                <p>{t('about.quality.p2')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-background p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">{t('about.quality.cotton.title')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('about.quality.cotton.description')}
                </p>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">{t('about.quality.preTreated.title')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('about.quality.preTreated.description')}
                </p>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">{t('about.quality.traditional.title')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('about.quality.traditional.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
