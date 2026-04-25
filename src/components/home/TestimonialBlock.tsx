import { MapPin, Lock, RotateCcw } from "lucide-react";

export const TestimonialBlock = () => {
  return (
    <section className="py-10 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-secondary/50 border border-border rounded-2xl p-6 lg:p-8">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0"
              aria-hidden="true"
            >
              MS
            </div>
            <div className="flex-1">
              <p className="text-foreground text-base lg:text-lg leading-relaxed mb-3">
                &ldquo;A really good experience. The quality met my expectations, and I&rsquo;d
                happily recommend Pure Ihram to anyone preparing for Hajj or Umrah.&rdquo;
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Mohsin Saleemi</span>
                <span className="mx-2">·</span>
                Västerås, Sweden
                <span className="mx-2">·</span>
                Verified buyer
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
            <span>Ships from Sweden - 2-4 day EU delivery</span>
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Lock className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
            <span>Stripe-secure: Apple Pay, Klarna</span>
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <RotateCcw className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
            <span>14-day free returns</span>
          </div>
        </div>
      </div>
    </section>
  );
};
