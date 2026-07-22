import { db } from "@/lib/db";
import type { Pathway, Role, XPTrackType } from "@/generated/prisma/enums";

const XP_TRACKS: XPTrackType[] = ["PLAYER", "COMMUNITY", "CREATOR", "COACH", "OFFICIAL"];
const PATHWAYS: Pathway[] = [
  "ATHLETE",
  "LEADERSHIP",
  "COACHING",
  "COMMUNITY",
  "CREATOR",
  "PROFESSIONAL",
];

/**
 * Every user gets all five XP tracks and all six pathway rows from the
 * start (matching the prototype's DB.player shape, which always carries
 * every track/pathway regardless of active role) -- created once, the
 * first time a role is selected.
 */
export async function ensureDefaultProgressionRows(userId: string) {
  await db.$transaction([
    ...XP_TRACKS.map((track) =>
      db.xPTrack.upsert({
        where: { userId_track: { userId, track } },
        create: { userId, track, xp: 0, level: 0, nextThreshold: 150 },
        update: {},
      }),
    ),
    ...PATHWAYS.map((pathway) =>
      db.pathwayProgress.upsert({
        where: { userId_pathway: { userId, pathway } },
        create: { userId, pathway, percent: 0 },
        update: {},
      }),
    ),
  ]);
}

export async function setActiveRole(userId: string, role: Role) {
  await db.$transaction([
    db.userRole.upsert({
      where: { userId_role: { userId, role } },
      create: { userId, role },
      update: {},
    }),
    db.user.update({ where: { id: userId }, data: { activeRole: role } }),
  ]);
  await ensureDefaultProgressionRows(userId);
}
