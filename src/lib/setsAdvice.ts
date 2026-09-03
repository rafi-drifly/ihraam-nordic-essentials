/**
 * How many Ihram sets a pilgrim actually needs.
 *
 * Per person, not per booking: a group of three needs three times what one
 * person needs. Earlier versions capped the answer at the 3-Pack, which quietly
 * under-served families, and recommended a single set for Umrah, which leaves a
 * first-time pilgrim with no spare if one tears or is soiled at Miqat.
 */

export type Journey = "umrah" | "hajj";

/** Minimum sets per person. */
export const SETS_PER_PERSON: Record<Journey, number> = {
  // A spare matters most to someone doing this for the first time.
  umrah: 2,
  // Hajj keeps you in Ihram across several days in Mina and Arafat.
  hajj: 3,
};

export const MAX_TRAVELLERS = 12;

/** Total sets to recommend. Travellers are clamped to a sane range. */
export function recommendedSets(journey: Journey, travellers: number): number {
  const people = Math.min(
    MAX_TRAVELLERS,
    Math.max(1, Math.floor(Number.isFinite(travellers) ? travellers : 1)),
  );
  return SETS_PER_PERSON[journey] * people;
}
