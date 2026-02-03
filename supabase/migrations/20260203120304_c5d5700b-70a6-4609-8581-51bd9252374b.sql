-- Add donation_amount column to orders table for tracking voluntary donations
ALTER TABLE public.orders 
ADD COLUMN donation_amount numeric DEFAULT 0;