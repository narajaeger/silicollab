"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Textarea, useToast } from "@/components/ui";
import { notifyUser, logActivity } from "@/lib/notify";

export function ApplyButton({
  projectId,
  projectTitle,
  ownerId,
}: {
  projectId: string;
  projectTitle: string;
  ownerId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function apply() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { error } = await supabase
      .from("applications")
      .insert({ project_id: projectId, applicant_id: user.id, message });
    setLoading(false);
    if (error) {
      toast.push(
        error.message.includes("duplicate") ? "Kamu sudah melamar proyek ini." : error.message,
        "error"
      );
      return;
    }
    await notifyUser(supabase, ownerId, {
      type: "application",
      title: "Lamaran baru masuk",
      body: `Seseorang melamar proyek "${projectTitle}".`,
      link: `/projects/${projectId}`,
    });
    await logActivity(supabase, projectId, "Lamaran baru", `Untuk proyek ${projectTitle}`);
    setDone(true);
    setOpen(false);
    toast.push("Lamaran terkirim!", "success");
    router.refresh();
  }

  if (done) return <p className="text-sm text-emerald-600">Lamaran terkirim! Tunggu konfirmasi pemilik proyek.</p>;

  return open ? (
    <div className="space-y-3">
      <Textarea
        rows={3}
        placeholder="Perkenalkan diri & jelaskan kontribusimu (skill, posisi yang diminati)."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={apply} disabled={loading}>
          {loading ? "Mengirim..." : "Kirim lamaran"}
        </Button>
        <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
      </div>
    </div>
  ) : (
    <Button onClick={() => setOpen(true)}>Lamar untuk bergabung</Button>
  );
}
