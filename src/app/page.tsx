import { redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/session";

export default async function Home() {
  await requireOnboardedUser();
  redirect("/dashboard");
}
