/**
 * The Pure Ihram mark: a white serif I in a Sacred Teal circle.
 *
 * Traced from the master file (Design/Pure ihram logo.jpg) for the brand
 * manual v2.0 (November 2026), the same drawing as brand-manual-v2/logos/
 * pure-ihram-mark.svg and the icons in public/. Use it beside the name in
 * Inter Bold, Deep Teal, at 1.6 times the name's type size.
 */
const I_PATH =
  "M37.44 20.2H62.56V24.9H60Q57.17 24.9 57.17 26.9V73.1Q57.17 75.1 60 75.1H62.56V79.8H37.44V75.1H40Q42.83 75.1 42.83 73.1V26.9Q42.83 24.9 40 24.9H37.44Z";

interface BrandMarkProps {
  className?: string;
}

const BrandMark = ({ className = "w-8 h-8" }: BrandMarkProps) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
    <circle cx="50" cy="50" r="50" fill="#287777" />
    <path d={I_PATH} fill="#ffffff" />
  </svg>
);

export default BrandMark;
