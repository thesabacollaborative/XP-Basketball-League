"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { awardXP } from "@/lib/award-xp";
import { classifyXPTier } from "@/lib/xp";
import { CATEGORY_TO_ROLE, CATEGORY_TO_XP_TRACK, type TrainingCategory } from "@/lib/training";

/**
 * "Mark complete" simulates the recording step described in PRD 4.5's
 * Evidence & Fair Play system, exactly as the prototype's dev-note flags
 * it -- no witness/camera confirmation gate yet. Repeat-completion XP
 * farming is the same diminishing-returns gap already noted in
 * CLAUDE.md as deferred to Phase 2, not a new one introduced here.
 */
export async function completeTraining(trainingItemId: string) {
  const user = await requireUser();
  const item = await db.trainingItem.findUniqueOrThrow({ where: { id: trainingItemId } });
  const category = item.category as TrainingCategory;
  const track = CATEGORY_TO_XP_TRACK[category];
  const role = CATEGORY_TO_ROLE[category];
  const tier = classifyXPTier(item.xp);

  await db.activityLog.create({
    data: {
      userId: user.id,
      role,
      type: item.title,
      tier,
      xpAwarded: item.xp,
      track,
    },
  });

  await db.trainingCompletion.create({
    data: { userId: user.id, trainingItemId: item.id },
  });

  if (category === "drills") {
    const durationSec = 30 + Math.floor(Math.random() * 30);
    await db.clip.create({
      data: {
        userId: user.id,
        title: item.title,
        duration: `0:${durationSec.toString().padStart(2, "0")}`,
        notes: "Recorded and saved to your personal catalogue for review.",
      },
    });
  }

  await awardXP(user.id, track, item.xp);

  redirect(`/training?category=${category}&completed=${encodeURIComponent(item.title)}`);
}
