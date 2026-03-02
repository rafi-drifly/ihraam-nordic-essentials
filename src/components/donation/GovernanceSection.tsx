import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Shield, MessageCircle } from "lucide-react";

interface GovernanceSectionProps {
  localePrefix: string;
}

const GovernanceSection = ({ localePrefix }: GovernanceSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Questions & Accountability
            </h2>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We welcome feedback and are committed to transparency in all our work.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href="mailto:support@pureihraam.com" className="text-primary hover:underline">
                      support@pureihraam.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">Pure Ihram, Sweden</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6" asChild>
                <Link to={`${localePrefix}/contact`}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send a Message
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Amanah Statement */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">{t('transparency.amanah.title')}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {t('transparency.amanah.text')}
              </p>
              <blockquote className="text-sm italic text-muted-foreground border-l-2 border-primary pl-4">
                {t('transparency.amanah.quote')}
              </blockquote>
            </CardContent>
          </Card>
        </div>

        {/* Spiritual Quote */}
        <Card className="mt-8 border-primary/20">
          <CardContent className="p-8 text-center">
            <blockquote className="text-lg italic text-muted-foreground mb-2">
              {t('donation.quote')}
            </blockquote>
            <cite className="text-sm text-muted-foreground">
              {t('donation.quoteCite')}
            </cite>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default GovernanceSection;
