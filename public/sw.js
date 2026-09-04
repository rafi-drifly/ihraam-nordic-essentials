/**
 * Pure Ihram service worker.
 *
 * Two jobs, and deliberately nothing more:
 *   1. Receive Web Push so a new order reaches the owner's phone.
 *   2. Provide an offline fallback page, which is what makes the site
 *      installable to the iPhone Home Screen — and on iOS, being installed is
 *      a hard prerequisite for push to work at all.
 *
 * What it deliberately does NOT do is cache HTML, JS or CSS. A shop that
 * serves a stale bundle shows stale prices, and a customer who is quoted one
 * price and charged another is a far worse outcome than a page that needs the
 * network. Only navigations are intercepted, only when the network has already
 * failed; every other request is left entirely alone.
 */

const VERSION = "v2";
const OFFLINE_CACHE = `pureihram-offline-${VERSION}`;
// Cloudflare Pages serves offline.html at the extensionless path and
// 308-redirects the .html form. Requesting the redirecting URL matters:
// cache.add() rejects outright on a redirect.
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(OFFLINE_CACHE);
        const response = await fetch(OFFLINE_URL, { cache: "reload" });
        if (response.ok) await cache.put(OFFLINE_URL, response);
      } catch (error) {
        // An offline page is a nicety; order notifications are not. This must
        // never reject and take the whole worker registration down with it.
        console.warn("sw: offline page unavailable, continuing", error);
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== OFFLINE_CACHE).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Navigations only, and only as a fallback once the network has actually
// failed. Not calling respondWith for anything else leaves asset and API
// requests on the browser's own default path.
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(OFFLINE_URL, { cacheName: OFFLINE_CACHE })
    )
  );
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "New order";
  const options = {
    body: payload.body || "A new order has arrived.",
    icon: "/android-chrome-192x192.png",
    badge: "/favicon-32x32.png",
    // Tagging by order number means a re-delivered push replaces the existing
    // notification instead of stacking a duplicate on the lock screen.
    tag: payload.tag || "pureihram-order",
    renotify: true,
    requireInteraction: false,
    data: { url: payload.url || "/admin/orders" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/admin/orders";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Prefer surfacing a tab that is already open over opening another one.
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
