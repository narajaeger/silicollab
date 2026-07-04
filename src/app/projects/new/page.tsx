"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button, Card, CardTitle, Input, Textarea, Select, Label, Badge, cn, useToast } from "@/components/ui";
import { RESEARCH_FIELDS, SUGGESTED_ROLES } from "@/lib/constants";
import { METHOD_TEMPLATES, METHOD_CATEGORIES, type TemplateStage } from "@/lib/method-templates";

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [field, setField] = useState<string>(RESEARCH_FIELDS[0]);
  const [roles, setRoles] = useState<string[]>([]);
  const [maxMembers, setMaxMembers] = useState(5);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(["molecular_docking"]);
  const [loading, setLoading] = useState(false);

  function toggleRole(r: string) {
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }
  function toggleMethod(key: string) {
    setSelectedMethods((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  }

  // Gabungkan tahapan dari metode terpilih (dedup berdasarkan nama).
  const generatedStages = useMemo(() => {
    const seen = new Set<string>();
    const out: (TemplateStage & { method_key: string })[] = [];
    for (const key of selectedMethods) {
      const tmpl = METHOD_TEMPLATES.find((m) => m.key === key);
      if (!tmpl) continue;
      for (const s of tmpl.stages) {
        const norm = s.name.toLowerCase();
        if (seen.has(norm)) continue;
        seen.add(norm);
        out.push({ ...s, method_key: key });
      }
    }
    return out;
  }, [selectedMethods]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedMethods.length === 0) {
      toast.push("Pilih minimal satu metode.", "error");
      return;
    }
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: project, error: pErr } = await supabase
      .from("projects")
      .insert({
        owner_id: user.id,
        title,
        description,
        field,
        required_roles: roles,
        max_members: maxMembers,
      })
      .select()
      .single();

    if (pErr || !project) {
      toast.push(pErr?.message ?? "Gagal membuat proyek.", "error");
      setLoading(false);
      return;
    }

    // Simpan metode
    await supabase.from("project_methods").insert(
      selectedMethods.map((key) => ({
        project_id: project.id,
        method_key: key,
        method_name: METHOD_TEMPLATES.find((m) => m.key === key)?.name ?? key,
      }))
    );

    // Generate stages
    await supabase.from("research_stages").insert(
      generatedStages.map((s, i) => ({
        project_id: project.id,
        name: s.name,
        description: s.description,
        position: i,
        method_key: s.method_key,
        suggested_tools: s.suggestedTools,
        param_checklist: s.paramChecklist.map((label) => ({ label, done: false })),
      }))
    );

    toast.push("Proyek dibuat!", "success");
    router.push(`/projects/${project.id}/pipeline`);
    router.refresh();
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Ajukan proyek penelitian
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Pilih metode in silico, dan pipeline tahapan akan tersusun otomatis (bisa diedit nanti).
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="space-y-4">
            <div>
              <Label>Judul</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="mis. Network pharmacology jamu X untuk diabetes"
              />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Latar belakang, tujuan, dan ekspektasi keluaran (mis. publikasi)."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Bidang</Label>
                <Select value={field} onChange={(e) => setField(e.target.value)}>
                  {RESEARCH_FIELDS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Maksimal anggota</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <Label>Posisi yang dicari</Label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_ROLES.map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => toggleRole(r)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition",
                      roles.includes(r)
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-1">Metode in silico</CardTitle>
            <p className="mb-4 text-sm text-slate-500">
              Pilih satu atau lebih. Tahapan dari metode terpilih akan digabung.
            </p>
            <div className="space-y-4">
              {METHOD_CATEGORIES.map((cat) => (
                <div key={cat}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {cat}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {METHOD_TEMPLATES.filter((m) => m.category === cat).map((m) => {
                      const on = selectedMethods.includes(m.key);
                      return (
                        <button
                          type="button"
                          key={m.key}
                          onClick={() => toggleMethod(m.key)}
                          className={cn(
                            "rounded-lg border p-3 text-left transition",
                            on
                              ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30"
                              : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {m.name}
                            </span>
                            <span
                              className={cn(
                                "flex h-4 w-4 items-center justify-center rounded border text-[10px]",
                                on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"
                              )}
                            >
                              {on ? "✓" : ""}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{m.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {generatedStages.length > 0 && (
            <Card>
              <CardTitle className="mb-3">
                Pipeline yang akan dibuat ({generatedStages.length} tahap)
              </CardTitle>
              <ol className="space-y-2">
                {generatedStages.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{s.name}</p>
                      {s.suggestedTools.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {s.suggestedTools.slice(0, 4).map((t) => (
                            <Badge key={t} tone="slate">{t}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} size="lg">
              {loading ? "Menyimpan..." : "Buat proyek & pipeline"}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
