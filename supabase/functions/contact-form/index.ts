import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const { name, email, subject, message }: ContactFormData = await req.json();

    // Input validation
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ 
        error: 'All fields are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid email format' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Length validations
    if (name.length > 100) {
      return new Response(JSON.stringify({ 
        error: 'Name must be less than 100 characters' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (subject.length > 200) {
      return new Response(JSON.stringify({ 
        error: 'Subject must be less than 200 characters' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (message.length > 2000) {
      return new Response(JSON.stringify({ 
        error: 'Message must be less than 2000 characters' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get Web3Forms API key from environment
    const web3formsKey = Deno.env.get('WEB3FORMS_API_KEY');
    if (!web3formsKey) {
      console.error('WEB3FORMS_API_KEY not found in environment');
      return new Response(JSON.stringify({ 
        error: 'Service configuration error' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Prepare form data for Web3Forms
    const formData = new FormData();
    formData.append('access_key', web3formsKey);
    formData.append('name', name.trim());
    formData.append('email', email.trim());
    formData.append('subject', `[Pure Ihram Contact] ${subject.trim()}`);
    formData.append('message', `From: ${name.trim()} (${email.trim()})\n\nSubject: ${subject.trim()}\n\nMessage:\n${message.trim()}`);
    formData.append('from_name', 'Pure Ihram Contact Form');
    formData.append('redirect', 'false');

    console.log('Sending form data to Web3Forms...');

    // Submit to Web3Forms
    const web3formsResponse = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });

    console.log('Web3Forms response status:', web3formsResponse.status);
    console.log('Web3Forms response headers:', Object.fromEntries(web3formsResponse.headers.entries()));

    const responseText = await web3formsResponse.text();
    console.log('Web3Forms raw response:', responseText);

    // Check if response is successful
    let isSuccess = false;
    
    // Try to parse as JSON first
    try {
      const jsonResult = JSON.parse(responseText);
      isSuccess = web3formsResponse.ok && jsonResult.success;
      console.log('Web3Forms JSON result:', jsonResult);
    } catch (parseError) {
      // If not JSON, check if it's HTML with success indicators
      console.log('Response is not JSON, checking for HTML success indicators');
      
      if (web3formsResponse.ok && responseText.includes('Form submitted successfully!')) {
        isSuccess = true;
        console.log('HTML response indicates successful form submission');
      } else {
        console.error('No success indicators found in response');
      }
    }

    if (isSuccess) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Message sent successfully! We will get back to you soon.' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } else {
      console.error('Web3Forms submission failed');
      return new Response(JSON.stringify({ 
        error: 'Failed to send message. Please try again or contact us directly.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

  } catch (error: any) {
    console.error('Error in contact-form function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error. Please try again later.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);