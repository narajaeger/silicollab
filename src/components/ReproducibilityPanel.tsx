"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, CardTitle, Input, Textarea, Label, useToast } from "@/components/ui";
import type { StageReproducibility } from "@/types/database";

export function ReproducibilityPanel({
  stageId,
  initial,
}: {
  stageId: string;
  initial: StageReproducibility | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();
  const [r, setR] = useState<Partial<StageReproducibility>>(initial ?? {});
  const [loading, setLoading] = useState(false);

  function set<K extends keyof StageReproducibility>(key: K, val: string) {
    setR((prev) => ({ ...prev, [key]: val }));
  }

  async function save() {
    setLoading(true);
    const payload = {
      stage_id: stageId,
      tool_name: r.tool_name ?? null,
      tool_version: r.tool_version ?? null,
      os_hardware: r.os_hardware ?? null,
      parameters: r.parameters ?? null,
      input_link: r.input_link ?? null,
      output_link: r.output_link ?? null,
      notes: r.notes ?? null,
      updated_at: new Date().toISOString(),
    };
    if (r.id) {
      await supabase.from("stage_reproducibility").update(payload).eq("id", r.id);
    } else {
      const { data } = await supabase.from("stage_reproducibility").insert(payload).select().single();
      if (data) setR(data as StageReproducibility);
    }
    setLoading(false);
    toast.push("Reprodusibilitas disimpan.", "success");
    router.refresh();
  }

  return (
    <Card>
      <CardTitle className="mb-1">Reprodusibilitas</CardTitle>
      <p className="mb-3 text-xs text-slate-500">
        Catatan ini akan dirangkai menjadi draft bagian Metode.
      </p>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Tool</Label>
            <Input value={r.tool_name ?? ""} onChange={(e) => set("tool_name", e.target.value)} placeholder="AutoDock Vina" />
          </div>
          <div>
            <Label>Versi</Label>
            <Input value={r.tool_version ?? ""} onChange={(e) => set("tool_version", e.target.value)} placeholder="1.2.5" />
          </div>
        </div>
        <div>
          <Label>OS / Hardware</Label>
          <Input value={r.os_hardware ?? ""} onChange={(e) => set("os_hardware", e.target.value)} placeholder="Ubuntu 22.04, i7, 16GB" />
        </div>
        <div>
          <Label>Parameter kunci</Label>
          <Textarea
            rows={3}
            value={r.parameters ?? ""}
            onChange={(e) => set("parameters", e.target.value)}
            placeholder="mis. grid box 25×25×25 Å, exhaustiveness 8, seed 42"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Input (tautan)</Label>
            <Input value={r.input_link ?? ""} onChange={(e) => set("input_link", e.target.value)} placeholder="Drive/Zenodo/URL" />
          </div>
          <div>
            <Label>Output (tautan)</Label>
            <Input value={r.output_link ?? ""} onChange={(e) => set("output_link", e.target.value)} placeholder="Drive/Zenodo/URL" />
          </div>
        </div>
        <div>
          <Label>Catatan</Label>
          <Textarea rows={2} value={r.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
        </div>
        <Button onClick={save} disabled={loading} className="w-full">
          {loading ? "Menyimpan..." : "Simpan reprodusibilitas"}
        </Button>
      </div>
    </Card>
  );
}
