import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { NotificationsList } from "@/components/NotificationsList";
import type { Notification } from "@/types/database";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: notifs } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Notifikasi</h1>
      </div>
      <NotificationsList initial={(notifs ?? []) as Notification[]} />
    </AppShell>
  );
}
