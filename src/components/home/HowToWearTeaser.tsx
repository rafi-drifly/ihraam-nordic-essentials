import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import howToWearImg from "@/assets/blog/how-to-wear-ihram.png";

export const HowToWearTeaser = () => {
  const location = useLocation();
  const localePrefix = location.pathname.startsWith("/sv")
    ? "/sv"
    : location.pathname.startsWith("/no")
    ? "/no"
    : "";

  return (
    <section className="py-14 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              First Hajj? Here&rsquo;s how to wear Ihram.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              A simple step-by-step guide for first-time pilgrims - written by Muslims, for
              Muslims.
            </p>
            <Button asChild variant="outline" size="lg" className="group">
              <Link
                to={`${localePrefix}/blog/how-to-wear-ihram`}
                className="inline-flex items-center gap-2"
              >
                Read the full guide
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className="order-1 md:order-2">
            <img
              src={howToWearImg}
              alt="Step-by-step guide to wearing Ihram"
              className="rounded-2xl shadow-md w-full"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
