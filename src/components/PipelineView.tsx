"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Badge, Modal, Input, Textarea, Label, EmptyState, useToast, cn } from "@/components/ui";
import { STAGE_STATUS_META } from "@/lib/constants";
import { logActivity } from "@/lib/notify";
import type { ResearchStage, StageStatus } from "@/types/database";
import { Icon } from "@/components/Icon";

const STATUS_OPTIONS: StageStatus[] = ["not_started", "in_progress", "done", "blocked"];

export function PipelineView({
  projectId,
  initialStages,
}: {
  projectId: string;
  initialStages: ResearchStage[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();
  const [stages, setStages] = useState<ResearchStage[]>(initialStages);
  const [dragId, setDragId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const done = stages.filter((s) => s.status === "done").length;
  const progress = stages.length ? Math.round((done / stages.length) * 100) : 0;

  async function setStatus(stage: ResearchStage, status: StageStatus) {
    setStages((prev) => prev.map((s) => (s.id === stage.id ? { ...s, status, is_done: status === "done" } : s)));
    await supabase
      .from("research_stages")
      .update({ status, is_done: status === "done" })
      .eq("id", stage.id);
    await logActivity(supabase, projectId, "Status tahap diperbarui", `${stage.name}: ${STAGE_STATUS_META[status].label}`);
    router.refresh();
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const from = stages.findIndex((s) => s.id === dragId);
    const to = stages.findIndex((s) => s.id === targetId);
    const reordered = [...stages];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setStages(reordered);
    setDragId(null);
    // Persist positions
    reordered.forEach((s, i) => {
      supabase.from("research_stages").update({ position: i }).eq("id", s.id);
    });
    toast.push("Urutan diperbarui.", "success");
  }

  async function addStage() {
    if (!newName.trim()) return;
    const { data } = await supabase
      .from("research_stages")
      .insert({
        project_id: projectId,
        name: newName.trim(),
        description: newDesc.trim() || null,
        position: stages.length,
      })
      .select()
      .single();
    if (data) {
      setStages((prev) => [...prev, data as ResearchStage]);
      await logActivity(supabase, projectId, "Tahap ditambahkan", newName.trim());
    }
    setNewName("");
    setNewDesc("");
    setAddOpen(false);
    toast.push("Tahap ditambahkan.", "success");
  }

  if (stages.length === 0) {
    return (
      <EmptyState
        icon={<Icon name="dna" size={28} />}
        title="Belum ada tahapan"
        description="Tambahkan tahap pertama untuk mulai menyusun pipeline."
        action={<Button onClick={() => setAddOpen(true)}>+ Tambah tahap</Button>}
      />
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Progres keseluruhan
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {progress}% · {done}/{stages.length} tahap
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Seret kartu untuk mengubah urutan.</p>
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>+ Tambah tahap</Button>
      </div>

      <div className="space-y-3">
        {stages.map((s, i) => {
          const meta = STAGE_STATUS_META[s.status];
          return (
            <div
              key={s.id}
              draggable
              onDragStart={() => setDragId(s.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(s.id)}
              className={cn(
                "group rounded-xl border bg-white p-4 shadow-sm transition dark:bg-slate-900",
                dragId === s.id ? "opacity-50" : "opacity-100",
                "border-slate-200 dark:border-slate-800"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: meta.hex }}
                  >
                    {i + 1}
                  </span>
                  {i < stages.length - 1 && <span className="mt-1 h-6 w-0.5 bg-slate-200 dark:bg-slate-700" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={`/projects/${projectId}/workspace/${s.id}`}
                      className="font-medium text-slate-900 hover:text-brand-600 dark:text-slate-100"
                    >
                      {s.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <select
                        value={s.status}
                        onChange={(e) => setStatus(s, e.target.value as StageStatus)}
                        className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                        aria-label="Ubah status"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>{STAGE_STATUS_META[st].label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {s.description && (
                    <p className="mt-1 text-sm text-slate-500">{s.description}</p>
                  )}
                  {s.suggested_tools.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {s.suggested_tools.map((t) => (
                        <Badge key={t} tone="slate">{t}</Badge>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/projects/${projectId}/workspace/${s.id}`}
                    className="mt-2 inline-block text-xs font-medium text-brand-600 hover:underline"
                  >
                    Buka workspace tahap <Icon name="arrow-right" size={13} className="inline align-[-2px]" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah tahap">
        <div className="space-y-3">
          <div>
            <Label>Nama tahap</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="mis. Analisis Sensitivitas" />
          </div>
          <div>
            <Label>Deskripsi (opsional)</Label>
            <Textarea rows={2} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button onClick={addStage}>Tambah</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
