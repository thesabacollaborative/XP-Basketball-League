export const ATTRIBUTE_KEYS = [
  "shooting",
  "passing",
  "defence",
  "conditioning",
  "strength",
  "leadership",
  "communication",
  "decisionMaking",
  "basketballIQ",
  "confidence",
  "consistency",
] as const;

export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  shooting: "Shooting",
  passing: "Passing",
  defence: "Defence",
  conditioning: "Conditioning",
  strength: "Strength",
  leadership: "Leadership",
  communication: "Communication",
  decisionMaking: "Decision Making",
  basketballIQ: "Basketball IQ",
  confidence: "Confidence",
  consistency: "Consistency",
};

/** Loosely maps each attribute to the closest training skill tag, ported
 * from the prototype's ATTR_TO_SKILL, so quiz results can point straight
 * at relevant drills. */
export const ATTR_TO_SKILL: Record<AttributeKey, string> = {
  shooting: "Shooting",
  passing: "Basketball IQ",
  defence: "Defence",
  conditioning: "Conditioning",
  strength: "Conditioning",
  leadership: "Basketball IQ",
  communication: "Basketball IQ",
  decisionMaking: "Basketball IQ",
  basketballIQ: "Basketball IQ",
  confidence: "Shooting",
  consistency: "Shooting",
};

/** New users have no evidence yet -- a neutral midpoint until real
 * activity accumulates real evidence reps (see PathwayProgress/Attribute
 * in PRD 5, and PRD 4.2's "back this with real underlying activity
 * counts... rather than a black box"). */
export const DEFAULT_ATTRIBUTE_VALUE = 50;
