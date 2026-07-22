import { db } from "@/lib/db";
import { applyXPGain, type XPGainResult } from "@/lib/xp";
import type { XPTrackType } from "@/generated/prisma/enums";

/**
 * Awards XP to a user's track, applying the compounding level-up curve,
 * and persists the result. This is the only place XPTrack rows should be
 * mutated from -- every caller should already know the tier and
 * verification rule behind the amount (see PRD 7.4).
 */
export async function awardXP(
  userId: string,
  track: XPTrackType,
  amount: number,
): Promise<XPGainResult> {
  const current = await db.xPTrack.findUniqueOrThrow({
    where: { userId_track: { userId, track } },
  });

  const result = applyXPGain(current, amount);

  await db.xPTrack.update({
    where: { userId_track: { userId, track } },
    data: result.state,
  });

  return result;
}
