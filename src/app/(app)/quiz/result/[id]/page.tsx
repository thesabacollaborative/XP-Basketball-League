import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { computeGrowthAreas, computeQuizResult, recommendDrills } from "@/lib/quiz";
import { ATTRIBUTE_LABELS, type AttributeKey } from "@/lib/attributes";
import { applyArchetype } from "@/app/(app)/quiz/actions";

export default async function QuizResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const quizResult = await db.quizResult.findUnique({ where: { id } });
  if (!quizResult) notFound();
  if (quizResult.userId !== user.id) redirect("/quiz");

  const [archetypes, attributes, drillPool] = await Promise.all([
    db.archetype.findMany(),
    db.attribute.findMany({ where: { userId: user.id } }),
    db.trainingItem.findMany({ where: { category: "drills" } }),
  ]);
  const archetypeMap = Object.fromEntries(archetypes.map((a) => [a.id, a]));

  const result = computeQuizResult(quizResult.scores as Record<string, number>, archetypeMap);
  const top = archetypeMap[result.topArchetypeId];
  const second = result.isHybrid && result.secondArchetypeId ? archetypeMap[result.secondArchetypeId] : null;

  const displayName = result.isHybrid && result.nickname ? `"${result.nickname}"` : top.name;
  const displayIcon = second ? `${top.icon}${second.icon}` : top.icon;
  const displayDesc = second
    ? `A hybrid build: mostly ${top.name.toLowerCase()} (${top.description}) with real ${second.name.toLowerCase()} tendencies too (${second.description})`
    : top.description;

  const attributeValues = Object.fromEntries(attributes.map((a) => [a.key, a.value]));
  const growthAreas = computeGrowthAreas(attributeValues, result.emphasizeSet);
  const drills = recommendDrills(result.emphasizeSet, drillPool);
  const tips = second ? [top.tip, second.tip] : [top.tip];
  const topScoreForBar = result.sortedScores[0]?.[1] || 1;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg border border-line bg-surface p-6">
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl">{displayIcon}</div>
          <h1 className="font-display text-3xl">{displayName}</h1>
          {second ? (
            <span className="mt-2 inline-block rounded-full border border-line bg-surface-alt px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-chalk-dim">
              Hybrid build
            </span>
          ) : null}
          <p className="mx-auto mt-3 max-w-md text-sm text-chalk-dim">{displayDesc}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 font-heading text-base tracking-wide">Your top matches</h3>
            {result.sortedScores.slice(0, 4).map(([archId, score]) => (
              <div key={archId} className="mb-2">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span>
                    {archetypeMap[archId]?.icon} {archetypeMap[archId]?.name}
                  </span>
                  <b className="font-mono">{score} pts</b>
                </div>
                <div className="mt-1 h-[5px] rounded-full bg-surface-raised">
                  <div
                    className="h-full rounded-full bg-xp"
                    style={{ width: `${Math.max(0, Math.min(100, Math.round((score / topScoreForBar) * 100)))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="mb-2 font-heading text-base tracking-wide">Character strengths</h3>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {result.emphasizeSet.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-line bg-surface-raised px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-chalk-dim"
                >
                  {ATTRIBUTE_LABELS[a as AttributeKey] ?? a}
                </span>
              ))}
            </div>
            <h3 className="mb-2 font-heading text-base tracking-wide">Growth areas</h3>
            <div className="flex flex-wrap gap-1.5">
              {growthAreas.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-danger px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-danger"
                >
                  {ATTRIBUTE_LABELS[a as AttributeKey] ?? a}
                </span>
              ))}
            </div>
          </div>
        </div>

        <h3 className="mb-2 mt-7 font-heading text-base tracking-wide">
          Training methodology — how to lean into this build
        </h3>
        {tips.map((t, i) => (
          <p key={i} className="mb-2 text-sm text-chalk-dim">
            {t}
          </p>
        ))}

        {drills.length ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {drills.map((d) => (
              <div key={d.id} className="rounded-md border border-line bg-surface-alt p-3">
                <div className="flex items-center justify-between text-[13.5px] font-semibold">
                  {d.title}
                  <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase text-chalk-faint">
                    {d.difficulty}
                  </span>
                </div>
                <div className="mt-1 text-xs text-chalk-faint">
                  {d.skill} · +{d.xp} XP
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2.5">
          <form action={applyArchetype.bind(null, quizResult.id)}>
            <button
              type="submit"
              className="rounded-sm bg-xp px-4 py-2 text-sm font-semibold text-[#0a0c0f] hover:brightness-110"
            >
              Set as my archetype
            </button>
          </form>
          <Link
            href="/quiz"
            className="rounded-sm border border-line bg-surface-alt px-4 py-2 text-sm font-semibold hover:border-wood"
          >
            Retake quiz
          </Link>
        </div>
      </div>
    </div>
  );
}
