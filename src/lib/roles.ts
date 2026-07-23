import type { Role, XPTrackType } from "@/generated/prisma/enums";

/** The prototype maps admin -> 'official' for XP/track purposes (Admin
 * users progress on the Official track) -- every other role name matches
 * its track name directly. */
export const ROLE_TO_XP_TRACK: Record<Role, XPTrackType> = {
  PLAYER: "PLAYER",
  COACH: "COACH",
  CREATOR: "CREATOR",
  ADMIN: "OFFICIAL",
};

export const ROLE_LABELS: Record<Role, string> = {
  PLAYER: "Player",
  COACH: "Coach",
  CREATOR: "Creator",
  ADMIN: "Admin",
};

export const DEFAULT_BADGE_CATEGORY: Record<Role, string> = {
  PLAYER: "player",
  COACH: "coach",
  CREATOR: "creator",
  ADMIN: "official",
};
