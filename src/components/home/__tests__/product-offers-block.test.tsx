/**
 * The homepage offer block and the basket it fills.
 *
 * On 2026-09-08 every basket started from this block died at "Proceed to
 * Checkout" with "Edge Function returned a non-2xx status code". The block
 * stored its own SKU ("IHRAM-2") as the cart item id; create-checkout looks
 * items up in the catalogue and returned 400 "Invalid item id" for anything
 * that was not a product id. The shop and cart pages sent the real id and
 * worked, so the failure was invisible from those pages while the busiest
 * page on the site could not sell anything.
 *
 * The id also travels on into Stripe metadata and from there into
 * order_items.product_id, which is a uuid column - a SKU reaching that insert
 * would take the payment and then lose the order.
 */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const PRODUCT_ID = "36acffbc-41ea-4512-8621-174cd8d9b00c";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

vi.mock("@/integrations/supabase/client", () => {
  const builder: Record<string, unknown> = {};
  builder.select = () => builder;
  builder.eq = () => builder;
  builder.limit = () => builder;
  builder.maybeSingle = async () => ({ data: { id: PRODUCT_ID }, error: null });
  return { supabase: { from: () => builder } };
});

import { CartProvider } from "@/hooks/useCart";
import { ProductOffersBlock } from "../ProductOffersBlock";

const storedCart = () => JSON.parse(localStorage.getItem("ihram-cart") || "[]");

async function renderBlock() {
  render(
    <MemoryRouter>
      <CartProvider>
        <ProductOffersBlock />
      </CartProvider>
    </MemoryRouter>,
  );
  // Let the catalogue lookup in the mount effect settle before anything is clicked.
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  return screen.getAllByRole("button");
}

beforeEach(() => {
  localStorage.clear();
});

describe("picking an offer on the homepage", () => {
  // The three offers render in OFFERS order: single, 2-pack, 3-pack.
  it.each([
    ["single", 0, 1],
    ["2-pack", 1, 2],
    ["3-pack", 2, 3],
  ])("puts a catalogue id in the basket for the %s", async (_name, index, qty) => {
    const buttons = await renderBlock();
    expect(buttons).toHaveLength(3);

    fireEvent.click(buttons[index]);

    await waitFor(() => expect(storedCart()).toHaveLength(1));
    const [item] = storedCart();
    expect(item.id).toBe(PRODUCT_ID);
    // The invariant that actually matters: checkout resolves items by
    // catalogue id, so a SKU here is a basket that cannot be paid for.
    expect(item.id).toMatch(UUID_RE);
    expect(item.quantity).toBe(qty);
  });

  it("stores a flat unit price, never a derived fraction", async () => {
    const buttons = await renderBlock();
    fireEvent.click(buttons[2]); // 3-pack: 55/3 used to store 18.333333333333332
    await waitFor(() => expect(storedCart()).toHaveLength(1));
    expect(storedCart()[0].price).toBe(19);
  });
});
