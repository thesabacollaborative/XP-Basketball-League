import type { Role, XPTrackType } from "@/generated/prisma/enums";

export const TRAINING_TABS = {
  drills: "Drills",
  clinics: "Coaching Clinics",
  content: "Content Tutorials",
  officiating: "Officiating Modules",
} as const;

export type TrainingCategory = keyof typeof TRAINING_TABS;

export const CATEGORY_TO_XP_TRACK: Record<TrainingCategory, XPTrackType> = {
  drills: "PLAYER",
  clinics: "COACH",
  content: "CREATOR",
  officiating: "OFFICIAL",
};

export const CATEGORY_TO_ROLE: Record<TrainingCategory, Role> = {
  drills: "PLAYER",
  clinics: "COACH",
  content: "CREATOR",
  officiating: "ADMIN",
};

export const DEFAULT_TRAIN_TAB: Record<Role, TrainingCategory> = {
  PLAYER: "drills",
  COACH: "clinics",
  CREATOR: "content",
  ADMIN: "officiating",
};
