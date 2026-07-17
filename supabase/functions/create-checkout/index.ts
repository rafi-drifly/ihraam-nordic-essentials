import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CheckoutRequest {
  items: Array<{ id: string; quantity: number }>;
  donation?: number;
  bundlePrice?: number;
  locale?: string;
  shippingCountry?: string;
  promoCode?: string;
  shippingCity?: string;
  /** Free mosque pickup instead of shipping. One of PICKUP_LOCATIONS keys. */
  pickupLocation?: string;
}

// Free local pickup points (no shipping fee, no delivery address needed).
const PICKUP_LOCATIONS: Record<string, string> = {
  "uppsala-mosque": "Free pickup - Uppsala Mosque",
  "stockholm-mosque": "Free pickup - Stockholm Mosque",
};

// European countries list
const EUROPE_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 
  'SE', 'GB', 'NO', 'IS', 'LI', 'CH'
] as const;

const bundleLabels: Record<string, { twoPack: string; threePack: string }> = {
  en: { twoPack: '2-Pack (Best Value)', threePack: '3-Pack (Most Popular)' },
  sv: { twoPack: '2-Pack (Bästa Värde)', threePack: '3-Pack (Mest Populär)' },
  no: { twoPack: '2-Pack (Beste Verdi)', threePack: '3-Pack (Mest Populær)' },
};

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

    const body = await req.json();
    const { items, donation, bundlePrice, locale, promoCode, shippingCity, shippingCountry, pickupLocation }: CheckoutRequest = body;

    // ---- Input validation (server-side; do not trust client) ----
    if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
      return new Response(JSON.stringify({ error: "Invalid items" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const it of items) {
      if (!it || typeof it.id !== "string" || !UUID_RE.test(it.id)) {
        return new Response(JSON.stringify({ error: "Invalid item id" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
      }
      if (!Number.isInteger(it.quantity) || it.quantity < 1 || it.quantity > 50) {
        return new Response(JSON.stringify({ error: "Invalid item quantity" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
      }
    }
    if (donation !== undefined && donation !== null) {
      if (typeof donation !== "number" || !Number.isFinite(donation) || donation < 0 || donation > 10000) {
        return new Response(JSON.stringify({ error: "Invalid donation amount" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
      }
    }
    if (bundlePrice !== undefined && bundlePrice !== null) {
      if (typeof bundlePrice !== "number" || !Number.isFinite(bundlePrice) || bundlePrice < 0 || bundlePrice > 100000) {
        return new Response(JSON.stringify({ error: "Invalid bundle price" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
      }
    }
    if (locale !== undefined && (typeof locale !== "string" || !["en", "sv", "no"].includes(locale))) {
      return new Response(JSON.stringify({ error: "Invalid locale" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }
    if (promoCode !== undefined && promoCode !== null && (typeof promoCode !== "string" || promoCode.length > 64 || !/^[A-Za-z0-9_-]+$/.test(promoCode))) {
      return new Response(JSON.stringify({ error: "Invalid promo code format" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }
    if (shippingCity !== undefined && shippingCity !== null && (typeof shippingCity !== "string" || shippingCity.length > 100)) {
      return new Response(JSON.stringify({ error: "Invalid shipping city" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }
    if (shippingCountry !== undefined && shippingCountry !== null && (typeof shippingCountry !== "string" || !/^[A-Z]{2}$/.test(shippingCountry))) {
      return new Response(JSON.stringify({ error: "Invalid shipping country" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }
    if (pickupLocation !== undefined && pickupLocation !== null && !PICKUP_LOCATIONS[pickupLocation]) {
      return new Response(JSON.stringify({ error: "Invalid pickup location" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }
    // ---- end validation ----

    console.log("Checkout request:", { itemCount: items.length, hasDonation: !!donation, hasBundlePrice: !!bundlePrice, locale, hasPromo: !!promoCode, shippingCountry });

    // Free mosque pickup: no shipping fee, no delivery address.
    const isPickup = !!(pickupLocation && PICKUP_LOCATIONS[pickupLocation]);
    const pickupLabel = isPickup ? PICKUP_LOCATIONS[pickupLocation as string] : null;
    if (isPickup) {
      console.log("Free mosque pickup selected:", pickupLocation);
    }

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const baseShippingFee = 9; // €9 base for all of Europe
    const shippingCents = isPickup ? 0 : baseShippingFee * 100;
    const bundleType = getBundleType(totalQuantity);
    console.log("Total qty:", totalQuantity, "Shipping: €", shippingCents / 100, "Bundle:", bundleType);

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
    if (totalQuantity === 2) bundleName = `${product.name} - ${labels.twoPack}`;
    else if (totalQuantity >= 3) bundleName = `${product.name} - ${labels.threePack}`;

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
            description: `Base delivery fee (${totalQuantity} set${totalQuantity > 1 ? 's' : ''})`,
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
            name: 'Voluntary Donation - Support Our Mission',
            description: 'Thank you for supporting Pure Ihram\'s mission',
          },
          unit_amount: Math.round(donation * 100),
        },
        quantity: 1,
      });
    }

    const shippingMessage = "We ship to Sweden (3-7 business days). For orders outside Sweden, shipping costs may vary - we'll contact you with the exact delivery fee before dispatching.";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : undefined,
      line_items: lineItems,
      mode: "payment",
      currency: "eur",
      payment_method_types: ['card', 'klarna'],
      success_url: `${req.headers.get("origin")}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      // Pickup orders need no delivery address; shipping orders collect one.
      ...(isPickup ? {} : {
        shipping_address_collection: {
          allowed_countries: EUROPE_COUNTRIES as unknown as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
        },
        custom_text: {
          shipping_address: { message: shippingMessage },
        },
      }),
      phone_number_collection: { enabled: true },
      metadata: {
        user_id: user?.id || '',
        items: JSON.stringify(items),
        total_quantity: totalQuantity.toString(),
        bundle_type: bundleType,
        base_shipping_fee_eur: (baseShippingFee).toString(),
        shipping_fee_applied: (shippingCents / 100).toString(),
        delivery_method: isPickup ? 'pickup' : 'shipping',
        pickup_location: pickupLabel || '',
        donation: donation && donation > 0 ? "true" : "false",
        donation_amount: donation && donation > 0 ? donation.toString() : "0",
        pricing_currency: 'EUR',
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
