-- Orders on Cloudflare (14 Nov 2026).
--
-- The Supabase project behind the shop was paused, so paid orders were no
-- longer recorded anywhere but Stripe. These tables take over from Supabase's
-- orders, order_items, payments, stripe_events, inventory and stock_movements.
-- Column names match Supabase's where the admin pages read them, so the pages
-- did not have to change.
--
-- The shop sells one product, so an order's items are its quantity and
-- goods_amount; there is no separate order_items table.

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  -- Sent to the customer with the order number; together they open the order
  -- on the order lookup page.
  lookup_token TEXT NOT NULL,
  status TEXT NOT NULL,
  guest_email TEXT,
  customer_phone TEXT,
  shipping_name TEXT,
  shipping_country TEXT,
  -- JSON: { name, line1, line2, city, postal_code, country }
  shipping_address TEXT,
  -- What the customer paid, in EUR: goods + delivery + donation.
  total_amount REAL NOT NULL,
  -- What the sets cost, in EUR: the charge less delivery and donation.
  goods_amount REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  donation_amount REAL NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL,
  bundle_type TEXT,
  base_shipping_fee_eur REAL NOT NULL DEFAULT 0,
  extra_shipping_fee_eur REAL NOT NULL DEFAULT 0,
  extra_shipping_status TEXT NOT NULL DEFAULT 'not_required',
  -- 'shipping' or 'pickup', as chosen on the Stripe page.
  delivery_method TEXT NOT NULL DEFAULT 'shipping',
  pickup_location TEXT,
  notes TEXT,
  -- 'webhook' for orders recorded as they were paid, 'stripe_import' for the
  -- orders copied from Stripe's history when Supabase was paused.
  source TEXT NOT NULL DEFAULT 'webhook',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_orders_created_at ON orders (created_at DESC);

-- Every Stripe event that has been handled, so a redelivery does nothing.
CREATE TABLE stripe_events (
  event_id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- The stock count. Empty until Rafi enters the count in the admin: Supabase's
-- figure could not be read while it was paused, and guessing one would send
-- false low-stock alerts.
CREATE TABLE inventory (
  product_key TEXT PRIMARY KEY,
  stock_on_hand INTEGER NOT NULL,
  low_stock_threshold INTEGER NOT NULL DEFAULT 20,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE stock_movements (
  id TEXT PRIMARY KEY,
  product_key TEXT NOT NULL,
  delta INTEGER NOT NULL,
  -- 'order_paid', 'manual_adjustment', ...
  reason TEXT NOT NULL,
  related_order_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_stock_movements_product_created ON stock_movements (product_key, created_at DESC);
