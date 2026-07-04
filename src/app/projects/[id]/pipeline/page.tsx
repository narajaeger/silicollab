import { createClient } from "@/lib/supabase/server";
import { PipelineView } from "@/components/PipelineView";
import { EmptyState } from "@/components/ui";
import type { ResearchStage } from "@/types/database";

export default async function PipelinePage({
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
    return (
      <EmptyState
        icon="🔒"
        title="Khusus anggota"
        description="Kamu perlu menjadi anggota proyek untuk mengakses pipeline."
      />
    );
  }

  const { data: stages } = await supabase
    .from("research_stages")
    .select("*")
    .eq("project_id", id)
    .order("position", { ascending: true });

  return <PipelineView projectId={id} initialStages={(stages ?? []) as ResearchStage[]} />;
}
