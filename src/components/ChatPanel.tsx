"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";
import type { ChatMessage } from "@/types/database";

type Msg = ChatMessage & { sender?: { full_name: string } | null };

export function ChatPanel({
  projectId,
  currentUserId,
  initialMessages,
}: {
  projectId: string;
  currentUserId: string;
  initialMessages: Msg[];
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${projectId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `project_id=eq.${projectId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Msg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setText("");
    await supabase.from("chat_messages").insert({
      project_id: projectId,
      sender_id: currentUserId,
      content,
    });
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border border-slate-200 bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800"
                }`}
              >
                {!mine && m.sender?.full_name && (
                  <p className="mb-0.5 text-xs font-medium opacity-70">{m.sender.full_name}</p>
                )}
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis pesan..." />
        <Button type="submit">Kirim</Button>
      </form>
    </div>
  );
}
