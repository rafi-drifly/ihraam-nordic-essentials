// Post-build prerender: bake per-route <title>, meta, canonical, hreflang, OG
// and Article + FAQPage JSON-LD into static HTML so crawlers and social
// scrapers see the correct head without executing JS. The same bundle still
// hydrates the page for real users. Pure Node, no headless browser required.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const BASE = 'https://www.pureihram.com';
const OG_IMAGE = `${BASE}/og-image.jpg`;

const TEMPLATE_PATH = join(DIST, 'index.html');
if (!existsSync(TEMPLATE_PATH)) {
  console.error('[prerender] dist/index.html not found. Run `vite build` first.');
  process.exit(1);
}
const template = readFileSync(TEMPLATE_PATH, 'utf-8');

// Read from the same manifest the app uses, so the build and the running site
// can never disagree about which languages exist.
const LOCALES = JSON.parse(readFileSync(join(ROOT, 'src/i18n/locale-manifest.json'), 'utf-8'));

const DEFAULT_PREFIX = (Object.values(LOCALES).find((l) => l.default) ?? { prefix: '' }).prefix;

const readJSON = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf-8'));
const blogData = readJSON('src/content/blog/blog-data.json');
const loc = Object.fromEntries(
  Object.keys(LOCALES).map((code) => [code, readJSON(`src/i18n/locales/${code}.json`)])
);

const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const jsonForScript = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

// Legacy hard-coded blog posts: slug -> i18n key under blog.posts.*
const LEGACY = [
  { slug: 'how-to-wear-ihram', key: 'howToWear' },
  { slug: 'sunnah-acts-before-ihram', key: 'sunnahActs' },
  { slug: 'umrah-preparation-checklist', key: 'checklist' },
  { slug: 'common-mistakes-ihram', key: 'commonMistakes' },
  { slug: 'essential-duas-umrah', key: 'essentialDuas' },
  { slug: 'spiritual-meaning-ihram', key: 'spiritualMeaning' },
];

const HOME_TITLE = {
  en: 'Buy Ihram Online - €19 + €9 Shipping in Sweden | Pure Ihram',
  sv: 'Köp Ihram Online - €19 + €9 frakt inom Sverige | Pure Ihram',
  no: 'Kjøp Ihram Online - Premium Ihram fra Sverige | Pure Ihram',
  fr: 'Acheter un Ihram en ligne - 19 € + 9 € de livraison en Suède | Pure Ihram',
};
const HOME_DESC = {
  en: 'Premium Ihram cloth for Umrah & Hajj. €19 + €9 shipping within Sweden, 3-7 days. Free pickup in Uppsala and Stockholm.',
  sv: 'Premium Ihram-tyg för Umrah och Hajj. €19 + €9 frakt inom Sverige, 3-7 arbetsdagar. Gratis avhämtning i Uppsala och Stockholm.',
  no: 'Premium Ihram-stoff for Umrah og Hajj. Fra €19, sendes fra Sverige. Frakt til Norge bekreftes før sending, eller hent gratis i Uppsala og Stockholm.',
  fr: "Tissu Ihram de qualité pour l'Omra et le Hajj. 19 € + 9 € de livraison en Suède, 3 à 7 jours. Retrait gratuit à Uppsala et Stockholm.",
};
const BLOGLIST_TITLE = {
  en: 'Hajj & Umrah Guides - Pilgrimage Knowledge | Pure Ihram',
  sv: 'Hajj- och Umrah-guider - kunskap för pilgrimer | Pure Ihram',
  no: 'Hajj- og Umrah-guider - kunnskap for pilegrimer | Pure Ihram',
  fr: 'Guides Hajj et Omra - Tout savoir sur le pèlerinage | Pure Ihram',
};
const BLOGLIST_DESC = {
  en: 'Practical guides for Hajj and Umrah: how to wear Ihram, Sunnah acts, essential duas, packing checklists, and spiritual preparation.',
  sv: 'Praktiska guider för Hajj och Umrah: så bär du Ihram, sunnah-handlingar, viktiga duas, packlistor och andlig förberedelse.',
  no: 'Praktiske guider for Hajj og Umrah: slik bærer du Ihram, sunnah-handlinger, viktige duaer, pakkelister og åndelig forberedelse.',
  fr: "Des guides pratiques pour le Hajj et l'Omra : comment porter l'Ihram, les actes de la Sunna, les duas essentielles, les check-lists et la préparation spirituelle.",
};

