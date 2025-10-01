-- Remove user authentication-related tables and update RLS policies for guest-only checkout

-- Drop user_roles table as authentication is removed
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop the has_role function as it's no longer needed
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;

-- Drop the app_role enum type
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Drop the handle_new_user trigger and function (no longer creating profiles on signup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Update profiles table: Keep it for potential future use but remove user-specific RLS
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Add simple admin policy for profiles (for internal admin access only)
CREATE POLICY "Service role can manage profiles"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Update orders RLS policies: Remove authenticated user policies, keep guest and admin
DROP POLICY IF EXISTS "Users can view their own authenticated orders only" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

-- Orders: Keep guest lookup and service role access
CREATE POLICY "Service role can manage all orders"
ON public.orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can create guest orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL AND guest_email IS NOT NULL);

-- Update order_items RLS policies
DROP POLICY IF EXISTS "Users can view their own authenticated order items only" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;

-- Order items: Keep guest lookup and service role access
CREATE POLICY "Service role can manage all order items"
ON public.order_items
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can create order items for guest orders"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = order_items.order_id 
    AND o.user_id IS NULL 
    AND o.guest_email IS NOT NULL
  )
);

-- Update payments RLS policies
DROP POLICY IF EXISTS "Users can view payments for their authenticated orders only" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;

-- Payments: Keep guest lookup and service role access
CREATE POLICY "Service role can manage all payments"
ON public.payments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Update products RLS policies: Remove admin management, keep public read
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Products: Service role can manage, anyone can view active products
CREATE POLICY "Service role can manage products"
ON public.products
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);