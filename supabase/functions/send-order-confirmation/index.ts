import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { renderOrderEmail, type OrderEmailRequest } from "./email.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Must be an address on a domain verified in Resend. This used to be
// orders@resend.dev, Resend's sandbox sender, which only delivers to the Resend
// account owner - so no customer could ever have received this email.
const FROM = "Pure Ihram <orders@pureihram.com>";
const OWNER_INBOX = "pureihraam@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only the order webhook may send these; it calls with the service role key.
  // The function runs without JWT verification, so without this check anyone
  // could use it to email any address, with any content, from the shop's domain.
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey || req.headers.get("Authorization") !== `Bearer ${serviceKey}`) {
    return json(401, { error: "Unauthorized" });
  }

  try {
    const order = (await req.json()) as OrderEmailRequest;
    if (
      typeof order?.email !== "string" || !order.email.includes("@") ||
      !Array.isArray(order.items) || order.items.length === 0 ||
      !Number.isFinite(order.totalAmount)
    ) {
      return json(400, {
        error: "Expected { email, orderNumber, customerName, items[], totalAmount, shippingAddress }",
      });
    }

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [order.email],
      bcc: [OWNER_INBOX],
      // A customer who replies reaches the shop's inbox, not a dead mailbox.
      replyTo: OWNER_INBOX,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: renderOrderEmail(order),
    });

    // send() reports a rejection in its return value and never throws. The old
    // handler logged "sent successfully" and answered 200 for every refusal.
    if (error) {
      console.error("Resend rejected the order confirmation:", error);
      return json(502, { error: error.message });
    }

    console.log("Order confirmation email sent:", data?.id, "to", order.email);
    return json(200, { id: data?.id });
  } catch (error) {
    console.error("Error in send-order-confirmation function:", error);
    return json(500, { error: (error as Error).message });
  }
};

serve(handler);
