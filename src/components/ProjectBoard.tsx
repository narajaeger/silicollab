"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { Card, Input, Select, Badge, EmptyState, cn } from "@/components/ui";
import { RESEARCH_FIELDS } from "@/lib/constants";
import type { Project } from "@/types/database";
import { Icon } from "@/components/Icon";

export type BoardProject = Project & { methods: string[] };

export function ProjectBoard({ projects }: { projects: BoardProject[] }) {
  const [q, setQ] = useState("");
  const [field, setField] = useState("");
  const [status, setStatus] = useState("");

  const allRoles = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.required_roles))).sort(),
    [projects]
  );
  const [role, setRole] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return projects.filter((p) => {
      if (field && p.field !== field) return false;
      if (status && p.status !== status) return false;
      if (role && !p.required_roles.includes(role)) return false;
      if (term) {
        const hay = [p.title, p.description, ...p.required_roles, ...p.methods].join(" ").toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [projects, q, field, status, role]);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-4">
        <Card className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Cari</label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Judul, metode..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Bidang</label>
            <Select value={field} onChange={(e) => setField(e.target.value)}>
              <option value="">Semua bidang</option>
              {RESEARCH_FIELDS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Status</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Semua status</option>
              <option value="open">Terbuka</option>
              <option value="in_progress">Berjalan</option>
              <option value="completed">Selesai</option>
            </Select>
          </div>
          {allRoles.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Role dibutuhkan</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setRole("")}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs",
                    role === "" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  Semua
                </button>
                {allRoles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs",
                      role === r ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </aside>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Badge tone="slate">{filtered.length} proyek</Badge>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={<Icon name="search" size={28} />} title="Tidak ada proyek cocok" description="Coba ubah filter atau kata kunci." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} methods={p.methods} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
