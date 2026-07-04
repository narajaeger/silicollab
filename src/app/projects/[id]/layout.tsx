import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { ProjectTabs } from "@/components/ProjectTabs";
import { Badge, LinkButton } from "@/components/ui";
import { PROJECT_STATUS_META } from "@/lib/constants";
import type { Project } from "@/types/database";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!project) notFound();
  const p = project as Project;

  const { data: membership } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", id)
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const isMember = !!membership;
  const meta = PROJECT_STATUS_META[p.status] ?? { label: p.status, tone: "slate" as const };

  return (
    <AppShell>
      <div className="mb-4">
        <Link href="/projects" className="text-sm text-slate-500 hover:text-brand-600">
          ← Semua proyek
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <Badge tone={meta.tone}>{meta.label}</Badge>
              {p.field && <span className="text-sm text-slate-500">{p.field}</span>}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{p.title}</h1>
          </div>
          {isMember && (
            <LinkButton href={`/projects/${id}/pipeline`} variant="outline" size="sm">
              Buka Pipeline
            </LinkButton>
          )}
        </div>
      </div>

      <ProjectTabs projectId={id} isMember={isMember} />
      {children}
    </AppShell>
  );
}