// Public info/commerce pages. Titles/descriptions mirror each page's SEOHead.
// `title`/`desc` = inline per-locale strings; `titleKey`/`descKey` = i18n keys
// resolved from the locale JSON (falling back to English, then the given default).
const tri = (en, sv, no, fr) => (fr ? { en, sv, no, fr } : { en, sv, no });
const STATIC_PAGES = [
  { path: '/shop', ogType: 'product',
    // Baked into the static head so answer engines that do not run JavaScript
    // still get the "how many sets do I need" answers. Mirrors BundleAdvisor.
    faqKeys: [
      'shop.advisor.quickAnswer.umrahSolo',
      'shop.advisor.quickAnswer.hajjSolo',
      'shop.advisor.quickAnswer.group',
    ],
    title: tri('Shop Ihram Sets - Single, 2-Pack & 3-Pack | Pure Ihram', 'Köp Ihram-set - Single, 2-Pack & 3-Pack | Pure Ihram', 'Kjøp Ihram-sett - Single, 2-Pack & 3-Pack | Pure Ihram', 'Acheter un ensemble Ihram - à l\'unité, lot de 2 ou lot de 3 | Pure Ihram'),
    desc: tri('Choose your Ihram set: single (€19), 2-pack (€37), or 3-pack (€55). Lightweight microfiber, ships from Sweden. Secure EU delivery.', 'Välj ditt Ihram-set: single (€19), 2-pack (€37) eller 3-pack (€55). Lätt mikrofiber, skickas från Sverige. Säker betalning via Stripe.', 'Velg ditt Ihram-sett: single (€19), 2-pack (€37) eller 3-pack (€55). Lett mikrofiber, sendes fra Sverige. Sikker betaling med Stripe.', 'Choisissez votre ensemble Ihram : à l\'unité (19 €), lot de 2 (37 €) ou lot de 3 (55 €). Microfibre légère, expédié depuis la Suède. Livraison sécurisée dans l\'UE.') },
  { path: '/about',
    title: tri('About Pure Ihram - Mission & Values', 'Om Pure Ihram - Uppdrag & Värderingar', 'Om Pure Ihram - Oppdrag & Verdier', 'À propos de Pure Ihram - Notre mission et nos valeurs'),
    desc: tri('Pure Ihram was founded in Sweden to make quality Ihram cloth affordable for every European Muslim. €19 per set, honest pricing, fast shipping.', 'Pure Ihram grundades i Sverige för att göra kvalitativ Ihram-duk prisvärd för varje europeisk muslim. €19 per set, ärlig prissättning, snabb leverans.', 'Pure Ihram ble grunnlagt i Sverige for å gjøre kvalitets Ihram rimelig for hver europeisk muslim. €19 per sett, ærlig prising, rask levering.', 'Pure Ihram a été fondé en Suède pour rendre un tissu Ihram de qualité abordable pour chaque musulman d\'Europe. 19 € l\'ensemble, des prix honnêtes, une expédition rapide.') },
  { path: '/contact',
    title: tri('Contact Pure Ihram - Email, WhatsApp & Phone Support', 'Kontakta Pure Ihram - E-post, WhatsApp & Telefonsupport', 'Kontakt Pure Ihram - E-post, WhatsApp & Telefonstøtte', 'Contacter Pure Ihram - E-mail, WhatsApp et téléphone'),
    desc: tri('Get in touch with Pure Ihram. Email pureihraam@gmail.com, WhatsApp +46720131476, or use our contact form.', 'Kontakta Pure Ihram. E-post pureihraam@gmail.com, WhatsApp +46720131476, eller använd vårt kontaktformulär.', 'Ta kontakt med Pure Ihram. E-post pureihraam@gmail.com, WhatsApp +46720131476, eller bruk kontaktskjemaet vårt.', 'Contactez Pure Ihram. E-mail pureihraam@gmail.com, WhatsApp +46720131476, ou utilisez notre formulaire de contact.') },
  { path: '/shipping',
    title: tri('Shipping & Delivery - Fast EU Shipping from Sweden | Pure Ihram', 'Frakt & Leverans - Snabb EU-frakt från Sverige | Pure Ihram', 'Frakt & Levering - Rask EU-frakt fra Sverige | Pure Ihram', 'Expédition et livraison - Livraison rapide dans l\'UE depuis la Suède | Pure Ihram'),
    desc: tri('Fast, reliable Ihram delivery across Sweden, the Nordics, and the EU. Orders processed in 1-2 business days with full tracking.', 'Snabb, pålitlig Ihram-leverans i Sverige, Norden och hela EU. Beställningar behandlas inom 1-2 arbetsdagar med full spårning.', 'Rask, pålitelig Ihram-levering i Sverige, Norden og hele EU. Bestillinger behandles innen 1-2 virkedager med full sporing.', 'Livraison d\'Ihram rapide et fiable en Suède, dans les pays nordiques et dans l\'UE. Commandes préparées sous 1 à 2 jours ouvrés, avec suivi complet.') },
  { path: '/partners',
    title: tri('B2B Partnership - Wholesale Ihram for Mosques & Agencies | Pure Ihram', 'B2B-Partnerskap - Grossist Ihram för Moskéer & Byråer | Pure Ihram', 'B2B-Partnerskap - Engros Ihram for Moskeer & Byråer | Pure Ihram', 'Partenariat B2B - Ihram en gros pour mosquées et agences | Pure Ihram'),
    desc: tri('Partner with Pure Ihram to offer wholesale Ihram sets to your mosque, agency, or travel group. Halal income, quality product, EU-wide shipping.', 'Bli partner med Pure Ihram för att erbjuda grossist Ihram-set till er moské, byrå eller resegrupp. Halal-inkomst, kvalitetsprodukt, EU-omfattande frakt.', 'Bli partner med Pure Ihram for å tilby engros Ihram-sett til din moské, byrå eller reisegruppe. Halal-inntekt, kvalitetsprodukt, EU-dekkende frakt.', 'Devenez partenaire de Pure Ihram pour proposer des ensembles Ihram en gros à votre mosquée, votre agence ou votre groupe de voyage. Revenu halal, produit de qualité, livraison dans toute l\'UE.') },
  { path: '/returns',
    title: tri('Returns & Exchanges - 14-Day Free Returns | Pure Ihram', 'Retur & byte - 14 dagars fri retur | Pure Ihram', 'Retur og bytte - 14 dagers fri retur | Pure Ihram', 'Retours et échanges - Retours gratuits sous 14 jours | Pure Ihram'),
    desc: tri("Pure Ihram's transparent return and exchange policy across the EU. 14-day withdrawal, easy size swaps, and clear shipping rules.", 'Pure Ihrams tydliga policy för retur och byte inom EU: 14 dagars ångerrätt, enkla storleksbyten och klara fraktregler.', 'Pure Ihrams tydelige policy for retur og bytte i EU: 14 dagers angrerett, enkle størrelsesbytter og klare fraktregler.', 'La politique de retour et d\'échange de Pure Ihram, transparente et valable dans toute l\'UE. Rétractation sous 14 jours, échanges de taille simples et règles de livraison claires.') },
  { path: '/mosque-support', titleKey: 'mosqueSupport.seoTitle', descKey: 'mosqueSupport.seoDescription',
    titleDefault: 'Mosque Support Program | Pure Ihram', descDefault: 'Pure Ihram supports mosques across the Nordics and EU. Learn about our mosque support program.' },
  { path: '/support-our-mission', titleKey: 'donation.seoTitle', descKey: 'donation.seoDescription',
    titleDefault: 'Support Our Mission | Pure Ihram', descDefault: 'Support the Pure Ihram mission to make Ihram affordable and give back to the community.' },
  { path: '/transparency', titleKey: 'transparency.seoTitle', descKey: 'transparency.seoDescription',
    titleDefault: 'Transparency Dashboard | Pure Ihram', descDefault: 'Pure Ihram transparency dashboard: where the money goes and how we give back.' },
];

