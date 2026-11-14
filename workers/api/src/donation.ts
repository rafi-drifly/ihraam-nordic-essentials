/**
 * POST /donation-checkout: the Support Our Mission page's Stripe checkout.
 *
 * Ported from the Supabase function create-donation-checkout (14 Nov 2026),
 * with the same validation and the same Stripe session, one-time or monthly.
 * The return address comes from the shop's allow-list rather than whatever
 * Origin a request carries.
 */

import { returnOrigin } from "./checkout";
import { stripeApi, StripeError } from "./stripe";

export interface DonationEnv {
  ALLOWED_ORIGINS: string;
  STRIPE_SECRET_KEY?: string;
}

export interface DonationInput {
  amount: number;
  frequency: "one-time" | "monthly";
  direction: "mosque" | "needy" | "where-needed";
  anonymous: boolean;
  wantsReceipt: boolean;
  receiptEmail?: string;
  coverFees: boolean;
}

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const DIRECTION_LABELS: Record<DonationInput["direction"], string> = {
  mosque: "Mosque Support Program",
  needy: "Needy Projects",
  "where-needed": "Where Most Needed",
};

export function parseDonation(body: unknown): Parsed<DonationInput> {
  const input = (body ?? {}) as Record<string, unknown>;
  const fail = (error: string): Parsed<DonationInput> => ({ ok: false, error });
  const { amount, receiptEmail } = input;
  const frequency = input.frequency ?? "one-time";
  const direction = input.direction ?? "where-needed";
  const anonymous = input.anonymous ?? false;
  const wantsReceipt = input.wantsReceipt ?? false;
  const coverFees = input.coverFees ?? false;

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 1 || amount > 100000) {
    return fail("Invalid donation amount. Must be between €1 and €100,000.");
  }
  if (frequency !== "one-time" && frequency !== "monthly") return fail("Invalid frequency");
  if (direction !== "mosque" && direction !== "needy" && direction !== "where-needed") return fail("Invalid direction");
  if (typeof anonymous !== "boolean" || typeof wantsReceipt !== "boolean" || typeof coverFees !== "boolean") {
    return fail("Invalid boolean flag");
  }
  if (receiptEmail !== undefined && receiptEmail !== null) {
    if (typeof receiptEmail !== "string" || receiptEmail.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiptEmail)) {
      return fail("Invalid receipt email");
    }
  }
  return {
    ok: true,
    value: {
      amount,
      frequency,
      direction,
      anonymous,
      wantsReceipt,
      receiptEmail: typeof receiptEmail === "string" ? receiptEmail : undefined,
      coverFees,
    },
  };
}

export function buildDonationSession(input: DonationInput, origin: string): Record<string, unknown> {
  const label = DIRECTION_LABELS[input.direction];
  const metadata = {
    donation: "true",
    donation_amount: String(input.amount),
    standalone_donation: "true",
    frequency: input.frequency,
    direction: input.direction,
    anonymous: String(input.anonymous),
    covered_fees: String(input.coverFees),
  };
  const monthly = input.frequency === "monthly";
  return {
    mode: monthly ? "subscription" : "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: monthly
            ? { name: `Monthly Donation - ${label}`, description: "Recurring monthly donation to Pure Ihram's mission." }
            : {
                name: `Voluntary Donation - ${label}`,
                description: "Thank you for supporting Pure Ihram's mission to serve pilgrims and keep Ihram affordable for all.",
              },
          unit_amount: Math.round(input.amount * 100),
          ...(monthly ? { recurring: { interval: "month" } } : {}),
        },
        quantity: 1,
      },
    ],
    // Prefills Stripe's email field, so the receipt the donor asked for reaches them.
    customer_email: input.wantsReceipt ? input.receiptEmail : undefined,
    success_url: `${origin}/donation-success`,
    cancel_url: `${origin}/donation-cancel`,
    metadata,
    ...(monthly ? { subscription_data: { metadata } } : {}),
  };
}

export async function handleDonationCheckout(
  request: Request,
  env: DonationEnv,
  json: (body: unknown, status: number) => Response,
): Promise<Response> {
  const parsed = parseDonation(await request.json().catch(() => null));
  if ("error" in parsed) return json({ error: parsed.error }, 400);
  if (!env.STRIPE_SECRET_KEY) return json({ error: "Donations are not available right now. Please try again shortly." }, 503);

  try {
    const session = await stripeApi<{ id: string; url?: string }>(
      env.STRIPE_SECRET_KEY,
      "POST",
      "checkout/sessions",
      buildDonationSession(parsed.value, returnOrigin(request.headers.get("Origin"), env)),
    );
    if (!session.url) throw new Error("Stripe returned no URL");
    console.log("donation: session created", session.id, parsed.value.frequency);
    return json({ url: session.url }, 200);
  } catch (error) {
    console.error("donation: Stripe refused", error instanceof StripeError ? `${error.status} ${error.message}` : String(error));
    return json({ error: "Could not start the donation. Please try again." }, 502);
  }
}
