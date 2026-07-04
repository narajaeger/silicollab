import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Card, CardTitle, Badge, EmptyState, Avatar } from "@/components/ui";
import { TASK_STATUS_META } from "@/lib/constants";
import type { Task, ProjectMember, Profile } from "@/types/database";
import { Icon } from "@/components/Icon";

export default async function TasksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", id)
    .eq("user_id", user?.id ?? "")
    .maybeSingle();
  if (!membership) {
    return <EmptyState icon={<Icon name="lock" size={28} />} title="Khusus anggota" description="Bergabung dulu untuk melihat papan tugas." />;
  }

  const { data: members } = await supabase
    .from("project_members")
    .select("user_id, profile:profiles(full_name)")
    .eq("project_id", id);
  const memberList = ((members ?? []) as unknown as (Pick<ProjectMember, "user_id"> & {
    profile: Pick<Profile, "full_name"> | null;
  })[]).map((m) => ({ user_id: m.user_id, full_name: m.profile?.full_name ?? "Anggota" }));

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true });
  const taskList = (tasks ?? []) as Task[];

  // Beban kerja per anggota (tugas belum done)
  const workload = memberList.map((m) => ({
    ...m,
    active: taskList.filter((t) => t.assignee_id === m.user_id && t.status !== "done").length,
  }));

  // Timeline: tugas dengan deadline, urut naik
  const upcoming = taskList
    .filter((t) => t.due_date && t.status !== "done")
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <KanbanBoard projectId={id} members={memberList} initialTasks={taskList} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardTitle className="mb-3">Beban kerja tim</CardTitle>
          <ul className="space-y-2">
            {workload.map((w) => (
              <li key={w.user_id} className="flex items-center gap-3">
                <Avatar name={w.full_name} size={28} />
                <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{w.full_name}</span>
                <Badge tone={w.active > 3 ? "amber" : "slate"}>{w.active} tugas aktif</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle className="mb-3">Deadline terdekat</CardTitle>
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-500">Tidak ada deadline mendatang.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((t) => {
                const overdue = new Date(t.due_date!) < new Date();
                return (
                  <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-slate-700 dark:text-slate-300">{t.title}</span>
                    <Badge tone={overdue ? "rose" : "brand"}>
                      {new Date(t.due_date!).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
