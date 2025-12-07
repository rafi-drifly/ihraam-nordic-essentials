import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  items: Array<{
    id: string;
    quantity: number;
  }>;
}

// Define shipping options by region
const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
  {
    shipping_rate_data: {
      type: 'fixed_amount',
      fixed_amount: { amount: 500, currency: 'eur' }, // 5€
      display_name: 'Shipping to Sweden',
      delivery_estimate: {
        minimum: { unit: 'business_day', value: 3 },
        maximum: { unit: 'business_day', value: 7 },
      },
    },
  },
  {
    shipping_rate_data: {
      type: 'fixed_amount',
      fixed_amount: { amount: 900, currency: 'eur' }, // 9€
      display_name: 'Shipping to Nordic Countries',
      delivery_estimate: {
        minimum: { unit: 'business_day', value: 7 },
        maximum: { unit: 'business_day', value: 14 },
      },
    },
  },
  {
    shipping_rate_data: {
      type: 'fixed_amount',
      fixed_amount: { amount: 1000, currency: 'eur' }, // 10€
      display_name: 'Shipping to European Union',
      delivery_estimate: {
        minimum: { unit: 'business_day', value: 7 },
        maximum: { unit: 'business_day', value: 14 },
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { items }: CheckoutRequest = await req.json();
    console.log("Checkout request:", { items });

    // Get user if authenticated (optional for guest checkout)
    const authHeader = req.headers.get("Authorization");
    let user = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
      console.log("Authenticated user:", user?.id);
    } else {
      console.log("No auth header - guest checkout");
    }

    // Find or create Stripe customer if user is authenticated
    let customerId;
    if (user?.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name,
        });
        customerId = customer.id;
      }
    }

    // Get product details from database
    const productIds = items.map(item => item.id);
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productsError) {
      throw new Error(`Error fetching products: ${productsError.message}`);
    }

    if (!products || products.length === 0) {
      throw new Error("No products found");
    }

    // Create line items for Stripe checkout (products only, shipping handled separately)
    const lineItems = items.map(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) {
        throw new Error(`Product not found: ${item.id}`);
      }

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: Math.round(product.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Create checkout session with shipping options
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : undefined, // Let Stripe collect email
      line_items: lineItems,
      mode: "payment",
      currency: "eur",
      success_url: `${req.headers.get("origin")}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      shipping_address_collection: {
        allowed_countries: ['SE', 'NO', 'DK', 'FI', 'DE', 'NL', 'BE', 'FR', 'AT', 'IT', 'ES'],
      },
      shipping_options: shippingOptions,
      phone_number_collection: {
        enabled: true,
      },
      custom_text: {
        shipping_address: {
          message: "We ship to Sweden, Nordic countries, and EU. Delivery time: 3-14 business days.",
        },
      },
      metadata: {
        user_id: user?.id || '',
        items: JSON.stringify(items),
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-checkout function:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
