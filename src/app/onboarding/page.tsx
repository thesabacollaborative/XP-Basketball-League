import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { requiresGuardianConsent } from "@/lib/consent";

const schema = z
  .object({
    dateOfBirth: z.coerce.date().max(new Date(), "Date of birth can't be in the future"),
    guardianEmail: z.string().email().optional().or(z.literal("")),
    guardianConsent: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!requiresGuardianConsent(data.dateOfBirth)) return true;
      return Boolean(data.guardianEmail) && data.guardianConsent === "on";
    },
    {
      message: "A guardian email and consent are required for players under 13.",
      path: ["guardianEmail"],
    },
  );

async function submit(formData: FormData) {
  "use server";

  const user = await requireUser();
  const parsed = schema.safeParse({
    dateOfBirth: formData.get("dateOfBirth") || undefined,
    guardianEmail: formData.get("guardianEmail") || undefined,
    guardianConsent: formData.get("guardianConsent") || undefined,
  });

  if (!parsed.success) {
    redirect(`/onboarding?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const { dateOfBirth, guardianEmail } = parsed.data;
  const needsConsent = requiresGuardianConsent(dateOfBirth);

  await db.user.update({
    where: { id: user.id },
    data: {
      dateOfBirth,
      guardianEmail: needsConsent ? guardianEmail : null,
      guardianConsentAt: needsConsent ? new Date() : null,
    },
  });

  redirect("/onboarding/role");
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireUser();
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-6">
        <h1 className="mb-1 font-display text-2xl">Before we start</h1>
        <p className="mb-6 text-sm text-chalk-dim">
          We need your date of birth. If you&apos;re under 13, we&apos;ll ask
          for a parent or guardian&apos;s email and consent before setting up
          your profile.
        </p>

        {error ? (
          <p className="mb-4 rounded-sm border border-danger bg-danger/10 px-3 py-2 text-xs text-danger">
            {error}
          </p>
        ) : null}

        <form action={submit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="dateOfBirth" className="mb-1 block text-xs uppercase tracking-wide text-chalk-faint">
              Date of birth
            </label>
            <input
              id="dateOfBirth"
              type="date"
              name="dateOfBirth"
              required
              max={new Date().toISOString().split("T")[0]}
              className="w-full rounded-sm border border-line bg-surface-alt px-3 py-2 text-sm text-chalk outline-none focus:border-xp"
            />
          </div>

          <div>
            <label htmlFor="guardianEmail" className="mb-1 block text-xs uppercase tracking-wide text-chalk-faint">
              Parent / guardian email (if under 13)
            </label>
            <input
              id="guardianEmail"
              type="email"
              name="guardianEmail"
              placeholder="guardian@example.com"
              className="w-full rounded-sm border border-line bg-surface-alt px-3 py-2 text-sm text-chalk outline-none focus:border-xp"
            />
          </div>

          <label className="flex items-start gap-2 text-xs text-chalk-dim">
            <input type="checkbox" name="guardianConsent" className="mt-0.5" />
            I am this player&apos;s parent or guardian and I consent to their
            profile being created (only required if under 13).
          </label>

          <button
            type="submit"
            className="rounded-sm bg-xp px-4 py-2 text-sm font-semibold text-[#0a0c0f] hover:brightness-110"
          >
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
