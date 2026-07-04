"use client";

import { usePathname } from "next/navigation";
import { TabLink } from "@/components/ui";

export function ProjectTabs({ projectId, isMember }: { projectId: string; isMember: boolean }) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  const tabs = [
    { href: base, label: "Overview", always: true },
    { href: `${base}/pipeline`, label: "Pipeline", always: false },
    { href: `${base}/tasks`, label: "Tugas", always: false },
    { href: `${base}/chat`, label: "Chat", always: false },
    { href: `${base}/references`, label: "Referensi", always: false },
    { href: `${base}/publication`, label: "Publikasi", always: false },
    { href: `${base}/activity`, label: "Aktivitas", always: false },
  ].filter((t) => t.always || isMember);

  function active(href: string) {
    if (href === base) return pathname === base;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="mb-6 flex gap-5 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
      {tabs.map((t) => (
        <TabLink key={t.href} href={t.href} active={active(t.href)}>
          {t.label}
        </TabLink>
      ))}
    </div>
  );
}
