import { describe, expect, it } from "vitest";
import {
  b64urlToBytes,
  bytesToB64url,
  buildVapidAuthHeader,
  concat,
  encryptPayload,
  hkdf,
} from "../../../workers/push/src/webpush";
import { buildMessage } from "../../../workers/push/src/index";
import { urlBase64ToUint8Array, VAPID_PUBLIC_KEY } from "../push";

/**
 * The push payload is encrypted by hand against RFC 8291. A mistake there does
 * not throw — it produces a body the phone silently fails to decrypt, so the
 * only way to know it is right is to decrypt it back with an independent
 * implementation of the reverse steps.
 */
async function decryptAsBrowserWould(
  body: Uint8Array,
  uaPrivateKey: CryptoKey,
  uaPublicRaw: Uint8Array,
  authSecret: Uint8Array
): Promise<string> {
  const salt = body.slice(0, 16);
  const idLength = body[20];
  const asPublic = body.slice(21, 21 + idLength);
  const ciphertext = body.slice(21 + idLength);

  const asKey = await crypto.subtle.importKey(
    "raw",
    asPublic,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
  const shared = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: asKey }, uaPrivateKey, 256)
  );

  const encoder = new TextEncoder();
  const prk = await hkdf(
    authSecret,
    shared,
    concat(encoder.encode("WebPush: info\0"), uaPublicRaw, asPublic),
    32
  );
  const cek = await hkdf(salt, prk, encoder.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, prk, encoder.encode("Content-Encoding: nonce\0"), 12);

  const key = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["decrypt"]);
  const plain = new Uint8Array(
    await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, key, ciphertext)
  );

  // Strip the 0x02 final-record delimiter the sender appends.
  expect(plain[plain.length - 1]).toBe(0x02);
  return new TextDecoder().decode(plain.slice(0, -1));
}

describe("web push encryption", () => {
  it("produces a body a subscriber can decrypt back to the exact payload", async () => {
    const ua = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
      "deriveBits",
    ]);
    const uaPublicRaw = new Uint8Array(await crypto.subtle.exportKey("raw", ua.publicKey));
    const authSecret = crypto.getRandomValues(new Uint8Array(16));

    const payload = JSON.stringify({
      title: "New order · €199.00",
      body: "10 sets · Lavdim Dibrani · ship to SE",
      url: "/admin/orders",
    });

    const body = await encryptPayload(
      payload,
      bytesToB64url(uaPublicRaw),
      bytesToB64url(authSecret)
    );

    const decrypted = await decryptAsBrowserWould(body, ua.privateKey, uaPublicRaw, authSecret);
    expect(decrypted).toBe(payload);
  });

  it("frames the record header the way RFC 8188 specifies", async () => {
    const ua = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
      "deriveBits",
    ]);
    const uaPublicRaw = new Uint8Array(await crypto.subtle.exportKey("raw", ua.publicKey));
    const body = await encryptPayload(
      "hi",
      bytesToB64url(uaPublicRaw),
      bytesToB64url(crypto.getRandomValues(new Uint8Array(16)))
    );

    // salt(16) || record size(4, big-endian) || key id length(1) || key id
    expect(new DataView(body.buffer, body.byteOffset + 16, 4).getUint32(0, false)).toBe(4096);
    expect(body[20]).toBe(65);
    // Uncompressed point marker on the ephemeral public key.
    expect(body[21]).toBe(0x04);
  });

  it("gives a different salt and ephemeral key every send", async () => {
    const ua = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
      "deriveBits",
    ]);
    const p256dh = bytesToB64url(new Uint8Array(await crypto.subtle.exportKey("raw", ua.publicKey)));
    const auth = bytesToB64url(crypto.getRandomValues(new Uint8Array(16)));

    const a = await encryptPayload("same", p256dh, auth);
    const b = await encryptPayload("same", p256dh, auth);
    expect(bytesToB64url(a)).not.toBe(bytesToB64url(b));
  });
});

