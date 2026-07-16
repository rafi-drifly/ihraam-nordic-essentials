// Blog metadata lives in blog-data.json (shared with scripts/prerender.mjs).
// Article bodies are imported here as raw HTML strings and merged in at runtime.
import blogData from './blog-data.json';
import b_how_many_ihrams_do_you_need_for_hajj_en from './how-many-ihrams-do-you-need-for-hajj.en.html?raw';
import b_how_many_ihrams_do_you_need_for_hajj_sv from './how-many-ihrams-do-you-need-for-hajj.sv.html?raw';
import b_how_many_ihrams_do_you_need_for_hajj_no from './how-many-ihrams-do-you-need-for-hajj.no.html?raw';
import b_hajj_2026_packing_checklist_en from './hajj-2026-packing-checklist.en.html?raw';
import b_hajj_2026_packing_checklist_sv from './hajj-2026-packing-checklist.sv.html?raw';
import b_hajj_2026_packing_checklist_no from './hajj-2026-packing-checklist.no.html?raw';
import b_how_to_wear_ihram_correctly_en from './how-to-wear-ihram-correctly.en.html?raw';
import b_how_to_wear_ihram_correctly_sv from './how-to-wear-ihram-correctly.sv.html?raw';
import b_how_to_wear_ihram_correctly_no from './how-to-wear-ihram-correctly.no.html?raw';
import b_wash_ihram_before_hajj_en from './wash-ihram-before-hajj.en.html?raw';
import b_wash_ihram_before_hajj_sv from './wash-ihram-before-hajj.sv.html?raw';
import b_wash_ihram_before_hajj_no from './wash-ihram-before-hajj.no.html?raw';
import b_common_ihram_mistakes_hajj_en from './common-ihram-mistakes-hajj.en.html?raw';
import b_common_ihram_mistakes_hajj_sv from './common-ihram-mistakes-hajj.sv.html?raw';
import b_common_ihram_mistakes_hajj_no from './common-ihram-mistakes-hajj.no.html?raw';
import b_ihram_for_umrah_vs_hajj_en from './ihram-for-umrah-vs-hajj.en.html?raw';
import b_ihram_for_umrah_vs_hajj_sv from './ihram-for-umrah-vs-hajj.sv.html?raw';
import b_ihram_for_umrah_vs_hajj_no from './ihram-for-umrah-vs-hajj.no.html?raw';
import b_what_happens_at_miqat_en from './what-happens-at-miqat.en.html?raw';
import b_what_happens_at_miqat_sv from './what-happens-at-miqat.sv.html?raw';
import b_what_happens_at_miqat_no from './what-happens-at-miqat.no.html?raw';
import b_buy_ihram_in_europe_en from './buy-ihram-in-europe.en.html?raw';
import b_buy_ihram_in_europe_sv from './buy-ihram-in-europe.sv.html?raw';
import b_buy_ihram_in_europe_no from './buy-ihram-in-europe.no.html?raw';
import b_ihram_for_men_en from './ihram-for-men.en.html?raw';
import b_ihram_for_men_sv from './ihram-for-men.sv.html?raw';
import b_ihram_for_men_no from './ihram-for-men.no.html?raw';
import b_ihram_for_women_en from './ihram-for-women.en.html?raw';
import b_ihram_for_women_sv from './ihram-for-women.sv.html?raw';
import b_ihram_for_women_no from './ihram-for-women.no.html?raw';
import b_ihram_packing_weather_care_en from './ihram-packing-weather-care.en.html?raw';
import b_ihram_packing_weather_care_sv from './ihram-packing-weather-care.sv.html?raw';
import b_ihram_packing_weather_care_no from './ihram-packing-weather-care.no.html?raw';
import b_ihram_rules_what_breaks_ihram_en from './ihram-rules-what-breaks-ihram.en.html?raw';
import b_ihram_rules_what_breaks_ihram_sv from './ihram-rules-what-breaks-ihram.sv.html?raw';
import b_ihram_rules_what_breaks_ihram_no from './ihram-rules-what-breaks-ihram.no.html?raw';
import b_how_to_perform_umrah_en from './how-to-perform-umrah.en.html?raw';
import b_how_to_perform_umrah_sv from './how-to-perform-umrah.sv.html?raw';
import b_how_to_perform_umrah_no from './how-to-perform-umrah.no.html?raw';
import b_best_time_for_umrah_en from './best-time-for-umrah.en.html?raw';
import b_best_time_for_umrah_sv from './best-time-for-umrah.sv.html?raw';
import b_best_time_for_umrah_no from './best-time-for-umrah.no.html?raw';
import b_umrah_in_ramadan_en from './umrah-in-ramadan.en.html?raw';
import b_umrah_in_ramadan_sv from './umrah-in-ramadan.sv.html?raw';
import b_umrah_in_ramadan_no from './umrah-in-ramadan.no.html?raw';
import b_first_umrah_from_europe_en from './first-umrah-from-europe.en.html?raw';
import b_first_umrah_from_europe_sv from './first-umrah-from-europe.sv.html?raw';
import b_first_umrah_from_europe_no from './first-umrah-from-europe.no.html?raw';
import b_umrah_mistakes_to_avoid_en from './umrah-mistakes-to-avoid.en.html?raw';
import b_umrah_mistakes_to_avoid_sv from './umrah-mistakes-to-avoid.sv.html?raw';
import b_umrah_mistakes_to_avoid_no from './umrah-mistakes-to-avoid.no.html?raw';

export type BlogLocale = 'en' | 'sv' | 'no';

export interface BlogFaq { q: string; a: string; }

export interface BlogTranslation {
  title: string;
  excerpt: string;
  body: string;
  faq: BlogFaq[];
}

