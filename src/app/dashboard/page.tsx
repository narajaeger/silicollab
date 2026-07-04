import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { ProjectCard } from "@/components/ProjectCard";
import { Card, CardTitle, Badge, LinkButton, EmptyState } from "@/components/ui";
import type { Project, ProjectMember, Task, ActivityLog, Profile, Application } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .maybeSingle();

  const { data: memberships } = await supabase
    .from("project_members")
    .select("project:projects(*)")
    .eq("user_id", user!.id);
  const projects = ((memberships ?? []) as unknown as { project: Project | null }[])
    .map((m) => m.project)
    .filter((p): p is Project => !!p);
  const projectIds = projects.map((p) => p.id);

  // Tugas saya (belum selesai)
  let myTasks: (Task & { project: Pick<Project, "id" | "title"> | null })[] = [];
  if (projectIds.length > 0) {
    const { data } = await supabase
      .from("tasks")
      .select("*, project:projects(id, title)")
      .eq("assignee_id", user!.id)
      .neq("status", "done")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(8);
    myTasks = (data ?? []) as unknown as typeof myTasks;
  }

  // Aktivitas terbaru dari proyek saya
  let activity: (ActivityLog & { actor: Pick<Profile, "full_name"> | null })[] = [];
  if (projectIds.length > 0) {
    const { data } = await supabase
      .from("activity_log")
      .select("*, actor:profiles(full_name)")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false })
      .limit(8);
    activity = (data ?? []) as unknown as typeof activity;
  }

  // Lamaran masuk ke proyek yang saya miliki
  const ownedIds = projects.filter((p) => p.owner_id === user!.id).map((p) => p.id);
  let pendingApps: (Application & { project: Pick<Project, "id" | "title"> | null })[] = [];
  if (ownedIds.length > 0) {
    const { data } = await supabase
      .from("applications")
      .select("*, project:projects(id, title)")
      .in("project_id", ownedIds)
      .eq("status", "pending");
    pendingApps = (data ?? []) as unknown as typeof pendingApps;
  }

  const firstName = (profile?.full_name || "").split(" ")[0] || "Peneliti";

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Halo, {firstName} 👋</h1>
          <p className="text-sm text-slate-500">Ringkasan proyek, tugas, dan aktivitas kamu.</p>
        </div>
        <LinkButton href="/projects/new">+ Proyek baru</LinkButton>
      </div>

      {pendingApps.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            📥 Ada <strong>{pendingApps.length}</strong> lamaran menunggu keputusan.{" "}
            <Link href={`/projects/${pendingApps[0].project?.id}`} className="font-medium underline">
              Tinjau sekarang
            </Link>
          </p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <CardTitle>Proyek saya</CardTitle>
            <Link href="/projects" className="text-sm text-brand-600 hover:underline">Jelajahi proyek →</Link>
          </div>
          {projects.length === 0 ? (
            <EmptyState
              icon="🧪"
              title="Belum ada proyek"
              description="Buat proyek dari template metode atau gabung proyek terbuka."
              action={<LinkButton href="/projects/new">Buat proyek</LinkButton>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle className="mb-3">Tugas jatuh tempo</CardTitle>
            {myTasks.length === 0 ? (
              <p className="text-sm text-slate-500">Tidak ada tugas aktif.</p>
            ) : (
              <ul className="space-y-2">
                {myTasks.map((t) => {
                  const overdue = t.due_date && new Date(t.due_date) < new Date();
                  return (
                    <li key={t.id}>
                      <Link href={`/projects/${t.project?.id}/tasks`} className="block rounded-lg border border-slate-200 p-2.5 text-sm hover:border-brand-300 dark:border-slate-800">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{t.title}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="truncate text-xs text-slate-500">{t.project?.title}</span>
                          {t.due_date && (
                            <Badge tone={overdue ? "rose" : "slate"}>
                              {new Date(t.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <CardTitle className="mb-3">Aktivitas terbaru</CardTitle>
            {activity.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada aktivitas.</p>
            ) : (
              <ul className="space-y-2.5">
                {activity.map((a) => (
                  <li key={a.id} className="text-sm">
                    <span className="text-slate-700 dark:text-slate-300">
                      <span className="font-medium">{a.actor?.full_name || "Seseorang"}</span> {a.action.toLowerCase()}
                    </span>
                    {a.detail && <span className="text-slate-400"> · {a.detail}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
