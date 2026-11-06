import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useLocalePrefix } from "@/i18n/useLocale";
import { supabase } from "@/integrations/supabase/client";
import { UNIT_PRICE, getBundlePrice } from "@/lib/bundles";
import ihraamProduct from "@/assets/hero-product.avif";
import { cn } from "@/lib/utils";
import { HomePhoto } from "./HomePhoto";

interface OfferConfig {
  sku: "IHRAM-1" | "IHRAM-2" | "IHRAM-3";
  key: "single" | "twoPack" | "threePack";
  qty: number;
}

// Prices are read from the module the checkout function charges from
// (`getBundlePrice`), so this list, the cart and Stripe cannot disagree.
const OFFERS: OfferConfig[] = [
  { sku: "IHRAM-1", key: "single", qty: 1 },
  { sku: "IHRAM-2", key: "twoPack", qty: 2 },
  { sku: "IHRAM-3", key: "threePack", qty: 3 },
];

// Shipping, delivery, returns and payment, said once, where people decide.
// These replaced the hero microcopy, the trust row under the testimonial, the
// icon cards and the shipping strip, which said the same things four times.
const FACTS = ["delivery", "shipping", "returns", "payment"] as const;

// Warm Gold: once a page, only on a price (brand manual p. 8).
const GOLD = "#EEBD2B";
const HAIRLINE = "border-[#D3E1E1]";

/**
 * The homepage's one place to buy: Single Set, 2-Pack or 3-Pack, then one
 * button. Replaced the Nov 2026 pricing-table cards (badges, "Save €10").
 */
export const ProductOffersBlock = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  // The French copy writes "19 €"; the other languages write "€19".
  const formatPrice = (amount: number) =>
    i18n.language?.startsWith("fr") ? `${amount} €` : `€${amount}`;
  const { toast } = useToast();
  // Was a hard-coded /sv and /no ternary, so French visitors who picked an
  // offer here were dropped onto the English shop.
  const localePrefix = useLocalePrefix();
  const [selectedSku, setSelectedSku] = useState<OfferConfig["sku"]>("IHRAM-1");

  // The catalogue id of the one product this block sells. The basket used to
  // carry the SKU ("IHRAM-2") instead, and the checkout function rejects an id
  // that is not a product id: every basket started from the homepage failed at
  // "Proceed to Checkout" with a 400, while the shop and cart pages worked.
  const [productId, setProductId] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("id")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (!cancelled && data?.id) setProductId(data.id);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (offer: OfferConfig) => {
    const title = t(`home.offers.${offer.key}.title`);
    addItem(
      {
        // Falls back to the SKU only if the catalogue lookup has not landed
        // yet; the checkout function resolves an unknown id to the active
        // product rather than refusing the sale.
        id: productId ?? offer.sku,
        name: `Pure Ihram - ${title}`,
        // The flat unit price, as the shop page stores it, so a basket built
        // from both places merges into one line. Never a derived fraction:
        // 55/3 showed "18.33€ each" beside a 55€ subtotal.
        price: UNIT_PRICE,
        image: ihraamProduct,
      },
      offer.qty,
    );
    toast({
      title: t("home.offers.addedToCart"),
      description: t("home.offers.addedToCartDescription", { title }),
    });
    navigate(`${localePrefix}/shop`);
  };

  const selected = OFFERS.find((o) => o.sku === selectedSku) ?? OFFERS[0];

  return (
    <section id="sets" className="scroll-mt-20 bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <h2 className="text-[2rem] font-normal leading-[1.2] tracking-[-0.01em] text-foreground lg:text-[2.5rem]">
              {t("home.offers.title")}
            </h2>

            <fieldset className="mt-10">
              <legend className="sr-only">{t("home.offers.legend")}</legend>
              <div className={cn("border-t", HAIRLINE)}>
                {OFFERS.map((offer) => {
                  const isSelected = offer.sku === selectedSku;
                  return (
                    <label
                      key={offer.sku}
                      className={cn("flex cursor-pointer items-start gap-4 border-b py-5", HAIRLINE)}
                    >
                      <input
                        type="radio"
                        name="ihram-set"
                        value={offer.sku}
                        checked={isSelected}
                        onChange={() => setSelectedSku(offer.sku)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
                          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-secondary",
                          isSelected ? "border-primary" : "border-foreground/40",
                        )}
                      >
                        {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                      </span>
                      <span className="flex-1">
                        <span className="block font-bold text-foreground">
                          {t(`home.offers.${offer.key}.title`)}
                        </span>
                        <span className="mt-1 block text-[0.9375rem] leading-[1.6] text-foreground">
                          {t(`home.offers.${offer.key}.description`)}
                        </span>
                      </span>
                      <span
                        className="shrink-0 rounded px-2 py-0.5 text-lg font-bold leading-snug text-foreground"
                        style={{ backgroundColor: isSelected ? GOLD : "transparent" }}
                      >
                        {formatPrice(getBundlePrice(offer.qty))}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={() => handleSelect(selected)}
              className="mt-8 h-12 w-full rounded-md bg-primary px-8 text-[0.9375rem] font-bold text-primary-foreground transition-colors hover:bg-[#205A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
            >
              {t("home.offers.addToCart")}
            </button>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <HomePhoto name="sets" frameClassName="aspect-[4/3] lg:aspect-[4/5]" />
          </div>
        </div>

        <dl className={cn("mt-16 grid grid-cols-1 gap-8 border-t pt-10 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4", HAIRLINE)}>
          {FACTS.map((key) => (
            <div key={key}>
              <dt className="text-sm font-bold text-foreground">
                {t(`home.offers.facts.${key}.label`)}
              </dt>
              <dd className="mt-2 text-[0.9375rem] leading-[1.6] text-foreground">
                {t(`home.offers.facts.${key}.text`)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};
