import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Utensils, Home, Stethoscope, AlertTriangle, Shield, CheckCircle } from "lucide-react";

const NeedyProjectsSection = () => {
  const { t } = useTranslation();

  const projects = [
    { icon: Utensils, label: "Food / Hunger Relief", color: "text-orange-500" },
    { icon: Home, label: "Winter Support / Shelter", color: "text-blue-500" },
    { icon: Stethoscope, label: "Medical Support", color: "text-green-500" },
    { icon: AlertTriangle, label: "Emergency / Crisis Support", color: "text-red-500" }
  ];

  const criteria = [
    "Verified partners or credible local organizers",
    "Clear distribution plan",
    "Proof requested (receipts/photos/written summary where appropriate)"
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <h2 className="text-2xl font-bold text-foreground">
              Needy Projects (Global)
            </h2>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Your donations support verified humanitarian projects where people are suffering across the globe.
          </p>
        </div>

        {/* Project Types */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {projects.map((project, index) => (
            <Card key={index} className="text-center">
              <CardContent className="py-6">
                <project.icon className={`h-8 w-8 ${project.color} mx-auto mb-3`} />
                <p className="text-sm font-medium">{project.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How We Choose Projects */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              How We Choose Projects
            </h3>
            <ul className="space-y-3">
              {criteria.map((criterion, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {criterion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default NeedyProjectsSection;
