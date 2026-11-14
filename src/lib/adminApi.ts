/**
 * The admin's backend: /api/admin on this same origin, behind Cloudflare Access.
 *
 * Access does the login: a full page load of /admin while signed out goes to
 * Cloudflare's sign-in page (a one-time code by email) and comes back with a
 * session cookie that these requests then carry. The Worker behind /api/admin
 * checks that session again on every call.
 */

/** Where a full page load sends the browser through the Access login. */
const LOGIN_URL = "/admin/orders";
const LOGOUT_URL = "/cdn-cgi/access/logout";
/** Stops a redirect loop if a login succeeds but the Worker still refuses it. */
const LOGIN_REDIRECT_KEY = "pureihram_admin_login_redirect_at";
const LOGIN_REDIRECT_COOLDOWN_MS = 30_000;

export class AdminSignInRequired extends Error {
  constructor() {
    super("Your admin session has ended. Signing you in again...");
  }
}

/**
 * Send the browser through the Access login, unless that was just tried, in
 * which case the session is fine and the account is simply not allowed in.
 * Returns whether it redirected.
 */
export function startAdminLogin(): boolean {
  try {
    const last = Number(sessionStorage.getItem(LOGIN_REDIRECT_KEY) ?? 0);
    if (Date.now() - last < LOGIN_REDIRECT_COOLDOWN_MS) return false;
    sessionStorage.setItem(LOGIN_REDIRECT_KEY, String(Date.now()));
  } catch {
    /* no sessionStorage: redirect anyway */
  }
  window.location.assign(LOGIN_URL);
  return true;
}

export function adminSignOut(): void {
  window.location.assign(LOGOUT_URL);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/admin/${path}`, { credentials: "same-origin", ...init });
  } catch (error) {
    // An expired Access session answers with a redirect to Cloudflare's own
    // sign-in page, which fetch cannot follow across origins and reports as a
    // network error. Online, that almost always means "sign in again".
    if (navigator.onLine && startAdminLogin()) throw new AdminSignInRequired();
    throw error;
  }

  const isJson = (response.headers.get("Content-Type") ?? "").includes("application/json");
  if (response.status === 401 || response.redirected || !isJson) {
    if (startAdminLogin()) throw new AdminSignInRequired();
    throw new Error("This account is not allowed into the admin.");
  }

  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

export function adminGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function adminPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** Upload one image file; returns its public URL. */
export function adminUploadImage(objectPath: string, blob: Blob): Promise<{ url: string }> {
  return request<{ url: string }>(`images/${objectPath}`, {
    method: "PUT",
    headers: { "Content-Type": "image/webp" },
    body: blob,
  });
}
