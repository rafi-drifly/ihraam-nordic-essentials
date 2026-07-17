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

console.log(`[prerender] wrote ${count} static HTML files`);
