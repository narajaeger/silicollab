import { createClient } from "@/lib/supabase/server";
import { ManuscriptEditor } from "@/components/ManuscriptEditor";
import { EmptyState } from "@/components/ui";
import type {
  Manuscript,
  ResearchStage,
  StageReproducibility,
  DataTable,
  DataRow,
  ProjectMember,
  Profile,
} from "@/types/database";

export default async function PublicationPage({
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
    return <EmptyState icon="🔒" title="Khusus anggota" description="Bergabung dulu untuk membuka pipeline publikasi." />;
  }

  const { data: manuscript } = await supabase
    .from("manuscript")
    .select("*")
    .eq("project_id", id)
    .maybeSingle();

  const { data: members } = await supabase
    .from("project_members")
    .select("profile:profiles(full_name)")
    .eq("project_id", id);
  const memberNames = ((members ?? []) as unknown as { profile: Pick<Profile, "full_name"> | null }[])
    .map((m) => m.profile?.full_name || "Anggota")
    .filter(Boolean);

  // --- Bangun saran auto-draft ---
  const { data: stages } = await supabase
    .from("research_stages")
    .select("id, name, position")
    .eq("project_id", id)
    .order("position", { ascending: true });
  const stageList = (stages ?? []) as Pick<ResearchStage, "id" | "name" | "position">[];
  const stageIds = stageList.map((s) => s.id);

  let methodsSuggestion = "";
  let resultsSuggestion = "";

  if (stageIds.length > 0) {
    const { data: repros } = await supabase
      .from("stage_reproducibility")
      .select("*")
      .in("stage_id", stageIds);
    const reproList = (repros ?? []) as StageReproducibility[];
    const reproByStage = new Map(reproList.map((r) => [r.stage_id, r]));

    const methodParas: string[] = [];
    for (const st of stageList) {
      const r = reproByStage.get(st.id);
      if (!r || (!r.tool_name && !r.parameters)) continue;
      const bits: string[] = [`Tahap "${st.name}" dilakukan`];
      if (r.tool_name) bits.push(`menggunakan ${r.tool_name}${r.tool_version ? ` versi ${r.tool_version}` : ""}`);
      if (r.os_hardware) bits.push(`(${r.os_hardware})`);
      let para = bits.join(" ") + ".";
      if (r.parameters) para += ` Parameter yang digunakan: ${r.parameters}.`;
      methodParas.push(para);
    }
    methodsSuggestion = methodParas.join("\n\n");

    const { data: tables } = await supabase
      .from("data_tables")
      .select("id, name, columns, stage_id")
      .in("stage_id", stageIds);
    const tableList = (tables ?? []) as Pick<DataTable, "id" | "name" | "columns" | "stage_id">[];
    const tableIds = tableList.map((t) => t.id);

    const countByTable = new Map<string, number>();
    if (tableIds.length > 0) {
      const { data: rows } = await supabase.from("data_rows").select("table_id").in("table_id", tableIds);
      for (const row of (rows ?? []) as Pick<DataRow, "table_id">[]) {
        countByTable.set(row.table_id, (countByTable.get(row.table_id) ?? 0) + 1);
      }
    }
    resultsSuggestion = tableList
      .map((t) => {
        const cols = t.columns.map((c) => c.label).join(", ");
        const n = countByTable.get(t.id) ?? 0;
        return `Tabel "${t.name}" merangkum ${n} entri data dengan variabel: ${cols || "(belum ada kolom)"}.`;
      })
      .join("\n\n");
  }

  return (
    <ManuscriptEditor
      projectId={id}
      initial={(manuscript ?? null) as Manuscript | null}
      memberNames={memberNames}
      methodsSuggestion={methodsSuggestion}
      resultsSuggestion={resultsSuggestion}
    />
  );
}
