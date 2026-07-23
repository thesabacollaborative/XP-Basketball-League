import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ROLE_LABELS } from "@/lib/roles";
import {
  COACH_SESSION_TYPES,
  CREATOR_CONTENT_TYPES,
  GAME_TYPES,
  OFFICIAL_ROLES,
} from "@/lib/activity-types";
import { logActivity, submitMilestone } from "@/app/(app)/log/actions";
import { ComeUpCycle } from "@/components/log/ComeUpCycle";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5">
      <label className="mb-1 block text-xs uppercase tracking-wide text-chalk-faint">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-sm border border-line bg-surface-alt px-3 py-2 text-sm text-chalk outline-none focus:border-xp";

function PlayerFields() {
  return (
    <>
      <Field label="Game type">
        <select name="type" className={inputClass} defaultValue={GAME_TYPES[4]}>
          {GAME_TYPES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Points">
          <input name="pts" type="number" min={0} defaultValue={0} className={inputClass} />
        </Field>
        <Field label="Assists">
          <input name="ast" type="number" min={0} defaultValue={0} className={inputClass} />
        </Field>
        <Field label="Rebounds">
          <input name="reb" type="number" min={0} defaultValue={0} className={inputClass} />
        </Field>
        <Field label="Minutes">
          <input name="min" type="number" min={0} defaultValue={20} className={inputClass} />
        </Field>
      </div>
      <Field label="Result">
        <input name="result" placeholder="e.g. W 21–17" className={inputClass} />
      </Field>
      <Field label="Confirmed by">
        <input
          name="witness"
          required
          placeholder="Opponent or referee name — required for XP"
          className={inputClass}
        />
      </Field>
    </>
  );
}

function CoachFields() {
  return (
    <>
      <Field label="Session type">
        <select name="type" className={inputClass} defaultValue={COACH_SESSION_TYPES[0]}>
          {COACH_SESSION_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Athletes attended">
          <input name="attendees" type="number" min={0} defaultValue={1} className={inputClass} />
        </Field>
        <Field label="Duration (min)">
          <input name="min" type="number" min={0} defaultValue={45} className={inputClass} />
        </Field>
      </div>
      <Field label="Notes">
        <textarea name="notes" rows={2} placeholder="What did the session cover?" className={inputClass} />
      </Field>
      <Field label="Confirmed by">
        <input
          name="witness"
          required
          placeholder="An athlete or league admin — required for XP"
          className={inputClass}
        />
      </Field>
    </>
  );
}

function CreatorFields() {
  return (
    <>
      <Field label="Content type">
        <select name="type" className={inputClass} defaultValue={CREATOR_CONTENT_TYPES[0]}>
          {CREATOR_CONTENT_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Platform">
          <input name="platform" placeholder="e.g. league app feed" className={inputClass} />
        </Field>
        <Field label="Views (est.)">
          <input name="views" type="number" min={0} defaultValue={0} className={inputClass} />
        </Field>
      </div>
      <Field label="Link / notes">
        <input name="notes" placeholder="Optional link or description" className={inputClass} />
      </Field>
    </>
  );
}

function AdminFields() {
  return (
    <>
      <Field label="Match type officiated">
        <select name="type" className={inputClass} defaultValue={GAME_TYPES[4]}>
          {GAME_TYPES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Role">
          <select name="offrole" className={inputClass} defaultValue={OFFICIAL_ROLES[0]}>
            {OFFICIAL_ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="Disputes mediated">
          <input name="disputes" type="number" min={0} defaultValue={0} className={inputClass} />
        </Field>
      </div>
      <Field label="Confirmed by">
        <input
          name="witness"
          required
          placeholder="Another official or league admin — required for XP"
          className={inputClass}
        />
      </Field>
    </>
  );
}

const ROLE_FIELDS = {
  PLAYER: PlayerFields,
  COACH: CoachFields,
  CREATOR: CreatorFields,
  ADMIN: AdminFields,
};

export default async function LogActivityPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    logged?: string;
    milestoneSubmitted?: string;
    cycleTab?: string;
    reflected?: string;
  }>;
}) {
  const sessionUser = await requireUser();
  const user = await db.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  const role = user.activeRole!;
  const { error, logged, milestoneSubmitted, cycleTab, reflected } = await searchParams;

  const [milestones, submissions, recentLogs, lastReflection] = await Promise.all([
    db.milestone.findMany({ orderBy: { xp: "asc" } }),
    db.milestoneSubmission.findMany({ where: { userId: user.id } }),
    db.activityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.reflectionEntry.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const submissionByMilestone = Object.fromEntries(submissions.map((s) => [s.milestoneId, s]));

  const RoleFields = ROLE_FIELDS[role];
  const initialCycleTab =
    cycleTab === "perform" || cycleTab === "reflect" ? cycleTab : "prepare";

  return (
    <div className="flex flex-col gap-8">
      {error ? (
        <p className="rounded-sm border border-danger bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </p>
      ) : null}
      {logged ? (
        <p className="rounded-sm border border-xp bg-xp/10 px-3 py-2 text-xs text-xp">
          Logged — XP awarded and recorded to your history below.
        </p>
      ) : null}
      {milestoneSubmitted ? (
        <p className="rounded-sm border border-fan bg-fan/10 px-3 py-2 text-xs text-fan">
          Submitted — high-value achievements are always reviewed by a league admin before XP is granted.
        </p>
      ) : null}
      {reflected ? (
        <p className="rounded-sm border border-xp bg-xp/10 px-3 py-2 text-xs text-xp">
          Reflection logged — carried into next session&apos;s Preparation step. +15 XP
        </p>
      ) : null}

      <div>
        <h2 className="mb-1 font-heading text-xl tracking-wide">The Come-Up Cycle</h2>
        <p className="mb-4 text-sm text-chalk-dim">
          Prepare, perform and reflect — every session, in three short steps.
        </p>
        <ComeUpCycle
          cueWord={user.cueWord}
          growthSeed={lastReflection?.journalWhatWillChange ?? null}
          initialTab={initialCycleTab}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface p-5">
          <h3 className="mb-1 font-heading text-lg tracking-wide">
            Log as {ROLE_LABELS[role]}
          </h3>
          <p className="mb-4 text-xs text-chalk-dim">
            Every entry needs confirmation from someone else before XP is granted.
          </p>
          <form action={logActivity}>
            <RoleFields />
            <button
              type="submit"
              className="mt-1 w-full rounded-sm bg-xp px-4 py-2.5 text-sm font-semibold text-[#0a0c0f] hover:brightness-110"
            >
              Save &amp; submit for confirmation
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-line bg-surface p-5">
          <h3 className="mb-3 font-heading text-lg tracking-wide">Recent activity</h3>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-chalk-faint">Nothing logged yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="border-b border-line pb-3 last:border-0">
                  <div className="flex items-center justify-between text-[13px]">
                    <span>{log.type}</span>
                    <b className="font-mono text-xp">+{log.xpAwarded} XP</b>
                  </div>
                  <div className="mt-0.5 text-[11px] text-chalk-faint">
                    {log.tier.toLowerCase()} tier
                    {log.witnessName ? ` · confirmed by ${log.witnessName}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-1 font-heading text-xl tracking-wide">
          Major Milestones <span className="ml-1 text-xs text-chalk-faint">Up to 10,000 XP</span>
        </h2>
        <p className="mb-4 text-sm text-chalk-dim">
          Rare, high-value achievements — always reviewed by a league admin before XP is granted, not self-awarded.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {milestones.map((m) => {
            const submission = submissionByMilestone[m.id];
            return (
              <div key={m.id} className="rounded-lg border border-line bg-surface p-4">
                <h3 className="mb-1 text-[14.5px] font-semibold">{m.title}</h3>
                <p className="mb-2 text-xs text-chalk-dim">{m.description}</p>
                <div className="mb-2.5 inline-block rounded-full border border-line bg-surface-alt px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-chalk-dim">
                  +{m.xp.toLocaleString()} XP · {m.track.toLowerCase()} track
                </div>
                {submission ? (
                  <div
                    className={`rounded-full border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${
                      submission.status === "APPROVED"
                        ? "border-xp text-xp"
                        : submission.status === "REJECTED"
                          ? "border-danger text-danger"
                          : "border-fan text-fan"
                    }`}
                  >
                    {submission.status === "APPROVED"
                      ? "Approved — XP granted"
                      : submission.status === "REJECTED"
                        ? "Not approved"
                        : "Pending admin review"}
                  </div>
                ) : (
                  <form action={submitMilestone.bind(null, m.id)}>
                    <button
                      type="submit"
                      className="w-full rounded-sm border border-line bg-surface-alt px-3 py-1.5 text-xs font-semibold hover:border-wood"
                    >
                      Submit for review
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
