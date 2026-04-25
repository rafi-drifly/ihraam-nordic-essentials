import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const HajjPrepPackForm = () => {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const locale = (i18n.language === "sv" || i18n.language === "no" ? i18n.language : "en") as
    | "en"
    | "sv"
    | "no";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({
        title: "Please enter a valid email",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-prep-pack", {
        body: { email: trimmed, locale, source: "homepage" },
      });
      if (error) throw error;
      setSubmitted(true);
      setEmail("");
    } catch (err) {
      console.error("Prep pack signup failed:", err);
      toast({
        title: "Could not send the pack",
        description: "Please try again in a moment, or contact support@pureihraam.com.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="hajj-prep-pack" className="py-14 bg-secondary/40 scroll-mt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background border border-border rounded-2xl p-6 lg:p-10 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
              Going for Hajj 2026? Get our free Pure Ihram Prep Pack.
            </h2>
            <p className="text-muted-foreground">
              A printable checklist, dua list, and packing guide for first-time pilgrims. Free -
              even if you don&rsquo;t buy from us.
            </p>
          </div>

          <ul className="space-y-2 mb-6 max-w-md mx-auto">
            {[
              "12-item Hajj packing checklist (the things most pilgrims forget)",
              "Essential duas with transliteration - for ihram, tawaf, sa'i, Arafah",
              "Day-by-day Hajj prep timeline starting 30 days out",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {submitted ? (
            <div
              className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center"
              role="status"
              aria-live="polite"
            >
              <p className="text-foreground font-medium mb-1">Check your inbox</p>
              <p className="text-sm text-muted-foreground">
                We&rsquo;ve sent the Prep Pack download link to your email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  aria-label="Your email address"
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send the Pack"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                No spam. We&rsquo;ll send the pack and a few helpful Hajj tips before you go.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
