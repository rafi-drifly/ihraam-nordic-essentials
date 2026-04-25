-- Hajj Prep Pack email subscribers
CREATE TABLE public.hajj_prep_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  locale text NOT NULL DEFAULT 'en',
  source text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- One signup per email
CREATE UNIQUE INDEX idx_hajj_prep_subscribers_email_lower
  ON public.hajj_prep_subscribers (lower(email));

ALTER TABLE public.hajj_prep_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or signed-in) can submit their email through the form
CREATE POLICY "Anyone can subscribe to prep pack"
  ON public.hajj_prep_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only the service role (backend) can read or manage the list
CREATE POLICY "Service role manages prep pack subscribers"
  ON public.hajj_prep_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);