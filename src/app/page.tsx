import { auth, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full font-display text-base"
          style={{
            background:
              "conic-gradient(from 220deg, var(--color-wood), var(--color-xp), var(--color-wood))",
            color: "#0a0c0f",
          }}
        >
          XP
        </div>
        <div className="font-heading text-lg tracking-wide">XP LEAGUE</div>
      </div>
      <h1 className="font-display text-4xl tracking-tight text-chalk">
        The XP Basketball League
      </h1>
      <p className="max-w-md text-center text-sm text-chalk-dim">
        Phase 0 scaffold — design tokens ported, auth wired, nav shell coming
        next.
      </p>

      {session?.user ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-line bg-surface p-4 text-sm">
          <p>
            Signed in as{" "}
            <span className="font-mono text-xp">{session.user.email}</span>
          </p>
          <p className="text-chalk-faint">
            Active role: {session.user.activeRole ?? "none set yet"}
          </p>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              type="submit"
              className="rounded-sm border border-line bg-surface-alt px-3 py-1.5 text-xs font-semibold hover:border-wood"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : (
        <a
          href="/login"
          className="rounded-sm bg-xp px-4 py-2 text-sm font-semibold text-[#0a0c0f] hover:brightness-110"
        >
          Sign in
        </a>
      )}

      <div className="flex gap-2">
        <span className="rounded-full border border-line bg-surface-alt px-3 py-1 font-mono text-xs">
          <span className="text-xp">●</span> xp
        </span>
        <span className="rounded-full border border-line bg-surface-alt px-3 py-1 font-mono text-xs">
          <span className="text-fan">●</span> fan
        </span>
        <span className="rounded-full border border-line bg-surface-alt px-3 py-1 font-mono text-xs">
          <span className="text-danger">●</span> danger
        </span>
        <span className="rounded-full border border-line bg-surface-alt px-3 py-1 font-mono text-xs">
          <span className="text-info">●</span> info
        </span>
      </div>
    </div>
  );
}
