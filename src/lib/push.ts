/**
 * Web Push for owner order alerts, served by a Cloudflare Worker.
 *
 * Only the owner ever subscribes: this exists so a new order reaches Rafi's
 * phone, not so customers get marketing. Each device subscribes separately —
 * a browser mints one endpoint per installation, so the phone and the laptop
 * are two enrolments and both should ring.
 *
 * Enrolment goes through the admin backend (/api/admin/push/*), so the
 * Cloudflare Access login is what allows a device in. The notifications
 * themselves are still sent by the pureihram-push Worker, which the admin
 * backend reaches over a service binding.
 *
 * iOS is the awkward one. Safari refuses `Notification.requestPermission()`
 * unless the site has been added to the Home Screen, and it throws rather than
 * returning "denied" — so the UI detects that case up front and explains it
 * instead of showing a button that cannot work.
 */

import { adminPost } from "@/lib/adminApi";

/**
 * VAPID public key. Public by design — it ships to every browser that
 * subscribes and identifies the sender. The private half lives only in the
 * Worker's secret store.
 */
export const VAPID_PUBLIC_KEY =
  "BBnC7Lg1mHfA8m7ClKO2Hbal6y1bNt0fcp1q7zb9z9NwvCoKg_wlsryWTaODU4PtxeGmrVBgsUS3lJ1dlnliizE";

/**
 * Decode a base64url VAPID key into the raw bytes `pushManager.subscribe`
 * wants. Exported for tests: a silently wrong key produces a subscription the
 * push service rejects much later, which is painful to debug from the symptom.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** True when running as an installed app rather than a browser tab. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    // Safari's own non-standard flag, the only signal available on iOS.
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS reports as a Mac; the touch points give it away.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export type PushBlocker = "unsupported" | "ios-needs-install" | "permission-denied" | null;

/**
 * Why push cannot be turned on right now, or null when it can. Kept separate
 * from enabling so the UI can explain the situation before the user taps.
 */
export function describePushBlocker(): PushBlocker {
  // Trust the capability check first and use the iOS heuristic only to explain
  // *why* support is missing. Doing it the other way round means a device that
  // is genuinely installed, but whose standalone signal we misread, gets locked
  // out of notifications with no way back.
  if (!isPushSupported()) {
    return isIos() && !isStandalone() ? "ios-needs-install" : "unsupported";
  }
  if (typeof Notification !== "undefined" && Notification.permission === "denied") {
    return "permission-denied";
  }
  return null;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch (error) {
    console.error("Service worker registration failed:", error);
    return null;
  }
}

async function currentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

/** Whether this device already has a live push subscription. */
export async function isPushEnabled(): Promise<boolean> {
  return (await currentSubscription()) !== null;
}

export interface EnableResult {
  ok: boolean;
  blocker?: PushBlocker;
  error?: string;
}

async function postToAdmin(path: string, body?: unknown): Promise<{ ok: boolean; error?: string }> {
  try {
    await adminPost(path, body);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not reach the admin backend." };
  }
}

/**
 * Ask for permission, subscribe, and enrol the device with the Worker.
 * Safe to call when already subscribed — enrolment is keyed on the endpoint.
 */
export async function enablePush(): Promise<EnableResult> {
  const blocker = describePushBlocker();
  if (blocker) return { ok: false, blocker };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, blocker: "permission-denied" };

  const registration =
    (await navigator.serviceWorker.getRegistration()) ?? (await registerServiceWorker());
  if (!registration) return { ok: false, error: "Service worker unavailable." };
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      // Required by every current browser; a silent subscription is rejected.
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const json = subscription.toJSON();
  const result = await postToAdmin("push/subscribe", {
    subscription: {
      endpoint: subscription.endpoint,
      keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
    },
    userAgent: navigator.userAgent,
  });

  if (!result.ok) {
    // Do not leave a browser subscription pointing at a Worker that has not
    // enrolled it; that would look enabled while silently never firing.
    await subscription.unsubscribe().catch(() => undefined);
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

export async function disablePush(): Promise<void> {
  const subscription = await currentSubscription();
  if (!subscription) return;
  const { endpoint } = subscription;
  await subscription.unsubscribe();
  // Best effort: a stale entry only costs one rejected send, which the Worker
  // prunes on the 410 the push service returns.
  await postToAdmin("push/unsubscribe", { endpoint });
}

/** Fire a notification immediately so enabling can be confirmed, not assumed. */
export async function sendTestPush(): Promise<{ ok: boolean; error?: string }> {
  return postToAdmin("push/test");
}
