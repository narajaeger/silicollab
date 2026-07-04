"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";

export function AppHeader() {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/dashboard" className="font-bold text-brand-700">
          SiliCollab
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/projects" className="text-slate-600 hover:text-slate-900">Proyek</Link>
          <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">Dashboard</Link>
          <Link href="/profile" className="text-slate-600 hover:text-slate-900">Profil</Link>
          <Button variant="outline" onClick={signOut}>Keluar</Button>
        </nav>
      </div>
    </header>
  );
}
