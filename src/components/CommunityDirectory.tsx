"use client";

import { useMemo, useState } from "react";
import { Card, Input, Select, Badge, Avatar, EmptyState, Button, useToast } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { createClient } from "@/lib/supabase/client";
import { notifyUser } from "@/lib/notify";
import type { ConnectionStatus } from "@/types/database";

export type Researcher = {
  id: string;
  full_name: string;
  university: string | null;
  study_program: string | null;
  semester: number | null;
  interests: string[];
  skills: string[];
  projectCount: number;
  completedCount: number;
};

export type ConnectionState = {
  id: string;
  status: ConnectionStatus;
  outgoing: boolean;
};

export function CommunityDirectory({
  researchers,
  universities,
  initialQuery = "",
  currentUserId = null,
  connections = {},
}: {
  researchers: Researcher[];
  universities: string[];
  initialQuery?: string;
  currentUserId?: string | null;
  connections?: Record<string, ConnectionState>;
}) {
  const supabase = createClient();
  const toast = useToast();
  const [q, setQ] = useState(initialQuery);
  const [uni, setUni] = useState("");
  const [conns, setConns] = useState<Record<string, ConnectionState | undefined>>(connections);
  const [busy, setBusy] = useState<string | null>(null);

  const currentName = useMemo(
    () => researchers.find((r) => r.id === currentUserId)?.full_name ?? "Seseorang",
    [researchers, currentUserId]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return researchers.filter((r) => {
      if (uni && r.university !== uni) return false;
      if (term) {
        const hay = [r.full_name, r.university, r.study_program, ...r.interests, ...r.skills]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [researchers, q, uni]);

  async function connect(r: Researcher) {
    if (!currentUserId) {
      toast.push("Masuk dulu untuk menghubungkan.", "error");
      return;
    }
    setBusy(r.id);
    const { data, error } = await supabase
      .from("connections")
      .insert({ requester_id: currentUserId, addressee_id: r.id, status: "pending" })
      .select("id")
      .single();
    setBusy(null);
    if (error || !data) {
      toast.push("Gagal mengirim permintaan.", "error");
      return;
    }
    setConns((prev) => ({ ...prev, [r.id]: { id: data.id, status: "pending", outgoing: true } }));
    await notifyUser(supabase, r.id, {
      type: "connection",
      title: "Permintaan koneksi baru",
      body: `${currentName} ingin terhubung denganmu.`,
      link: "/community",
    });
    toast.push("Permintaan koneksi terkirim.", "success");
  }

  async function accept(r: Researcher, c: ConnectionState) {
    setBusy(r.id);
    const { error } = await supabase
      .from("connections")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", c.id);
    setBusy(null);
    if (error) {
      toast.push("Gagal menerima permintaan.", "error");
      return;
    }
    setConns((prev) => ({ ...prev, [r.id]: { ...c, status: "accepted" } }));
    await notifyUser(supabase, r.id, {
      type: "connection",
      title: "Koneksi diterima",
      body: `${currentName} menerima permintaan koneksimu.`,
      link: "/community",
    });
    toast.push("Sekarang kalian terhubung.", "success");
  }

  async function removeConn(r: Researcher, c: ConnectionState) {
    setBusy(r.id);
    const { error } = await supabase.from("connections").delete().eq("id", c.id);
    setBusy(null);
    if (error) {
      toast.push("Gagal membatalkan.", "error");
      return;
    }
    setConns((prev) => ({ ...prev, [r.id]: undefined }));
  }

  function ConnectControl({ r }: { r: Researcher }) {
    if (!currentUserId || r.id === currentUserId) return null;
    const c = conns[r.id];
    const loading = busy === r.id;

    if (!c) {
      return (
        <Button size="sm" variant="subtle" disabled={loading} onClick={() => connect(r)}>
          <Icon name="user-plus" size={15} /> Hubungkan
        </Button>
      );
    }
    if (c.status === "accepted") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <Icon name="check-circle" size={15} /> Terhubung
        </span>
      );
    }
    if (c.outgoing) {
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Icon name="clock" size={14} /> Menunggu
          </span>
          <button
            onClick={() => removeConn(r, c)}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-rose-600"
          >
            Batal
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="success" disabled={loading} onClick={() => accept(r, c)}>
          <Icon name="check" size={15} /> Terima
        </Button>
        <button
          onClick={() => removeConn(r, c)}
          disabled={loading}
          className="text-xs text-slate-400 hover:text-rose-600"
        >
          Tolak
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama, skill, atau tool (misalnya AutoDock, Cytoscape)..."
          className="max-w-md"
        />
        <Select value={uni} onChange={(e) => setUni(e.target.value)} className="max-w-xs">
          <option value="">Semua universitas</option>
          {universities.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Icon name="user" size={28} />}
          title="Tidak ada peneliti cocok"
          description="Coba kata kunci skill atau tool lain."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center gap-3">
                <Avatar name={r.full_name} size={44} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                    {r.full_name}
                    {r.id === currentUserId && (
                      <span className="ml-1 text-xs font-normal text-slate-400">(kamu)</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {[r.study_program, r.semester ? `Smt ${r.semester}` : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              {r.university && (
                <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <Icon name="cap" size={14} /> {r.university}
                </p>
              )}

              {r.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {r.skills.slice(0, 5).map((s) => (
                    <Badge key={s} tone="brand">{s}</Badge>
                  ))}
                </div>
              )}
              {r.interests.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.interests.slice(0, 3).map((s) => (
                    <Badge key={s} tone="slate">{s}</Badge>
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/50 pt-3 dark:border-slate-800">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="violet">{r.projectCount} proyek</Badge>
                  {r.completedCount > 0 && (
                    <Badge tone="emerald">
                      <Icon name="medal" size={13} className="inline align-[-2px]" /> {r.completedCount} selesai
                    </Badge>
                  )}
                </div>
                <ConnectControl r={r} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
