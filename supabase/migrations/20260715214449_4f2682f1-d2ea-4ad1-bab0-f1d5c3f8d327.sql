
-- 1. Fix inventory: replace public ALL policy with service_role-only
DROP POLICY IF EXISTS "Service role can manage inventory" ON public.inventory;
CREATE POLICY "Service role can manage inventory"
  ON public.inventory FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 2. Fix stock_movements
DROP POLICY IF EXISTS "Service role can manage stock_movements" ON public.stock_movements;
CREATE POLICY "Service role can manage stock_movements"
  ON public.stock_movements FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 3. Fix stripe_events
DROP POLICY IF EXISTS "Service role can manage stripe_events" ON public.stripe_events;
CREATE POLICY "Service role can manage stripe_events"
  ON public.stripe_events FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 4. Remove bypassable/exposing guest lookup policies (guest-order-lookup edge function uses service role)
DROP POLICY IF EXISTS "Guests can view orders with valid lookup_token" ON public.orders;
DROP POLICY IF EXISTS "Guests can view order items with valid lookup_token" ON public.order_items;
DROP POLICY IF EXISTS "Guests can view payments with valid lookup_token" ON public.payments;

-- 5. Remove duplicate service-role SELECT policies using bypassable current_setting()
DROP POLICY IF EXISTS "Service role can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Service role can view all payments" ON public.payments;

-- 6. Add self-read policy for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 7. Revoke EXECUTE on SECURITY DEFINER helper functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM anon, authenticated, PUBLIC;

-- 8. Prevent listing/enumeration of product-images bucket (public direct URLs continue to work)
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
