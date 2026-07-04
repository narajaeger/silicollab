import { createClient } from "@/lib/supabase/server";
import { ChatPanel } from "@/components/ChatPanel";
import { EmptyState } from "@/components/ui";
import type { ChatMessage } from "@/types/database";
import { Icon } from "@/components/Icon";

export default async function ChatPage({
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
    return <EmptyState icon={<Icon name="lock" size={28} />} title="Khusus anggota" description="Bergabung dulu untuk ikut diskusi tim." />;
  }

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*, sender:profiles(full_name)")
    .eq("project_id", id)
    .order("created_at", { ascending: true })
    .limit(200);

  return (
    <ChatPanel
      projectId={id}
      currentUserId={user!.id}
      initialMessages={(messages ?? []) as unknown as ChatMessage[]}
    />
  );
}
