import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import ihraamProduct from "@/assets/hero-product.avif";

interface OfferConfig {
  sku: "IHRAM-1" | "IHRAM-2" | "IHRAM-3";
  key: "single" | "twoPack" | "threePack";
  qty: number;
  price: number; // bundle total in EUR (excl. shipping)
  saving?: number; // shipping-inclusive saving vs. buying singly
  badgeTone?: "teal" | "gold";
  highlighted?: boolean;
  mobileOrder: number; // CSS order at <768px
}

// Pricing locked site-wide: €19 / €37 / €55 + flat €9 shipping.
// AUTHORITATIVE SOURCE for prices/savings is `src/lib/bundles.ts` (BUNDLES).
// The savings below mirror that file - update both together if pricing changes.
// Single (1 set) = €19 + €9 = €28 total.
// 2-Pack vs buying 2 singles: €46 vs €56  -> save €10 (one shipping fee).
// 3-Pack vs buying 3 singles: €64 vs €84  -> save €20 (one shipping fee).
const OFFERS: OfferConfig[] = [
  { sku: "IHRAM-1", key: "single", qty: 1, price: 19, mobileOrder: 2 },
  {
    sku: "IHRAM-2",
    key: "twoPack",
    qty: 2,
    price: 37,
    saving: 10,
    badgeTone: "teal",
    highlighted: true,
    mobileOrder: 1,
  },
  {
    sku: "IHRAM-3",
    key: "threePack",
    qty: 3,
    price: 55,
    saving: 20,
    badgeTone: "gold",
    mobileOrder: 3,
  },
];

export const ProductOffersBlock = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { addItem } = useCart();
  const { toast } = useToast();

  const localePrefix = location.pathname.startsWith("/sv")
    ? "/sv"
    : location.pathname.startsWith("/no")
    ? "/no"
    : "";

  const handleSelect = (offer: OfferConfig) => {
    const title = t(`home.offers.${offer.key}.title`);
    addItem(
      {
        id: offer.sku,
        name: `Pure Ihram - ${title}`,
        price: offer.price / offer.qty, // unit price, matches Shop convention
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

  return (
    <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 1200 }}
      >
        {/* Heading */}
        <div className="text-center mb-10">
          <h2
            className="font-bold"
            style={{
              color: "#305050",
              fontSize: "clamp(28px, 4vw, 36px)",
              lineHeight: 1.2,
            }}
          >
            {t("home.offers.title")}
          </h2>
          <p
            className="mx-auto mt-3"
            style={{
              color: "#6B7280",
              fontSize: 16,
              lineHeight: 1.5,
              maxWidth: 540,
            }}
          >
            {t("home.offers.subtitle")}
          </p>
        </div>

        {/* Cards grid */}
        <div className="offers-grid">
          {OFFERS.map((offer) => {
            const isHighlighted = !!offer.highlighted;
            const title = t(`home.offers.${offer.key}.title`);
            const description = t(`home.offers.${offer.key}.description`);
            const ctaLabel = t(`home.offers.${offer.key}.cta`);
            const badgeLabel = offer.badgeTone
              ? t(`home.offers.${offer.key}.badge`)
              : null;
            return (
              <div
                key={offer.sku}
                role="group"
                aria-label={t("home.offers.ariaLabel", {
                  title,
                  price: offer.price,
                  description,
                })}
                onClick={() => handleSelect(offer)}
                className={`offer-card ${isHighlighted ? "offer-card--highlighted" : ""}`}
                style={{ order: offer.mobileOrder }}
              >
                {badgeLabel && (
                  <span
                    aria-hidden="true"
                    className="offer-badge"
                    style={{
                      background:
                        offer.badgeTone === "teal" ? "#287777" : "#EEBD2B",
                      color: offer.badgeTone === "teal" ? "#FFFFFF" : "#1A1A1A",
                    }}
                  >
                    {badgeLabel}
                  </span>
                )}

                <h3
                  className="text-center"
                  style={{
                    color: "#305050",
                    fontSize: 24,
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  {title}
                </h3>

                <div className="text-center" style={{ marginBottom: 4 }}>
                  <span
                    style={{
                      color: "#305050",
                      fontSize: 48,
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    €{offer.price}
                  </span>
                  <span
                    style={{
                      color: "#6B7280",
                      fontSize: 14,
                      fontWeight: 400,
                      marginLeft: 4,
                    }}
                  >
                    {" "}
                    {t("home.offers.shippingSuffix")}
                  </span>
                </div>

                {/* Savings line - reserves vertical space on Single Set so cards align */}
                <div
                  className="text-center"
                  style={{ minHeight: 44, marginBottom: 12 }}
                >
                  {offer.saving ? (
                    <>
                      <div
                        style={{
                          color: "#287777",
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        {t("home.offers.saveAmount", { amount: offer.saving })}
                      </div>
                      <div
                        style={{
                          color: "#6B7280",
                          fontSize: 13,
                          fontWeight: 400,
                          marginTop: 2,
                        }}
                      >
                        {t("home.offers.oneShippingFee")}
                      </div>
                    </>
                  ) : null}
                </div>

                <p
                  className="text-center"
                  style={{
                    color: "#4B5563",
                    fontSize: 15,
                    lineHeight: 1.5,
                    marginBottom: 24,
                  }}
                >
                  {description}
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(offer);
                  }}
                  className="offer-cta"
                >
                  {ctaLabel}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer line */}
        <p
          className="text-center mx-auto"
          style={{
            color: "#6B7280",
            fontSize: 14,
            lineHeight: 1.5,
            maxWidth: 600,
            marginTop: 32,
          }}
        >
          {t("home.offers.footerLine")}
        </p>
      </div>

      {/* Scoped styles - keeps spec hex values exact and handles responsive + hover/focus */}
      <style>{`
        .offers-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .offers-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }
        @media (min-width: 1024px) {
          .offers-grid {
            gap: 24px;
          }
        }
        /* On desktop, neutralize the mobile CSS order so cards render Single | 2-Pack | 3-Pack */
        @media (min-width: 768px) {
          .offers-grid > .offer-card { order: 0 !important; }
        }

        .offer-card {
          position: relative;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 32px;
          cursor: pointer;
          transition: transform 200ms ease, box-shadow 200ms ease;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .offer-card { padding: 24px; }
        }
        .offer-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
        }
        .offer-card--highlighted {
          border: 2px solid #287777;
          box-shadow: 0 8px 24px rgba(40, 119, 119, 0.12);
        }
        .offer-card--highlighted:hover {
          transform: none;
          box-shadow: 0 8px 24px rgba(40, 119, 119, 0.12);
        }

        .offer-badge {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 999px;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }

        .offer-cta {
          width: 100%;
          height: 48px;
          background: #287777;
          color: #FFFFFF;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 200ms ease;
          margin-top: auto;
        }
        .offer-cta:hover {
          background: #205A5A;
        }
        .offer-cta:focus-visible {
          outline: 3px solid #EEBD2B;
          outline-offset: 2px;
        }
      `}</style>
    </section>
  );
};