const getKey = (locale, key, fallback) => {
  for (const src of [loc[locale], loc.en]) {
    let o = src;
    for (const part of key.split('.')) o = (o && typeof o === 'object') ? o[part] : undefined;
    if (typeof o === 'string' && o) return o;
  }
  return fallback;
};

/** Build one page's HTML from the template. */
function render({ title, description, canonicalPath, ogType = 'website', locale, jsonLd = [] }) {
  const lm = LOCALES[locale];
  const build = (prefix) => (canonicalPath === '/' ? `${BASE}${prefix}/` : `${BASE}${prefix}${canonicalPath}`);
  const url = build(lm.prefix);
  const alt = (p) => build(p);
  // One alternate per language in the manifest, plus x-default pointing at the
  // unprefixed language. Adding a locale extends this on its own.
  const hreflang = [
    ...Object.values(LOCALES).map(
      (l) => `<link rel="alternate" hreflang="${l.hreflang}" href="${attr(alt(l.prefix))}" />`
    ),
    `<link rel="alternate" hreflang="x-default" href="${attr(alt(DEFAULT_PREFIX))}" />`,
  ].join('\n    ');
  const ld = jsonLd.map((o) => `<script type="application/ld+json">${jsonForScript(o)}</script>`).join('\n    ');

  let html = template;
  // The template ships lang="en"; every localised copy must say what it is.
  html = html.replace(/<html lang="[^"]*"/, `<html lang="${attr(lm.htmlLang)}"`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${attr(title)}</title>`);
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${attr(description)}" />`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${attr(url)}" />`);
  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${attr(title)}" />`);
  html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${attr(description)}" />`);
  html = html.replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${attr(ogType)}" />`);
  html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${attr(url)}" />`);
  html = html.replace(/<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/, `<meta property="og:locale" content="${lm.ogLocale}" />`);
  html = html.replace('</head>', `    ${hreflang}\n    ${ld}\n  </head>`);
  return html;
}

