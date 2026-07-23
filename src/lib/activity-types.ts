/** Ported verbatim from the prototype's gameTypes array and the option
 * lists in viewLog()'s per-role <select> fields. */
export const GAME_TYPES = [
  "1v1",
  "2v2",
  "3v3",
  "4v4",
  "5v5",
  "HORSE",
  "21",
  "American 21",
  "King of the Court",
  "Pickup",
  "League",
  "Tournament",
] as const;

export const COACH_SESSION_TYPES = ["Skill clinic", "Team practice", "1-on-1 mentoring"] as const;

export const CREATOR_CONTENT_TYPES = ["Highlight clip", "Livestream", "Interview", "Recap"] as const;

export const OFFICIAL_ROLES = ["Referee", "Scorekeeper"] as const;
