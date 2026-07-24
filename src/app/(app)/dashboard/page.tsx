import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ROLE_DASHBOARD_COPY } from "@/lib/nav";

const TRACK_META: Record<string, { icon: string; label: string }> = {
  PLAYER: { icon: "🏀", label: "Player" },
  COMMUNITY: { icon: "🤝", label: "Community" },
  CREATOR: { icon: "🎬", label: "Creator" },
  COACH: { icon: "📋", label: "Coach" },
  OFFICIAL: { icon: "🎓", label: "Official" },
};
const TRACK_ORDER = ["PLAYER", "COMMUNITY", "CREATOR", "COACH", "OFFICIAL"];

const PATHWAY_LABELS: Record<string, string> = {
  ATHLETE: "Athlete",
  LEADERSHIP: "Leadership",
  COACHING: "Coaching",
  COMMUNITY: "Community",
  CREATOR: "Creator",
  PROFESSIONAL: "Professional",
};
const PATHWAY_ORDER = ["ATHLETE", "LEADERSHIP", "COACHING", "COMMUNITY", "CREATOR", "PROFESSIONAL"];

function pct(a: number, b: number) {
  return Math.max(0, Math.min(100, Math.round((a / b) * 100)));
}

export default async function DashboardPage() {
  const sessionUser = await requireUser();
  const user = await db.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  const role = user.activeRole!;
  const copy = ROLE_DASHBOARD_COPY[role];
  const words = copy.headline.split(" ");
  const headlineStart = words.slice(0, -2).join(" ");
  const headlineAccent = words.slice(-2).join(" ");

  const [xpTracks, pathways] = await Promise.all([
    db.xPTrack.findMany({ where: { userId: user.id } }),
    db.pathwayProgress.findMany({ where: { userId: user.id } }),
  ]);
  const tracksByType = Object.fromEntries(xpTracks.map((t) => [t.track, t]));
  const pathwaysByType = Object.fromEntries(pathways.map((p) => [p.pathway, p]));

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-lg border border-line bg-surface p-7">
        <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[3px] text-xp">
          {role} DASHBOARD
        </div>
        <h1 className="font-display text-3xl leading-tight md:text-4xl">
          {headlineStart} <span className="text-xp">{headlineAccent}</span>
        </h1>
        <p className="mt-2 max-w-lg text-sm text-chalk-dim">{copy.sub}</p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link
            href="/log"
            className="rounded-sm bg-xp px-4 py-2 text-sm font-semibold text-[#0a0c0f] hover:brightness-110"
          >
            📝 Log activity
          </Link>
          <Link
            href="/training"
            className="rounded-sm border border-line bg-surface-alt px-4 py-2 text-sm font-semibold hover:border-wood"
          >
            🎥 Open training &amp; clinics
          </Link>
          <Link
            href="/mycard"
            className="rounded-sm border border-line bg-surface-alt px-4 py-2 text-sm font-semibold hover:border-wood"
          >
            🪪 View your card
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface p-5">
          <h3 className="mb-1 font-heading text-lg tracking-wide">
            XP Progression <span className="ml-1 text-xs text-chalk-faint">5 tracks</span>
          </h3>
          <p className="mb-3 text-xs text-chalk-dim">
            Every way you show up earns XP on its own track.
          </p>
          {TRACK_ORDER.map((trackKey) => {
            const t = tracksByType[trackKey];
            const meta = TRACK_META[trackKey];
            if (!t) return null;
            return (
              <div key={trackKey} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-surface-alt text-base">
                  {meta.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-[12.5px]">
                    <span>
                      {meta.label} · Lvl {t.level}
                    </span>
                    <b className="font-mono text-xp">
                      {t.xp}/{t.nextThreshold} XP
                    </b>
                  </div>
                  <div className="h-[5px] rounded-full bg-surface-raised">
                    <div
                      className="h-full rounded-full bg-xp"
                      style={{ width: `${pct(t.xp, t.nextThreshold)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-line bg-surface p-5">
          <h3 className="mb-1 font-heading text-lg tracking-wide">
            Life Progression System <span className="ml-1 text-xs text-chalk-faint">6 pathways</span>
          </h3>
          <p className="mb-3 text-xs text-chalk-dim">
            Basketball is the medium — this is the real scoreboard.
          </p>
          {PATHWAY_ORDER.map((pathwayKey) => {
            const p = pathwaysByType[pathwayKey];
            if (!p) return null;
            return (
              <div key={pathwayKey} className="mb-3 flex items-center gap-3 last:mb-0">
                <div className="w-24 flex-none text-[12.5px] font-semibold">
                  {PATHWAY_LABELS[pathwayKey]}
                </div>
                <div className="h-[5px] flex-1 rounded-full bg-surface-raised">
                  <div className="h-full rounded-full bg-wood" style={{ width: `${p.percent}%` }} />
                </div>
                <div className="w-9 flex-none text-right font-mono text-xs text-chalk-faint">
                  {p.percent}%
                </div>
              </div>
            );
          })}
          <p className="mt-4 text-[11px] text-chalk-faint">
            Scoring function per pathway is still being designed (PRD 4.2) — these read real
            stored values, not a hand-set demo number, but nothing has moved them yet.
          </p>
        </div>
      </div>
    </div>
  );
}
