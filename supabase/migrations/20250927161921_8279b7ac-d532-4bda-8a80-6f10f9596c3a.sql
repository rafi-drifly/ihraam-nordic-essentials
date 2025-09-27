-- Fix the generate_order_number function as well
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD((EXTRACT(epoch FROM now())::INTEGER % 100000)::TEXT, 5, '0')
$$;