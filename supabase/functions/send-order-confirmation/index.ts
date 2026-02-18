import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  email: string;
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, orderNumber, customerName, items, totalAmount, shippingAddress }: OrderEmailRequest = await req.json();

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)}€</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toFixed(2)}€</td>
      </tr>
    `).join('');

    const emailResponse = await resend.emails.send({
      from: "Pure Ihram <orders@resend.dev>",
      to: [email],
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0f766e, #059669); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Order Confirmation</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your order!</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #0f766e; margin-bottom: 10px;">Dear ${customerName},</h2>
            <p style="line-height: 1.6; margin-bottom: 20px;">
              We have received your order and are preparing it for shipment. You will receive another email 
              with tracking information once your order has been shipped.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #0f766e; margin: 0 0 10px 0;">Order Details</h3>
              <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <h3 style="color: #0f766e; margin-bottom: 15px;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                  <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                  <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                  <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr style="font-weight: bold; background: #f8f9fa;">
                  <td colspan="3" style="padding: 12px 8px; text-align: right;">Total Amount:</td>
                  <td style="padding: 12px 8px; text-align: right;">${totalAmount.toFixed(2)}€</td>
                </tr>
              </tbody>
            </table>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #0f766e; margin: 0 0 10px 0;">Shipping Address</h3>
              <p style="margin: 0; line-height: 1.4;">
                ${shippingAddress.name}<br>
                ${shippingAddress.line1}<br>
                ${shippingAddress.line2 ? `${shippingAddress.line2}<br>` : ''}
                ${shippingAddress.postal_code} ${shippingAddress.city}<br>
                ${shippingAddress.country}
              </p>
            </div>
            
            <div style="background: #e6fffa; border-left: 4px solid #0f766e; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #0f766e; margin: 0 0 10px 0;">Shipping Information</h3>
              <p style="margin: 0; line-height: 1.6;">
                <strong>🇸🇪 Sweden:</strong> 3-7 business days<br>
                <strong>🇪🇺 Nordic & EU:</strong> 7-14 business days<br>
                <strong>📦 Tracking:</strong> You'll receive tracking information once shipped
              </p>
            </div>
            
            <p style="line-height: 1.6; margin-bottom: 20px;">
              May this sacred garment serve you well on your pilgrimage. If you have any questions about your order, 
              please don't hesitate to contact us.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px;">
                Barakallahu feeki for choosing Pure Ihram<br>
                <a href="mailto:support@pureihraam.com" style="color: #0f766e;">support@pureihraam.com</a>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Order confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);