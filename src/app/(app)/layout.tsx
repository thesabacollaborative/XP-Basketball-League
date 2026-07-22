import { requireOnboardedUser } from "@/lib/session";
import { Sidebar } from "@/components/nav/Sidebar";
import { Topbar } from "@/components/nav/Topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOnboardedUser();

  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar activeRole={user.activeRole!} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <div className="flex-1 px-7 py-6">{children}</div>
      </div>
    </div>
  );
}
