import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShippingAdjustmentEmailRequest {
  orderId: string;
  paymentUrl: string;
  extraAmount: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { orderId, paymentUrl, extraAmount }: ShippingAdjustmentEmailRequest = await req.json();
    console.log("Sending shipping adjustment email:", { orderId, extraAmount });

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const customerEmail = order.guest_email;
    if (!customerEmail) {
      return new Response(
        JSON.stringify({ error: "No customer email on order" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const shippingAddress = order.shipping_address as any;
    const addressSummary = [
      shippingAddress?.name,
      shippingAddress?.line1,
      shippingAddress?.city,
      shippingAddress?.country
    ].filter(Boolean).join(', ');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #2C7A7B, #285E61); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 30px; background: #f9f9f9; }
          .amount-box { background: #fff; border: 2px solid #2C7A7B; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .amount { font-size: 32px; font-weight: bold; color: #2C7A7B; }
          .btn { display: inline-block; background: #2C7A7B; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .btn:hover { background: #285E61; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .details { background: #fff; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🕋 PureIhram</h1>
        </div>
        <div class="content">
          <h2>Additional Shipping Required</h2>
          <p>Assalamu Alaikum,</p>
          <p>Thank you for your order from PureIhram!</p>
          <p>After reviewing the shipping costs to your address, we found that the actual delivery cost is higher than the base €9 fee you paid at checkout.</p>
          
          <div class="details">
            <p><strong>Order:</strong> ${order.order_number}</p>
            <p><strong>Shipping to:</strong> ${addressSummary}</p>
            <p><strong>Base shipping fee paid:</strong> €${order.base_shipping_fee_eur || 9}</p>
          </div>

          <div class="amount-box">
            <p>Additional shipping required:</p>
            <div class="amount">€${extraAmount.toFixed(2)}</div>
          </div>

          <p>Please approve this additional fee by clicking the secure payment link below. <strong>We will dispatch your order immediately after receiving your payment.</strong></p>

          <p style="text-align: center;">
            <a href="${paymentUrl}" class="btn">Pay €${extraAmount.toFixed(2)} Now →</a>
          </p>

          <p style="font-size: 14px; color: #666;">If you have any questions or would like to cancel your order instead, please reply to this email and we will process a full refund.</p>

          <p>JazakAllahu Khayran,<br>The PureIhram Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} PureIhram.com | <a href="mailto:support@pureihraam.com">support@pureihraam.com</a></p>
        </div>
      </body>
      </html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "PureIhram <noreply@pureihram.com>",
        to: [customerEmail],
        subject: `Action Required: Additional Shipping for Order ${order.order_number}`,
        html: html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Email send failed:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    console.log("Shipping adjustment email sent to:", customerEmail);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending shipping adjustment email:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
