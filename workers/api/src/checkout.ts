/**
 * Checkout on Cloudflare.
 *
 * Builds the Stripe Checkout session that the Supabase function create-checkout
 * used to build, with the same validation, the same prices and the same
 * delivery choices, so the customer sees the same Stripe page. Moved here in
 * Nov 2026, when the paused Supabase project left the shop unable to sell.
 *
 * Differences from the Supabase function, all deliberate:
 * - The product comes from src/lib/product.ts, not a database read.
 * - No customer login lookup: every order the shop has had was a guest order.
 * - The Stripe page no longer calls the packs "Best Value" or "Most Popular",
 *   and the description no longer says "Premium" (brand manual p. 15).
 * - The return address is the site's own origin from an allow-list, never
 *   whatever Origin header a request carries.
 *
 * Stripe is called over its REST API with fetch, so the Worker needs no Stripe
 * package. The key is the Worker secret STRIPE_SECRET_KEY.
 */

import { getBundlePrice, getBundleType } from "../../../supabase/functions/create-checkout/pricing";
import { PRODUCT } from "../../../src/lib/product";
import { STRIPE_VERSION, toStripeForm } from "./stripe";

export { toStripeForm };

export interface CheckoutEnv {
  ALLOWED_ORIGINS: string;
  STRIPE_SECRET_KEY?: string;
}

export interface CheckoutInput {
  items: Array<{ id: string; quantity: number }>;
  donation?: number;
  bundlePrice?: number;
  /** Two-letter language code, used only for the wording on the Stripe page. */
  lang: string;
  shippingCountry?: string;
  pickupLocation?: string;
  cancelPath: string;
}

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

/** Must match src/lib/pickupLocations.ts. */
export const PICKUP_LOCATIONS: Record<string, string> = {
  "uppsala-mosque": "Free pickup - Uppsala Mosque",
  "stockholm-mosque": "Free pickup - Stockholm Mosque",
};

export const EUROPE_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "SE", "GB", "NO", "IS", "LI", "CH",
] as const;

/** €9: what delivery costs inside Sweden. Elsewhere the cost is confirmed before shipping. */
export const SHIPPING_FEE_EUR = 9;

const DELIVERY_LABELS: Record<string, string> = {
  en: "Delivery to your address",
  sv: "Leverans till din adress",
  no: "Levering til adressen din",
  fr: "Livraison à votre adresse",
};

const PACK_LABELS: Record<string, { two: string; three: string }> = {
  en: { two: "2-Pack", three: "3-Pack" },
  sv: { two: "2-Pack", three: "3-Pack" },
  no: { two: "2-Pack", three: "3-Pack" },
  fr: { two: "Lot de 2", three: "Lot de 3" },
};

const SHIPPING_MESSAGE =
  "We ship to Sweden (3-7 business days). For orders outside Sweden, shipping costs may vary - we'll contact you with the exact delivery fee before dispatching.";

const DEFAULT_ORIGIN = "https://www.pureihram.com";

