"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardTitle, Button, Badge, Select, useToast } from "@/components/ui";
import { STAGE_STATUS_META } from "@/lib/constants";
import { logActivity } from "@/lib/notify";
import type { ChecklistItem, ResearchStage, StageStatus } from "@/types/database";

const STATUS_OPTIONS: StageStatus[] = ["not_started", "in_progress", "done", "blocked"];

export function StageControls({
  projectId,
  stage,
}: {
  projectId: string;
  stage: ResearchStage;
}) {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();
  const [status, setStatusState] = useState<StageStatus>(stage.status);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(stage.param_checklist ?? []);

  const doneCount = checklist.filter((c) => c.done).length;

  async function changeStatus(next: StageStatus) {
    setStatusState(next);
    await supabase
      .from("research_stages")
      .update({ status: next, is_done: next === "done" })
      .eq("id", stage.id);
    await logActivity(supabase, projectId, "Status tahap", `${stage.name}: ${STAGE_STATUS_META[next].label}`);
    toast.push("Status diperbarui.", "success");
    router.refresh();
  }

  async function toggleItem(i: number) {
    const next = checklist.map((c, idx) => (idx === i ? { ...c, done: !c.done } : c));
    setChecklist(next);
    await supabase.from("research_stages").update({ param_checklist: next }).eq("id", stage.id);
  }

  async function markDone() {
    if (doneCount < checklist.length) {
      toast.push("Masih ada parameter wajib yang belum dicentang.", "error");
      return;
    }
    await changeStatus("done");
  }

  const meta = STAGE_STATUS_META[status];

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <CardTitle>Status tahap</CardTitle>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>
      <Select value={status} onChange={(e) => changeStatus(e.target.value as StageStatus)} className="mb-4">
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{STAGE_STATUS_META[s].label}</option>
        ))}
      </Select>

      {checklist.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Checklist parameter
            </span>
            <span className="text-xs text-slate-500">{doneCount}/{checklist.length}</span>
          </div>
          <ul className="space-y-1.5">
            {checklist.map((c, i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={c.done}
                    onChange={() => toggleItem(i)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className={c.done ? "line-through opacity-60" : ""}>{c.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status !== "done" && (
        <Button variant="success" className="w-full" onClick={markDone}>
          ✓ Tandai tahap selesai
        </Button>
      )}
    </Card>
  );
}
