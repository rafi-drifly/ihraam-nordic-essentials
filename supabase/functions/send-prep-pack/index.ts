// Send the free Hajj 2026 Prep Pack via email and store the subscriber.
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
const FROM_ADDRESS = "Pure Ihram <support@pureihraam.com>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY || !SUPABASE_URL || !SERVICE_ROLE) {
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

    // Idempotent insert — ignore conflict on email.
    const { error: insertError } = await supabase
      .from("hajj_prep_subscribers")
      .insert({ email, locale, source: source ?? "homepage" });

    if (insertError && !insertError.message.toLowerCase().includes("duplicate")) {
      console.error("Subscriber insert error:", insertError);
    }

    // Compose email
    const subject = "Your free Pure Ihram - Hajj 2026 Prep Pack";
    const html = `
      <div style="font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; color:#1f2d2d; max-width:560px; margin:0 auto; padding:24px;">
        <h1 style="font-size:22px; margin:0 0 16px; color:#287777;">Your Hajj 2026 Prep Pack is ready</h1>
        <p style="font-size:15px; line-height:1.55; margin:0 0 16px;">
          Assalamu alaikum,
        </p>
        <p style="font-size:15px; line-height:1.55; margin:0 0 16px;">
          Thank you for requesting the free Pure Ihram Hajj 2026 Prep Pack. It includes a printable
          packing checklist, a list of essential duas, and a simple day-by-day prep timeline.
        </p>
        <p style="margin:24px 0;">
          <a href="${PDF_URL}"
             style="background:#287777; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:8px; font-weight:600; display:inline-block;">
            Download the Prep Pack (PDF)
          </a>
        </p>
        <p style="font-size:14px; line-height:1.55; color:#55676a; margin:0 0 12px;">
          We will only email you a few helpful Hajj tips before you go - no spam.
        </p>
        <p style="font-size:13px; line-height:1.55; color:#7d8c8c; margin:24px 0 0;">
          - Pure Ihram, Sweden<br/>
          <a href="https://www.pureihram.com" style="color:#287777;">pureihram.com</a>
        </p>
      </div>
    `;
    const text = `Assalamu alaikum,

Thank you for requesting the free Pure Ihram Hajj 2026 Prep Pack.
Download it here: ${PDF_URL}

We will only email you a few helpful Hajj tips before you go - no spam.

- Pure Ihram, Sweden
https://www.pureihram.com`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [email],
        subject,
        html,
        text,
      }),
    });

    if (!resendRes.ok) {
      const errBody = await resendRes.text();
      console.error("Resend error:", resendRes.status, errBody);
      return new Response(
        JSON.stringify({ error: "Email could not be sent. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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
