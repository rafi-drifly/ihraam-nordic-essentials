import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, Globe } from "lucide-react";

const CommitmentCards = () => {
  const { t } = useTranslation();

  const commitments = [
    {
      icon: Users,
      title: t('donation.why.affordable'),
      description: t('donation.why.affordableDesc')
    },
    {
      icon: Building2,
      title: t('donation.why.masjids'),
      description: t('donation.why.masjidsDesc')
    },
    {
      icon: Globe,
      title: t('donation.why.education'),
      description: t('donation.why.educationDesc')
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {commitments.map((commitment, index) => (
            <Card key={index} className="text-center border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 mb-5">
                  <commitment.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-3">{commitment.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {commitment.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommitmentCards;
