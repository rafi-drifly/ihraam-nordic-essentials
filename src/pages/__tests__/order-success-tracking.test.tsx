/**
 * Purchase tracking on the order confirmation page.
 *
 * Two production defects are pinned here:
 *
 * 1. An effect that called `clearCart()` while also depending on it. Because
 *    CartProvider rebuilt its functions on every render, clearing triggered a
 *    re-render, which produced a new `clearCart`, which re-ran the effect.
 *    PostHog recorded 651 `purchase` events from ONE person in ONE session
 *    across 55 seconds on 2026-07-15.
 *
 * 2. `trackPurchase` was called with hardcoded `total: 0` and `item_count: 1`,
 *    so revenue and AOV could not be measured.
 */

import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const captureMock = vi.fn();

vi.mock("posthog-js", () => ({
  default: { capture: (...args: unknown[]) => captureMock(...args), register: vi.fn(), identify: vi.fn() },
}));

// SEOHead pulls in helmet/meta plumbing that is irrelevant here.
vi.mock("@/components/SEOHead", () => ({ default: () => null }));

import { CartProvider } from "@/hooks/useCart";
import { stashPendingOrder } from "@/lib/pendingOrder";
import OrderSuccess from "../OrderSuccess";

function renderConfirmation(sessionId = "cs_test_123") {
  return render(
    <MemoryRouter initialEntries={[`/order-success?session_id=${sessionId}`]}>
      <CartProvider>
        <OrderSuccess />
      </CartProvider>
    </MemoryRouter>,
  );
}

const purchases = () => captureMock.mock.calls.filter(([event]) => event === "purchase");

beforeEach(() => {
  captureMock.mockClear();
  sessionStorage.clear();
  localStorage.clear();
});

afterEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

describe("purchase event firing", () => {
  it("fires exactly once per order, not in a loop", async () => {
    renderConfirmation();
    await waitFor(() => expect(purchases()).toHaveLength(1));
    // Give any runaway effect chain a chance to show itself.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(purchases()).toHaveLength(1);
  });

  it("still fires once when the cart is not empty", async () => {
    // The loop was triggered by clearCart() actually changing state, so a
    // populated cart is the case that used to run away.
    localStorage.setItem(
      "ihram-cart",
      JSON.stringify([{ id: "p1", name: "Ihram", price: 19, quantity: 2, image: "" }]),
    );
    renderConfirmation();
    await waitFor(() => expect(purchases()).toHaveLength(1));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(purchases()).toHaveLength(1);
  });

  it("does not fire without a Stripe session id", async () => {
    render(
      <MemoryRouter initialEntries={["/order-success"]}>
        <CartProvider>
          <OrderSuccess />
        </CartProvider>
      </MemoryRouter>,
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(purchases()).toHaveLength(0);
  });

  it("empties the cart", async () => {
    localStorage.setItem(
      "ihram-cart",
      JSON.stringify([{ id: "p1", name: "Ihram", price: 19, quantity: 2, image: "" }]),
    );
    renderConfirmation();
    await waitFor(() => expect(JSON.parse(localStorage.getItem("ihram-cart") || "[]")).toHaveLength(0));
  });
});

describe("purchase event payload", () => {
  it("reports the real total and item count from the stashed order", async () => {
    stashPendingOrder({ total: 46, item_count: 2 });
    renderConfirmation();

    await waitFor(() => expect(purchases()).toHaveLength(1));
    const [, props] = purchases()[0];
    expect(props).toMatchObject({
      order_id: "cs_test_123",
      revenue: 46,
      item_count: 2,
      currency: "EUR",
      payment_method: "stripe",
    });
  });

  it("consumes the stash so a refresh cannot double count revenue", async () => {
    stashPendingOrder({ total: 46, item_count: 2 });
    const first = renderConfirmation();
    await waitFor(() => expect(purchases()).toHaveLength(1));
    first.unmount();

    captureMock.mockClear();
    renderConfirmation();
    await waitFor(() => expect(purchases()).toHaveLength(1));
    const [, props] = purchases()[0];
    expect(props).not.toHaveProperty("revenue");
  });

  it("omits revenue rather than reporting a zero-value sale", async () => {
    // No stash: the customer cleared storage, or returned on another device.
    renderConfirmation();
    await waitFor(() => expect(purchases()).toHaveLength(1));
    const [, props] = purchases()[0];
    expect(props).not.toHaveProperty("revenue");
    expect(props).not.toHaveProperty("item_count");
    expect(props).toMatchObject({ order_id: "cs_test_123", payment_method: "stripe" });
  });
});
