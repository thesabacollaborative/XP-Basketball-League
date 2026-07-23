import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { computeQuizResult } from "@/lib/quiz";
import { ATTRIBUTE_LABELS, type AttributeKey } from "@/lib/attributes";
import { ROLE_LABELS, ROLE_TO_XP_TRACK } from "@/lib/roles";
import { EmptyState } from "@/components/EmptyState";

const CONFIDENCE_COLOR: Record<string, string> = {
  HIGH: "text-xp border-xp",
  MEDIUM: "text-fan border-fan",
  LOW: "text-danger border-danger",
};

export default async function MyCardPage() {
  const sessionUser = await requireUser();
  const user = await db.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  const activeRole = user.activeRole!;
  const track = ROLE_TO_XP_TRACK[activeRole];

  const [xpTrack, appliedResult] = await Promise.all([
    db.xPTrack.findUnique({ where: { userId_track: { userId: user.id, track } } }),
    db.quizResult.findFirst({
      where: { userId: user.id, appliedAt: { not: null } },
      orderBy: { appliedAt: "desc" },
    }),
  ]);

  const progressPct = xpTrack
    ? Math.max(0, Math.min(100, Math.round((xpTrack.xp / xpTrack.nextThreshold) * 100)))
    : 0;

  if (activeRole !== "PLAYER") {
    return (
      <div className="max-w-md">
        <div className="rounded-lg border border-line bg-surface p-6">
          <h2 className="mb-1 font-heading text-xl tracking-wide">
            {ROLE_LABELS[activeRole]} Card
          </h2>
          <p className="mb-4 text-sm text-chalk-dim">
            Level {xpTrack?.level ?? 0} · {xpTrack?.xp ?? 0}/{xpTrack?.nextThreshold ?? 150} XP
          </p>
          <div className="h-1.5 rounded-full bg-surface-raised">
            <div className="h-full rounded-full bg-xp" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>
    );
  }

  if (!appliedResult) {
    return (
      <EmptyState
        title="No player card yet"
        description="Take the Playstyle Quiz to set your archetype and unlock your card."
      />
    );
  }

  const [archetypes, attributes] = await Promise.all([
    db.archetype.findMany(),
    db.attribute.findMany({ where: { userId: user.id } }),
  ]);
  const archetypeMap = Object.fromEntries(archetypes.map((a) => [a.id, a]));
  const result = computeQuizResult(appliedResult.scores as Record<string, number>, archetypeMap);
  const top = archetypeMap[result.topArchetypeId];
  const second = appliedResult.isHybrid && appliedResult.secondArchetypeId
    ? archetypeMap[appliedResult.secondArchetypeId]
    : null;

  const displayName = appliedResult.isHybrid && appliedResult.nickname ? `"${appliedResult.nickname}"` : top.name;
  const playstyle = second
    ? `A hybrid build blending ${top.name} (${top.description}) with ${second.name} (${second.description})`
    : top.description;

  return (
    <div className="flex flex-wrap items-start gap-6">
      <div
        className="w-[280px] flex-none rounded-[22px] p-0.5"
        style={{
          background: "linear-gradient(160deg, var(--color-wood), var(--color-surface-raised) 40%, var(--color-xp))",
        }}
      >
        <div className="rounded-[20px] bg-gradient-to-b from-[#1A1E25] to-[#14171D] p-5">
          <div className="flex items-start justify-between">
            <div className="font-mono text-[11px] uppercase tracking-wide text-chalk-faint">
              LEVEL
              <b className="block font-display text-2xl leading-none text-xp">{xpTrack?.level ?? 0}</b>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-wood bg-surface-alt text-3xl">
              {top.icon}
            </div>
          </div>
          <div className="mt-3.5 font-display text-2xl">{user.name ?? "Player"}</div>
          <div className="mt-0.5 text-xs font-bold uppercase tracking-wide text-wood">
            {displayName}
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-x-3.5 gap-y-2">
            {result.emphasizeSet.slice(0, 6).map((key) => {
              const attr = attributes.find((a) => a.key === key);
              return (
                <div key={key} className="text-[11px]">
                  <div className="mb-0.5 flex justify-between">
                    <span className="text-chalk-dim">{ATTRIBUTE_LABELS[key as AttributeKey] ?? key}</span>
                    <b className="font-mono">{attr?.value ?? "—"}</b>
                  </div>
                  <div className="h-[5px] rounded-full bg-surface-raised">
                    <div className="h-full rounded-full bg-xp" style={{ width: `${attr?.value ?? 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-between border-t border-line pt-3.5 text-center">
            <div>
              <b className="block font-mono text-[15px]">{xpTrack?.xp ?? 0}</b>
              <span className="text-[9.5px] uppercase tracking-wide text-chalk-faint">XP</span>
            </div>
            <div>
              <b className="block font-mono text-[15px]">{xpTrack?.nextThreshold ?? 150}</b>
              <span className="text-[9.5px] uppercase tracking-wide text-chalk-faint">Next</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-w-[280px] flex-1 flex-col gap-4">
        <div className="rounded-lg border border-line bg-surface p-4">
          <h3 className="mb-1 font-heading text-base tracking-wide">Playstyle</h3>
          <p className="text-sm text-chalk-dim">{playstyle}</p>
          <Link
            href="/quiz"
            className="mt-2.5 inline-block rounded-sm border border-line bg-surface-alt px-3 py-1.5 text-xs font-semibold hover:border-wood"
          >
            Retake playstyle quiz
          </Link>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4">
          <h3 className="mb-1 font-heading text-base tracking-wide">Strengths</h3>
          <div className="flex flex-wrap gap-1.5">
            {result.emphasizeSet.map((key) => (
              <span
                key={key}
                className="rounded-full border border-line bg-surface-raised px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-chalk-dim"
              >
                {ATTRIBUTE_LABELS[key as AttributeKey] ?? key}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4">
          <h3 className="mb-1 font-heading text-base tracking-wide">All Attributes</h3>
          <p className="mb-3 text-xs text-chalk-dim">
            Confidence reflects how much verified evidence backs each number.
          </p>
          <div className="flex flex-col gap-3">
            {attributes.map((attr) => (
              <div key={attr.key}>
                <div className="mb-1 flex justify-between text-[12.5px]">
                  <span>{ATTRIBUTE_LABELS[attr.key as AttributeKey] ?? attr.key}</span>
                  <b className="font-mono">{attr.value}</b>
                </div>
                <div className="h-[5px] rounded-full bg-surface-raised">
                  <div className="h-full rounded-full bg-xp" style={{ width: `${attr.value}%` }} />
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-chalk-faint">
                  <span>{attr.evidenceReps.toLocaleString()} verified reps</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${CONFIDENCE_COLOR[attr.confidence]}`}
                  >
                    {attr.confidence.toLowerCase()} confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
