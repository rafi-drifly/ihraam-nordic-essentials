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
      
      // Get items from metadata
      const itemsJson = session.metadata?.items;
      const userId = session.metadata?.user_id || null;
      const shippingCost = parseFloat(session.metadata?.shipping_cost || "5");
      
      if (!itemsJson) {
        console.error("No items found in session metadata");
        return new Response("No items found", { status: 400 });
      }

      const items = JSON.parse(itemsJson);
      const customerEmail = session.customer_details?.email || session.customer_email;
      
      if (!customerEmail) {
        console.error("No customer email found");
        return new Response("No customer email found", { status: 400 });
      }

      // Get shipping address from Stripe
      const shippingDetails = session.shipping_details;
      const shippingAddress = shippingDetails ? {
        name: shippingDetails.name,
        line1: shippingDetails.address?.line1,
        line2: shippingDetails.address?.line2,
        city: shippingDetails.address?.city,
        postal_code: shippingDetails.address?.postal_code,
        country: shippingDetails.address?.country,
      } : {};

      // Get product details to calculate prices
      const productIds = items.map((item: { id: string }) => item.id);
      const { data: products, error: productsError } = await supabaseClient
        .from('products')
        .select('*')
        .in('id', productIds);

      if (productsError) {
        console.error("Error fetching products:", productsError);
        throw productsError;
      }

      // Calculate total amount
      const subtotal = items.reduce((total: number, item: { id: string; quantity: number }) => {
        const product = products?.find(p => p.id === item.id);
        return total + (product ? product.price * item.quantity : 0);
      }, 0);
      const totalAmount = subtotal + shippingCost;

      // Create order
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          user_id: userId || null,
          guest_email: customerEmail,
          total_amount: totalAmount,
          currency: 'EUR',
          status: 'paid',
          shipping_address: shippingAddress,
          order_number: `ORD-${Date.now()}`,
          lookup_token: crypto.randomUUID()
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        throw orderError;
      }

      console.log("Order created:", order.id);

      // Create order items
      const orderItems = items.map((item: { id: string; quantity: number }) => {
        const product = products?.find(p => p.id === item.id);
        return {
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: product?.price || 0,
          total_price: (product?.price || 0) * item.quantity
        };
      });

      const { error: orderItemsError } = await supabaseClient
        .from('order_items')
        .insert(orderItems);

      if (orderItemsError) {
        console.error("Error creating order items:", orderItemsError);
        throw orderItemsError;
      }

      // Create payment record
      const { error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          order_id: order.id,
          stripe_payment_intent_id: session.payment_intent as string,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency?.toUpperCase() || 'EUR',
          status: 'succeeded'
        });

      if (paymentError) {
        console.error("Error creating payment record:", paymentError);
        throw paymentError;
      }

      // Get full order details for email
      const { data: fullOrder, error: fullOrderError } = await supabaseClient
        .from('orders')
        .select('*, order_items(*, products(name))')
        .eq('id', order.id)
        .single();

      if (!fullOrderError && fullOrder) {
        // Send confirmation email
        try {
          await supabaseClient.functions.invoke('send-order-confirmation', {
            body: {
              order: fullOrder,
              customerEmail: customerEmail
            }
          });
          console.log("Confirmation email sent to:", customerEmail);
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't fail the webhook for email errors
        }
      }

      console.log(`Order ${order.id} created and marked as paid`);
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
