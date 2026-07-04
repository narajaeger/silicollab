// Helper notifikasi & activity log (dipanggil dari client components)
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, NotificationType } from "@/types/database";

type SB = SupabaseClient<Database>;

export async function logActivity(
  supabase: SB,
  projectId: string,
  action: string,
  detail?: string
) {
  try {
    await supabase.from("activity_log").insert({ project_id: projectId, action, detail: detail ?? null });
  } catch {
    /* non-blocking */
  }
}

export async function notifyUser(
  supabase: SB,
  userId: string,
  n: { type: NotificationType; title: string; body?: string; link?: string }
) {
  try {
    await supabase.from("notifications").insert({
      user_id: userId,
      type: n.type,
      title: n.title,
      body: n.body ?? null,
      link: n.link ?? null,
    });
  } catch {
    /* non-blocking */
  }
}

export async function notifyMany(
  supabase: SB,
  userIds: string[],
  n: { type: NotificationType; title: string; body?: string; link?: string }
) {
  const rows = userIds.map((user_id) => ({
    user_id,
    type: n.type,
    title: n.title,
    body: n.body ?? null,
    link: n.link ?? null,
  }));
  if (rows.length === 0) return;
  try {
    await supabase.from("notifications").insert(rows);
  } catch {
    /* non-blocking */
  }
}
