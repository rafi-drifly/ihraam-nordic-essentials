/**
 * The admin's password login, the same idea as the Yalla Jerky admin.
 *
 * Replaced Cloudflare Access on 16 Nov 2026 at the owner's request: one
 * password box instead of an emailed code. Done more carefully than a plain
 * password check:
 *
 *   - The password is the ADMIN_PASSWORD secret, at least 12 characters, set
 *     by the owner. The browser never stores it: a right password is answered
 *     with a session cookie that the page's own scripts cannot read
 *     (HttpOnly) and that is never sent from another site (SameSite=Strict).
 *   - "Keep me signed in on this device" makes the session last 30 days;
 *     otherwise 12 hours, and it ends when the browser closes.
 *   - Sessions are signed with a key made from ADMIN_SESSION_SECRET and the
 *     password, so changing the password signs every device out at once.
 *   - Five wrong passwords from one address within 15 minutes lock that
 *     address out until they age out (D1 table admin_login_failures).
 */

export interface AdminSessionEnv {
  DB: D1Database;
  /** The admin password, set by the owner with `wrangler secret put`. */
  ADMIN_PASSWORD?: string;
  /** Random, 32+ characters. Signs session cookies; never typed by anyone. */
  ADMIN_SESSION_SECRET?: string;
}

export const COOKIE_NAME = "pureihram_admin";
export const MIN_PASSWORD_LENGTH = 12;
export const MAX_FAILURES = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;
export const LONG_SESSION_MS = 30 * 24 * 60 * 60 * 1000;
export const SHORT_SESSION_MS = 12 * 60 * 60 * 1000;
const FAILURE_KEEP_MS = 24 * 60 * 60 * 1000;
const MAX_PASSWORD_INPUT = 200;

const encoder = new TextEncoder();
const HMAC = { name: "HMAC", hash: "SHA-256" } as const;

function base64Url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(text.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

const password = (env: AdminSessionEnv) => (env.ADMIN_PASSWORD ?? "").trim();

/** Why the admin cannot be signed in to yet, or null when it is set up. */
export function sessionSetupProblem(env: AdminSessionEnv): string | null {
  if (!password(env)) return "The admin password has not been set yet.";
  if (password(env).length < MIN_PASSWORD_LENGTH) {
    return `The admin password is too short. It needs at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if ((env.ADMIN_SESSION_SECRET ?? "").length < 32) return "The admin sign-in is not finished setting up.";
  return null;
}

function secretKey(env: AdminSessionEnv): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(env.ADMIN_SESSION_SECRET), HMAC, false, ["sign"]);
}

/** The key sessions are signed with: changes whenever the password does. */
async function sessionKey(env: AdminSessionEnv): Promise<CryptoKey> {
  const derived = await crypto.subtle.sign("HMAC", await secretKey(env), encoder.encode(`session-key:${password(env)}`));
  return crypto.subtle.importKey("raw", derived, HMAC, false, ["sign", "verify"]);
}

/**
 * Compares by HMAC digest, so the time taken says nothing about how much of
 * the guess was right, or how long the real password is.
 */
async function passwordMatches(guess: string, env: AdminSessionEnv): Promise<boolean> {
  const key = await secretKey(env);
  const [a, b] = await Promise.all(
    [guess, password(env)].map(async (text) => new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(`password:${text}`))))
  );
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}

export async function makeSessionValue(env: AdminSessionEnv, remember: boolean, now = Date.now()): Promise<string> {
  const payload = `v1.${now + (remember ? LONG_SESSION_MS : SHORT_SESSION_MS)}`;
  const signature = await crypto.subtle.sign("HMAC", await sessionKey(env), encoder.encode(payload));
  return `${payload}.${base64Url(signature)}`;
}

function readCookie(request: Request, name: string): string | null {
  for (const part of (request.headers.get("Cookie") ?? "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

/** True only for a current session this Worker signed with today's password. */
export async function hasValidSession(request: Request, env: AdminSessionEnv, now = Date.now()): Promise<boolean> {
  if (sessionSetupProblem(env)) return false;
  const match = /^v1\.(\d{13})\.([A-Za-z0-9_-]{43})$/.exec(readCookie(request, COOKIE_NAME) ?? "");
  if (!match) return false;
  const expires = Number(match[1]);
  if (expires <= now || expires > now + LONG_SESSION_MS) return false;
  return crypto.subtle.verify("HMAC", await sessionKey(env), fromBase64Url(match[2]), encoder.encode(`v1.${match[1]}`));
}

/** www.pureihram.com serves the admin API under /api/admin, workers.dev under /admin. */
function cookiePath(request: Request): string {
  return new URL(request.url).pathname.startsWith("/api/") ? "/api/admin" : "/admin";
}

function cookie(request: Request, value: string, maxAgeSeconds?: number): string {
  const parts = [`${COOKIE_NAME}=${value}`, `Path=${cookiePath(request)}`, "HttpOnly", "Secure", "SameSite=Strict"];
  if (maxAgeSeconds !== undefined) parts.push(`Max-Age=${maxAgeSeconds}`);
  return parts.join("; ");
}

function reply(body: unknown, status: number, setCookie?: string): Response {
  const headers: Record<string, string> = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  if (setCookie) headers["Set-Cookie"] = setCookie;
  return new Response(JSON.stringify(body), { status, headers });
}

/** POST /admin/login with { password, remember }. */
export async function handleLogin(request: Request, env: AdminSessionEnv, now = Date.now()): Promise<Response> {
  const problem = sessionSetupProblem(env);
  if (problem) return reply({ error: problem }, 503);

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  await env.DB.prepare("DELETE FROM admin_login_failures WHERE failed_at < ?").bind(now - FAILURE_KEEP_MS).run();
  const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM admin_login_failures WHERE ip = ? AND failed_at > ?")
    .bind(ip, now - LOCKOUT_MS)
    .first<{ n: number }>();
  const failures = Number(recent?.n ?? 0);
  // Checked before the password, so a locked-out guesser learns nothing more.
  if (failures >= MAX_FAILURES) {
    return reply({ error: "Too many wrong passwords. Wait 15 minutes, then try again." }, 429);
  }

  const body = ((await request.json().catch(() => null)) ?? {}) as { password?: unknown; remember?: unknown };
  const guess = typeof body.password === "string" ? body.password.trim() : "";
  const remember = body.remember !== false;

  if (!guess || guess.length > MAX_PASSWORD_INPUT || !(await passwordMatches(guess, env))) {
    await env.DB.prepare("INSERT INTO admin_login_failures (ip, failed_at) VALUES (?, ?)").bind(ip, now).run();
    const left = MAX_FAILURES - failures - 1;
    console.warn("admin: wrong password", { left });
    return reply(
      {
        error:
          left > 0
            ? `Wrong password. ${left} ${left === 1 ? "try" : "tries"} left before a 15-minute wait.`
            : "Too many wrong passwords. Wait 15 minutes, then try again.",
      },
      left > 0 ? 401 : 429
    );
  }

  await env.DB.prepare("DELETE FROM admin_login_failures WHERE ip = ?").bind(ip).run();
  const value = await makeSessionValue(env, remember, now);
  return reply({ ok: true }, 200, cookie(request, value, remember ? LONG_SESSION_MS / 1000 : undefined));
}

/** POST /admin/logout: ends the session on this device. */
export function handleLogout(request: Request): Response {
  return reply({ ok: true }, 200, cookie(request, "", 0));
}
