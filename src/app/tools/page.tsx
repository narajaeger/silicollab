"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Input, Select, Badge, EmptyState, cn } from "@/components/ui";
import { TOOLS_REGISTRY, TOOL_CATEGORIES, LICENSE_LABEL } from "@/lib/tools-registry";
import type { ToolLicense } from "@/types/database";

const licenseTone: Record<ToolLicense, "emerald" | "amber" | "rose"> = {
  free: "emerald",
  academic: "amber",
  paid: "rose",
};

export default function ToolsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [lic, setLic] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return TOOLS_REGISTRY.filter((t) => {
      if (cat && t.category !== cat) return false;
      if (lic && t.license !== lic) return false;
      if (term) {
        const hay = [t.name, t.description, t.category, ...t.stages].join(" ").toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [q, cat, lic]);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Registry tool in silico</h1>
        <p className="text-sm text-slate-500">
          Katalog tool umum: fungsi, tahap penggunaan, lisensi, tautan resmi, dan tips.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari tool..." className="max-w-xs" />
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="max-w-xs">
          <option value="">Semua kategori</option>
          {TOOL_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <Select value={lic} onChange={(e) => setLic(e.target.value)} className="max-w-[160px]">
          <option value="">Semua lisensi</option>
          <option value="free">Gratis</option>
          <option value="academic">Akademik</option>
          <option value="paid">Berbayar</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🧰" title="Tidak ada tool cocok" description="Coba kata kunci atau filter lain." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <Card key={t.name} className="flex flex-col">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t.name}</h3>
                <Badge tone={licenseTone[t.license]}>{LICENSE_LABEL[t.license]}</Badge>
              </div>
              <Badge tone="slate" className="mb-2 self-start">{t.category}</Badge>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {t.stages.map((s) => (
                  <span key={s} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800">
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">💡 {t.tips}</p>
              <a
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("mt-3 text-sm font-medium text-brand-600 hover:underline")}
              >
                Situs resmi →
              </a>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
