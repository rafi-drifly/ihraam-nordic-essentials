/**
 * Order totals held across the Stripe redirect.
 *
 * The `purchase` event fires on the confirmation page, but by then the basket
 * is gone: Stripe takes the customer off-site, and the navbar checkout clears
 * `ihram-cart` before redirecting. So the real totals are stashed the moment
 * checkout starts and read back once payment succeeds.
 *
 * sessionStorage rather than localStorage: a stale snapshot must not survive
 * into a later visit and attach itself to an unrelated order.
 */

export interface PendingOrder {
  /** What the customer is charged: goods + delivery + any donation, in EUR. */
  total: number;
  item_count: number;
  currency: string;
}

const KEY = 'ihram-pending-order';

function storage(): Storage | null {
  // Guards SSR/prerender and browsers where storage is blocked.
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export function stashPendingOrder(order: {
  total: number;
  item_count: number;
  currency?: string;
}): void {
  const store = storage();
  if (!store) return;
  try {
    const payload: PendingOrder = {
      total: order.total,
      item_count: order.item_count,
      currency: order.currency || 'EUR',
    };
    store.setItem(KEY, JSON.stringify(payload));
  } catch (error) {
    // Analytics must never block a sale.
    console.error('Could not stash pending order:', error);
  }
}

/** Reads the snapshot and removes it, so one checkout reports at most once. */
export function takePendingOrder(): PendingOrder | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(KEY);
    store.removeItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingOrder>;
    if (typeof parsed?.total !== 'number' || typeof parsed?.item_count !== 'number') {
      return null;
    }
    return {
      total: parsed.total,
      item_count: parsed.item_count,
      currency: parsed.currency || 'EUR',
    };
  } catch (error) {
    console.error('Could not read pending order:', error);
    return null;
  }
}
