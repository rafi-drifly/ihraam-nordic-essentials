import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import posthog from "posthog-js";

export const HajjPrepPackForm = () => {
  const { t, i18n } = useTranslation();
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
    const trimmedLower = trimmed.toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({
        title: t("home.prepPack.errorInvalidEmail"),
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      posthog.identify(trimmedLower, {
        email: trimmedLower,
        lead_magnet: "hajj_prep_pack",
        first_seen_at: new Date().toISOString(),
      });
      posthog.capture("hajj_prep_pack_requested", {
        email: trimmedLower,
        lead_magnet: "hajj_prep_pack",
        source: "homepage",
        locale,
      });

      const { error } = await supabase.functions.invoke("send-prep-pack", {
        body: { email: trimmed, locale, source: "homepage" },
      });
      if (error) throw error;
      setSubmitted(true);
      setEmail("");
    } catch (err) {
      console.error("Prep pack signup failed:", err);
      posthog.capture("hajj_prep_pack_request_failed", {
        email: trimmedLower,
        error: err instanceof Error ? err.message : String(err),
      });
      toast({
        title: t("home.prepPack.errorSendTitle"),
        description: t("home.prepPack.errorSendBody"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const bullets = [
    t("home.prepPack.bullets.checklist"),
    t("home.prepPack.bullets.duas"),
    t("home.prepPack.bullets.timeline"),
  ];

  return (
    <section id="hajj-prep-pack" className="py-14 bg-secondary/40 scroll-mt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background border border-border rounded-2xl p-6 lg:p-10 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
              {t("home.prepPack.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("home.prepPack.subtitle")}
            </p>
          </div>

          <ul className="space-y-2 mb-6 max-w-md mx-auto">
            {bullets.map((item) => (
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
              <p className="text-foreground font-medium mb-1">
                {t("home.prepPack.successTitle")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("home.prepPack.successBody")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  required
                  placeholder={t("home.prepPack.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  aria-label={t("home.prepPack.emailAriaLabel")}
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
                      {t("home.prepPack.submitting")}
                    </>
                  ) : (
                    t("home.prepPack.submit")
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {t("home.prepPack.disclaimer")}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
