import { createClient } from "@/lib/supabase/server";
import { ReferencesManager } from "@/components/ReferencesManager";
import { EmptyState } from "@/components/ui";
import type { Reference } from "@/types/database";

export default async function ReferencesPage({
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
    return <EmptyState icon="🔒" title="Khusus anggota" description="Bergabung dulu untuk mengelola referensi." />;
  }

  const { data: refs } = await supabase
    .from("references")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  return <ReferencesManager projectId={id} initial={(refs ?? []) as Reference[]} />;
}
