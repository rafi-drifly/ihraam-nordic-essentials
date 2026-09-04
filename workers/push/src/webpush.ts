/**
 * The Web Push wire protocol, with no runtime-specific dependencies.
 *
 * Split out from push.ts deliberately: this is hand-written cryptography, and
 * keeping it free of Deno globals is what lets it be round-trip tested in the
 * normal vitest suite. A silent mistake in here does not throw — it produces
 * ciphertext the phone quietly fails to decrypt, so it must be tested rather
 * than eyeballed.
 *
 *   - VAPID signing: RFC 8292
 *   - Payload encryption: RFC 8188 (aes128gcm) keyed per RFC 8291
 */

export const RECORD_SIZE = 4096;

export function b64urlToBytes(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

export function bytesToB64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function concat(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info },
    key,
    length * 8
  );
  return new Uint8Array(bits);
}

/**
 * The ES256 JWT identifying this sender, formatted as an Authorization header.
 * The audience is the endpoint's *origin*; push services reject the full URL.
 */
export async function buildVapidAuthHeader(
  endpoint: string,
  publicKey: string,
  privateKey: string,
  subject: string
): Promise<string> {
  const encoder = new TextEncoder();
  const header = bytesToB64url(encoder.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = bytesToB64url(
    encoder.encode(
      JSON.stringify({
        aud: new URL(endpoint).origin,
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
        sub: subject,
      })
    )
  );

  // Uncompressed P-256 point: 0x04 || X(32) || Y(32).
  const publicBytes = b64urlToBytes(publicKey);
  const signingKey = await crypto.subtle.importKey(
    "jwk",
    {
      kty: "EC",
      crv: "P-256",
      x: bytesToB64url(publicBytes.slice(1, 33)),
      y: bytesToB64url(publicBytes.slice(33, 65)),
      d: privateKey,
      ext: true,
    },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const unsigned = `${header}.${payload}`;
  // Web Crypto emits raw r||s, which is exactly what JWS wants (not DER).
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    signingKey,
    encoder.encode(unsigned)
  );

  return `vapid t=${unsigned}.${bytesToB64url(new Uint8Array(signature))}, k=${publicKey}`;
}

/** Encrypt a payload for one subscription. Output is a complete aes128gcm body. */
export async function encryptPayload(
  plaintext: string,
  uaPublicKeyB64: string,
  authSecretB64: string
): Promise<Uint8Array> {
  const uaPublic = b64urlToBytes(uaPublicKeyB64);
  const authSecret = b64urlToBytes(authSecretB64);

  const ephemeral = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
    "deriveBits",
  ]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", ephemeral.publicKey));

  const uaKey = await crypto.subtle.importKey(
    "raw",
    uaPublic,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, ephemeral.privateKey, 256)
  );

  const encoder = new TextEncoder();
  // Binding the key material to both public keys is what stops a captured
  // ciphertext being replayed against a different subscription.
  const prk = await hkdf(
    authSecret,
    sharedSecret,
    concat(encoder.encode("WebPush: info\0"), uaPublic, asPublic),
    32
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, prk, encoder.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, prk, encoder.encode("Content-Encoding: nonce\0"), 12);

  const contentKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, [
    "encrypt",
  ]);
  // 0x02 marks this as the final record.
  const padded = concat(encoder.encode(plaintext), new Uint8Array([0x02]));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, contentKey, padded)
  );

  const recordSize = new Uint8Array(4);
  new DataView(recordSize.buffer).setUint32(0, RECORD_SIZE, false);

  // salt(16) || record size(4) || key id length(1) || key id(65) || ciphertext
  return concat(salt, recordSize, new Uint8Array([asPublic.length]), asPublic, ciphertext);
}
