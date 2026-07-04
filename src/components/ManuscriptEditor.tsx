"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, CardTitle, Input, Textarea, Select, Label, Badge, useToast, cn } from "@/components/ui";
import { MANUSCRIPT_STATUS_META, MANUSCRIPT_CHECKLIST_DEFAULT } from "@/lib/constants";
import { logActivity } from "@/lib/notify";
import type {
  Manuscript,
  ManuscriptStatus,
  AuthorEntry,
  ChecklistItem,
} from "@/types/database";

const STATUSES: ManuscriptStatus[] = ["draft", "submitted", "revision", "accepted", "rejected"];

export function ManuscriptEditor({
  projectId,
  initial,
  memberNames,
  methodsSuggestion,
  resultsSuggestion,
}: {
  projectId: string;
  initial: Manuscript | null;
  memberNames: string[];
  methodsSuggestion: string;
  resultsSuggestion: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  const [id, setId] = useState<string | null>(initial?.id ?? null);
  const [journal, setJournal] = useState(initial?.target_journal ?? "");
  const [status, setStatus] = useState<ManuscriptStatus>(initial?.status ?? "draft");
  const [authors, setAuthors] = useState<AuthorEntry[]>(
    initial?.authors?.length
      ? initial.authors
      : memberNames.map((name, i) => ({ name, order: i + 1, contribution: "", corresponding: i === 0 }))
  );
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    initial?.checklist?.length
      ? initial.checklist
      : MANUSCRIPT_CHECKLIST_DEFAULT.map((label) => ({ label, done: false }))
  );
  const [methods, setMethods] = useState(initial?.methods_draft ?? "");
  const [results, setResults] = useState(initial?.results_draft ?? "");
  const [abstract, setAbstract] = useState(initial?.abstract_draft ?? "");
  const [saving, setSaving] = useState(false);

  function setAuthor(i: number, patch: Partial<AuthorEntry>) {
    setAuthors((a) => a.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function addAuthor() {
    setAuthors((a) => [...a, { name: "", order: a.length + 1, contribution: "" }]);
  }
  function removeAuthor(i: number) {
    setAuthors((a) => a.filter((_, idx) => idx !== i).map((x, idx) => ({ ...x, order: idx + 1 })));
  }
  function moveAuthor(i: number, dir: -1 | 1) {
    setAuthors((a) => {
      const j = i + dir;
      if (j < 0 || j >= a.length) return a;
      const copy = [...a];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy.map((x, idx) => ({ ...x, order: idx + 1 }));
    });
  }
  function toggleCheck(i: number) {
    setChecklist((c) => c.map((x, idx) => (idx === i ? { ...x, done: !x.done } : x)));
  }

  async function save() {
    setSaving(true);
    const payload = {
      project_id: projectId,
      target_journal: journal || null,
      status,
      authors,
      checklist,
      methods_draft: methods || null,
      results_draft: results || null,
      abstract_draft: abstract || null,
      updated_at: new Date().toISOString(),
    };
    if (id) {
      await supabase.from("manuscript").update(payload).eq("id", id);
    } else {
      const { data } = await supabase.from("manuscript").insert(payload).select().single();
      if (data) setId((data as Manuscript).id);
    }
    await logActivity(supabase, projectId, "Manuskrip diperbarui", MANUSCRIPT_STATUS_META[status].label);
    setSaving(false);
    toast.push("Manuskrip disimpan.", "success");
    router.refresh();
  }

  const checkDone = checklist.filter((c) => c.done).length;
  const meta = MANUSCRIPT_STATUS_META[status];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardTitle className="mb-3">Draft Metode & Hasil</CardTitle>
          <div className="mb-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="subtle"
              onClick={() => {
                setMethods(methodsSuggestion || "Belum ada catatan reprodusibilitas untuk dirangkai.");
                toast.push("Draft Metode dihasilkan dari panel reprodusibilitas.", "info");
              }}
            >
              ⚙ Auto-draft Metode
            </Button>
            <Button
              size="sm"
              variant="subtle"
              onClick={() => {
                setResults(resultsSuggestion || "Belum ada tabel data untuk dirangkai.");
                toast.push("Draft Hasil dihasilkan dari tabel data.", "info");
              }}
            >
              📊 Auto-draft Hasil
            </Button>
          </div>
          <Label>Abstrak</Label>
          <Textarea rows={3} value={abstract} onChange={(e) => setAbstract(e.target.value)} className="mb-3" />
          <Label>Metode</Label>
          <Textarea rows={7} value={methods} onChange={(e) => setMethods(e.target.value)} className="mb-3" />
          <Label>Hasil</Label>
          <Textarea rows={7} value={results} onChange={(e) => setResults(e.target.value)} />
          <p className="mt-2 text-xs text-slate-400">
            Draft otomatis adalah bantuan awal — wajib diverifikasi & disunting peneliti.
          </p>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <CardTitle>Kontribusi penulis (authorship)</CardTitle>
            <Button size="sm" variant="outline" onClick={addAuthor}>+ Penulis</Button>
          </div>
          <ul className="space-y-2">
            {authors.map((a, i) => (
              <li key={i} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold dark:bg-slate-800">
                    {a.order}
                  </span>
                  <Input value={a.name} onChange={(e) => setAuthor(i, { name: e.target.value })} placeholder="Nama penulis" />
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => moveAuthor(i, -1)} className="px-1 text-slate-400 hover:text-slate-700">↑</button>
                    <button onClick={() => moveAuthor(i, 1)} className="px-1 text-slate-400 hover:text-slate-700">↓</button>
                    <button onClick={() => removeAuthor(i)} className="px-1 text-slate-400 hover:text-rose-600">✕</button>
                  </div>
                </div>
                <Input
                  className="mt-2 text-xs"
                  value={a.contribution ?? ""}
                  onChange={(e) => setAuthor(i, { contribution: e.target.value })}
                  placeholder="Kontribusi (mis. konseptualisasi, docking, penulisan)"
                />
                <label className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={!!a.corresponding}
                    onChange={(e) => setAuthor(i, { corresponding: e.target.checked })}
                  />
                  Corresponding author
                </label>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <CardTitle>Status submisi</CardTitle>
            <Badge tone={meta.tone}>{meta.label}</Badge>
          </div>
          <Label>Jurnal target</Label>
          <Input value={journal} onChange={(e) => setJournal(e.target.value)} placeholder="mis. Journal of Molecular Modeling" className="mb-3" />
          <Label>Status</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as ManuscriptStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{MANUSCRIPT_STATUS_META[s].label}</option>
            ))}
          </Select>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <CardTitle>Checklist submisi</CardTitle>
            <span className="text-xs text-slate-500">{checkDone}/{checklist.length}</span>
          </div>
          <ul className="space-y-2">
            {checklist.map((c, i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={c.done}
                    onChange={() => toggleCheck(i)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className={cn(c.done && "line-through opacity-60")}>{c.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </Card>

        <Button onClick={save} disabled={saving} className="w-full" size="lg">
          {saving ? "Menyimpan..." : "Simpan manuskrip"}
        </Button>
      </div>
    </div>
  );
}
