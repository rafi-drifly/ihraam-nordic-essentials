import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ExtraShippingRequest {
  orderId: string;
  extraAmount: number; // in EUR
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { orderId, extraAmount }: ExtraShippingRequest = await req.json();
    console.log("Creating extra shipping payment:", { orderId, extraAmount });

    if (!orderId || !extraAmount || extraAmount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid orderId or extraAmount" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const customerEmail = order.guest_email;
    if (!customerEmail) {
      return new Response(
        JSON.stringify({ error: "No customer email on order" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Stripe Checkout session for extra shipping
    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Additional Shipping Fee',
              description: `Extra shipping cost for order ${order.order_number}`,
            },
            unit_amount: Math.round(extraAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/order-success?extra_shipping=paid&order=${order.order_number}`,
      cancel_url: `${req.headers.get("origin")}/order-success?extra_shipping=cancelled&order=${order.order_number}`,
      metadata: {
        payment_type: 'extra_shipping',
        order_id: orderId,
        order_number: order.order_number,
        extra_amount_eur: extraAmount.toString(),
      },
    });

    // Update order with extra shipping info
    await supabaseClient
      .from('orders')
      .update({
        extra_shipping_fee_eur: extraAmount,
        extra_shipping_status: 'requested',
      })
      .eq('id', orderId);

    console.log("Extra shipping session created:", session.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating extra shipping payment:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
