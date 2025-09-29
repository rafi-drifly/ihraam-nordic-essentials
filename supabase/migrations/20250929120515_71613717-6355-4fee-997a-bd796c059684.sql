-- Fix guest data exposure vulnerabilities by updating RLS policies

-- 1. Drop and recreate the problematic policies for orders table
DROP POLICY IF EXISTS "Users can view their own orders only" ON public.orders;

-- Create new policy that ONLY allows users to see their authenticated orders
-- This prevents access to guest orders (user_id IS NULL)
CREATE POLICY "Users can view their own authenticated orders only"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- 2. Update order_items policies to prevent access to guest order items
DROP POLICY IF EXISTS "Users can view their own order items only" ON public.order_items;

-- Create new policy that ensures users can only view items from their authenticated orders
CREATE POLICY "Users can view their own authenticated order items only"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.id = order_items.order_id
      AND o.user_id = auth.uid()
      AND o.user_id IS NOT NULL
  )
);

-- 3. Update payments policies to protect guest payment data
DROP POLICY IF EXISTS "Users can view their own payments only" ON public.payments;

-- Create new policy that only allows viewing payments for authenticated user orders
CREATE POLICY "Users can view payments for their authenticated orders only"
ON public.payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.id = payments.order_id
      AND o.user_id = auth.uid()
      AND o.user_id IS NOT NULL
  )
);

-- 4. Ensure service role can still create payments (for webhooks)
-- The existing "Service role can create payments" policy should remain as is

-- 5. Add a policy to allow service role to view all payments (needed for webhook processing)
CREATE POLICY "Service role can view all payments"
ON public.payments
FOR SELECT
USING (current_setting('role') = 'service_role');

-- 6. Add policy to allow service role to view all orders (needed for webhook processing)
CREATE POLICY "Service role can view all orders"
ON public.orders
FOR SELECT
USING (current_setting('role') = 'service_role');

-- 7. Add policy to allow service role to view all order items (needed for webhook processing)  
CREATE POLICY "Service role can view all order items"
ON public.order_items
FOR SELECT
USING (current_setting('role') = 'service_role');