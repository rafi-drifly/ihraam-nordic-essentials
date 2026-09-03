/**
 * The advice has to scale with the group, and never fall below the per-person
 * minimum. Getting this wrong either under-serves a family or recommends a
 * single set to a first-time pilgrim with no spare.
 */

import { describe, expect, it } from "vitest";
import { MAX_TRAVELLERS, recommendedSets, SETS_PER_PERSON } from "../setsAdvice";

describe("sets per person", () => {
  it("never recommends fewer than two for Umrah, or three for Hajj", () => {
    expect(SETS_PER_PERSON.umrah).toBeGreaterThanOrEqual(2);
    expect(SETS_PER_PERSON.hajj).toBeGreaterThanOrEqual(3);
    expect(recommendedSets("umrah", 1)).toBe(2);
    expect(recommendedSets("hajj", 1)).toBe(3);
  });

  it("recommends more for Hajj than for the same Umrah party", () => {
    for (const people of [1, 2, 5]) {
      expect(recommendedSets("hajj", people)).toBeGreaterThan(recommendedSets("umrah", people));
    }
  });
});

describe("scaling with the group", () => {
  it("multiplies by the number of travellers", () => {
    expect(recommendedSets("umrah", 3)).toBe(6);
    expect(recommendedSets("hajj", 4)).toBe(12);
  });

  it("grows strictly as people are added", () => {
    for (const journey of ["umrah", "hajj"] as const) {
      for (let n = 1; n < 8; n++) {
        expect(recommendedSets(journey, n + 1)).toBeGreaterThan(recommendedSets(journey, n));
      }
    }
  });
});

describe("bad input", () => {
  it("treats zero, negatives and nonsense as one traveller", () => {
    for (const bad of [0, -3, NaN, Infinity]) {
      expect(recommendedSets("umrah", bad as number)).toBe(SETS_PER_PERSON.umrah);
    }
  });

  it("ignores fractional people rather than recommending a fraction of a set", () => {
    expect(recommendedSets("hajj", 2.9)).toBe(6);
    expect(Number.isInteger(recommendedSets("umrah", 3.5))).toBe(true);
  });

  it("clamps an absurd party size", () => {
    expect(recommendedSets("hajj", 9999)).toBe(SETS_PER_PERSON.hajj * MAX_TRAVELLERS);
  });
});
