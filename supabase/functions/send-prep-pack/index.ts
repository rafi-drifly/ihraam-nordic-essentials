// Triggers a Klaviyo event for the free Hajj 2026 Prep Pack lead magnet.
// The Klaviyo flow (configured in the dashboard, triggered by the
// "Hajj Prep Pack Requested" metric) is responsible for sending the email
// with the PDF download link.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BodySchema = z.object({
  email: z.string().trim().email().max(255),
  locale: z.enum(["en", "sv", "no"]).optional().default("en"),
  source: z.string().max(120).optional(),
});

const KLAVIYO_API_REVISION = "2024-10-15";
const KLAVIYO_METRIC_NAME = "Hajj Prep Pack Requested";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const KLAVIYO_PRIVATE_API_KEY = Deno.env.get("KLAVIYO_PRIVATE_API_KEY");
    const KLAVIYO_HAJJ_PREP_LIST_ID = Deno.env.get("KLAVIYO_HAJJ_PREP_LIST_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!KLAVIYO_PRIVATE_API_KEY || !SUPABASE_URL || !SERVICE_ROLE) {
      return new Response(
        JSON.stringify({ error: "Server not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { email, locale, source } = parsed.data;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Idempotent backup record in our own DB.
    const { error: insertError } = await supabase
      .from("hajj_prep_subscribers")
      .insert({ email, locale, source: source ?? "homepage" });

    if (insertError && !insertError.message.toLowerCase().includes("duplicate")) {
      console.error("Subscriber insert error:", insertError);
    }

    const klaviyoHeaders = {
      "accept": "application/vnd.api+json",
      "content-type": "application/vnd.api+json",
      "revision": KLAVIYO_API_REVISION,
      "Authorization": `Klaviyo-API-Key ${KLAVIYO_PRIVATE_API_KEY}`,
    } as const;

    // 1) Fire the event. Klaviyo creates the profile if it doesn't exist
    //    and triggers the "Hajj Prep Pack Requested" flow that sends the email.
    const eventPayload = {
      data: {
        type: "event",
        attributes: {
          properties: {
            lead_magnet: "hajj_prep_pack",
            source: source ?? "homepage",
            locale,
          },
          metric: {
            data: {
              type: "metric",
              attributes: { name: KLAVIYO_METRIC_NAME },
            },
          },
          profile: {
            data: {
              type: "profile",
              attributes: {
                email,
                properties: { Locale: locale, LeadMagnet: "hajj_prep_pack" },
              },
            },
          },
        },
      },
    };

    const eventRes = await fetch("https://a.klaviyo.com/api/events", {
      method: "POST",
      headers: klaviyoHeaders,
      body: JSON.stringify(eventPayload),
    });

    if (!eventRes.ok) {
      const errBody = await eventRes.text();
      console.error("Klaviyo event error:", eventRes.status, errBody);
      return new Response(
        JSON.stringify({ error: "Email could not be sent. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2) Optional: subscribe the profile to the lead-magnet list with
    //    marketing consent. Non-fatal if it fails; the flow above already fired.
    if (KLAVIYO_HAJJ_PREP_LIST_ID) {
      const subscribePayload = {
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            profiles: {
              data: [
                {
                  type: "profile",
                  attributes: {
                    email,
                    subscriptions: {
                      email: { marketing: { consent: "SUBSCRIBED" } },
                    },
                  },
                },
              ],
            },
          },
          relationships: {
            list: { data: { type: "list", id: KLAVIYO_HAJJ_PREP_LIST_ID } },
          },
        },
      };

      const subRes = await fetch(
        "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs",
        {
          method: "POST",
          headers: klaviyoHeaders,
          body: JSON.stringify(subscribePayload),
        },
      );

      if (!subRes.ok) {
        const errBody = await subRes.text();
        console.error("Klaviyo subscribe warning:", subRes.status, errBody);
      }
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("send-prep-pack error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
