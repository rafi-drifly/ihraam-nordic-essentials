ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'paid_pending_shipping_review';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'awaiting_extra_shipping_payment';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'ready_to_ship';