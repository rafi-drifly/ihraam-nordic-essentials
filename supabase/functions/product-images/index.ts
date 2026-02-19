import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const { data: product, error } = await supabase
      .from('products')
      .select('id, name, images')
      .eq('is_active', true)
      .single();

    if (error || !product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const images: string[] = product.images || [];
    const imageLink = images.length > 0 ? images[0] : null;
    const additionalImages = images.length > 1 ? images.slice(1) : [];

    return new Response(
      JSON.stringify({
        product_id: 'pure-ihram-hajj-towel-set',
        product_name: product.name,
        image_link: imageLink,
        additional_images: additionalImages,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
