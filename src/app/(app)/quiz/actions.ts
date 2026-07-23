"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { computeQuizResult } from "@/lib/quiz";

export async function submitQuiz(scores: Record<string, number>) {
  const user = await requireUser();
  const archetypes = await db.archetype.findMany();
  const archetypeMap = Object.fromEntries(archetypes.map((a) => [a.id, a]));

  const result = computeQuizResult(scores, archetypeMap);

  const quizResult = await db.quizResult.create({
    data: {
      userId: user.id,
      topArchetypeId: result.topArchetypeId,
      secondArchetypeId: result.secondArchetypeId,
      isHybrid: result.isHybrid,
      nickname: result.nickname,
      scores,
    },
  });

  redirect(`/quiz/result/${quizResult.id}`);
}

export async function applyArchetype(quizResultId: string) {
  const user = await requireUser();
  const result = await db.quizResult.findUniqueOrThrow({ where: { id: quizResultId } });
  if (result.userId !== user.id) {
    throw new Error("Cannot apply a quiz result that isn't yours");
  }

  await db.quizResult.update({
    where: { id: quizResultId },
    data: { appliedAt: new Date() },
  });

  redirect("/mycard");
}
