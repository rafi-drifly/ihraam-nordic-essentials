import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  items: Array<{ id: string; quantity: number }>;
  donation?: number;
  bundlePrice?: number;
  locale?: string;
  shippingCountry?: 'SE' | 'NO';
}

const bundleLabels: Record<string, { twoPack: string; threePack: string }> = {
  en: { twoPack: '2-Pack (Best Value)', threePack: '3-Pack (Free Delivery)' },
  sv: { twoPack: '2-Pack (Bästa Värde)', threePack: '3-Pack (Fri Frakt)' },
  no: { twoPack: '2-Pack (Best Verdi)', threePack: '3-Pack (Gratis Frakt)' },
};

// Shipping rules in cents
function getShippingCents(totalQuantity: number, country: string): number {
  if (country === 'NO') {
    return totalQuantity >= 3 ? 4900 : 3900;
  }
  // Sweden: 1-2 = €9, 3+ = free
  if (totalQuantity >= 3) return 0;
  return 900;
}

function getShippingDescription(totalQuantity: number, country: string): string {
  if (country === 'NO') {
    return `Delivery to Norway (${totalQuantity} set${totalQuantity > 1 ? 's' : ''})`;
  }
  return `Delivery to Sweden (${totalQuantity} set${totalQuantity > 1 ? 's' : ''})`;
}

function getBundleType(qty: number): string {
  if (qty >= 3) return '3-pack';
  if (qty === 2) return '2-pack';
  return 'single';
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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { items, donation, bundlePrice, locale, shippingCountry }: CheckoutRequest = await req.json();
    const country = shippingCountry || 'SE';
    console.log("Checkout request:", { items, donation, bundlePrice, locale, country });

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const shippingCents = getShippingCents(totalQuantity, country);
    const bundleType = getBundleType(totalQuantity);
    console.log("Total qty:", totalQuantity, "Shipping:", shippingCents / 100, "EUR, Bundle:", bundleType, "Country:", country);

    // Get user if authenticated
    const authHeader = req.headers.get("Authorization");
    let user = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
    }

    // Find or create Stripe customer
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

    // Get product details
    const productIds = items.map(item => item.id);
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productsError) throw new Error(`Error fetching products: ${productsError.message}`);
    if (!products || products.length === 0) throw new Error("No products found");

    const product = products[0];
    if (!product) throw new Error("No product found");

    const labels = bundleLabels[locale || 'en'] || bundleLabels.en;
    let bundleName = product.name;
    if (totalQuantity === 2) bundleName = `${product.name} – ${labels.twoPack}`;
    else if (totalQuantity >= 3) bundleName = `${product.name} – ${labels.threePack}`;

    const totalPriceCents = bundlePrice
      ? Math.round(bundlePrice * 100)
      : Math.round(product.price * totalQuantity * 100);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'eur',
          product_data: { name: bundleName, description: product.description },
          unit_amount: totalPriceCents,
        },
        quantity: 1,
      },
    ];

    // Add shipping line item
    if (shippingCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Shipping',
            description: getShippingDescription(totalQuantity, country),
          },
          unit_amount: shippingCents,
        },
        quantity: 1,
      });
    }

    // Add optional donation
    if (donation && donation > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Voluntary Donation – Support Our Mission',
            description: 'Thank you for supporting Pure Ihram\'s mission',
          },
          unit_amount: Math.round(donation * 100),
        },
        quantity: 1,
      });
    }

    // Norway customs note
    const shippingAddressMessage = country === 'NO'
      ? "Norway is outside the EU. Import VAT/customs fees may apply on delivery. Delivery time: 7-14 business days."
      : "We ship to Sweden, Nordic countries, and EU. Delivery time: 3-14 business days.";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : undefined,
      line_items: lineItems,
      mode: "payment",
      currency: "eur",
      allow_promotion_codes: true,
      success_url: `${req.headers.get("origin")}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      shipping_address_collection: {
        allowed_countries: ['SE', 'NO', 'DK', 'FI', 'DE', 'NL', 'BE', 'FR', 'AT', 'IT', 'ES'],
      },
      phone_number_collection: { enabled: true },
      custom_text: {
        shipping_address: { message: shippingAddressMessage },
      },
      metadata: {
        user_id: user?.id || '',
        items: JSON.stringify(items),
        total_quantity: totalQuantity.toString(),
        bundle_type: bundleType,
        shipping_eur: (shippingCents / 100).toString(),
        shipping_country: country,
        shipping_fee_applied: (shippingCents / 100).toString(),
        donation: donation && donation > 0 ? "true" : "false",
        donation_amount: donation && donation > 0 ? donation.toString() : "0",
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
