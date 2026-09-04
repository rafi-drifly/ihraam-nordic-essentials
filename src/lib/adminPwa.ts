/**
 * Lets the admin install as its own app, separate from the shop.
 *
 * "Add to Home Screen" does not bookmark the page you are looking at — the
 * browser reads the linked manifest and launches whatever `start_url` says.
 * With a single site manifest pointing at "/", adding the admin produced a
 * second icon that opened the shop homepage, which is exactly what it was
 * asked to do and never what anyone wanted.
 *
 * So the admin routes advertise a different manifest, with its own id,
 * start_url, name and icon. Two installable apps, one codebase.
 */

const SITE_MANIFEST = "/site.webmanifest?v=3";
const ADMIN_MANIFEST = "/admin.webmanifest";

const SITE_TITLE = "Pure Ihram";
const ADMIN_TITLE = "Ihram Admin";

const SITE_TOUCH_ICON = "/apple-touch-icon.png?v=3";
const ADMIN_TOUCH_ICON = "/admin-apple-touch-icon.png";

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function setAttr(selector: string, attribute: string, value: string): void {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attribute, value);
}

/**
 * Point the document at the right manifest for the current route. Safari reads
 * these from the live DOM at the moment the user taps Add to Home Screen, so
 * swapping them at runtime is enough — no separate HTML entry point needed.
 */
export function applyPwaIdentity(pathname: string): void {
  if (typeof document === "undefined") return;
  const admin = isAdminPath(pathname);

  setAttr('link[rel="manifest"]', "href", admin ? ADMIN_MANIFEST : SITE_MANIFEST);
  setAttr('meta[name="apple-mobile-web-app-title"]', "content", admin ? ADMIN_TITLE : SITE_TITLE);
  // iOS takes the home-screen image from apple-touch-icon, not the manifest,
  // so the two apps would otherwise be identical on the Home Screen.
  setAttr('link[rel="apple-touch-icon"]', "href", admin ? ADMIN_TOUCH_ICON : SITE_TOUCH_ICON);
}
