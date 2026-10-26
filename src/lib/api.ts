/**
 * The shop's own backend on Cloudflare (workers/api), which is taking over
 * from the Supabase edge functions one form at a time.
 */
export const API_URL = "https://pureihram-api.rafi-drifly.workers.dev";

/** POST JSON to the Worker. Throws with the Worker's own error text on failure. */
export async function postToApi<T = unknown>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${response.status})`);
  }
  return data as T;
}
