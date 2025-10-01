-- Enable guest order lookup using lookup_token
-- This allows guests to securely access their order information using the unique lookup token

-- Policy: Allow guests to view orders using lookup_token
CREATE POLICY "Guests can view orders with valid lookup_token"
ON public.orders
FOR SELECT
USING (
  lookup_token IS NOT NULL AND
  guest_email IS NOT NULL
);

-- Policy: Allow guests to view order items for orders with valid lookup_token
CREATE POLICY "Guests can view order items with valid lookup_token"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = order_items.order_id
      AND o.lookup_token IS NOT NULL
      AND o.guest_email IS NOT NULL
  )
);

-- Policy: Allow guests to view payments for orders with valid lookup_token
CREATE POLICY "Guests can view payments with valid lookup_token"
ON public.payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = payments.order_id
      AND o.lookup_token IS NOT NULL
      AND o.guest_email IS NOT NULL
  )
);