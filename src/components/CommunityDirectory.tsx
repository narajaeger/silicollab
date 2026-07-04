"use client";

import { useMemo, useState } from "react";
import { Card, Input, Select, Badge, Avatar, EmptyState } from "@/components/ui";

export type Researcher = {
  id: string;
  full_name: string;
  university: string | null;
  study_program: string | null;
  semester: number | null;
  interests: string[];
  skills: string[];
  projectCount: number;
  completedCount: number;
};

export function CommunityDirectory({
  researchers,
  universities,
  initialQuery = "",
}: {
  researchers: Researcher[];
  universities: string[];
  initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [uni, setUni] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return researchers.filter((r) => {
      if (uni && r.university !== uni) return false;
      if (term) {
        const hay = [r.full_name, r.university, r.study_program, ...r.interests, ...r.skills]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [researchers, q, uni]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama, skill, atau tool (mis. AutoDock, Cytoscape)..."
          className="max-w-md"
        />
        <Select value={uni} onChange={(e) => setUni(e.target.value)} className="max-w-xs">
          <option value="">Semua universitas</option>
          {universities.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🧑‍🔬" title="Tidak ada peneliti cocok" description="Coba kata kunci skill/tool lain." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center gap-3">
                <Avatar name={r.full_name} size={44} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{r.full_name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {[r.study_program, r.semester ? `Smt ${r.semester}` : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              {r.university && <p className="mt-2 text-xs text-slate-500">🎓 {r.university}</p>}

              {r.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {r.skills.slice(0, 5).map((s) => (
                    <Badge key={s} tone="brand">{s}</Badge>
                  ))}
                </div>
              )}
              {r.interests.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.interests.slice(0, 3).map((s) => (
                    <Badge key={s} tone="slate">{s}</Badge>
                  ))}
                </div>
              )}

              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Badge tone="violet">{r.projectCount} proyek</Badge>
                {r.completedCount > 0 && <Badge tone="emerald">🏅 {r.completedCount} selesai</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
