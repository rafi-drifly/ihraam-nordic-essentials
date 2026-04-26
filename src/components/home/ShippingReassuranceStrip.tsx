import { useTranslation } from "react-i18next";
import { Truck, Clock, Zap, RotateCcw, ShieldCheck } from "lucide-react";

export const ShippingReassuranceStrip = () => {
  const { t } = useTranslation();

  const items = [
    { icon: Truck, label: t("home.shipping.freeEu") },
    { icon: Clock, label: t("home.shipping.delivery") },
    { icon: Zap, label: t("home.shipping.express") },
    { icon: RotateCcw, label: t("home.shipping.returns") },
    { icon: ShieldCheck, label: t("home.shipping.secure") },
  ];

  return (
    <section className="py-12 bg-muted">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {items.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <p className="text-sm text-foreground leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
