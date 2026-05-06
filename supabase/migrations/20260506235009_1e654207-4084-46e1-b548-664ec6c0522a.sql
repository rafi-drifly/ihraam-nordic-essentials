-- Remove anon/authenticated INSERT policies on orders and order_items.
-- All order creation goes through the stripe-webhook edge function using the service role.
DROP POLICY IF EXISTS "Anyone can create guest orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order items for guest orders" ON public.order_items;

-- Add explicit service-role-only SELECT policy on hajj_prep_subscribers
-- to harden against accidental future permissive policies leaking emails.
CREATE POLICY "Only service role can read prep pack subscribers"
ON public.hajj_prep_subscribers
FOR SELECT
TO service_role
USING (true);