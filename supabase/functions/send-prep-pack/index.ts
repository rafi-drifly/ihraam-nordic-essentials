// Capture Hajj 2026 Prep Pack signups: store in DB, push to Klaviyo (event + list subscription).
// The actual email send is handled by a Klaviyo Flow triggered by the "Requested Hajj Prep Pack" metric
// or by the list subscription.
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

const PDF_URL = "https://www.pureihram.com/hajj-2026-prep-pack.pdf";
const KLAVIYO_REVISION = "2024-10-15";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const KLAVIYO_API_KEY = Deno.env.get("KLAVIYO_PRIVATE_API_KEY");
    const KLAVIYO_LIST_ID = Deno.env.get("KLAVIYO_Hajj_Guide_Subscribers");

    if (!SUPABASE_URL || !SERVICE_ROLE || !KLAVIYO_API_KEY) {
      console.error("Missing required env", {
        hasUrl: !!SUPABASE_URL,
        hasServiceRole: !!SERVICE_ROLE,
        hasKlaviyo: !!KLAVIYO_API_KEY,
      });
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

    // 1. Idempotent insert into our subscribers table (source of truth).
    const { error: insertError } = await supabase
      .from("hajj_prep_subscribers")
      .insert({ email, locale, source: source ?? "homepage" });
    if (insertError && !insertError.message.toLowerCase().includes("duplicate")) {
      console.error("Subscriber insert error:", insertError);
    }

    const klaviyoHeaders = {
      Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      revision: KLAVIYO_REVISION,
    };

    // 2. Push the event to Klaviyo (this is the Flow trigger).
    const eventRes = await fetch("https://a.klaviyo.com/api/events/", {
      method: "POST",
      headers: klaviyoHeaders,
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            properties: {
              lead_magnet: "hajj_prep_pack",
              source: source ?? "homepage",
              locale,
              pdf_url: PDF_URL,
            },
            metric: {
              data: {
                type: "metric",
                attributes: { name: "Requested Hajj Prep Pack" },
              },
            },
            profile: {
              data: {
                type: "profile",
                attributes: { email, properties: { locale } },
              },
            },
          },
        },
      }),
    });

    if (!eventRes.ok) {
      const errBody = await eventRes.text();
      console.error("Klaviyo event error:", eventRes.status, errBody);
      return new Response(
        JSON.stringify({ error: "Could not register your email. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } else {
      // Body must be consumed.
      await eventRes.text();
    }

    // 3. Subscribe to list (best-effort, don't fail user if this errors).
    if (KLAVIYO_LIST_ID) {
      const subRes = await fetch(
        "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/",
        {
          method: "POST",
          headers: klaviyoHeaders,
          body: JSON.stringify({
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
                custom_source: source ?? "homepage",
              },
              relationships: {
                list: { data: { type: "list", id: KLAVIYO_LIST_ID } },
              },
            },
          }),
        },
      );
      if (!subRes.ok) {
        const errBody = await subRes.text();
        console.error("Klaviyo list subscription error:", subRes.status, errBody);
      } else {
        await subRes.text();
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
