import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

/**
 * Full onboarding = DOB captured (minor consent gate cleared) AND a role
 * chosen. Redirects to whichever step is missing.
 */
export async function requireOnboardedUser() {
  const sessionUser = await requireUser();
  const user = await db.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

  if (!user.dateOfBirth) redirect("/onboarding");
  if (!user.activeRole) redirect("/onboarding/role");

  return user;
}
