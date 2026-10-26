/**
 * The shop's public forms, running on Cloudflare instead of Supabase.
 *
 * Stage 1 of the move off Supabase. Each route does what its Supabase function
 * did, with the same validation, plus one change: whatever a visitor sends is
 * written to D1 before anything is delivered, so a failure further down no
 * longer loses it. The contact form now sends through Resend, the shop's own
 * email provider, instead of Web3Forms.
 *
 *   POST /contact    contact, partner and mosque forms -> Resend -> shop inbox
 *   POST /prep-pack  Hajj prep pack signup -> Klaviyo, whose flow emails the PDF
 */

export interface Env {
  DB: D1Database;
  ALLOWED_ORIGINS: string;
  KLAVIYO_COMPANY_ID: string;
  KLAVIYO_PREP_PACK_LIST_ID: string;
  RESEND_API_KEY?: string;
}

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface PrepPackSignup {
  email: string;
  locale: string;
  source: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KLAVIYO_REVISION = "2026-10-15";
const PREP_PACK_PDF_URL = "https://www.pureihram.com/hajj-2026-prep-pack.pdf";
const CONTACT_INBOX = "pureihraam@gmail.com";
// pureihram.com publishes DMARC p=reject, so this only delivers once the
// domain is verified in Resend and its DKIM record is live.
const CONTACT_FROM = "Pure Ihram Contact <noreply@pureihram.com>";

export function parseContact(body: unknown): Parsed<ContactMessage> {
  const input = (body ?? {}) as Record<string, unknown>;
  const field = (key: string) => (typeof input[key] === "string" ? (input[key] as string).trim() : "");

  const name = field("name");
  const email = field("email");
  const subject = field("subject");
  const message = field("message");

  if (!name || !email || !subject || !message) return { ok: false, error: "All fields are required" };
  if (!EMAIL_PATTERN.test(email)) return { ok: false, error: "Invalid email format" };
  if (name.length > 100) return { ok: false, error: "Name must be less than 100 characters" };
  if (subject.length > 200) return { ok: false, error: "Subject must be less than 200 characters" };
  if (message.length > 2000) return { ok: false, error: "Message must be less than 2000 characters" };

  return { ok: true, value: { name, email, subject, message } };
}

export function parsePrepPack(body: unknown): Parsed<PrepPackSignup> {
  const input = (body ?? {}) as Record<string, unknown>;

  const email = typeof input.email === "string" ? input.email.trim() : "";
  if (!email || email.length > 255 || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Invalid input" };
  }

  // Locale is only recorded against the subscriber and passed to Klaviyo, so
  // any well-formed two-letter code is accepted. A fixed list here is what
  // turned the form into a 400 for every French visitor in September.
  const locale = input.locale ?? "en";
  if (typeof locale !== "string" || !/^[a-z]{2}$/.test(locale)) {
    return { ok: false, error: "Invalid input" };
  }

  const source = input.source ?? "homepage";
  if (typeof source !== "string" || source.length > 120) {
    return { ok: false, error: "Invalid input" };
  }

  return { ok: true, value: { email, locale, source } };
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());
  const origin = request.headers.get("Origin") ?? "";
  // Any local dev server too: Vite picks another port when 8080 is taken.
  const isAllowed = allowed.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowed[0],
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// --- Contact form --------------------------------------------------------

async function deliverViaResend(apiKey: string, m: ContactMessage): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: [CONTACT_INBOX],
        // Pressing reply in Gmail answers the visitor, not the shop's own address.
        reply_to: m.email,
        subject: `[Pure Ihram Contact] ${m.subject}`,
        text: `From: ${m.name} (${m.email})\n\nSubject: ${m.subject}\n\nMessage:\n${m.message}`,
      }),
    });
    if (!response.ok) {
      console.error(`contact: Resend returned ${response.status}`, (await response.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (error) {
    console.error("contact: Resend request failed", errorMessage(error));
    return false;
  }
}

async function handleContact(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  const parsed = parseContact(await request.json().catch(() => null));
  if ("error" in parsed) return json({ error: parsed.error }, 400, cors);
  const m = parsed.value;

  // Stored first, so a message survives whatever happens to delivery. If D1
  // itself fails, delivery still goes ahead: the store must never make the
  // form worse than it was on Supabase, which had no store at all.
  const id = crypto.randomUUID();
  let stored = false;
  try {
    await env.DB.prepare(
      "INSERT INTO contact_messages (id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(id, m.name, m.email, m.subject, m.message)
      .run();
    stored = true;
  } catch (error) {
    console.error("contact: could not store message", errorMessage(error));
  }

  if (!env.RESEND_API_KEY) {
    console.error("contact: RESEND_API_KEY is not set");
    return json({ error: "Service configuration error" }, 500, cors);
  }

  if (!(await deliverViaResend(env.RESEND_API_KEY, m))) {
    return json({ error: "Failed to send message. Please try again or contact us directly." }, 500, cors);
  }

  if (stored) {
    await env.DB.prepare("UPDATE contact_messages SET delivered = 1 WHERE id = ?")
      .bind(id)
      .run()
      .catch((error: unknown) => console.error("contact: could not mark delivered", errorMessage(error)));
  }

  return json({ success: true, message: "Message sent successfully! We will get back to you soon." }, 200, cors);
}

// --- Hajj prep pack ------------------------------------------------------

/**
 * Klaviyo's client endpoints take the public site ID instead of a private key,
 * so nothing secret is needed to record a signup.
 */
async function postToKlaviyo(env: Env, path: "events" | "subscriptions", data: unknown): Promise<boolean> {
  try {
    const response = await fetch(
      `https://a.klaviyo.com/client/${path}?company_id=${encodeURIComponent(env.KLAVIYO_COMPANY_ID)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/vnd.api+json",
          Accept: "application/vnd.api+json",
          revision: KLAVIYO_REVISION,
        },
        body: JSON.stringify({ data }),
      }
    );
    const text = await response.text();
    if (!response.ok) {
      console.error(`prep-pack: Klaviyo ${path} returned ${response.status}`, text.slice(0, 300));
      return false;
    }
    return true;
  } catch (error) {
    console.error(`prep-pack: Klaviyo ${path} request failed`, errorMessage(error));
    return false;
  }
}

async function handlePrepPack(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  const parsed = parsePrepPack(await request.json().catch(() => null));
  if ("error" in parsed) return json({ error: parsed.error }, 400, cors);
  const { email, locale, source } = parsed.value;

  // 1. Our own record. Signing up twice is not an error.
  try {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO hajj_prep_subscribers (id, email, locale, source) VALUES (?, ?, ?, ?)"
    )
      .bind(crypto.randomUUID(), email, locale, source)
      .run();
  } catch (error) {
    console.error("prep-pack: could not store subscriber", errorMessage(error));
  }

  // 2. The event is what triggers the Klaviyo flow that sends the PDF. If it
  // fails the visitor gets nothing, so they are told rather than thanked.
  const eventSent = await postToKlaviyo(env, "events", {
    type: "event",
    attributes: {
      properties: { lead_magnet: "hajj_prep_pack", source, locale, pdf_url: PREP_PACK_PDF_URL },
      metric: { data: { type: "metric", attributes: { name: "Requested Hajj Prep Pack" } } },
      profile: { data: { type: "profile", attributes: { email, properties: { locale } } } },
    },
  });
  if (!eventSent) {
    return json({ error: "Could not register your email. Please try again." }, 502, cors);
  }

  // 3. Marketing list subscription, best-effort.
  if (env.KLAVIYO_PREP_PACK_LIST_ID) {
    await postToKlaviyo(env, "subscriptions", {
      type: "subscription",
      attributes: {
        custom_source: source,
        profile: {
          data: {
            type: "profile",
            attributes: { email, subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } } },
          },
        },
      },
      relationships: { list: { data: { type: "list", id: env.KLAVIYO_PREP_PACK_LIST_ID } } },
    });
  }

  return json({ ok: true }, 200, cors);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/health") {
      return json(
        {
          ok: true,
          contactConfigured: Boolean(env.RESEND_API_KEY),
          prepPackListConfigured: Boolean(env.KLAVIYO_PREP_PACK_LIST_ID),
        },
        200,
        cors
      );
    }

    if (request.method === "POST" && url.pathname === "/contact") return handleContact(request, env, cors);
    if (request.method === "POST" && url.pathname === "/prep-pack") return handlePrepPack(request, env, cors);

    return json({ error: "Not found" }, 404, cors);
  },
};
