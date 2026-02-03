import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DonationRequest {
  amount: number; // Amount in EUR
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { amount }: DonationRequest = await req.json();
    console.log("Donation request:", { amount });

    if (!amount || amount < 1) {
      throw new Error("Invalid donation amount. Minimum is €1.");
    }

    // Convert EUR to cents
    const amountInCents = Math.round(amount * 100);

    // Create checkout session for standalone donation
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Voluntary Donation – Support Our Mission',
              description: 'Thank you for supporting Pure Ihram\'s mission to serve pilgrims and keep Ihram affordable for all.',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/donation-success`,
      cancel_url: `${req.headers.get("origin")}/support-our-mission`,
      metadata: {
        donation: "true",
        donation_amount: amount.toString(),
        standalone_donation: "true",
      },
    });

    console.log("Donation checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-donation-checkout function:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
