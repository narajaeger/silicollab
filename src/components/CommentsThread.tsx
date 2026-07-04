"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, CardTitle, Textarea, Avatar, useToast } from "@/components/ui";
import { notifyMany } from "@/lib/notify";
import type { Comment } from "@/types/database";

type CommentRow = Comment & { author?: { full_name: string } | null };

export function CommentsThread({
  stageId,
  projectId,
  currentUserId,
  stageName,
  memberIds,
  initial,
}: {
  stageId: string;
  projectId: string;
  currentUserId: string;
  stageName: string;
  memberIds: string[];
  initial: CommentRow[];
}) {
  const supabase = createClient();
  const toast = useToast();
  const [comments, setComments] = useState<CommentRow[]>(initial);
  const [text, setText] = useState("");

  useEffect(() => {
    const channel = supabase
      .channel(`comments:${stageId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `stage_id=eq.${stageId}` },
        (payload) => {
          const row = payload.new as CommentRow;
          setComments((prev) => (prev.some((c) => c.id === row.id) ? prev : [...prev, row]));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [stageId, supabase]);

  async function send() {
    const content = text.trim();
    if (!content) return;
    setText("");
    const { data } = await supabase
      .from("comments")
      .insert({ stage_id: stageId, project_id: projectId, author_id: currentUserId, content })
      .select("*, author:profiles(full_name)")
      .single();
    if (data) {
      const row = data as unknown as CommentRow;
      setComments((prev) => (prev.some((c) => c.id === row.id) ? prev : [...prev, row]));
    }
    // Notifikasi mention @nama → notif ke semua anggota lain jika ada '@'
    if (content.includes("@")) {
      await notifyMany(
        supabase,
        memberIds.filter((id) => id !== currentUserId),
        {
          type: "mention",
          title: "Kamu disebut dalam diskusi",
          body: `Pada tahap "${stageName}": ${content.slice(0, 80)}`,
          link: `/projects/${projectId}/workspace/${stageId}`,
        }
      );
      toast.push("Anggota diberi notifikasi mention.", "info");
    }
  }

  return (
    <Card>
      <CardTitle className="mb-3">Diskusi ({comments.length})</CardTitle>
      <div className="mb-3 max-h-80 space-y-3 overflow-y-auto">
        {comments.length === 0 && <p className="text-sm text-slate-500">Belum ada komentar.</p>}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2">
            <Avatar name={c.author?.full_name || "?"} size={28} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {c.author?.full_name || "Anggota"}
              </p>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
      <Textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tulis komentar... gunakan @nama untuk menyebut anggota"
      />
      <div className="mt-2 flex justify-end">
        <Button size="sm" onClick={send}>Kirim</Button>
      </div>
    </Card>
  );
}
