"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Input, Textarea, Select, Label, useToast } from "@/components/ui";
import type { Profile, University } from "@/types/database";

export function ProfileForm({
  profile,
  universities,
}: {
  profile: Profile;
  universities: University[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [universityId, setUniversityId] = useState(profile?.university_id ?? "");
  const [studyProgram, setStudyProgram] = useState(profile?.study_program ?? "");
  const [semester, setSemester] = useState<number | "">(profile?.semester ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [interests, setInterests] = useState((profile?.interests ?? []).join(", "));
  const [skills, setSkills] = useState((profile?.skills ?? []).join(", "));
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        university_id: universityId || null,
        study_program: studyProgram || null,
        semester: semester === "" ? null : Number(semester),
        bio: bio || null,
        interests: interests.split(",").map((s) => s.trim()).filter(Boolean),
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
    setLoading(false);
    toast.push("Profil tersimpan.", "success");
    router.refresh();
  }

  return (
    <Card>
      <form onSubmit={save} className="space-y-4">
        <div>
          <Label>Nama lengkap</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <Label>Universitas</Label>
          <Select value={universityId} onChange={(e) => setUniversityId(e.target.value)}>
            <option value="">— Pilih —</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Program studi</Label>
            <Input value={studyProgram} onChange={(e) => setStudyProgram(e.target.value)} placeholder="Pendidikan Dokter" />
          </div>
          <div>
            <Label>Semester</Label>
            <Input type="number" min={1} max={14} value={semester}
              onChange={(e) => setSemester(e.target.value === "" ? "" : Number(e.target.value))} />
          </div>
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div>
          <Label>Bidang minat (pisahkan dengan koma)</Label>
          <Input value={interests} onChange={(e) => setInterests(e.target.value)}
            placeholder="Molecular Docking, Network Pharmacology" />
        </div>
        <div>
          <Label>Skill / tool (pisahkan dengan koma)</Label>
          <Input value={skills} onChange={(e) => setSkills(e.target.value)}
            placeholder="AutoDock Vina, PyMOL, Cytoscape, R" />
        </div>
        <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan profil"}</Button>
      </form>
    </Card>
  );
}
