/**
 * Direct, idempotent <head> management.
 *
 * react-helmet-async was mounted correctly but rendered nothing: on the live
 * site `document.head` carried no helmet-managed tags and no JSON-LD at all, so
 * every per-route title, canonical and schema came only from the prerendered
 * HTML. Anything the prerender did not write simply did not exist, which is why
 * the Product and Organization schema never reached a crawler.
 *
 * These helpers write the same tags straight to the DOM. They upsert rather
 * than append, so they replace what the prerender already put there instead of
 * duplicating it, and they are safe to run on every route change.
 */

/** Marks tags this module owns, so a route change can clear its own leftovers. */
const OWNED = "data-seo-head";

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(OWNED, "");
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

export function setTitle(title: string) {
  if (document.title !== title) document.title = title;
}

export function setHtmlLang(lang: string) {
  document.documentElement.setAttribute("lang", lang);
}

export function setDescription(description: string) {
  upsertMeta('meta[name="description"]', { name: "description", content: description });
}

export function setRobots(noindex: boolean) {
  const existing = document.head.querySelector('meta[name="robots"]');
  if (noindex) {
    upsertMeta('meta[name="robots"]', { name: "robots", content: "noindex, follow" });
  } else if (existing) {
    existing.remove();
  }
}

/**
 * Set the canonical URL, or pass null to remove it entirely. Pages that should
 * never be indexed - the admin - must not advertise a canonical, because that
 * is an invitation to index precisely the URL you are trying to keep out.
 */
export function setCanonical(href: string | null) {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (href === null) {
    existing?.remove();
    return;
  }
  let el = existing;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    el.setAttribute(OWNED, "");
    document.head.appendChild(el);
  }
  el.href = href;
}

export function setAlternates(alternates: Array<{ hreflang: string; href: string }>) {
  document.head
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((el) => el.remove());
  for (const alt of alternates) {
    const el = document.createElement("link");
    el.rel = "alternate";
    el.setAttribute("hreflang", alt.hreflang);
    el.href = alt.href;
    el.setAttribute(OWNED, "");
    document.head.appendChild(el);
  }
}

export function setProperty(property: string, content: string) {
  upsertMeta(`meta[property="${property}"]`, { property, content });
}

export function setNamed(name: string, content: string) {
  upsertMeta(`meta[name="${name}"]`, { name, content });
}

export function setOgLocaleAlternates(locales: string[]) {
  document.head
    .querySelectorAll('meta[property="og:locale:alternate"]')
    .forEach((el) => el.remove());
  for (const locale of locales) {
    const el = document.createElement("meta");
    el.setAttribute("property", "og:locale:alternate");
    el.setAttribute("content", locale);
    el.setAttribute(OWNED, "");
    document.head.appendChild(el);
  }
}

/**
 * Replaces this route's structured data. Blocks written by the prerender carry
 * no marker, so they are left alone on first paint and only superseded once the
 * page supplies its own - which is what makes Product schema appear at all.
 */
export function setJsonLd(blocks: Array<Record<string, unknown>>) {
  // When the page supplies its own schema it supersedes the prerendered blocks
  // entirely, otherwise both survive and the page ships duplicate FAQPage /
  // Product entries. A page that supplies none leaves the prerendered ones be,
  // which is what keeps Article schema on the blog routes.
  const selector = blocks.length
    ? 'script[type="application/ld+json"]'
    : `script[type="application/ld+json"][${OWNED}]`;
  document.head.querySelectorAll(selector).forEach((el) => el.remove());
  for (const block of blocks) {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute(OWNED, "");
    // Escaping "<" keeps a stray "</script>" inside a value from ending the tag.
    el.textContent = JSON.stringify(block).replace(/</g, "\\u003c");
    document.head.appendChild(el);
  }
}
