/**
 * Stripe over its REST API, with fetch and Web Crypto: no Stripe package, so
 * nothing Node-specific has to run in the Worker.
 */

/** The Stripe API version the Supabase functions were pinned to. */
export const STRIPE_VERSION = "2025-08-27.basil";

/** Stripe's form encoding: nested objects and arrays in bracket notation. */
export function toStripeForm(params: Record<string, unknown>): string {
  const pairs: string[] = [];
  const walk = (value: unknown, key: string) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, `${key}[${i}]`));
    } else if (typeof value === "object") {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) walk(v, `${key}[${k}]`);
    } else {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  };
  for (const [k, v] of Object.entries(params)) walk(v, k);
  return pairs.join("&");
}

export class StripeError extends Error {
  constructor(
    public status: number,
    public type: string | undefined,
    message: string,
  ) {
    super(message);
  }
}

/**
 * One Stripe API call. GET parameters go in the query string, POST ones in the
 * body. Throws StripeError with Stripe's own message, which never contains the
 * key, so it is safe to log.
 */
export async function stripeApi<T>(
  key: string,
  method: "GET" | "POST",
  path: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  const form = toStripeForm(params);
  const url = `https://api.stripe.com/v1/${path}${method === "GET" && form ? `?${form}` : ""}`;
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Stripe-Version": STRIPE_VERSION,
      ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: method === "POST" ? form : undefined,
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: { message?: string; type?: string } };
  if (!response.ok) {
    throw new StripeError(response.status, data.error?.type, data.error?.message ?? `Stripe returned ${response.status}`);
  }
  return data;
}

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Equal-time string comparison, so the check does not leak how much matched. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Checks a Stripe-Signature header the way Stripe's libraries do: HMAC-SHA256
 * of "<timestamp>.<raw body>" with the endpoint's signing secret, against any
 * v1 signature in the header, and a timestamp no more than five minutes old so
 * a captured request cannot be replayed later.
 */
export async function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
  toleranceSeconds = 300,
): Promise<boolean> {
  if (!header || !secret) return false;
  const parts = header.split(",").map((p) => p.trim().split("="));
  const timestamp = parts.find(([k]) => k === "t")?.[1];
  const signatures = parts.filter(([k]) => k === "v1").map(([, v]) => v ?? "");
  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) return false;
  if (Math.abs(nowSeconds - Number(timestamp)) > toleranceSeconds) return false;

  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const expected = toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`)));
  return signatures.some((signature) => safeEqual(signature, expected));
}

/** Signs a payload the way Stripe does. For tests and for nothing else. */
export async function signStripePayload(payload: string, secret: string, timestamp: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const signature = toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`)));
  return `t=${timestamp},v1=${signature}`;
}
