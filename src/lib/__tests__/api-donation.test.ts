/**
 * The donation checkout on the Cloudflare Worker (workers/api/src/donation.ts),
 * ported from the Supabase function create-donation-checkout in Nov 2026.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import worker, { type Env } from "../../../workers/api/src/index";
import { buildDonationSession, parseDonation } from "../../../workers/api/src/donation";

const env = (overrides: Partial<Env> = {}) =>
  ({
    DB: {} as Env["DB"],
    ALLOWED_ORIGINS: "https://www.pureihram.com,https://pureihram.com",
    KLAVIYO_COMPANY_ID: "TGazgN",
    KLAVIYO_PREP_PACK_LIST_ID: "",
    STRIPE_SECRET_KEY: "sk_test_123",
    ...overrides,
  }) as Env;

const post = (body: unknown, origin = "https://www.pureihram.com") =>
  new Request("https://pureihram-api.example/donation-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });

afterEach(() => vi.unstubAllGlobals());

describe("parseDonation", () => {
  it("keeps the Supabase function's rules", () => {
    expect(parseDonation({ amount: 10 }).ok).toBe(true);
    expect(parseDonation({ amount: 0.5 }).ok).toBe(false);
    expect(parseDonation({ amount: 100001 }).ok).toBe(false);
    expect(parseDonation({ amount: 10, frequency: "weekly" }).ok).toBe(false);
    expect(parseDonation({ amount: 10, direction: "elsewhere" }).ok).toBe(false);
    expect(parseDonation({ amount: 10, anonymous: "yes" }).ok).toBe(false);
    expect(parseDonation({ amount: 10, receiptEmail: "not-an-email" }).ok).toBe(false);
  });
});

type DonationParams = {
  mode: string;
  line_items: Array<{ price_data: { unit_amount: number; product_data: { name: string }; recurring?: unknown } }>;
  metadata: Record<string, string>;
  subscription_data?: { metadata: Record<string, string> };
  customer_email?: string;
  success_url: string;
};

describe("buildDonationSession", () => {
  it("makes a one-time payment, marked as a standalone donation so no order is created", () => {
    const parsed = parseDonation({ amount: 25, direction: "mosque" });
    if ("error" in parsed) throw new Error(parsed.error);
    const params = buildDonationSession(parsed.value, "https://www.pureihram.com") as unknown as DonationParams;
    expect(params.mode).toBe("payment");
    expect(params.line_items[0].price_data.unit_amount).toBe(2500);
    expect(params.line_items[0].price_data.product_data.name).toBe("Voluntary Donation - Mosque Support Program");
    expect(params.metadata.standalone_donation).toBe("true");
    expect(params.success_url).toBe("https://www.pureihram.com/donation-success");
  });

  it("makes a monthly subscription that carries the same metadata", () => {
    const parsed = parseDonation({ amount: 5, frequency: "monthly", wantsReceipt: true, receiptEmail: "a@example.com" });
    if ("error" in parsed) throw new Error(parsed.error);
    const params = buildDonationSession(parsed.value, "https://www.pureihram.com") as unknown as DonationParams;
    expect(params.mode).toBe("subscription");
    expect(params.line_items[0].price_data.recurring).toEqual({ interval: "month" });
    expect(params.subscription_data?.metadata.frequency).toBe("monthly");
    expect(params.customer_email).toBe("a@example.com");
  });
});

describe("POST /donation-checkout", () => {
  it("returns the Stripe page, and sends a customer back only to the shop's own site", async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        calls.push(decodeURIComponent(String(init.body)));
        return Response.json({ id: "cs_1", url: "https://checkout.stripe.com/c/pay/cs_1" });
      })
    );
    const response = await worker.fetch(post({ amount: 10 }, "https://evil.example"), env());
    expect(await response.json()).toEqual({ url: "https://checkout.stripe.com/c/pay/cs_1" });
    expect(calls[0]).toContain("success_url=https://www.pureihram.com/donation-success");
  });

  it("says donations are unavailable when the Stripe key is missing", async () => {
    const response = await worker.fetch(post({ amount: 10 }), env({ STRIPE_SECRET_KEY: undefined }));
    expect(response.status).toBe(503);
  });
});