export function parseCheckout(body: unknown): Parsed<CheckoutInput> {
  const input = (body ?? {}) as Record<string, unknown>;
  const fail = (error: string): Parsed<CheckoutInput> => ({ ok: false, error });

  const items = input.items;
  if (!Array.isArray(items) || items.length === 0 || items.length > 20) return fail("Invalid items");
  for (const it of items as Array<Record<string, unknown>>) {
    // The id only says which product; the charge is computed from quantity.
    if (!it || typeof it.id !== "string" || it.id.length === 0 || it.id.length > 64) return fail("Invalid item id");
    if (!Number.isInteger(it.quantity) || (it.quantity as number) < 1 || (it.quantity as number) > 50) {
      return fail("Invalid item quantity");
    }
  }

  const { donation, bundlePrice, locale, promoCode, shippingCity, shippingCountry, pickupLocation, cancelPath } = input;
  if (donation !== undefined && donation !== null) {
    if (typeof donation !== "number" || !Number.isFinite(donation) || donation < 0 || donation > 10000) {
      return fail("Invalid donation amount");
    }
  }
  if (bundlePrice !== undefined && bundlePrice !== null) {
    if (typeof bundlePrice !== "number" || !Number.isFinite(bundlePrice) || bundlePrice < 0 || bundlePrice > 100000) {
      return fail("Invalid bundle price");
    }
  }
  // Wording only, never a reason to refuse a sale: any well-formed code, with
  // region tags such as "sv-SE" accepted.
  if (locale !== undefined && (typeof locale !== "string" || !/^[a-z]{2}(-[A-Za-z]{2})?$/.test(locale))) {
    return fail("Invalid locale");
  }
  if (promoCode !== undefined && promoCode !== null) {
    if (typeof promoCode !== "string" || promoCode.length > 64 || !/^[A-Za-z0-9_-]+$/.test(promoCode)) {
      return fail("Invalid promo code format");
    }
  }
  if (shippingCity !== undefined && shippingCity !== null && (typeof shippingCity !== "string" || shippingCity.length > 100)) {
    return fail("Invalid shipping city");
  }
  if (shippingCountry !== undefined && shippingCountry !== null) {
    if (typeof shippingCountry !== "string" || !/^[A-Z]{2}$/.test(shippingCountry)) return fail("Invalid shipping country");
  }
  if (pickupLocation !== undefined && pickupLocation !== null) {
    if (typeof pickupLocation !== "string" || !PICKUP_LOCATIONS[pickupLocation]) return fail("Invalid pickup location");
  }

  // A same-origin path only, never a URL: an open redirect here would let a
  // crafted link bounce a paying customer to someone else's page.
  const safeCancelPath =
    typeof cancelPath === "string" && /^\/[A-Za-z0-9\-/_]{0,64}$/.test(cancelPath) ? cancelPath : "/cart";

  return {
    ok: true,
    value: {
      items: (items as Array<{ id: string; quantity: number }>).map((it) => ({ id: it.id, quantity: it.quantity })),
      donation: typeof donation === "number" ? donation : undefined,
      bundlePrice: typeof bundlePrice === "number" ? bundlePrice : undefined,
      lang: typeof locale === "string" ? locale.slice(0, 2).toLowerCase() : "en",
      shippingCountry: typeof shippingCountry === "string" ? shippingCountry : undefined,
      pickupLocation: typeof pickupLocation === "string" ? pickupLocation : undefined,
      cancelPath: safeCancelPath,
    },
  };
}

/** The site's own address to send the customer back to: an allowed origin or the shop. */
export function returnOrigin(requestOrigin: string | null, env: Pick<CheckoutEnv, "ALLOWED_ORIGINS">): string {
  const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  if (requestOrigin && (allowed.includes(requestOrigin) || /^http:\/\/localhost:\d+$/.test(requestOrigin))) {
    return requestOrigin;
  }
  return DEFAULT_ORIGIN;
}

