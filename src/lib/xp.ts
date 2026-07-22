import type { XPTier } from "@/generated/prisma/enums";

export interface XPTrackState {
  xp: number;
  level: number;
  nextThreshold: number;
}

export interface XPGainResult {
  state: XPTrackState;
  levelsGained: number;
}

/**
 * Compounding level-up curve ported verbatim from the prototype's
 * awardXP(): while xp >= next, subtract next from xp, increment level,
 * then next = round(next * 1.28). Intentionally non-linear -- don't
 * "simplify" this into a flat curve.
 */
export function applyXPGain(current: XPTrackState, amount: number): XPGainResult {
  let { xp, level, nextThreshold } = current;
  xp += amount;
  let levelsGained = 0;

  while (xp >= nextThreshold) {
    xp -= nextThreshold;
    level += 1;
    nextThreshold = Math.round(nextThreshold * 1.28);
    levelsGained += 1;
  }

  return { state: { xp, level, nextThreshold }, levelsGained };
}

/**
 * Four-tier XP scale from PRD 4.1. The PRD's ranges overlap exactly at
 * their shared boundary (50/300/1500) -- those values are assigned to the
 * higher tier here.
 */
export const XP_TIER_RANGES: Record<XPTier, { min: number; max: number }> = {
  ROUTINE: { min: 5, max: 50 },
  STANDARD: { min: 50, max: 300 },
  SIGNIFICANT: { min: 300, max: 1500 },
  RARE: { min: 1500, max: 10000 },
};

export function classifyXPTier(amount: number): XPTier {
  if (amount >= XP_TIER_RANGES.RARE.min) return "RARE";
  if (amount >= XP_TIER_RANGES.SIGNIFICANT.min) return "SIGNIFICANT";
  if (amount >= XP_TIER_RANGES.STANDARD.min) return "STANDARD";
  return "ROUTINE";
}

export function isAmountWithinTier(amount: number, tier: XPTier): boolean {
  const range = XP_TIER_RANGES[tier];
  return amount >= range.min && amount <= range.max;
}
