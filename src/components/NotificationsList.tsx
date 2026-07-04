"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Button, Badge, EmptyState } from "@/components/ui";
import type { Notification } from "@/types/database";
import { Icon } from "@/components/Icon";

export function NotificationsList({ initial }: { initial: Notification[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>(initial);

  async function markAll() {
    const ids = items.filter((n) => !n.is_read).map((n) => n.id);
    if (ids.length === 0) return;
    setItems((p) => p.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).in("id", ids);
    router.refresh();
  }

  async function markOne(id: string) {
    setItems((p) => p.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    router.refresh();
  }

  if (items.length === 0) {
    return <EmptyState icon={<Icon name="bell" size={28} />} title="Belum ada notifikasi" description="Notifikasi lamaran, tugas, dan mention akan muncul di sini." />;
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button size="sm" variant="outline" onClick={markAll}>Tandai semua dibaca</Button>
      </div>
      <div className="space-y-2">
        {items.map((n) => {
          const inner = (
            <Card className={n.is_read ? "opacity-70" : "border-brand-200 dark:border-brand-900"}>
              <div className="flex items-start gap-3">
                {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-sm text-slate-500">{n.body}</p>}
                  <p className="mt-1 text-xs text-slate-400">{new Date(n.created_at).toLocaleString("id-ID")}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markOne(n.id)} className="text-xs text-brand-600 hover:underline">
                    Tandai
                  </button>
                )}
              </div>
            </Card>
          );
          return n.link ? (
            <Link key={n.id} href={n.link} onClick={() => markOne(n.id)} className="block">
              {inner}
            </Link>
          ) : (
            <div key={n.id}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
