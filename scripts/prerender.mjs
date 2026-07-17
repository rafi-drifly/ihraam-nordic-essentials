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

const LOCALES = {
  en: { prefix: '', ogLocale: 'en_GB' },
  sv: { prefix: '/sv', ogLocale: 'sv_SE' },
  no: { prefix: '/no', ogLocale: 'nb_NO' },
};

const readJSON = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf-8'));
const blogData = readJSON('src/content/blog/blog-data.json');
const loc = { en: readJSON('src/i18n/locales/en.json'), sv: readJSON('src/i18n/locales/sv.json'), no: readJSON('src/i18n/locales/no.json') };

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
  en: 'Buy Ihram Online from €19 | Pure Ihram',
  sv: 'Köp Ihram Online från €19 | Pure Ihram',
  no: 'Kjøp Ihram Online fra €19 | Pure Ihram',
};
const HOME_DESC = {
  en: 'Premium Ihram cloth for Hajj & Umrah. From €19. Ships from Sweden, fast delivery across Europe. Trusted by pilgrims for Hajj 2026.',
  sv: 'Premium Ihram-tyg för Hajj och Umrah. Från €19. Levereras från Sverige, snabb leverans i hela Europa. Betrodd av pilgrimer inför Hajj 2026.',
  no: 'Premium Ihram-stoff for Hajj og Umrah. Fra €19. Sendes fra Sverige, rask levering i hele Europa. Foretrukket av pilegrimer for Hajj 2026.',
};
const BLOGLIST_TITLE = 'Hajj & Umrah Guides - Pilgrimage Knowledge | Pure Ihram';
const BLOGLIST_DESC = 'Practical guides for Hajj and Umrah: how to wear Ihram, Sunnah acts, essential duas, packing checklists, and spiritual preparation.';

