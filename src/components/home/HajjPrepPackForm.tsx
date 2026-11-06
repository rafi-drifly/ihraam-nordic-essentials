import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2 } from "lucide-react";
import { postToApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { identifyUser, trackEvent } from "@/lib/analytics";

declare global {
  interface Window {
    klaviyo?: { push: (args: unknown[]) => void };
  }
}

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
      identifyUser(trimmedLower, {
        lead_magnet: "hajj_prep_pack",
        first_seen_at: new Date().toISOString(),
      });
      trackEvent("hajj_prep_pack_requested", {
        email: trimmedLower,
        lead_magnet: "hajj_prep_pack",
        source: "homepage",
        locale,
      });

      window.klaviyo?.push(["identify", { email: trimmedLower }]);
      window.klaviyo?.push([
        "track",
        "Requested Hajj Prep Pack",
        { lead_magnet: "hajj_prep_pack", source: "homepage", locale },
      ]);

      await postToApi("/prep-pack", { email: trimmed, locale, source: "homepage" });
      setSubmitted(true);
      setEmail("");
    } catch (err) {
      console.error("Prep pack signup failed:", err);
      trackEvent("hajj_prep_pack_request_failed", {
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
    <section id="hajj-prep-pack" className="scroll-mt-20 bg-secondary">
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <h2 className="text-[2rem] font-normal leading-[1.2] tracking-[-0.01em] text-foreground lg:text-[2.5rem]">
          {t("home.prepPack.title")}
        </h2>
        <p className="mt-6 text-lg leading-[1.6] text-foreground">
          {t("home.prepPack.subtitle")}
        </p>

        <ul className="mt-8 space-y-2">
          {bullets.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[0.9375rem] leading-[1.6] text-foreground">
              <Check className="mt-1 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {submitted ? (
          <div className="mt-10 border-t border-[#D3E1E1] pt-6" role="status" aria-live="polite">
            <p className="font-bold text-foreground">{t("home.prepPack.successTitle")}</p>
            <p className="mt-1 text-[0.9375rem] text-foreground">{t("home.prepPack.successBody")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                required
                placeholder={t("home.prepPack.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                aria-label={t("home.prepPack.emailAriaLabel")}
                className="h-12 flex-1 bg-white text-base"
              />
              <Button
                type="submit"
                disabled={submitting}
                className="h-12 bg-primary px-8 text-[0.9375rem] font-bold hover:bg-[#205A5A]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("home.prepPack.submitting")}
                  </>
                ) : (
                  t("home.prepPack.submit")
                )}
              </Button>
            </div>
            <p className="mt-3 text-sm text-foreground">{t("home.prepPack.disclaimer")}</p>
          </form>
        )}
      </div>
    </section>
  );
};
