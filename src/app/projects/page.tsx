import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { ProjectBoard, type BoardProject } from "@/components/ProjectBoard";
import { LinkButton } from "@/components/ui";
import type { Project, ProjectMethod } from "@/types/database";

export default async function ProjectsBoardPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .in("status", ["open", "in_progress", "completed"])
    .order("created_at", { ascending: false });
  const projectList = (projects ?? []) as Project[];

  const { data: methods } = await supabase.from("project_methods").select("project_id, method_name");
  const methodList = (methods ?? []) as Pick<ProjectMethod, "project_id" | "method_name">[];
  const methodsByProject = new Map<string, string[]>();
  for (const m of methodList) {
    const arr = methodsByProject.get(m.project_id) ?? [];
    arr.push(m.method_name);
    methodsByProject.set(m.project_id, arr);
  }

  const board: BoardProject[] = projectList.map((p) => ({
    ...p,
    methods: methodsByProject.get(p.id) ?? [],
  }));

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Proyek terbuka</h1>
          <p className="text-sm text-slate-500">Temukan penelitian in silico yang mencari anggota.</p>
        </div>
        <LinkButton href="/projects/new">+ Ajukan proyek</LinkButton>
      </div>
      <ProjectBoard projects={board} />
    </AppShell>
  );
}