function write(pathNoLeadingSlash, html) {
  const dir = join(DIST, pathNoLeadingSlash);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf-8');
}

function articleSchema({ title, description, url, datePublished, keywords, locale }) {
  const inLang = locale === 'sv' ? 'sv-SE' : locale === 'no' ? 'nb-NO' : 'en';
  return {
    '@context': 'https://schema.org', '@type': 'Article', headline: title, description,
    inLanguage: inLang, author: { '@type': 'Organization', name: 'Pure Ihram' },
    datePublished, dateModified: datePublished, image: OG_IMAGE,
    publisher: { '@type': 'Organization', name: 'Pure Ihram', logo: { '@type': 'ImageObject', url: OG_IMAGE } },
    mainEntityOfPage: url, ...(keywords ? { keywords } : {}),
  };
}
function faqSchema(faq) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}

let count = 0;
// Homepage + blog list, per locale
for (const locale of Object.keys(LOCALES)) {
  const pfx = LOCALES[locale].prefix;
  write(pfx || '.', render({ title: (HOME_TITLE[locale] ?? HOME_TITLE.en), description: (HOME_DESC[locale] ?? HOME_DESC.en), canonicalPath: '/', locale }));
  // Host serves directory routes with a trailing slash (clean URL 308-redirects
  // to it), so canonical/hreflang use the trailing-slash 200 URL.
  write(`${pfx}/blog`.replace(/^\//, ''), render({ title: (BLOGLIST_TITLE[locale] ?? BLOGLIST_TITLE.en), description: (BLOGLIST_DESC[locale] ?? BLOGLIST_DESC.en), canonicalPath: '/blog/', locale }));
  count += 2;
}
// Registry blog posts (full Article + FAQPage), per locale
for (const post of blogData) {
  for (const locale of Object.keys(LOCALES)) {
    const t = post.translations[locale] || post.translations.en;
    const pfx = LOCALES[locale].prefix;
    const url = `${BASE}${pfx}/blog/${post.slug}/`;
    const jsonLd = [
      articleSchema({ title: t.title, description: t.excerpt, url, datePublished: post.datePublished, keywords: post.keywords, locale }),
    ];
    if (t.faq && t.faq.length) jsonLd.push(faqSchema(t.faq));
    write(`${pfx}/blog/${post.slug}`.replace(/^\//, ''), render({
      title: `${t.title} | Pure Ihram`, description: t.excerpt, canonicalPath: `/blog/${post.slug}/`,
      ogType: 'article', locale, jsonLd,
    }));
    count++;
  }
}
// Legacy hard-coded blog posts (title + excerpt + Article schema), per locale
for (const { slug, key } of LEGACY) {
  for (const locale of Object.keys(LOCALES)) {
    const posts = loc[locale]?.blog?.posts?.[key] || loc.en.blog.posts[key] || {};
    const title = posts.title || slug;
    const excerpt = posts.excerpt || BLOGLIST_DESC;
    const pfx = LOCALES[locale].prefix;
    const url = `${BASE}${pfx}/blog/${slug}/`;
    write(`${pfx}/blog/${slug}`.replace(/^\//, ''), render({
      title: `${title} | Pure Ihram`, description: excerpt, canonicalPath: `/blog/${slug}/`,
      ogType: 'article', locale,
      jsonLd: [articleSchema({ title, description: excerpt, url, datePublished: '2026-03-01', locale })],
    }));
    count++;
  }
}

