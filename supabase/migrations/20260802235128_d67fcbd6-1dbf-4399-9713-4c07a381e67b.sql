-- service_role bypasses RLS entirely; these blanket true policies are redundant and flagged as overly permissive
DROP POLICY IF EXISTS "Service role can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can manage all order items" ON public.order_items;
DROP POLICY IF EXISTS "Service role can manage all payments" ON public.payments;
DROP POLICY IF EXISTS "Service role can create payments" ON public.payments;
DROP POLICY IF EXISTS "Service role can manage products" ON public.products;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage inventory" ON public.inventory;
DROP POLICY IF EXISTS "Service role can manage stock_movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Service role can manage stripe_events" ON public.stripe_events;
DROP POLICY IF EXISTS "Service role manages prep pack subscribers" ON public.hajj_prep_subscribers;
DROP POLICY IF EXISTS "Only service role can read prep pack subscribers" ON public.hajj_prep_subscribers;

-- Replace the always-true public insert with a validated one
DROP POLICY IF EXISTS "Anyone can subscribe to prep pack" ON public.hajj_prep_subscribers;

CREATE POLICY "Anyone can subscribe to prep pack"
ON public.hajj_prep_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'
  AND length(email) <= 254
  AND locale IN ('en', 'sv', 'no')
  AND (source IS NULL OR length(source) <= 64)
);