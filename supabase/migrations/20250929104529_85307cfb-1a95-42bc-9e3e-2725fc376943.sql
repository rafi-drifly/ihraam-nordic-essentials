-- Fix guest order data exposure by updating RLS policies

-- Drop the existing problematic policy for users viewing orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create a new policy that explicitly prevents access to guest orders by authenticated users
CREATE POLICY "Users can view their own orders only" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- Guest orders should not be accessible to any authenticated users
-- Only admins can view all orders (including guest orders) through the existing admin policy

-- Also fix the order_items table to prevent access to guest order items
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;

-- Create a new policy that ensures users can only see order items for their own orders (not guest orders)
CREATE POLICY "Users can view their own order items only" 
ON public.order_items 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM orders o 
    WHERE o.id = order_items.order_id 
      AND o.user_id = auth.uid() 
      AND o.user_id IS NOT NULL
  )
);

-- Fix the payments table to restrict creation to system/service accounts only
DROP POLICY IF EXISTS "System can create payments" ON public.payments;

-- Create a more restrictive policy for payment creation
-- Only allow service role to create payments (this will be used by Edge Functions)
CREATE POLICY "Service role can create payments" 
ON public.payments 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Allow authenticated users to view payments for their own orders only
DROP POLICY IF EXISTS "Users can view their payments" ON public.payments;

CREATE POLICY "Users can view their own payments only" 
ON public.payments 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM orders o 
    WHERE o.id = payments.order_id 
      AND o.user_id = auth.uid() 
      AND o.user_id IS NOT NULL
  )
);