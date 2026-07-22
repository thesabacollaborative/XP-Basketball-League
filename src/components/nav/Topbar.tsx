"use client";

import { usePathname } from "next/navigation";
import { TITLES } from "@/lib/nav";

export function Topbar() {
  const pathname = usePathname();
  const id = pathname.split("/")[1] || "dashboard";
  const [title, sub] = TITLES[id] ?? TITLES.dashboard;

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-5 border-b border-line bg-bg/85 px-7 py-4 backdrop-blur-sm">
      <div>
        <div className="font-heading text-[25px] tracking-wide">{title}</div>
        <div className="mt-0.5 text-[12.5px] text-chalk-faint">{sub}</div>
      </div>
    </div>
  );
}
