"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, CardTitle, Input, useToast } from "@/components/ui";
import type { Attachment } from "@/types/database";

export function AttachmentsPanel({
  stageId,
  projectId,
  initial,
}: {
  stageId: string;
  projectId: string;
  initial: Attachment[];
}) {
  const supabase = createClient();
  const toast = useToast();
  const [items, setItems] = useState<Attachment[]>(initial);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function addLink() {
    if (!label.trim() || !url.trim()) {
      toast.push("Isi label & tautan.", "error");
      return;
    }
    const { data } = await supabase
      .from("attachments")
      .insert({ stage_id: stageId, project_id: projectId, label: label.trim(), url: url.trim(), kind: "link" })
      .select()
      .single();
    if (data) setItems((p) => [...p, data as Attachment]);
    setLabel("");
    setUrl("");
    toast.push("Tautan ditambahkan.", "success");
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${projectId}/${stageId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("attachments").upload(path, file);
    if (error) {
      toast.push(`Upload gagal: ${error.message}. Pastikan bucket "attachments" ada.`, "error");
      setUploading(false);
      return;
    }
    const { data: pub } = supabase.storage.from("attachments").getPublicUrl(path);
    const { data } = await supabase
      .from("attachments")
      .insert({ stage_id: stageId, project_id: projectId, label: file.name, url: pub.publicUrl, kind: "file" })
      .select()
      .single();
    if (data) setItems((p) => [...p, data as Attachment]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    toast.push("File terunggah.", "success");
  }

  async function remove(id: string) {
    await supabase.from("attachments").delete().eq("id", id);
    setItems((p) => p.filter((a) => a.id !== id));
  }

  return (
    <Card>
      <CardTitle className="mb-3">Lampiran & tautan</CardTitle>
      {items.length === 0 ? (
        <p className="mb-3 text-sm text-slate-500">Belum ada lampiran.</p>
      ) : (
        <ul className="mb-3 space-y-2">
          {items.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-brand-600 hover:underline">
                {a.kind === "file" ? "📎" : "🔗"} {a.label}
              </a>
              <button onClick={() => remove(a.id)} className="text-xs text-slate-400 hover:text-rose-600">✕</button>
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-2">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (mis. File input GROMACS)" />
        <div className="flex gap-2">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL Drive/Zenodo/GitHub" />
          <Button onClick={addLink}>Tautkan</Button>
        </div>
        <input ref={fileRef} type="file" onChange={uploadFile} className="hidden" />
        <Button variant="subtle" className="w-full" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? "Mengunggah..." : "Atau unggah file"}
        </Button>
      </div>
    </Card>
  );
}
