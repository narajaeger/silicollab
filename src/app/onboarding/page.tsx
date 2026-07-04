"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardTitle, Button, Input, Select, Label, cn, useToast } from "@/components/ui";
import { RESEARCH_FIELDS } from "@/lib/constants";
import { TOOLS_REGISTRY } from "@/lib/tools-registry";
import type { University } from "@/types/database";
import { Icon } from "@/components/Icon";

const TOOL_NAMES = TOOLS_REGISTRY.map((t) => t.name);

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [universities, setUniversities] = useState<University[]>([]);
  const [fullName, setFullName] = useState("");
  const [uni, setUni] = useState("");
  const [program, setProgram] = useState("");
  const [semester, setSemester] = useState<number | "">("");
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("universities").select("*").order("name");
      setUniversities((data ?? []) as University[]);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (p) {
          setFullName(p.full_name || "");
          setUni(p.university_id || "");
          setProgram(p.study_program || "");
          setSemester(p.semester ?? "");
          setInterests(p.interests ?? []);
          setSkills(p.skills ?? []);
        }
      }
    })();
  }, [supabase]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  async function finish() {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        university_id: uni || null,
        study_program: program || null,
        semester: semester === "" ? null : Number(semester),
        interests,
        skills,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setSaving(false);
    toast.push("Profil siap! Selamat datang.", "success");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Selamat datang <Icon name="sparkles" size={22} className="inline align-[-2px] text-brand-500" /></h1>
          <p className="text-sm text-slate-500">Lengkapi profil singkat (langkah {step}/3) agar mudah ditemukan tim.</p>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className={cn("h-1.5 flex-1 rounded-full", n <= step ? "bg-brand-600" : "bg-slate-200 dark:bg-slate-800")} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <Card className="space-y-4">
            <CardTitle>Identitas</CardTitle>
            <div>
              <Label>Nama lengkap</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label>Universitas</Label>
              <Select value={uni} onChange={(e) => setUni(e.target.value)}>
                <option value="">Pilih universitas</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Program studi</Label>
                <Input value={program} onChange={(e) => setProgram(e.target.value)} placeholder="Pendidikan Dokter" />
              </div>
              <div>
                <Label>Semester</Label>
                <Input type="number" min={1} max={14} value={semester} onChange={(e) => setSemester(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>Lanjut</Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="space-y-4">
            <CardTitle>Bidang minat</CardTitle>
            <div className="flex flex-wrap gap-2">
              {RESEARCH_FIELDS.map((f) => (
                <button
                  key={f}
                  onClick={() => toggle(interests, setInterests, f)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm transition",
                    interests.includes(f) ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Kembali</Button>
              <Button onClick={() => setStep(3)}>Lanjut</Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="space-y-4">
            <CardTitle>Tool yang dikuasai</CardTitle>
            <p className="text-sm text-slate-500">Pilih tool yang kamu kuasai (bisa diubah nanti di profil).</p>
            <div className="flex max-h-72 flex-wrap gap-2 overflow-y-auto">
              {TOOL_NAMES.map((t) => (
                <button
                  key={t}
                  onClick={() => toggle(skills, setSkills, t)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm transition",
                    skills.includes(t) ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Kembali</Button>
              <Button variant="success" onClick={finish} disabled={saving}>
                {saving ? "Menyimpan..." : "Selesai & masuk dashboard"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
