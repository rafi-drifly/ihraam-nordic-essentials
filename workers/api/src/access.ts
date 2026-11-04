/**
 * Cloudflare Access, checked inside the Worker.
 *
 * Access sits in front of www.pureihram.com/admin and /api/admin and does the
 * login. That alone is not enough: this Worker is also reachable on its
 * workers.dev address, where Access does not run. So every admin request is
 * let through only with a valid Access token for the admin application,
 * signed by the team's own keys and issued to an allowed email.
 */

export interface AccessConfig {
  /** e.g. "pureihram.cloudflareaccess.com" */
  teamDomain: string;
  /** The Access application's Audience (AUD) tag. */
  aud: string;
  /** Lower-case emails allowed into the admin. */
  adminEmails: string[];
}

interface AccessClaims {
  aud?: string | string[];
  iss?: string;
  exp?: number;
  nbf?: number;
  email?: string;
}

const CERTS_TTL_MS = 60 * 60 * 1000;
let certsCache: { url: string; keys: JsonWebKey[]; fetchedAt: number } | null = null;

/** Tests reset this between cases. */
export function clearAccessCertsCache(): void {
  certsCache = null;
}

function base64UrlDecode(input: string): Uint8Array {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodeJson<T>(segment: string): T | null {
  try {
    return JSON.parse(new TextDecoder().decode(base64UrlDecode(segment))) as T;
  } catch {
    return null;
  }
}

async function loadCerts(teamDomain: string, forceRefresh: boolean): Promise<JsonWebKey[]> {
  const url = `https://${teamDomain}/cdn-cgi/access/certs`;
  const fresh = certsCache && certsCache.url === url && Date.now() - certsCache.fetchedAt < CERTS_TTL_MS;
  if (fresh && !forceRefresh) return certsCache!.keys;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Access certs returned ${response.status}`);
  const body = (await response.json()) as { keys?: JsonWebKey[] };
  certsCache = { url, keys: body.keys ?? [], fetchedAt: Date.now() };
  return certsCache.keys;
}

/** The token Access attaches to requests it let through, from header or cookie. */
export function accessTokenFrom(request: Request): string | null {
  const header = request.headers.get("Cf-Access-Jwt-Assertion");
  if (header) return header;
  const cookie = request.headers.get("Cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)CF_Authorization=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Returns the admin's email when the token is genuine and current, otherwise
 * null. Never throws on a bad token; a malformed one is just not an admin.
 */
export async function verifyAccessToken(
  token: string,
  config: AccessConfig,
  now: number = Date.now()
): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerSegment, payloadSegment, signatureSegment] = parts;

  const header = decodeJson<{ alg?: string; kid?: string }>(headerSegment);
  const claims = decodeJson<AccessClaims>(payloadSegment);
  if (!header || !claims || header.alg !== "RS256" || !header.kid) return null;

  // A key rotation shows up as an unknown kid: refetch once before giving up.
  let jwk = (await loadCerts(config.teamDomain, false)).find((key) => (key as { kid?: string }).kid === header.kid);
  if (!jwk) {
    jwk = (await loadCerts(config.teamDomain, true)).find((key) => (key as { kid?: string }).kid === header.kid);
  }
  if (!jwk) return null;

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const signed = new TextEncoder().encode(`${headerSegment}.${payloadSegment}`);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, base64UrlDecode(signatureSegment), signed);
  if (!valid) return null;

  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audiences.includes(config.aud)) return null;
  if (claims.iss !== `https://${config.teamDomain}`) return null;
  const seconds = Math.floor(now / 1000);
  if (typeof claims.exp !== "number" || claims.exp <= seconds) return null;
  if (typeof claims.nbf === "number" && claims.nbf > seconds) return null;

  const email = claims.email?.toLowerCase();
  if (!email || !config.adminEmails.includes(email)) return null;
  return email;
}
