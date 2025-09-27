import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const body = await req.text();
    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret || "");
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    console.log("Webhook event type:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (!orderId) {
        console.error("No order_id found in session metadata");
        return new Response("No order_id found", { status: 400 });
      }

      // Update order status to paid
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({ 
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error("Error updating order:", updateError);
        throw updateError;
      }

      // Create payment record
      const { error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          order_id: orderId,
          stripe_payment_intent_id: session.payment_intent as string,
          amount: (session.amount_total || 0) / 100, // Convert from cents
          currency: session.currency?.toUpperCase() || 'EUR',
          status: 'completed'
        });

      if (paymentError) {
        console.error("Error creating payment record:", paymentError);
        throw paymentError;
      }

      // Get order details for email
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .select('*, order_items(*, products(name))')
        .eq('id', orderId)
        .single();

      if (!orderError && order) {
        // Send confirmation email
        try {
          await supabaseClient.functions.invoke('send-order-confirmation', {
            body: {
              order: order,
              customerEmail: order.guest_email || session.customer_email
            }
          });
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't fail the webhook for email errors
        }
      }

      console.log(`Order ${orderId} marked as paid and confirmation email sent`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});