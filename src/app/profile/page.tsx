import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { ProfileForm } from "@/components/ProfileForm";
import { Card, CardTitle, Badge, Avatar } from "@/components/ui";
import type { Profile, University, ProjectMember, Project } from "@/types/database";
import { Icon } from "@/components/Icon";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/profile");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const p = profile as Profile;
  const { data: universities } = await supabase.from("universities").select("*").order("name");

  const { data: memberships } = await supabase
    .from("project_members")
    .select("project:projects(status)")
    .eq("user_id", user.id);
  const mem = ((memberships ?? []) as unknown as { project: Pick<Project, "status"> | null }[]);
  const total = mem.length;
  const done = mem.filter((m) => m.project?.status === "completed").length;

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Profil saya</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfileForm profile={p} universities={(universities ?? []) as University[]} />
        </div>
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3">
              <Avatar name={p?.full_name || "?"} size={48} />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{p?.full_name || "Tanpa nama"}</p>
                <p className="text-xs text-slate-500">{p?.study_program}</p>
              </div>
            </div>
          </Card>
          <Card>
            <CardTitle className="mb-3">Reputasi</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge tone="violet">{total} proyek diikuti</Badge>
              <Badge tone="emerald"><Icon name="medal" size={13} className="inline align-[-2px]" /> {done} proyek selesai</Badge>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
