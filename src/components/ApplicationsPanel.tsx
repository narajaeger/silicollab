"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Avatar, useToast } from "@/components/ui";
import { notifyUser, logActivity } from "@/lib/notify";
import type { Application, Profile } from "@/types/database";

type AppWithProfile = Application & { applicant: Pick<Profile, "id" | "full_name"> | null };

export function ApplicationsPanel({
  projectId,
  projectTitle,
  applications,
}: {
  projectId: string;
  projectTitle: string;
  applications: AppWithProfile[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function decide(app: AppWithProfile, accepted: boolean) {
    setBusy(app.id);
    await supabase
      .from("applications")
      .update({ status: accepted ? "accepted" : "rejected" })
      .eq("id", app.id);

    if (accepted) {
      await supabase.from("project_members").insert({
        project_id: projectId,
        user_id: app.applicant_id,
        role: "member",
      });
      await logActivity(supabase, projectId, "Anggota bergabung", app.applicant?.full_name ?? undefined);
    }
    await notifyUser(supabase, app.applicant_id, {
      type: "application_result",
      title: accepted ? "Lamaran diterima 🎉" : "Lamaran belum diterima",
      body: accepted
        ? `Kamu bergabung dengan proyek "${projectTitle}".`
        : `Lamaranmu ke "${projectTitle}" tidak dilanjutkan.`,
      link: `/projects/${projectId}`,
    });
    setBusy(null);
    toast.push(accepted ? "Anggota diterima." : "Lamaran ditolak.", accepted ? "success" : "info");
    router.refresh();
  }

  if (applications.length === 0)
    return <p className="text-sm text-slate-500">Belum ada lamaran masuk.</p>;

  return (
    <ul className="space-y-3">
      {applications.map((a) => (
        <li key={a.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Avatar name={a.applicant?.full_name || "?"} size={28} />
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {a.applicant?.full_name || "Mahasiswa"}
            </p>
          </div>
          {a.message && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{a.message}</p>}
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="success" disabled={busy === a.id} onClick={() => decide(a, true)}>
              Terima
            </Button>
            <Button size="sm" variant="outline" disabled={busy === a.id} onClick={() => decide(a, false)}>
              Tolak
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
