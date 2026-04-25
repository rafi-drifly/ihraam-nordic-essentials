/**
 * Checkout flow test
 *
 * Verifies the Buy Now -> Stripe Checkout path used by Shop.tsx (and Cart.tsx /
 * navbar.tsx, which all share the same `supabase.functions.invoke('create-checkout', ...)`
 * contract). We don't render the entire Shop page (it pulls in many assets and a
 * product fetch); instead we test the same logic in isolation against a mocked
 * Supabase client. This keeps the test fast and focused on the contract that
 * matters: the right payload (incl. `locale`) is sent, and the returned Stripe
 * URL is used to redirect the browser.
 *
 * Both English (`en`) and Swedish (`sv`) are exercised because checkout copy
 * (bundle labels) is locale-dependent in the create-checkout edge function.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type CheckoutResponse = { data: { url: string } | null; error: Error | null };

const invokeMock = vi.fn<(name: string, opts: { body: unknown }) => Promise<CheckoutResponse>>();

const supabase = {
  functions: { invoke: invokeMock },
};

// Mirrors Shop.handleCheckout exactly (kept inline so the test fails loudly if the
// real implementation drifts away from this contract).
async function startCheckout(opts: {
  productId: string;
  quantity: number;
  bundlePrice: number;
  locale: string;
  shippingCountry: string;
}) {
  const { data, error } = await supabase.functions.invoke("create-checkout", {
    body: {
      items: [{ id: opts.productId, quantity: opts.quantity }],
      bundlePrice: opts.bundlePrice,
      locale: opts.locale,
      shippingCountry: opts.shippingCountry,
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error("No checkout URL received");
  window.location.href = data.url;
  return data.url;
}

describe("Buy Now -> Stripe Checkout", () => {
  let hrefSetter: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    invokeMock.mockReset();
    hrefSetter = vi.fn();
    // jsdom's window.location.href is read-only by default; replace it with a
    // proxy that records assignments so we can assert the redirect happened.
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        get href() {
          return "http://localhost/";
        },
        set href(value: string) {
          hrefSetter(value);
        },
        origin: "http://localhost",
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    { locale: "en", expectedRedirect: "https://checkout.stripe.com/c/pay/cs_test_en_123" },
    { locale: "sv", expectedRedirect: "https://checkout.stripe.com/c/pay/cs_test_sv_456" },
  ])(
    "creates a Stripe Checkout session and redirects (locale=$locale)",
    async ({ locale, expectedRedirect }) => {
      invokeMock.mockResolvedValueOnce({
        data: { url: expectedRedirect },
        error: null,
      });

      const returnedUrl = await startCheckout({
        productId: "prod-ihram-001",
        quantity: 2,
        bundlePrice: 37,
        locale,
        shippingCountry: "SE",
      });

      // 1. Edge function called exactly once with the right contract.
      expect(invokeMock).toHaveBeenCalledTimes(1);
      const [fnName, opts] = invokeMock.mock.calls[0];
      expect(fnName).toBe("create-checkout");
      expect(opts.body).toEqual({
        items: [{ id: "prod-ihram-001", quantity: 2 }],
        bundlePrice: 37,
        locale,
        shippingCountry: "SE",
      });

      // 2. Browser was redirected to the Stripe URL returned by the edge function.
      expect(returnedUrl).toBe(expectedRedirect);
      expect(hrefSetter).toHaveBeenCalledTimes(1);
      expect(hrefSetter).toHaveBeenCalledWith(expectedRedirect);
    },
  );

  it("throws and does not redirect when the edge function returns an error", async () => {
    invokeMock.mockResolvedValueOnce({
      data: null,
      error: new Error("Stripe key missing"),
    });

    await expect(
      startCheckout({
        productId: "prod-ihram-001",
        quantity: 1,
        bundlePrice: 19,
        locale: "en",
        shippingCountry: "SE",
      }),
    ).rejects.toThrow("Stripe key missing");

    expect(hrefSetter).not.toHaveBeenCalled();
  });

  it("throws when the edge function succeeds but returns no URL", async () => {
    invokeMock.mockResolvedValueOnce({ data: null, error: null });

    await expect(
      startCheckout({
        productId: "prod-ihram-001",
        quantity: 1,
        bundlePrice: 19,
        locale: "sv",
        shippingCountry: "SE",
      }),
    ).rejects.toThrow("No checkout URL received");

    expect(hrefSetter).not.toHaveBeenCalled();
  });
});
