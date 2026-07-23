import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { DEFAULT_TRAIN_TAB, TRAINING_TABS, type TrainingCategory } from "@/lib/training";
import { completeTraining } from "@/app/(app)/training/actions";

export default async function TrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; completed?: string }>;
}) {
  const sessionUser = await requireUser();
  const user = await db.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  const { category: categoryParam, completed } = await searchParams;

  const category = (
    categoryParam && categoryParam in TRAINING_TABS
      ? categoryParam
      : DEFAULT_TRAIN_TAB[user.activeRole!]
  ) as TrainingCategory;

  const items = await db.trainingItem.findMany({
    where: { category },
    orderBy: { xp: "asc" },
  });

  return (
    <div>
      {completed ? (
        <p className="mb-5 rounded-sm border border-xp bg-xp/10 px-3 py-2 text-xs text-xp">
          &ldquo;{completed}&rdquo; recorded — XP awarded.
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-1.5 rounded-full border border-line bg-surface-alt p-1 w-fit">
        {Object.entries(TRAINING_TABS).map(([key, label]) => (
          <Link
            key={key}
            href={`/training?category=${key}`}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${
              category === key
                ? "bg-surface-raised text-chalk"
                : "text-chalk-dim hover:text-chalk"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-line bg-surface p-4">
            <div className="mb-3 flex h-[100px] items-center justify-center rounded-md bg-surface-alt text-2xl">
              ▶️
            </div>
            <h3 className="mb-2 flex items-center justify-between text-[14.5px] font-semibold">
              {item.title}
              <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase text-chalk-faint">
                {item.difficulty}
              </span>
            </h3>
            <div className="mb-3 flex flex-wrap gap-1.5">
              <span className="rounded-full border border-line bg-surface-alt px-2 py-0.5 text-[10.5px] text-chalk-dim">
                🎯 {item.skill}
              </span>
              {item.timeLabel ? (
                <span className="rounded-full border border-line bg-surface-alt px-2 py-0.5 text-[10.5px] text-chalk-dim">
                  ⏱ {item.timeLabel}
                </span>
              ) : null}
              {item.equipment ? (
                <span className="rounded-full border border-line bg-surface-alt px-2 py-0.5 text-[10.5px] text-chalk-dim">
                  🧰 {item.equipment}
                </span>
              ) : null}
              {item.recLevel ? (
                <span className="rounded-full border border-line bg-surface-alt px-2 py-0.5 text-[10.5px] text-chalk-dim">
                  Lvl {item.recLevel}
                </span>
              ) : null}
            </div>
            <div className="mb-3 text-[11.5px] text-chalk-faint">+{item.xp} XP</div>
            <form action={completeTraining.bind(null, item.id)}>
              <button
                type="submit"
                className="w-full rounded-sm bg-xp px-3 py-2 text-xs font-semibold text-[#0a0c0f] hover:brightness-110"
              >
                Mark complete &amp; record
              </button>
            </form>
          </div>
        ))}
      </div>

      <p className="mt-6 rounded-md border border-dashed border-line px-4 py-3 font-mono text-[11.5px] text-chalk-faint">
        <b className="text-chalk-dim">Dev note —</b> &ldquo;Mark complete&rdquo; simulates the
        recording step described in the Evidence &amp; Fair Play system. Real camera / witness
        confirmation before XP is granted is planned for a later phase.
      </p>
    </div>
  );
}