/** The Checkout Session, as a plain object. Pure, so the tests can read it. */
export function buildSessionParams(input: CheckoutInput, origin: string): Record<string, unknown> {
  const totalQuantity = input.items.reduce((sum, it) => sum + it.quantity, 0);
  const isPickup = !!(input.pickupLocation && PICKUP_LOCATIONS[input.pickupLocation]);
  const pickupLabel = isPickup ? PICKUP_LOCATIONS[input.pickupLocation as string] : "";

  // Priced from the quantity, never from the browser's bundlePrice, which is
  // only compared. A crafted request cannot name its own price.
  const totalCents = Math.round(getBundlePrice(totalQuantity) * 100);
  if (input.bundlePrice !== undefined && Math.round(input.bundlePrice * 100) !== totalCents) {
    console.warn("checkout: client bundlePrice disagrees with the server price; using the server price", {
      client: input.bundlePrice,
      server: totalCents / 100,
      totalQuantity,
    });
  }

  const packs = PACK_LABELS[input.lang] ?? PACK_LABELS.en;
  const name =
    totalQuantity === 2 ? `${PRODUCT.name} - ${packs.two}` : totalQuantity >= 3 ? `${PRODUCT.name} - ${packs.three}` : PRODUCT.name;

  const lineItems: Array<Record<string, unknown>> = [
    {
      price_data: {
        currency: "eur",
        product_data: { name, description: PRODUCT.description },
        unit_amount: totalCents,
      },
      quantity: 1,
    },
  ];
  if (input.donation && input.donation > 0) {
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: {
          name: "Voluntary Donation - Support Our Mission",
          description: "Thank you for supporting Pure Ihram's mission",
        },
        unit_amount: Math.round(input.donation * 100),
      },
      quantity: 1,
    });
  }

  return {
    mode: "payment",
    currency: "eur",
    line_items: lineItems,
    payment_method_types: ["card", "klarna"],
    success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${input.cancelPath}`,
    // Always collected: Stripe only shows shipping_options once it has an
    // address, and the delivery-or-pickup choice lives there.
    shipping_address_collection: { allowed_countries: [...EUROPE_COUNTRIES] },
    custom_text: { shipping_address: { message: SHIPPING_MESSAGE } },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: SHIPPING_FEE_EUR * 100, currency: "eur" },
          display_name: DELIVERY_LABELS[input.lang] ?? DELIVERY_LABELS.en,
        },
      },
      ...Object.values(PICKUP_LOCATIONS).map((label) => ({
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "eur" },
          display_name: label,
        },
      })),
    ],
    phone_number_collection: { enabled: true },
    // The same keys the Supabase function wrote: the order alert Worker reads
    // total_quantity, delivery_method and pickup_location from here.
    metadata: {
      user_id: "",
      items: JSON.stringify(input.items.map((it) => ({ id: PRODUCT.id, quantity: it.quantity }))),
      total_quantity: String(totalQuantity),
      bundle_type: getBundleType(totalQuantity),
      base_shipping_fee_eur: String(SHIPPING_FEE_EUR),
      shipping_fee_applied: String(isPickup ? 0 : SHIPPING_FEE_EUR),
      delivery_method: isPickup ? "pickup" : "shipping",
      pickup_location: pickupLabel,
      donation: input.donation && input.donation > 0 ? "true" : "false",
      donation_amount: input.donation && input.donation > 0 ? String(input.donation) : "0",
      pricing_currency: "EUR",
      created_by: "pureihram-api",
    },
  };
}

export async function handleCheckout(
  request: Request,
  env: CheckoutEnv,
  json: (body: unknown, status: number) => Response,
): Promise<Response> {
  const parsed = parseCheckout(await request.json().catch(() => null));
  if ("error" in parsed) return json({ error: parsed.error }, 400);

  if (!env.STRIPE_SECRET_KEY) {
    console.error("checkout: STRIPE_SECRET_KEY is not set");
    return json({ error: "Checkout is not available right now. Please try again shortly." }, 503);
  }

  const params = buildSessionParams(parsed.value, returnOrigin(request.headers.get("Origin"), env));

  let response: Response;
  try {
    response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Stripe-Version": STRIPE_VERSION,
      },
      body: toStripeForm(params),
    });
  } catch (error) {
    console.error("checkout: Stripe request failed", error instanceof Error ? error.message : String(error));
    return json({ error: "Could not start checkout. Please try again." }, 502);
  }

  const data = (await response.json().catch(() => ({}))) as { id?: string; url?: string; error?: { message?: string; type?: string } };
  if (!response.ok || !data.url) {
    // Stripe's own message names the problem (a bad key, a bad parameter) and
    // never contains the key, so it is safe to log. The customer gets a plain one.
    console.error(`checkout: Stripe returned ${response.status}`, data.error?.type, data.error?.message);
    return json({ error: "Could not start checkout. Please try again." }, 502);
  }

  console.log("checkout: session created", data.id);
  return json({ url: data.url }, 200);
}
