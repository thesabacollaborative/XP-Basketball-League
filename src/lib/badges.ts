import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/enums";
import type { TrainingCategory } from "@/lib/training";

type BadgeMetric =
  | { kind: "matchSum"; field: "pts" | "ast" | "reb" | "minutes" }
  | { kind: "activityCount"; role: Role; type?: string }
  | { kind: "trainingCompletionCount"; category?: TrainingCategory };

/**
 * PRD 4.6/4.2: badge progress bars must read from live counters, never a
 * hand-set percentage. Our Log Activity form only captures a handful of
 * structured stats (pts/ast/reb/minutes for players, session/content/
 * officiated counts for other roles) -- nowhere near the granularity the
 * prototype's 33 badge descriptions imply (blocks, steals, conduct
 * flags, fan growth, etc.). Rather than fabricate numbers for stats we
 * don't collect, only badges with a real, honest data source are mapped
 * here; everything else genuinely reads 0 until a real source exists.
 */
const BADGE_METRICS: Record<string, BadgeMetric> = {
  visionkeeper: { kind: "matchSum", field: "ast" },
  glasscleaner: { kind: "matchSum", field: "reb" },
  marathon: { kind: "matchSum", field: "minutes" },
  ironman: { kind: "activityCount", role: "PLAYER" },
  highlightreel: { kind: "activityCount", role: "CREATOR", type: "Highlight clip" },
  livestreamregular: { kind: "activityCount", role: "CREATOR", type: "Livestream" },
  sessionarchitect: { kind: "activityCount", role: "COACH" },
  whistlesteady: { kind: "activityCount", role: "ADMIN" },
  rulebookready: { kind: "trainingCompletionCount", category: "officiating" },
};

async function computeOne(userId: string, metric: BadgeMetric): Promise<number> {
  switch (metric.kind) {
    case "matchSum": {
      const logs = await db.activityLog.findMany({
        where: { userId, matchId: { not: null } },
        select: { match: { select: { pts: true, ast: true, reb: true, minutes: true } } },
      });
      const field = metric.field;
      return logs.reduce((sum, l) => sum + (l.match?.[field] ?? 0), 0);
    }
    case "activityCount": {
      return db.activityLog.count({
        where: { userId, role: metric.role, ...(metric.type ? { type: metric.type } : {}) },
      });
    }
    case "trainingCompletionCount": {
      return db.trainingCompletion.count({
        where: {
          userId,
          ...(metric.category ? { trainingItem: { category: metric.category } } : {}),
        },
      });
    }
  }
}

/** Returns a map of badgeId -> live progress count for every badge this
 * user has a real data source for. Badges not in BADGE_METRICS are left
 * out (callers should treat missing = 0). */
export async function computeLiveBadgeProgress(
  userId: string,
  badgeIds: string[],
): Promise<Record<string, number>> {
  const entries = await Promise.all(
    badgeIds
      .filter((id) => id in BADGE_METRICS)
      .map(async (id) => [id, await computeOne(userId, BADGE_METRICS[id])] as const),
  );
  return Object.fromEntries(entries);
}
