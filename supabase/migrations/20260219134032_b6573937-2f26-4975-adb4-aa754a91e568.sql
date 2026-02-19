-- Create a public storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Allow anyone to read files from the product-images bucket
CREATE POLICY "Public read access for product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');
