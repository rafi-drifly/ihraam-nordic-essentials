/**
 * Web Push for owner order alerts.
 *
 * Only the admin ever subscribes: this exists so a new order reaches Rafi's
 * phone, not so customers get marketing. The subscription is stored per device,
 * because a browser mints one endpoint per installation — the phone and the
 * laptop are two separate rows, and both should ring.
 *
 * iOS is the awkward one. Safari refuses `Notification.requestPermission()`
 * entirely unless the site has been added to the Home Screen first, and it
 * throws rather than returning "denied", so the UI has to detect that case up
 * front and explain it instead of showing a dead button.
 */

/**
 * VAPID public key. Public by design — it is shipped to every browser that
 * subscribes and identifies the sender. The matching private key lives only in
 * the Supabase function secret `VAPID_PRIVATE_KEY`.
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
    // Safari's own non-standard flag, which is the only signal on iOS.
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

export type PushBlocker =
  | "unsupported"
  | "ios-needs-install"
  | "permission-denied"
  | null;

/**
 * Why push cannot be turned on right now, or null when it can. Kept separate
 * from enabling so the UI can explain the situation before the user taps.
 */
export function describePushBlocker(): PushBlocker {
  if (!isPushSupported()) {
    return isIos() && !isStandalone() ? "ios-needs-install" : "unsupported";
  }
  if (isIos() && !isStandalone()) return "ios-needs-install";
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

/**
 * Ask for permission, subscribe, and record the endpoint against the signed-in
 * user. Safe to call when already subscribed — the row is upserted on endpoint.
 */
export async function enablePush(
  supabase: {
    auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> };
    from: (table: "push_subscriptions") => {
      upsert: (
        values: Record<string, unknown>,
        options: { onConflict: string }
      ) => Promise<{ error: { message: string } | null }>;
    };
  }
): Promise<EnableResult> {
  const blocker = describePushBlocker();
  if (blocker) return { ok: false, blocker };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, blocker: "permission-denied" };

  const registration = (await navigator.serviceWorker.getRegistration()) ?? (await registerServiceWorker());
  if (!registration) return { ok: false, error: "Service worker unavailable" };
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      // Required by every current browser; a non-userVisible subscription is
      // rejected outright.
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, error: "Not signed in" };

  const json = subscription.toJSON();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: data.user.id,
      endpoint: subscription.endpoint,
      p256dh: json.keys?.p256dh ?? "",
      auth: json.keys?.auth ?? "",
      user_agent: navigator.userAgent.slice(0, 300),
      failure_count: 0,
    },
    { onConflict: "endpoint" }
  );
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

export async function disablePush(supabase: {
  from: (table: "push_subscriptions") => {
    delete: () => { eq: (column: string, value: string) => Promise<unknown> };
  };
}): Promise<void> {
  const subscription = await currentSubscription();
  if (!subscription) return;
  const { endpoint } = subscription;
  await subscription.unsubscribe();
  // Best effort: an orphaned row only costs one rejected send, which the
  // sender prunes on the 410 the push service returns.
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
}
