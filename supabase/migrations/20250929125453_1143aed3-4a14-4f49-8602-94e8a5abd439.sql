-- Fix critical security vulnerability: Remove overly permissive RLS policies that expose customer emails

-- Remove the dangerous "Anyone can view orders with valid lookup token" policy
-- This policy was too broad and allowed public access to customer emails
DROP POLICY IF EXISTS "Anyone can view orders with valid lookup token" ON public.orders;

-- Remove the overly permissive order_items policy
DROP POLICY IF EXISTS "Anyone can view order items with valid order lookup token" ON public.order_items;

-- Remove the overly permissive payments policy  
DROP POLICY IF EXISTS "Anyone can view payments with valid order lookup token" ON public.payments;

-- The guest order lookup will now be handled entirely through the edge function
-- using the service role, which provides proper access control and data filtering