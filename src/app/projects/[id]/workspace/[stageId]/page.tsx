import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTableEditor } from "@/components/DataTableEditor";
import { NewTableForm } from "@/components/NewTableForm";
import { ReproducibilityPanel } from "@/components/ReproducibilityPanel";
import { AttachmentsPanel } from "@/components/AttachmentsPanel";
import { CommentsThread } from "@/components/CommentsThread";
import { StageControls } from "@/components/StageControls";
import { Card, CardTitle, Badge, EmptyState } from "@/components/ui";
import type {
  DataRow,
  DataTable,
  ResearchStage,
  StageReproducibility,
  Attachment,
  Comment,
  ProjectMember,
  Profile,
} from "@/types/database";
import { Icon } from "@/components/Icon";

export default async function StagePage({
  params,
}: {
  params: Promise<{ id: string; stageId: string }>;
}) {
  const { id, stageId } = await params;
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
    return <EmptyState icon={<Icon name="lock" size={28} />} title="Khusus anggota" description="Bergabung dulu untuk membuka workspace." />;
  }

  const { data: stage } = await supabase.from("research_stages").select("*").eq("id", stageId).single();
  const s = stage as ResearchStage | null;
  if (!s) return <EmptyState icon={<Icon name="help" size={28} />} title="Tahap tidak ditemukan" />;

  const { data: tables } = await supabase
    .from("data_tables")
    .select("*")
    .eq("stage_id", stageId)
    .order("created_at", { ascending: true });
  const tableList = (tables ?? []) as DataTable[];

  const rowsByTable: Record<string, DataRow[]> = {};
  const tableIds = tableList.map((t) => t.id);
  if (tableIds.length > 0) {
    const { data: rows } = await supabase
      .from("data_rows")
      .select("*")
      .in("table_id", tableIds)
      .order("position", { ascending: true });
    for (const row of (rows ?? []) as DataRow[]) {
      (rowsByTable[row.table_id] ??= []).push(row);
    }
  }

  const { data: repro } = await supabase
    .from("stage_reproducibility")
    .select("*")
    .eq("stage_id", stageId)
    .maybeSingle();

  const { data: attachments } = await supabase
    .from("attachments")
    .select("*")
    .eq("stage_id", stageId)
    .order("created_at", { ascending: true });

  const { data: comments } = await supabase
    .from("comments")
    .select("*, author:profiles(full_name)")
    .eq("stage_id", stageId)
    .order("created_at", { ascending: true });

  const { data: members } = await supabase
    .from("project_members")
    .select("user_id")
    .eq("project_id", id);
  const memberIds = ((members ?? []) as Pick<ProjectMember, "user_id">[]).map((m) => m.user_id);

  return (
    <div>
      <div className="mb-4">
        <Link href={`/projects/${id}/pipeline`} className="text-sm text-slate-500 hover:text-brand-600">
          ← Pipeline
        </Link>
        <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{s.name}</h2>
        {s.description && <p className="text-sm text-slate-500">{s.description}</p>}
        {s.suggested_tools.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-xs text-slate-400">Tool disarankan:</span>
            {s.suggested_tools.map((t) => (
              <Badge key={t} tone="slate">{t}</Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kolom utama: tabel data */}
        <div className="space-y-6 lg:col-span-2">
          {tableList.length === 0 ? (
            <EmptyState
              icon={<Icon name="chart" size={28} />}
              title="Belum ada tabel data"
              description="Buat tabel pertamamu untuk menabulasi data & sumbernya."
            />
          ) : (
            tableList.map((t) => (
              <DataTableEditor key={t.id} table={t} initialRows={rowsByTable[t.id] ?? []} />
            ))
          )}
          <NewTableForm stageId={stageId} />
        </div>

        {/* Kolom samping */}
        <div className="space-y-6">
          <StageControls projectId={id} stage={s} />
          <ReproducibilityPanel stageId={stageId} initial={(repro ?? null) as StageReproducibility | null} />
          <AttachmentsPanel stageId={stageId} projectId={id} initial={(attachments ?? []) as Attachment[]} />
          <CommentsThread
            stageId={stageId}
            projectId={id}
            currentUserId={user!.id}
            stageName={s.name}
            memberIds={memberIds}
            initial={(comments ?? []) as unknown as (Comment & { author?: { full_name: string } | null })[]}
          />
        </div>
      </div>
    </div>
  );
}
