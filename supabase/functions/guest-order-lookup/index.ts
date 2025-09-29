import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GuestOrderLookupRequest {
  orderNumber: string;
  lookupToken: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { orderNumber, lookupToken }: GuestOrderLookupRequest = await req.json();
    
    console.log("Guest order lookup request:", { orderNumber, lookupToken: "***" });

    // Input validation
    if (!orderNumber || !lookupToken) {
      return new Response(JSON.stringify({ error: "Order number and lookup token are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate UUID format for lookup token
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(lookupToken)) {
      return new Response(JSON.stringify({ error: "Invalid lookup token format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find order by order number and lookup token
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            description,
            price,
            images
          )
        ),
        payments (
          id,
          status,
          amount,
          currency,
          created_at
        )
      `)
      .eq('order_number', orderNumber)
      .eq('lookup_token', lookupToken)
      .single();

    console.log("Order lookup result:", { found: !!order, error: orderError?.message });

    if (orderError || !order) {
      console.error("Order lookup error:", orderError);
      return new Response(JSON.stringify({ error: "Order not found. Please check your order number and lookup token." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log successful lookup for security monitoring
    console.log(`Successful guest order lookup: ${orderNumber} at ${new Date().toISOString()}`);

    // Return order details (excluding sensitive lookup token)
    const { lookup_token, ...safeOrderData } = order;
    
    return new Response(JSON.stringify({ 
      success: true, 
      order: safeOrderData 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in guest-order-lookup function:", error);
    return new Response(JSON.stringify({ error: "An error occurred while looking up your order" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});