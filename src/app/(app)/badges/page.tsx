import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { DEFAULT_BADGE_CATEGORY } from "@/lib/roles";
import { computeLiveBadgeProgress } from "@/lib/badges";

const CATEGORIES: Record<string, string> = {
  player: "Player",
  community: "Community",
  creator: "Creator",
  coach: "Coach",
  official: "Official",
};

function pct(progress: number, req: number) {
  return Math.max(0, Math.min(100, Math.round((progress / req) * 100)));
}

export default async function BadgesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sub?: string }>;
}) {
  const sessionUser = await requireUser();
  const user = await db.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  const { category: categoryParam, sub } = await searchParams;

  const category =
    categoryParam && categoryParam in CATEGORIES
      ? categoryParam
      : DEFAULT_BADGE_CATEGORY[user.activeRole!];

  const allInCategory = await db.badge.findMany({ where: { category } });
  const subs = category === "player" ? ["All", ...new Set(allInCategory.map((b) => b.sub ?? ""))] : null;
  const badges =
    subs && sub && sub !== "All" ? allInCategory.filter((b) => b.sub === sub) : allInCategory;

  const progress = await computeLiveBadgeProgress(
    user.id,
    badges.map((b) => b.id),
  );

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap gap-1.5 rounded-full border border-line bg-surface-alt p-1 w-fit">
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <Link
            key={key}
            href={`/badges?category=${key}`}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${
              category === key ? "bg-surface-raised text-chalk" : "text-chalk-dim hover:text-chalk"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {subs ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {subs.map((s) => (
            <Link
              key={s}
              href={`/badges?category=${category}${s === "All" ? "" : `&sub=${encodeURIComponent(s)}`}`}
              className={`rounded-full border px-3 py-1 text-[11.5px] font-semibold ${
                (sub ?? "All") === s
                  ? "border-xp text-chalk"
                  : "border-line bg-surface-alt text-chalk-dim"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b) => {
          const tiers = b.tiers as Array<{ name: string; req: number }>;
          const current = progress[b.id] ?? 0;
          return (
            <details key={b.id} className="group rounded-lg border border-line bg-surface p-4">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <div className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-md bg-surface-alt text-xl">
                    {b.icon}
                  </div>
                  <div>
                    <div className="font-heading text-base tracking-wide">{b.name}</div>
                    <div className="text-[11px] text-chalk-faint">{b.sub}</div>
                  </div>
                </div>
                <p className="mt-2.5 text-xs text-chalk-dim">{b.description}</p>
                <div className="group-open:hidden mt-2 inline-block rounded-full border border-line bg-surface-alt px-2.5 py-1 text-[10.5px] text-chalk-dim">
                  Tap to view tier progress
                </div>
              </summary>
              <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
                {tiers.map((t) => {
                  const done = current >= t.req;
                  return (
                    <div key={t.name} className="flex items-center gap-2.5 text-[11.5px]">
                      <div className={`w-16 flex-none ${done ? "text-xp" : "text-chalk-dim"}`}>
                        {t.name}
                      </div>
                      <div className="h-[5px] flex-1 rounded-full bg-surface-raised">
                        <div
                          className="h-full rounded-full bg-xp"
                          style={{ width: `${pct(current, t.req)}%` }}
                        />
                      </div>
                      <div className="w-24 flex-none text-right font-mono text-chalk-faint">
                        {Math.min(current, t.req).toLocaleString()}/{t.req.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
