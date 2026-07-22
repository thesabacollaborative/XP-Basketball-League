import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
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

      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-6">
        <h1 className="mb-1 font-display text-2xl">Sign in</h1>
        <p className="mb-6 text-sm text-chalk-dim">
          We&apos;ll email you a link to sign in — no password needed.
        </p>
        <form
          action={async (formData) => {
            "use server";
            await signIn("resend", formData);
          }}
          className="flex flex-col gap-3"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="rounded-sm border border-line bg-surface-alt px-3 py-2 text-sm text-chalk outline-none focus:border-xp"
          />
          <button
            type="submit"
            className="rounded-sm bg-xp px-4 py-2 text-sm font-semibold text-[#0a0c0f] transition hover:brightness-110"
          >
            Send magic link
          </button>
        </form>
      </div>
    </main>
  );
}
