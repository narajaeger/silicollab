import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState } from "@/components/ui";
import type { ActivityLog, Profile } from "@/types/database";
import { Icon } from "@/components/Icon";

export default async function ActivityPage({
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
    return <EmptyState icon={<Icon name="lock" size={28} />} title="Khusus anggota" description="Bergabung dulu untuk melihat aktivitas." />;
  }

  const { data: logs } = await supabase
    .from("activity_log")
    .select("*, actor:profiles(full_name)")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(100);
  const logList = (logs ?? []) as unknown as (ActivityLog & { actor: Pick<Profile, "full_name"> | null })[];

  if (logList.length === 0) {
    return <EmptyState icon={<Icon name="clock" size={28} />} title="Belum ada aktivitas" description="Aktivitas tim akan tercatat di sini." />;
  }

  return (
    <Card>
      <ol className="space-y-3">
        {logList.map((l) => (
          <li key={l.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
            <div>
              <p className="text-sm text-slate-800 dark:text-slate-200">
                <span className="font-medium">{l.actor?.full_name || "Seseorang"}</span>{" "}<span className="text-slate-400">·</span> {l.action}
                {l.detail && <span className="text-slate-500"> · {l.detail}</span>}
              </p>
              <p className="text-xs text-slate-400">
                {new Date(l.created_at).toLocaleString("id-ID")}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