// Public info/commerce pages, per locale
for (const page of STATIC_PAGES) {
  for (const locale of Object.keys(LOCALES)) {
    const pfx = LOCALES[locale].prefix;
    // Fall back to English when a locale has no bespoke string, rather than
    // baking "undefined" into the title tag as it did when French was added.
    const title = page.title ? (page.title[locale] ?? page.title.en) : getKey(locale, page.titleKey, page.titleDefault);
    const description = page.desc ? (page.desc[locale] ?? page.desc.en) : getKey(locale, page.descKey, page.descDefault);
    const pageJsonLd = [];
    if (page.faqKeys) {
      const faq = page.faqKeys
        .map((base) => ({ q: getKey(locale, `${base}.q`), a: getKey(locale, `${base}.a`) }))
        .filter((f) => f.q && f.a);
      if (faq.length) pageJsonLd.push(faqSchema(faq));
    }
    write(`${pfx}${page.path}`.replace(/^\//, ''), render({
      title, description, canonicalPath: `${page.path}/`, ogType: page.ogType || 'website', locale,
      jsonLd: pageJsonLd,
    }));
    count++;
  }
}

// --- Admin, installed as its own app ---------------------------------------
// Safari reads <link rel="manifest"> while the document is loading and caches
// it, so swapping the link from React afterwards is too late: by the time
// anyone taps Add to Home Screen the site manifest has already been read, and
// its start_url of "/" opens the shop. These pages therefore ship the admin
// manifest in the HTML itself, before any JavaScript runs.
const ADMIN_ROUTES = ['/admin', '/admin/orders', '/admin/inventory', '/admin/images'];

function renderAdmin() {
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>Ihram Admin</title>');
  html = html.replace(
    /<link\s+rel="manifest"\s+href="[^"]*"\s*\/?>/,
    '<link rel="manifest" href="/admin.webmanifest" />');
  // iOS takes the Home Screen image from apple-touch-icon, not the manifest.
  html = html.replace(
    /<link\s+rel="apple-touch-icon"\s+sizes="180x180"\s+href="[^"]*"\s*\/?>/,
    '<link rel="apple-touch-icon" sizes="180x180" href="/admin-apple-touch-icon.png" />');
  html = html.replace(
    /<meta\s+name="apple-mobile-web-app-title"\s+content="[^"]*"\s*\/?>/,
    '<meta name="apple-mobile-web-app-title" content="Ihram Admin" />');
  // The back office is nobody's search result, and the shop's canonical and
  // social tags would only leak storefront URLs into admin link previews.
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, '');
  html = html.replace(/<meta\s+property="og:[^"]*"\s+content="[^"]*"\s*\/?>/g, '');
  html = html.replace('</head>', '    <meta name="robots" content="noindex, nofollow" />\n  </head>');
  return html;
}

for (const route of ADMIN_ROUTES) {
  write(route.replace(/^\//, ''), renderAdmin());
  count++;
}

console.log(`[prerender] wrote ${count} static HTML files`);
