import { db } from "@/lib/db";

/**
 * Categories match the prototype's four XP lookup tables
 * (GAME_TYPE_XP / OFFICIATING_XP / COACH_SESSION_XP / CREATOR_CONTENT_XP),
 * now rows in XPRule instead of hardcoded objects -- see the build brief's
 * "make them admin-configurable in the data model" instruction.
 */
export const XP_RULE_CATEGORIES = {
  GAME: "game",
  OFFICIATING: "officiating",
  COACH_SESSION: "coach_session",
  CREATOR_CONTENT: "creator_content",
} as const;

export type XPRuleCategory = (typeof XP_RULE_CATEGORIES)[keyof typeof XP_RULE_CATEGORIES];

export async function getXPRuleAmount(
  category: XPRuleCategory,
  key: string,
): Promise<number> {
  const rule = await db.xPRule.findUnique({
    where: { category_key: { category, key } },
  });
  if (!rule) {
    throw new Error(`No XPRule configured for ${category}/${key}`);
  }
  return rule.xp;
}

export async function listXPRules(category: XPRuleCategory) {
  return db.xPRule.findMany({
    where: { category },
    orderBy: { key: "asc" },
  });
}
