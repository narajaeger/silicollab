import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle, Badge, Avatar, EmptyState } from "@/components/ui";
import { ApplyButton } from "@/components/ApplyButton";
import { ApplicationsPanel } from "@/components/ApplicationsPanel";
import { STAGE_STATUS_META } from "@/lib/constants";
import type {
  Project,
  ProjectMember,
  Profile,
  Application,
  ProjectMethod,
  ResearchStage,
} from "@/types/database";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  const p = project as Project;

  const { data: members } = await supabase
    .from("project_members")
    .select("*, profile:profiles(id, full_name, study_program)")
    .eq("project_id", id);
  const memberList = (members ?? []) as unknown as (ProjectMember & {
    profile: (Pick<Profile, "id" | "full_name" | "study_program">) | null;
  })[];

  const { data: methods } = await supabase
    .from("project_methods")
    .select("*")
    .eq("project_id", id);
  const methodList = (methods ?? []) as ProjectMethod[];

  const { data: stages } = await supabase
    .from("research_stages")
    .select("id, status")
    .eq("project_id", id);
  const stageList = (stages ?? []) as Pick<ResearchStage, "id" | "status">[];
  const doneCount = stageList.filter((s) => s.status === "done").length;
  const progress = stageList.length ? Math.round((doneCount / stageList.length) * 100) : 0;

  const isMember = memberList.some((m) => m.user_id === user?.id);
  const isOwner = p.owner_id === user?.id;

  let applications: (Application & { applicant: Pick<Profile, "id" | "full_name"> | null })[] = [];
  if (isOwner) {
    const { data } = await supabase
      .from("applications")
      .select("*, applicant:profiles(id, full_name)")
      .eq("project_id", id)
      .eq("status", "pending");
    applications = (data ?? []) as unknown as typeof applications;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-6 md:col-span-2">
        <Card>
          <CardTitle className="mb-2">Deskripsi</CardTitle>
          <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
            {p.description || "Belum ada deskripsi."}
          </p>

          {methodList.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Metode</p>
              <div className="flex flex-wrap gap-1.5">
                {methodList.map((m) => (
                  <Badge key={m.id} tone="violet">{m.method_name}</Badge>
                ))}
              </div>
            </div>
          )}

          {p.required_roles.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                Posisi yang dicari
              </p>
              <div className="flex flex-wrap gap-1.5">
                {p.required_roles.map((r) => (
                  <Badge key={r} tone="slate">{r}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {isMember && stageList.length > 0 && (
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <CardTitle>Progres pipeline</CardTitle>
              <Link href={`/projects/${id}/pipeline`} className="text-sm text-brand-600 hover:underline">
                Lihat pipeline →
              </Link>
            </div>
            <div className="mb-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>{doneCount} / {stageList.length} tahap selesai</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{progress}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </Card>
        )}

        {!isMember && p.status === "open" && (
          <Card>
            <CardTitle className="mb-3">Tertarik bergabung?</CardTitle>
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
              Kirim lamaran ke pemilik proyek. Jelaskan skill & posisi yang kamu minati.
            </p>
            <ApplyButton projectId={id} projectTitle={p.title} ownerId={p.owner_id} />
          </Card>
        )}

        {isOwner && (
          <Card>
            <CardTitle className="mb-3">Lamaran masuk</CardTitle>
            <ApplicationsPanel projectId={id} projectTitle={p.title} applications={applications} />
          </Card>
        )}
      </div>

      <div>
        <Card>
          <CardTitle className="mb-3">Tim ({memberList.length}/{p.max_members})</CardTitle>
          {memberList.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada anggota.</p>
          ) : (
            <ul className="space-y-3">
              {memberList.map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <Avatar name={m.profile?.full_name || "?"} size={36} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                      {m.profile?.full_name || "Mahasiswa"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {m.position || (m.role === "owner" ? "Principal Investigator" : "Anggota")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
