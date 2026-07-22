import { describe, expect, it } from "vitest";
import {
  applyXPGain,
  classifyXPTier,
  isAmountWithinTier,
  XP_TIER_RANGES,
} from "@/lib/xp";

describe("applyXPGain", () => {
  it("adds XP without leveling up when below the threshold", () => {
    const result = applyXPGain({ xp: 0, level: 0, nextThreshold: 150 }, 100);
    expect(result).toEqual({
      state: { xp: 100, level: 0, nextThreshold: 150 },
      levelsGained: 0,
    });
  });

  it("levels up exactly at the threshold, growing next by 1.28x", () => {
    const result = applyXPGain({ xp: 0, level: 0, nextThreshold: 150 }, 150);
    expect(result).toEqual({
      state: { xp: 0, level: 1, nextThreshold: 192 }, // round(150 * 1.28) = 192
      levelsGained: 1,
    });
  });

  it("carries over leftover XP past the threshold", () => {
    const result = applyXPGain({ xp: 0, level: 0, nextThreshold: 150 }, 200);
    expect(result).toEqual({
      state: { xp: 50, level: 1, nextThreshold: 192 },
      levelsGained: 1,
    });
  });

  it("handles multiple level-ups from a single large award", () => {
    // 400 XP: 400-150=250 (lvl1, next=192); 250-192=58 (lvl2, next=246)
    const result = applyXPGain({ xp: 0, level: 0, nextThreshold: 150 }, 400);
    expect(result).toEqual({
      state: { xp: 58, level: 2, nextThreshold: 246 },
      levelsGained: 2,
    });
  });

  it("compounds correctly starting from a non-zero level", () => {
    // matches the prototype's demo player track: level 14, xp 2340, next 3000
    const result = applyXPGain({ xp: 2340, level: 14, nextThreshold: 3000 }, 700);
    expect(result).toEqual({
      state: { xp: 40, level: 15, nextThreshold: 3840 }, // round(3000*1.28)=3840
      levelsGained: 1,
    });
  });

  it("is a no-op for zero XP gain", () => {
    const result = applyXPGain({ xp: 10, level: 2, nextThreshold: 300 }, 0);
    expect(result).toEqual({
      state: { xp: 10, level: 2, nextThreshold: 300 },
      levelsGained: 0,
    });
  });
});

describe("classifyXPTier", () => {
  it.each([
    [5, "ROUTINE"],
    [49, "ROUTINE"],
    [50, "STANDARD"],
    [299, "STANDARD"],
    [300, "SIGNIFICANT"],
    [1499, "SIGNIFICANT"],
    [1500, "RARE"],
    [10000, "RARE"],
  ] as const)("classifies %i as %s", (amount, tier) => {
    expect(classifyXPTier(amount)).toBe(tier);
  });
});

describe("isAmountWithinTier", () => {
  it("accepts amounts inside the tier's range", () => {
    expect(isAmountWithinTier(25, "ROUTINE")).toBe(true);
    expect(isAmountWithinTier(650, "SIGNIFICANT")).toBe(true);
  });

  it("rejects amounts outside the tier's range", () => {
    expect(isAmountWithinTier(500, "ROUTINE")).toBe(false);
    expect(isAmountWithinTier(1, "STANDARD")).toBe(false);
  });

  it("matches XP_TIER_RANGES boundaries inclusively", () => {
    for (const tier of Object.keys(XP_TIER_RANGES) as (keyof typeof XP_TIER_RANGES)[]) {
      const { min, max } = XP_TIER_RANGES[tier];
      expect(isAmountWithinTier(min, tier)).toBe(true);
      expect(isAmountWithinTier(max, tier)).toBe(true);
    }
  });
});