export interface BlogEntry {
  slug: string;
  category: string;
  datePublished: string;
  readTime: number;
  keywords: string;
  translations: Record<BlogLocale, BlogTranslation>;
}

const bodies: Record<string, string> = {
  'how-many-ihrams-do-you-need-for-hajj_en': b_how_many_ihrams_do_you_need_for_hajj_en,
  'how-many-ihrams-do-you-need-for-hajj_sv': b_how_many_ihrams_do_you_need_for_hajj_sv,
  'how-many-ihrams-do-you-need-for-hajj_no': b_how_many_ihrams_do_you_need_for_hajj_no,
  'hajj-2026-packing-checklist_en': b_hajj_2026_packing_checklist_en,
  'hajj-2026-packing-checklist_sv': b_hajj_2026_packing_checklist_sv,
  'hajj-2026-packing-checklist_no': b_hajj_2026_packing_checklist_no,
  'how-to-wear-ihram-correctly_en': b_how_to_wear_ihram_correctly_en,
  'how-to-wear-ihram-correctly_sv': b_how_to_wear_ihram_correctly_sv,
  'how-to-wear-ihram-correctly_no': b_how_to_wear_ihram_correctly_no,
  'wash-ihram-before-hajj_en': b_wash_ihram_before_hajj_en,
  'wash-ihram-before-hajj_sv': b_wash_ihram_before_hajj_sv,
  'wash-ihram-before-hajj_no': b_wash_ihram_before_hajj_no,
  'common-ihram-mistakes-hajj_en': b_common_ihram_mistakes_hajj_en,
  'common-ihram-mistakes-hajj_sv': b_common_ihram_mistakes_hajj_sv,
  'common-ihram-mistakes-hajj_no': b_common_ihram_mistakes_hajj_no,
  'ihram-for-umrah-vs-hajj_en': b_ihram_for_umrah_vs_hajj_en,
  'ihram-for-umrah-vs-hajj_sv': b_ihram_for_umrah_vs_hajj_sv,
  'ihram-for-umrah-vs-hajj_no': b_ihram_for_umrah_vs_hajj_no,
  'what-happens-at-miqat_en': b_what_happens_at_miqat_en,
  'what-happens-at-miqat_sv': b_what_happens_at_miqat_sv,
  'what-happens-at-miqat_no': b_what_happens_at_miqat_no,
  'buy-ihram-in-europe_en': b_buy_ihram_in_europe_en,
  'buy-ihram-in-europe_sv': b_buy_ihram_in_europe_sv,
  'buy-ihram-in-europe_no': b_buy_ihram_in_europe_no,
  'ihram-for-men_en': b_ihram_for_men_en,
  'ihram-for-men_sv': b_ihram_for_men_sv,
  'ihram-for-men_no': b_ihram_for_men_no,
  'ihram-for-women_en': b_ihram_for_women_en,
  'ihram-for-women_sv': b_ihram_for_women_sv,
  'ihram-for-women_no': b_ihram_for_women_no,
  'ihram-packing-weather-care_en': b_ihram_packing_weather_care_en,
  'ihram-packing-weather-care_sv': b_ihram_packing_weather_care_sv,
  'ihram-packing-weather-care_no': b_ihram_packing_weather_care_no,
  'ihram-rules-what-breaks-ihram_en': b_ihram_rules_what_breaks_ihram_en,
  'ihram-rules-what-breaks-ihram_sv': b_ihram_rules_what_breaks_ihram_sv,
  'ihram-rules-what-breaks-ihram_no': b_ihram_rules_what_breaks_ihram_no,
  'how-to-perform-umrah_en': b_how_to_perform_umrah_en,
  'how-to-perform-umrah_sv': b_how_to_perform_umrah_sv,
  'how-to-perform-umrah_no': b_how_to_perform_umrah_no,
  'best-time-for-umrah_en': b_best_time_for_umrah_en,
  'best-time-for-umrah_sv': b_best_time_for_umrah_sv,
  'best-time-for-umrah_no': b_best_time_for_umrah_no,
  'umrah-in-ramadan_en': b_umrah_in_ramadan_en,
  'umrah-in-ramadan_sv': b_umrah_in_ramadan_sv,
  'umrah-in-ramadan_no': b_umrah_in_ramadan_no,
  'first-umrah-from-europe_en': b_first_umrah_from_europe_en,
  'first-umrah-from-europe_sv': b_first_umrah_from_europe_sv,
  'first-umrah-from-europe_no': b_first_umrah_from_europe_no,
  'umrah-mistakes-to-avoid_en': b_umrah_mistakes_to_avoid_en,
  'umrah-mistakes-to-avoid_sv': b_umrah_mistakes_to_avoid_sv,
  'umrah-mistakes-to-avoid_no': b_umrah_mistakes_to_avoid_no,
};

export const blogPosts: BlogEntry[] = (blogData as Array<Omit<BlogEntry, 'translations'> & {
  translations: Record<BlogLocale, Omit<BlogTranslation, 'body'>>;
}>).map((p) => ({
  slug: p.slug,
  category: p.category,
  datePublished: p.datePublished,
  readTime: p.readTime,
  keywords: p.keywords,
  translations: {
    en: { ...p.translations.en, body: bodies[`${p.slug}_en`] },
    sv: { ...p.translations.sv, body: bodies[`${p.slug}_sv`] },
    no: { ...p.translations.no, body: bodies[`${p.slug}_no`] },
  },
}));

export const getBlogPost = (slug?: string): BlogEntry | undefined =>
  blogPosts.find((p) => p.slug === slug);

export const pickLocale = (lang: string): BlogLocale =>
  lang === 'sv' ? 'sv' : lang === 'no' ? 'no' : 'en';
