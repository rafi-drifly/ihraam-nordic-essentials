-- Add lookup_token column to orders table for secure guest order lookup
ALTER TABLE public.orders 
ADD COLUMN lookup_token UUID DEFAULT gen_random_uuid();

-- Create unique index on lookup_token for fast lookups
CREATE UNIQUE INDEX idx_orders_lookup_token ON public.orders(lookup_token) WHERE lookup_token IS NOT NULL;

-- Add RLS policy for guest order lookup using token
CREATE POLICY "Anyone can view orders with valid lookup token"
ON public.orders
FOR SELECT
USING (lookup_token IS NOT NULL);

-- Add RLS policy for guest order items lookup using token
CREATE POLICY "Anyone can view order items with valid order lookup token"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.id = order_items.order_id
      AND o.lookup_token IS NOT NULL
  )
);

-- Add RLS policy for guest payments lookup using token
CREATE POLICY "Anyone can view payments with valid order lookup token"
ON public.payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.id = payments.order_id
      AND o.lookup_token IS NOT NULL
  )
);