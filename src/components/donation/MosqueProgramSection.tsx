import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight } from "lucide-react";

interface MosqueProgramSectionProps {
  localePrefix: string;
}

const MosqueProgramSection = ({ localePrefix }: MosqueProgramSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {t('mosqueSupport.hero.title')}
              </h2>
            </div>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {t('mosqueSupport.hero.subtitle')}
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-blue-500 font-bold">•</span>
                We supply Ihrams to mosques (free or subsidized depending on availability)
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-blue-500 font-bold">•</span>
                Mosques can sell and keep proceeds for mosque needs (rent, utilities, renovation, education)
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-blue-500 font-bold">•</span>
                Priority given to mosques with demonstrated need
              </li>
            </ul>

            <Button asChild>
              <Link to={`${localePrefix}/mosque-support`}>
                <Building2 className="h-4 w-4 mr-2" />
                Mosque: Request Ihrams
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="flex-shrink-0">
            <Card className="w-64 border-blue-200 bg-blue-50/50">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
                <p className="text-sm text-muted-foreground">Mosques supported so far</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MosqueProgramSection;
