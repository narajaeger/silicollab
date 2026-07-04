"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, CardTitle, Input, Label, Modal, EmptyState, useToast } from "@/components/ui";
import { toBibTeX, toVancouver, downloadText, fetchDoiMetadata } from "@/lib/references";
import type { Reference } from "@/types/database";

export function ReferencesManager({
  projectId,
  initial,
}: {
  projectId: string;
  initial: Reference[];
}) {
  const supabase = createClient();
  const toast = useToast();
  const [refs, setRefs] = useState<Reference[]>(initial);
  const [open, setOpen] = useState(false);
  const [doi, setDoi] = useState("");
  const [importing, setImporting] = useState(false);
  const [form, setForm] = useState<Partial<Reference>>({});

  function setField<K extends keyof Reference>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: k === "year" ? (v ? Number(v) : null) : v }));
  }

  async function importDoi() {
    if (!doi.trim()) return;
    setImporting(true);
    try {
      const meta = await fetchDoiMetadata(doi);
      setForm({
        title: meta.title,
        authors: meta.authors,
        year: meta.year,
        journal: meta.journal,
        doi: meta.doi,
      });
      toast.push("Metadata DOI terisi. Periksa lalu simpan.", "success");
    } catch {
      toast.push("Gagal mengambil DOI. Isi manual.", "error");
    }
    setImporting(false);
  }

  async function save() {
    if (!form.title?.trim()) {
      toast.push("Judul wajib diisi.", "error");
      return;
    }
    const { data } = await supabase
      .from("references")
      .insert({
        project_id: projectId,
        title: form.title!.trim(),
        authors: form.authors ?? null,
        year: form.year ?? null,
        journal: form.journal ?? null,
        doi: form.doi ?? null,
        url: form.url ?? null,
      })
      .select()
      .single();
    if (data) setRefs((p) => [...p, data as Reference]);
    setForm({});
    setDoi("");
    setOpen(false);
    toast.push("Referensi ditambahkan.", "success");
  }

  async function remove(id: string) {
    await supabase.from("references").delete().eq("id", id);
    setRefs((p) => p.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">{refs.length} referensi</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={refs.length === 0}
            onClick={() => downloadText("references.bib", toBibTeX(refs), "text/plain")}
          >
            Export BibTeX
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={refs.length === 0}
            onClick={() => downloadText("daftar-pustaka-vancouver.txt", toVancouver(refs), "text/plain")}
          >
            Vancouver
          </Button>
          <Button size="sm" onClick={() => setOpen(true)}>+ Referensi</Button>
        </div>
      </div>

      {refs.length === 0 ? (
        <EmptyState
          icon="📚"
          title="Belum ada referensi"
          description="Tambahkan referensi manual atau impor lewat DOI, lalu ekspor BibTeX / Vancouver."
          action={<Button onClick={() => setOpen(true)}>+ Tambah referensi</Button>}
        />
      ) : (
        <ol className="space-y-2">
          {refs.map((r, i) => (
            <li key={r.id}>
              <Card className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {i + 1}. {r.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {[r.authors, r.journal, r.year].filter(Boolean).join(" · ")}
                  </p>
                  {r.doi && (
                    <a
                      href={`https://doi.org/${r.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-600 hover:underline"
                    >
                      doi:{r.doi}
                    </a>
                  )}
                </div>
                <button onClick={() => remove(r.id)} className="text-xs text-slate-400 hover:text-rose-600">
                  ✕
                </button>
              </Card>
            </li>
          ))}
        </ol>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah referensi">
        <div className="space-y-3">
          <div>
            <Label>Impor via DOI</Label>
            <div className="flex gap-2">
              <Input value={doi} onChange={(e) => setDoi(e.target.value)} placeholder="10.1016/j.xxxx" />
              <Button variant="subtle" onClick={importDoi} disabled={importing}>
                {importing ? "..." : "Ambil"}
              </Button>
            </div>
          </div>
          <hr className="border-slate-200 dark:border-slate-800" />
          <div>
            <Label>Judul</Label>
            <Input value={form.title ?? ""} onChange={(e) => setField("title", e.target.value)} />
          </div>
          <div>
            <Label>Penulis</Label>
            <Input value={form.authors ?? ""} onChange={(e) => setField("authors", e.target.value)} placeholder="Nama1; Nama2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tahun</Label>
              <Input type="number" value={form.year ?? ""} onChange={(e) => setField("year", e.target.value)} />
            </div>
            <div>
              <Label>Jurnal</Label>
              <Input value={form.journal ?? ""} onChange={(e) => setField("journal", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>URL (opsional)</Label>
            <Input value={form.url ?? ""} onChange={(e) => setField("url", e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
