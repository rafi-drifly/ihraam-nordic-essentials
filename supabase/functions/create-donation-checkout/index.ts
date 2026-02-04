import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DonationRequest {
  amount: number;
  frequency?: 'one-time' | 'monthly';
  direction?: 'mosque' | 'needy' | 'where-needed';
  anonymous?: boolean;
  wantsReceipt?: boolean;
  receiptEmail?: string;
  coverFees?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { 
      amount, 
      frequency = 'one-time',
      direction = 'where-needed',
      anonymous = false,
      wantsReceipt = false,
      receiptEmail,
      coverFees = false
    }: DonationRequest = await req.json();
    
    console.log("Donation request:", { amount, frequency, direction, anonymous, coverFees });

    if (!amount || amount < 1) {
      throw new Error("Invalid donation amount. Minimum is €1.");
    }

    const amountInCents = Math.round(amount * 100);
    const origin = req.headers.get("origin") || "https://pureihram.com";

    // Build product description based on direction
    const directionLabels: Record<string, string> = {
      'mosque': 'Mosque Support Program',
      'needy': 'Needy Projects',
      'where-needed': 'Where Most Needed'
    };

    const productDescription = `Voluntary Donation – ${directionLabels[direction] || 'Support Our Mission'}`;

    // Common metadata
    const metadata = {
      donation: "true",
      donation_amount: amount.toString(),
      standalone_donation: "true",
      frequency,
      direction,
      anonymous: anonymous.toString(),
      covered_fees: coverFees.toString(),
    };

    let session;

    if (frequency === 'monthly') {
      // Create recurring subscription checkout
      session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Monthly Donation – ${directionLabels[direction] || 'Support Our Mission'}`,
                description: 'Recurring monthly donation to Pure Ihram\'s mission.',
              },
              unit_amount: amountInCents,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${origin}/donation-success`,
        cancel_url: `${origin}/donation-cancel`,
        metadata,
        subscription_data: {
          metadata,
        },
      });
    } else {
      // One-time payment
      session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: productDescription,
                description: 'Thank you for supporting Pure Ihram\'s mission to serve pilgrims and keep Ihram affordable for all.',
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/donation-success`,
        cancel_url: `${origin}/donation-cancel`,
        metadata,
      });
    }

    console.log("Donation checkout session created:", session.id, "mode:", frequency);

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
