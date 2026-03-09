// Shipping rates in EUR
export const SHIPPING_RATES = {
  sweden: 9,   // flat per order
  europe: 9,   // base fee per order (actual may vary)
} as const;

// European countries list (Stripe allowed_countries format)
export const EUROPE_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 
  'SE', // Sweden
  'GB', // UK
  'NO', // Norway (EEA)
  'IS', // Iceland (EEA)
  'LI', // Liechtenstein (EEA)
  'CH', // Switzerland
] as const;

export type EuropeCountry = typeof EUROPE_COUNTRIES[number];

export const COUNTRY_FLAGS: Record<EuropeCountry, string> = {
  AT: '🇦🇹', BE: '🇧🇪', BG: '🇧🇬', HR: '🇭🇷', CY: '🇨🇾',
  CZ: '🇨🇿', DK: '🇩🇰', EE: '🇪🇪', FI: '🇫🇮', FR: '🇫🇷',
  DE: '🇩🇪', GR: '🇬🇷', HU: '🇭🇺', IE: '🇮🇪', IT: '🇮🇹',
  LV: '🇱🇻', LT: '🇱🇹', LU: '🇱🇺', MT: '🇲🇹', NL: '🇳🇱',
  PL: '🇵🇱', PT: '🇵🇹', RO: '🇷🇴', SK: '🇸🇰', SI: '🇸🇮',
  ES: '🇪🇸', SE: '🇸🇪', GB: '🇬🇧', NO: '🇳🇴', IS: '🇮🇸',
  LI: '🇱🇮', CH: '🇨🇭',
};

// Country names for display
export const COUNTRY_NAMES: Record<EuropeCountry, string> = {
  AT: 'Austria', BE: 'Belgium', BG: 'Bulgaria', HR: 'Croatia', CY: 'Cyprus',
  CZ: 'Czech Republic', DK: 'Denmark', EE: 'Estonia', FI: 'Finland', FR: 'France',
  DE: 'Germany', GR: 'Greece', HU: 'Hungary', IE: 'Ireland', IT: 'Italy',
  LV: 'Latvia', LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta', NL: 'Netherlands',
  PL: 'Poland', PT: 'Portugal', RO: 'Romania', SK: 'Slovakia', SI: 'Slovenia',
  ES: 'Spain', SE: 'Sweden', GB: 'United Kingdom', NO: 'Norway', IS: 'Iceland',
  LI: 'Liechtenstein', CH: 'Switzerland',
};

/**
 * Calculate shipping cost — €9 flat for all of Europe (base fee)
 */
export function calculateShipping(quantity: number, country: string = 'SE'): number {
  return 9;
}

/**
 * Get shipping display text
 */
export function getShippingLabel(quantity: number, country: string = 'SE'): string {
  if (country === 'SE') {
    return '€9 delivery in Sweden';
  }
  return '€9 base delivery fee';
}

/**
 * Check if a country is in our Europe list
 */
export function isEuropeCountry(country: string): boolean {
  return EUROPE_COUNTRIES.includes(country as EuropeCountry);
}

/**
 * Check if country requires shipping adjustment disclosure
 */
export function requiresShippingDisclosure(country: string): boolean {
  return country !== 'SE';
}
