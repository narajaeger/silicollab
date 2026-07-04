"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Input, Select, Label, useToast } from "@/components/ui";
import type { ColumnDef, ColumnType } from "@/types/database";

function slugify(label: string, idx: number) {
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return base || `col_${idx}`;
}

type Col = { label: string; type: ColumnType; options: string };

export function NewTableForm({ stageId }: { stageId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [cols, setCols] = useState<Col[]>([
    { label: "Senyawa", type: "text", options: "" },
    { label: "Binding Affinity (kcal/mol)", type: "number", options: "" },
  ]);
  const [loading, setLoading] = useState(false);

  function addCol() {
    setCols((c) => [...c, { label: "", type: "text", options: "" }]);
  }
  function setCol(i: number, patch: Partial<Col>) {
    setCols((c) => c.map((col, idx) => (idx === i ? { ...col, ...patch } : col)));
  }
  function removeCol(i: number) {
    setCols((c) => c.filter((_, idx) => idx !== i));
  }

  async function create() {
    setLoading(true);
    const columns: ColumnDef[] = cols
      .filter((c) => c.label.trim())
      .map((c, i) => {
        const def: ColumnDef = { key: slugify(c.label, i), label: c.label.trim(), type: c.type };
        if (c.type === "select") {
          def.options = c.options.split(",").map((o) => o.trim()).filter(Boolean);
        }
        return def;
      });

    await supabase.from("data_tables").insert({ stage_id: stageId, name: name || "Tabel data", columns });
    setLoading(false);
    setOpen(false);
    setName("");
    toast.push("Tabel dibuat.", "success");
    router.refresh();
  }

  if (!open) return <Button variant="outline" onClick={() => setOpen(true)}>+ Tabel data baru</Button>;

  return (
    <Card className="bg-slate-50 dark:bg-slate-800/40">
      <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Tabel data baru</h3>
      <Label>Nama tabel</Label>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Hasil Docking" className="mb-4" />

      <Label>Kolom</Label>
      <div className="space-y-2">
        {cols.map((c, i) => (
          <div key={i} className="space-y-1">
            <div className="flex gap-2">
              <Input value={c.label} onChange={(e) => setCol(i, { label: e.target.value })} placeholder="Nama kolom" />
              <Select
                className="w-28 shrink-0"
                value={c.type}
                onChange={(e) => setCol(i, { type: e.target.value as ColumnType })}
              >
                <option value="text">Teks</option>
                <option value="number">Angka</option>
                <option value="url">URL</option>
                <option value="select">Pilihan</option>
              </Select>
              <button onClick={() => removeCol(i)} className="px-2 text-slate-400 hover:text-rose-600">×</button>
            </div>
            {c.type === "select" && (
              <Input
                value={c.options}
                onChange={(e) => setCol(i, { options: e.target.value })}
                placeholder="Opsi dipisah koma, mis. Aktif, Tidak aktif"
                className="text-xs"
              />
            )}
          </div>
        ))}
      </div>
      <button onClick={addCol} className="mt-2 text-sm text-brand-600 hover:underline">+ kolom</button>

      <div className="mt-4 flex gap-2">
        <Button onClick={create} disabled={loading}>{loading ? "Menyimpan..." : "Buat tabel"}</Button>
        <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
      </div>
    </Card>
  );
}
