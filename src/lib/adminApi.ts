/**
 * The admin's backend: /api/admin on this same origin, behind the admin password.
 *
 * Since 16 Nov 2026 the admin signs in with a password, like the Yalla Jerky
 * admin (before that, Cloudflare Access with an emailed code). The Worker
 * checks the password and answers with a session cookie that the browser
 * sends back with every request. This page never stores the password, and
 * cannot read the cookie: the Worker checks the session on every call.
 */

const LOGIN_PAGE = "/admin";

export class AdminSignInRequired extends Error {
  constructor() {
    super("Your admin session has ended. Please sign in again.");
  }
}

/** Back to the password page, then on to where the admin was. */
function goToLogin(): void {
  const here = window.location.pathname;
  window.location.assign(here.startsWith("/admin/") ? `${LOGIN_PAGE}?next=${encodeURIComponent(here)}` : LOGIN_PAGE);
}

async function readError(response: Response): Promise<string> {
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  return data.error || `Request failed (${response.status})`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, { credentials: "same-origin", ...init });
  if (response.status === 401) {
    goToLogin();
    throw new AdminSignInRequired();
  }
  const isJson = (response.headers.get("Content-Type") ?? "").includes("application/json");
  if (!isJson) throw new Error(`Unexpected answer from the server (${response.status}).`);
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as T;
}

/** Whether this browser has a current admin session. Never redirects. */
export async function adminHasSession(): Promise<boolean> {
  const response = await fetch("/api/admin/me", { credentials: "same-origin" });
  if (response.status === 401) return false;
  if (!response.ok) throw new Error(await readError(response));
  // Only the Worker's own answer counts, not a page some other server returned.
  const data = (await response.json().catch(() => null)) as { signedIn?: boolean } | null;
  return data?.signedIn === true;
}

/** Checks the password; on success the browser now holds the session cookie. */
export async function adminSignIn(password: string, remember: boolean): Promise<void> {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, remember }),
  });
  if (!response.ok) throw new Error(await readError(response));
}

export async function adminSignOut(): Promise<void> {
  await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" }).catch(() => undefined);
  window.location.assign(LOGIN_PAGE);
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
