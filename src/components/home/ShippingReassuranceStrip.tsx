import { Truck, Clock, Zap, RotateCcw, ShieldCheck } from "lucide-react";

const ITEMS = [
  { icon: Truck, label: "Free EU shipping on orders over €40" },
  { icon: Clock, label: "Standard EU delivery: 2-4 business days from Sweden" },
  { icon: Zap, label: "Express shipping at checkout" },
  { icon: RotateCcw, label: "14-day free returns - no questions asked" },
  { icon: ShieldCheck, label: "Stripe-secure: Apple Pay, Google Pay, Klarna" },
];

export const ShippingReassuranceStrip = () => {
  return (
    <section className="py-12 bg-muted">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {ITEMS.map(({ icon: Icon, label }) => (
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
