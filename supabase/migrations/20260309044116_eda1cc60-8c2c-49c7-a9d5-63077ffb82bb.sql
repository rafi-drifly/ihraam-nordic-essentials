-- Create inventory table
CREATE TABLE public.inventory (
  product_key text PRIMARY KEY,
  stock_on_hand integer NOT NULL DEFAULT 0,
  low_stock_threshold integer NOT NULL DEFAULT 20,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create stripe_events table for idempotency
CREATE TABLE public.stripe_events (
  event_id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create stock_movements audit table
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_key text NOT NULL,
  delta integer NOT NULL,
  reason text NOT NULL,
  related_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add new columns to orders table
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS shipping_name text,
  ADD COLUMN IF NOT EXISTS shipping_country text,
  ADD COLUMN IF NOT EXISTS bundle_type text,
  ADD COLUMN IF NOT EXISTS quantity integer,
  ADD COLUMN IF NOT EXISTS base_shipping_fee_eur numeric DEFAULT 9,
  ADD COLUMN IF NOT EXISTS extra_shipping_fee_eur numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS extra_shipping_status text DEFAULT 'not_required';

-- Enable RLS on new tables
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS policies for inventory (admin only via service role)
CREATE POLICY "Service role can manage inventory" ON public.inventory
  FOR ALL USING (true) WITH CHECK (true);

-- RLS policies for stripe_events (service role only)
CREATE POLICY "Service role can manage stripe_events" ON public.stripe_events
  FOR ALL USING (true) WITH CHECK (true);

-- RLS policies for stock_movements (service role only)
CREATE POLICY "Service role can manage stock_movements" ON public.stock_movements
  FOR ALL USING (true) WITH CHECK (true);

-- Insert initial inventory record for ihram_set
INSERT INTO public.inventory (product_key, stock_on_hand, low_stock_threshold)
VALUES ('ihram_set', 100, 20)
ON CONFLICT (product_key) DO NOTHING;

-- Create trigger to update updated_at on inventory
CREATE OR REPLACE FUNCTION public.update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_updated_at();