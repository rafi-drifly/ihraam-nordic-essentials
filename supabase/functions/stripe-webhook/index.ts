import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ORDER_ALERT_EMAIL = "support@pureihraam.com";
const LOW_STOCK_THRESHOLD_FALLBACK = 20;

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

    console.log("Webhook event type:", event.type, "Event ID:", event.id);

    // Idempotency check
    const { data: existingEvent } = await supabaseClient
      .from('stripe_events')
      .select('event_id')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      console.log("Event already processed:", event.id);
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Record event for idempotency
    await supabaseClient.from('stripe_events').insert({ event_id: event.id });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Check if this is an extra shipping payment
      if (session.metadata?.payment_type === 'extra_shipping') {
        return await handleExtraShippingPayment(supabaseClient, session);
      }
      
      // Regular order payment
      const itemsJson = session.metadata?.items;
      const userId = session.metadata?.user_id || null;
      const totalQuantity = parseInt(session.metadata?.total_quantity || "1", 10);
      const bundleType = session.metadata?.bundle_type || 'single';
      const baseShippingFee = parseFloat(session.metadata?.base_shipping_fee_eur || "9");
      const donationAmount = parseFloat(session.metadata?.donation_amount || "0");
      const isStandaloneDonation = session.metadata?.standalone_donation === "true";
      
      // Skip order creation for standalone donations
      if (isStandaloneDonation) {
        console.log("Standalone donation completed - no order to create");
        return new Response(JSON.stringify({ received: true, type: "standalone_donation" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

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
      const shippingCountry = shippingDetails?.address?.country || 'SE';
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
      const totalAmount = subtotal + baseShippingFee + donationAmount;

      // Determine order status based on shipping country
      // Sweden = paid (no review needed), Rest of Europe = paid_pending_shipping_review
      const orderStatus = shippingCountry === 'SE' ? 'paid' : 'paid_pending_shipping_review';
      const extraShippingStatus = 'not_required';

      console.log("Order totals - Subtotal:", subtotal, "Shipping:", baseShippingFee, "Donation:", donationAmount, "Total:", totalAmount);
      console.log("Shipping country:", shippingCountry, "Status:", orderStatus);

      // Create order with new fields
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          user_id: userId || null,
          guest_email: customerEmail,
          total_amount: totalAmount,
          currency: 'EUR',
          status: orderStatus,
          shipping_address: shippingAddress,
          order_number: `ORD-${Date.now()}`,
          lookup_token: crypto.randomUUID(),
          donation_amount: donationAmount,
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          shipping_name: shippingDetails?.name || null,
          shipping_country: shippingCountry,
          bundle_type: bundleType,
          quantity: totalQuantity,
          base_shipping_fee_eur: baseShippingFee,
          extra_shipping_fee_eur: 0,
          extra_shipping_status: extraShippingStatus,
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

      // Decrement inventory and log stock movement
      const { data: inventory, error: inventoryError } = await supabaseClient
        .from('inventory')
        .select('*')
        .eq('product_key', 'ihram_set')
        .single();

      if (!inventoryError && inventory) {
        const newStock = inventory.stock_on_hand - totalQuantity;
        
        // Update inventory
        await supabaseClient
          .from('inventory')
          .update({ stock_on_hand: newStock })
          .eq('product_key', 'ihram_set');

        // Log stock movement
        await supabaseClient
          .from('stock_movements')
          .insert({
            product_key: 'ihram_set',
            delta: -totalQuantity,
            reason: 'order_paid',
            related_order_id: order.id,
          });

        console.log("Inventory updated: ", inventory.stock_on_hand, "->", newStock);

        // Check low stock threshold
        const threshold = inventory.low_stock_threshold || LOW_STOCK_THRESHOLD_FALLBACK;
        if (newStock <= threshold) {
          await sendLowStockAlert(supabaseClient, newStock, threshold);
        }
      }

      // Send internal order alert email
      await sendOrderAlertEmail(supabaseClient, order, shippingAddress, customerEmail, totalQuantity, bundleType, baseShippingFee);

      // Get full order details for customer email
      const { data: fullOrder, error: fullOrderError } = await supabaseClient
        .from('orders')
        .select('*, order_items(*, products(name))')
        .eq('id', order.id)
        .single();

      if (!fullOrderError && fullOrder) {
        // Send confirmation email to customer
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
        }
      }

      console.log(`Order ${order.id} created and marked as ${orderStatus}`);
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

async function handleExtraShippingPayment(supabaseClient: any, session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  if (!orderId) {
    console.error("No order_id in extra shipping payment metadata");
    return new Response("No order_id found", { status: 400 });
  }

  // Update order status
  const { error } = await supabaseClient
    .from('orders')
    .update({
      extra_shipping_status: 'paid',
      status: 'ready_to_ship',
    })
    .eq('id', orderId);

  if (error) {
    console.error("Error updating order for extra shipping:", error);
    throw error;
  }

  console.log("Extra shipping paid for order:", orderId);
  return new Response(JSON.stringify({ received: true, type: "extra_shipping_paid" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function sendOrderAlertEmail(supabaseClient: any, order: any, shippingAddress: any, customerEmail: string, quantity: number, bundleType: string, baseShippingFee: number) {
  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("No RESEND_API_KEY, skipping order alert");
      return;
    }

    const addressSummary = [
      shippingAddress.name,
      shippingAddress.line1,
      shippingAddress.line2,
      `${shippingAddress.postal_code} ${shippingAddress.city}`,
      shippingAddress.country
    ].filter(Boolean).join(', ');

    const html = `
      <h2>New PureIhram Order</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Order Number:</strong> ${order.order_number}</p>
      <p><strong>Customer Email:</strong> ${customerEmail}</p>
      <p><strong>Bundle Type:</strong> ${bundleType}</p>
      <p><strong>Quantity:</strong> ${quantity}</p>
      <p><strong>Country:</strong> ${shippingAddress.country || 'N/A'}</p>
      <p><strong>Address:</strong> ${addressSummary}</p>
      <p><strong>Base Shipping Fee:</strong> €${baseShippingFee}</p>
      <p><strong>Total Paid:</strong> €${order.total_amount}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      ${order.donation_amount > 0 ? `<p><strong>Donation:</strong> €${order.donation_amount}</p>` : ''}
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "PureIhram Orders <noreply@pureihram.com>",
        to: [ORDER_ALERT_EMAIL],
        subject: `New PureIhram Order - ${order.order_number}`,
        html: html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Order alert email failed:", errorText);
    } else {
      console.log("Order alert email sent to:", ORDER_ALERT_EMAIL);
    }
  } catch (error) {
    console.error("Error sending order alert:", error);
  }
}

async function sendLowStockAlert(supabaseClient: any, currentStock: number, threshold: number) {
  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("No RESEND_API_KEY, skipping low stock alert");
      return;
    }

    const html = `
      <h2>⚠️ LOW STOCK ALERT</h2>
      <p>Ihram Set inventory is running low!</p>
      <p><strong>Current Stock:</strong> ${currentStock}</p>
      <p><strong>Threshold:</strong> ${threshold}</p>
      <p>Please restock soon to avoid stockouts.</p>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "PureIhram Alerts <noreply@pureihram.com>",
        to: [ORDER_ALERT_EMAIL],
        subject: `⚠️ LOW STOCK ALERT - ${currentStock} Ihram Sets remaining`,
        html: html,
      }),
    });

    console.log("Low stock alert sent");
  } catch (error) {
    console.error("Error sending low stock alert:", error);
  }
}
