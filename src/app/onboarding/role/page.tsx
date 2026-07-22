import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { setActiveRole } from "@/lib/onboarding";
import type { Role } from "@/generated/prisma/enums";

const ROLES: { id: Role; icon: string; title: string; desc: string }[] = [
  {
    id: "PLAYER",
    icon: "🏀",
    title: "Player",
    desc: "Log games, train, level up your Player Card and chase fans & badges.",
  },
  {
    id: "COACH",
    icon: "📋",
    title: "Coach",
    desc: "Guide athletes, run sessions, grow your Coach XP and reputation.",
  },
  {
    id: "CREATOR",
    icon: "🎬",
    title: "Creator",
    desc: "Film highlights, grow fans, build your Creator track and brand.",
  },
  {
    id: "ADMIN",
    icon: "🗂️",
    title: "Admin",
    desc: "Run leagues, courts and events on the Official track.",
  },
];

async function pickRole(formData: FormData) {
  "use server";
  const user = await requireUser();
  const role = formData.get("role") as Role;
  await setActiveRole(user.id, role);
  redirect("/dashboard");
}

export default async function RolePickerPage() {
  const user = await requireUser();
  const dbUser = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!dbUser.dateOfBirth) redirect("/onboarding");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="max-w-2xl text-center">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[3px] text-xp">
          The XP Basketball League · The League OS
        </div>
        <h1 className="font-display text-4xl leading-tight md:text-5xl">
          One league.
          <br />
          <span className="text-wood">Every way to level up.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-chalk-dim">
          Basketball is the medium — the real product is your progression.
          Pick how you&apos;re joining the league to get your dashboard,
          badges, training and leaderboard set up.
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-2 gap-3.5 text-left md:grid-cols-4">
        {ROLES.map((r) => (
          <form key={r.id} action={pickRole}>
            <input type="hidden" name="role" value={r.id} />
            <button
              type="submit"
              className="w-full rounded-lg border-[1.5px] border-line bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-xp"
            >
              <div className="mb-2.5 text-2xl">{r.icon}</div>
              <b className="block font-heading text-base tracking-wide">{r.title}</b>
              <p className="mt-1 text-[11.5px] leading-snug text-chalk-faint">{r.desc}</p>
            </button>
          </form>
        ))}
      </div>
    </main>
  );
}
