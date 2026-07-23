import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { EmptyState } from "@/components/EmptyState";

export default async function ClipsPage() {
  const user = await requireUser();
  const clips = await db.clip.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (clips.length === 0) {
    return (
      <EmptyState
        title="No clips yet"
        description="Complete a drill in Training & Clinics to save your first one."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {clips.map((clip) => (
        <details key={clip.id} className="group rounded-lg border border-line bg-surface p-4">
          <summary className="cursor-pointer list-none">
            <div className="mb-2.5 flex h-[100px] items-center justify-center rounded-md bg-gradient-to-br from-surface-alt to-surface-raised text-2xl">
              🎬
            </div>
            <h3 className="text-[14.5px] font-semibold">{clip.title}</h3>
            <div className="mt-0.5 text-xs text-chalk-faint">
              {clip.createdAt.toLocaleDateString(undefined, { day: "numeric", month: "short" })} ·{" "}
              {clip.duration}
            </div>
            <div className="mt-2 inline-block rounded-full border border-line bg-surface-alt px-2.5 py-1 text-[10.5px] text-chalk-dim group-open:hidden">
              Tap to watch &amp; see notes
            </div>
          </summary>
          <div className="mt-2.5 border-t border-line pt-2.5 text-xs leading-relaxed text-chalk-dim">
            ▶️ Playing locally — visible only to you.
            <br />
            <br />
            {clip.notes}
          </div>
        </details>
      ))}
    </div>
  );
}