// Public info/commerce pages. Titles/descriptions mirror each page's SEOHead.
// `title`/`desc` = inline per-locale strings; `titleKey`/`descKey` = i18n keys
// resolved from the locale JSON (falling back to English, then the given default).
const tri = (en, sv, no) => ({ en, sv, no });
const STATIC_PAGES = [
  { path: '/shop', ogType: 'product',
    title: tri('Shop Ihram Sets - Single, 2-Pack & 3-Pack | Pure Ihram', 'Köp Ihram-set - Single, 2-Pack & 3-Pack | Pure Ihram', 'Kjøp Ihram-sett - Single, 2-Pack & 3-Pack | Pure Ihram'),
    desc: tri('Choose your Ihram set: single (€19), 2-pack (€37), or 3-pack (€55). Lightweight microfiber, ships from Sweden. Secure EU delivery.', 'Välj ditt Ihram-set: single (€19), 2-pack (€37) eller 3-pack (€55). Lätt mikrofiber, skickas från Sverige. Säker betalning via Stripe.', 'Velg ditt Ihram-sett: single (€19), 2-pack (€37) eller 3-pack (€55). Lett mikrofiber, sendes fra Sverige. Sikker betaling med Stripe.') },
  { path: '/about',
    title: tri('About Pure Ihram - Mission & Values', 'Om Pure Ihram - Uppdrag & Värderingar', 'Om Pure Ihram - Oppdrag & Verdier'),
    desc: tri('Pure Ihram was founded in Sweden to make quality Ihram cloth affordable for every European Muslim. €19 per set, honest pricing, fast shipping.', 'Pure Ihram grundades i Sverige för att göra kvalitativ Ihram-duk prisvärd för varje europeisk muslim. €19 per set, ärlig prissättning, snabb leverans.', 'Pure Ihram ble grunnlagt i Sverige for å gjøre kvalitets Ihram rimelig for hver europeisk muslim. €19 per sett, ærlig prising, rask levering.') },
  { path: '/contact',
    title: tri('Contact Pure Ihram - Email, WhatsApp & Phone Support', 'Kontakta Pure Ihram - E-post, WhatsApp & Telefonsupport', 'Kontakt Pure Ihram - E-post, WhatsApp & Telefonstøtte'),
    desc: tri('Get in touch with Pure Ihram. Email support@pureihraam.com, WhatsApp +46720131476, or use our contact form.', 'Kontakta Pure Ihram. E-post support@pureihraam.com, WhatsApp +46720131476, eller använd vårt kontaktformulär.', 'Ta kontakt med Pure Ihram. E-post support@pureihraam.com, WhatsApp +46720131476, eller bruk kontaktskjemaet vårt.') },
  { path: '/shipping',
    title: tri('Shipping & Delivery - Fast EU Shipping from Sweden | Pure Ihram', 'Frakt & Leverans - Snabb EU-frakt från Sverige | Pure Ihram', 'Frakt & Levering - Rask EU-frakt fra Sverige | Pure Ihram'),
    desc: tri('Fast, reliable Ihram delivery across Sweden, the Nordics, and the EU. Orders processed in 1-2 business days with full tracking.', 'Snabb, pålitlig Ihram-leverans i Sverige, Norden och hela EU. Beställningar behandlas inom 1-2 arbetsdagar med full spårning.', 'Rask, pålitelig Ihram-levering i Sverige, Norden og hele EU. Bestillinger behandles innen 1-2 virkedager med full sporing.') },
  { path: '/partners',
    title: tri('B2B Partnership - Wholesale Ihram for Mosques & Agencies | Pure Ihram', 'B2B-Partnerskap - Grossist Ihram för Moskéer & Byråer | Pure Ihram', 'B2B-Partnerskap - Engros Ihram for Moskeer & Byråer | Pure Ihram'),
    desc: tri('Partner with Pure Ihram to offer wholesale Ihram sets to your mosque, agency, or travel group. Halal income, quality product, EU-wide shipping.', 'Bli partner med Pure Ihram för att erbjuda grossist Ihram-set till er moské, byrå eller resegrupp. Halal-inkomst, kvalitetsprodukt, EU-omfattande frakt.', 'Bli partner med Pure Ihram for å tilby engros Ihram-sett til din moské, byrå eller reisegruppe. Halal-inntekt, kvalitetsprodukt, EU-dekkende frakt.') },
  { path: '/returns',
    title: tri('Returns & Exchanges - 14-Day Free Returns | Pure Ihram', 'Returns & Exchanges - 14-Day Free Returns | Pure Ihram', 'Returns & Exchanges - 14-Day Free Returns | Pure Ihram'),
    desc: tri("Pure Ihram's transparent return and exchange policy across the EU. 14-day withdrawal, easy size swaps, and clear shipping rules.", "Pure Ihram's transparent return and exchange policy across the EU. 14-day withdrawal, easy size swaps, and clear shipping rules.", "Pure Ihram's transparent return and exchange policy across the EU. 14-day withdrawal, easy size swaps, and clear shipping rules.") },
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
  const hreflang = [
    `<link rel="alternate" hreflang="en" href="${attr(alt(''))}" />`,
    `<link rel="alternate" hreflang="sv-SE" href="${attr(alt('/sv'))}" />`,
    `<link rel="alternate" hreflang="nb-NO" href="${attr(alt('/no'))}" />`,
    `<link rel="alternate" hreflang="x-default" href="${attr(alt(''))}" />`,
  ].join('\n    ');
  const ld = jsonLd.map((o) => `<script type="application/ld+json">${jsonForScript(o)}</script>`).join('\n    ');

  let html = template;
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
  write(pfx || '.', render({ title: HOME_TITLE[locale], description: HOME_DESC[locale], canonicalPath: '/', locale }));
  // Host serves directory routes with a trailing slash (clean URL 308-redirects
  // to it), so canonical/hreflang use the trailing-slash 200 URL.
  write(`${pfx}/blog`.replace(/^\//, ''), render({ title: BLOGLIST_TITLE, description: BLOGLIST_DESC, canonicalPath: '/blog/', locale }));
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
    const title = page.title ? page.title[locale] : getKey(locale, page.titleKey, page.titleDefault);
    const description = page.desc ? page.desc[locale] : getKey(locale, page.descKey, page.descDefault);
    write(`${pfx}${page.path}`.replace(/^\//, ''), render({
      title, description, canonicalPath: `${page.path}/`, ogType: page.ogType || 'website', locale,
    }));
    count++;
  }
}

console.log(`[prerender] wrote ${count} static HTML files`);
