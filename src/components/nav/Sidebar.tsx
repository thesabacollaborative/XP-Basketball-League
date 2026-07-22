"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS, ROLE_META } from "@/lib/nav";
import type { Role } from "@/generated/prisma/enums";

export function Sidebar({ activeRole }: { activeRole: Role }) {
  const pathname = usePathname();
  const role = ROLE_META[activeRole];

  return (
    <aside className="sticky top-0 flex h-screen w-sidebar flex-none flex-col border-r border-line bg-surface">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
        <div
          className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full font-display text-[15px]"
          style={{
            background:
              "conic-gradient(from 220deg, var(--color-wood), var(--color-xp), var(--color-wood))",
            color: "#0a0c0f",
          }}
        >
          XP
        </div>
        <div className="font-heading leading-none tracking-wide">
          <b className="block text-lg text-chalk">XP LEAGUE</b>
          <span className="mt-0.5 block text-[10.5px] uppercase tracking-[2px] text-chalk-faint">
            Basketball OS
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {NAV_GROUPS.map((g) => (
          <div key={g.group}>
            <div className="px-2.5 pb-1 pt-3 text-[10px] uppercase tracking-[1.5px] text-chalk-faint">
              {g.group}
            </div>
            {g.links.map((l) => {
              const href = `/${l.id}`;
              const active = pathname === href;
              return (
                <Link
                  key={l.id}
                  href={href}
                  className={`mb-0.5 flex items-center gap-2.5 rounded-sm border px-3 py-2 text-[13.5px] font-medium transition-colors ${
                    active
                      ? "border-line bg-surface-alt text-chalk"
                      : "border-transparent text-chalk-dim hover:bg-surface-alt hover:text-chalk"
                  }`}
                >
                  <span className={`w-[18px] text-center text-sm ${active ? "text-xp" : ""}`}>
                    {l.icon}
                  </span>
                  {l.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-3.5">
        <Link
          href="/onboarding/role"
          className="flex items-center gap-2.5 rounded-md border border-line bg-surface-alt px-2.5 py-2 hover:border-wood"
        >
          <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-surface-raised text-[15px]">
            {role.icon}
          </div>
          <div className="min-w-0 leading-tight">
            <b className="block truncate text-[13px] text-chalk">{role.label} mode</b>
            <span className="text-[11px] uppercase tracking-wide text-chalk-faint">
              Switch role
            </span>
          </div>
        </Link>
        <div className="mt-2.5 text-center text-[9.5px] tracking-wide text-chalk-faint">
          Run by <span className="text-chalk-dim">Full-Court Community</span>
        </div>
      </div>
    </aside>
  );
}
