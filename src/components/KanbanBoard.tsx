"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Badge, Modal, Input, Textarea, Select, Label, Avatar, useToast, cn } from "@/components/ui";
import { TASK_STATUS_ORDER, TASK_STATUS_META, TASK_PRIORITY_META } from "@/lib/constants";
import { notifyUser, logActivity } from "@/lib/notify";
import type { Task, TaskStatus, TaskPriority } from "@/types/database";

type Member = { user_id: string; full_name: string };

export function KanbanBoard({
  projectId,
  members,
  initialTasks,
}: {
  projectId: string;
  members: Member[];
  initialTasks: Task[];
}) {
  const supabase = createClient();
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [dragId, setDragId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [due, setDue] = useState("");

  const nameOf = (id: string | null) =>
    members.find((m) => m.user_id === id)?.full_name ?? null;

  async function moveTo(status: TaskStatus) {
    if (!dragId) return;
    const t = tasks.find((x) => x.id === dragId);
    setTasks((prev) => prev.map((x) => (x.id === dragId ? { ...x, status } : x)));
    setDragId(null);
    await supabase.from("tasks").update({ status }).eq("id", dragId);
    if (t) await logActivity(supabase, projectId, "Tugas dipindah", `${t.title} → ${TASK_STATUS_META[status].label}`);
  }

  async function createTask() {
    if (!title.trim()) {
      toast.push("Judul tugas wajib.", "error");
      return;
    }
    const { data } = await supabase
      .from("tasks")
      .insert({
        project_id: projectId,
        title: title.trim(),
        description: desc.trim() || null,
        assignee_id: assignee || null,
        priority,
        due_date: due || null,
        status: "todo",
      })
      .select()
      .single();
    if (data) {
      setTasks((prev) => [...prev, data as Task]);
      if (assignee) {
        await notifyUser(supabase, assignee, {
          type: "task_assigned",
          title: "Tugas baru untukmu",
          body: title.trim(),
          link: `/projects/${projectId}/tasks`,
        });
      }
      await logActivity(supabase, projectId, "Tugas dibuat", title.trim());
    }
    setTitle("");
    setDesc("");
    setAssignee("");
    setPriority("medium");
    setDue("");
    setOpen(false);
    toast.push("Tugas dibuat.", "success");
  }

  async function removeTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">Seret kartu antar kolom untuk mengubah status.</p>
        <Button size="sm" onClick={() => setOpen(true)}>+ Tugas baru</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {TASK_STATUS_ORDER.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          return (
            <div
              key={col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => moveTo(col)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {TASK_STATUS_META[col].label}
                </span>
                <Badge tone="slate">{colTasks.length}</Badge>
              </div>
              <div className="space-y-2">
                {colTasks.map((t) => {
                  const pr = TASK_PRIORITY_META[t.priority];
                  const overdue = t.due_date && t.status !== "done" && new Date(t.due_date) < new Date();
                  return (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={() => setDragId(t.id)}
                      className={cn(
                        "group cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800",
                        dragId === t.id && "opacity-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t.title}</p>
                        <button
                          onClick={() => removeTask(t.id)}
                          className="text-xs text-slate-300 opacity-0 transition hover:text-rose-600 group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                      {t.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{t.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge tone={pr.tone}>{pr.label}</Badge>
                        {t.due_date && (
                          <Badge tone={overdue ? "rose" : "slate"}>
                            📅 {new Date(t.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </Badge>
                        )}
                        {nameOf(t.assignee_id) && (
                          <span className="ml-auto flex items-center gap-1">
                            <Avatar name={nameOf(t.assignee_id)!} size={20} />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <p className="py-4 text-center text-xs text-slate-400">Kosong</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tugas baru">
        <div className="space-y-3">
          <div>
            <Label>Judul</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Redocking validasi" />
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ditugaskan ke</Label>
              <Select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                <option value="">— Belum —</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>{m.full_name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Prioritas</Label>
              <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>Deadline</Label>
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={createTask}>Buat tugas</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