describe("VAPID authorization header", () => {
  // A throwaway keypair: the private half of the real one never belongs in the repo.
  async function testKeys() {
    const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
      "sign",
      "verify",
    ]);
    const jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
    const raw = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
    return { publicKey: bytesToB64url(raw), privateKey: jwk.d as string, verifyKey: pair.publicKey };
  }

  it("signs a JWT that verifies against the advertised public key", async () => {
    const { publicKey, privateKey, verifyKey } = await testKeys();
    const header = await buildVapidAuthHeader(
      "https://fcm.googleapis.com/fcm/send/abc123",
      publicKey,
      privateKey,
      "mailto:pureihraam@gmail.com"
    );

    const match = header.match(/^vapid t=([^,]+), k=(.+)$/);
    expect(match).not.toBeNull();
    const [, token, advertisedKey] = match!;
    expect(advertisedKey).toBe(publicKey);

    const [h, p, s] = token.split(".");
    const valid = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      verifyKey,
      b64urlToBytes(s),
      new TextEncoder().encode(`${h}.${p}`)
    );
    expect(valid).toBe(true);
  });

  it("addresses the endpoint's origin, not its full URL", async () => {
    const { publicKey, privateKey } = await testKeys();
    const header = await buildVapidAuthHeader(
      "https://updates.push.services.mozilla.com/wpush/v2/long-token-here",
      publicKey,
      privateKey,
      "mailto:pureihraam@gmail.com"
    );
    const claims = JSON.parse(
      new TextDecoder().decode(b64urlToBytes(header.split(".")[1]))
    );
    expect(claims.aud).toBe("https://updates.push.services.mozilla.com");
    expect(claims.sub).toBe("mailto:pureihraam@gmail.com");
    expect(claims.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    // Push services reject anything more than 24h out.
    expect(claims.exp).toBeLessThanOrEqual(Math.floor(Date.now() / 1000) + 24 * 60 * 60);
  });
});

describe("the shipped VAPID public key", () => {
  it("decodes to a valid uncompressed P-256 point the browser will accept", async () => {
    const bytes = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    expect(bytes.length).toBe(65);
    expect(bytes[0]).toBe(0x04);
    // Importable as a real key, so a typo cannot reach production unnoticed.
    await expect(
      crypto.subtle.importKey("raw", bytes, { name: "ECDH", namedCurve: "P-256" }, false, [])
    ).resolves.toBeDefined();
  });

  it("round-trips through the browser and server decoders identically", () => {
    expect(bytesToB64url(urlBase64ToUint8Array(VAPID_PUBLIC_KEY))).toBe(VAPID_PUBLIC_KEY);
    expect(bytesToB64url(b64urlToBytes(VAPID_PUBLIC_KEY))).toBe(VAPID_PUBLIC_KEY);
  });
});

describe("notification wording", () => {
  it("leads with the amount and says where it is going", () => {
    expect(
      buildMessage({
        amount_total: 19900,
        currency: "eur",
        shipping_details: { name: "Lavdim Dibrani", address: { country: "SE" } },
        metadata: { total_quantity: "10", delivery_method: "shipping" },
      })
    ).toEqual({
      title: "New order · €199.00",
      body: "10 sets · Lavdim Dibrani · ship to SE",
    });
  });

  it("singularises one set and names the collection point", () => {
    expect(
      buildMessage({
        amount_total: 1900,
        currency: "eur",
        customer_details: { name: "Ayu" },
        metadata: {
          total_quantity: "1",
          delivery_method: "pickup",
          pickup_location: "Uppsala Mosque",
        },
      }).body
    ).toBe("1 set · Ayu · collect · Uppsala Mosque");
  });

  it("stays readable when Stripe gave us no name, country or quantity", () => {
    expect(buildMessage({ amount_total: 4100, currency: "eur" })).toEqual({
      title: "New order · €41.00",
      body: "A customer · delivery",
    });
  });

  it("converts from Stripe's minor units rather than trusting a major-unit total", () => {
    expect(buildMessage({ amount_total: 6600, currency: "eur" }).title).toBe("New order · €66.00");
    expect(buildMessage({ amount_total: 5, currency: "eur" }).title).toBe("New order · €0.05");
  });
});
