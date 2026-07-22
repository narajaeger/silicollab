"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, cn } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";

// `private: true` = butuh login untuk benar-benar dipakai. Tetap ditampilkan
// setelah login; disembunyikan dari sidebar untuk pengunjung anonim supaya
// mereka tidak diarahkan bolak-balik ke /login saat sekadar melihat-lihat.
const NAV: { href: string; label: string; icon: IconName; private?: boolean }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "grid", private: true },
  { href: "/projects", label: "Proyek", icon: "folder" },
  { href: "/community", label: "Komunitas", icon: "users" },
  { href: "/tools", label: "Registry Tool", icon: "toolbox" },
  { href: "/notifications", label: "Notifikasi", icon: "bell", private: true },
  { href: "/profile", label: "Profil", icon: "user", private: true },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setLoggedIn(false);
        setAuthChecked(true);
        return;
      }
      setLoggedIn(true);
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (active) setName(profile?.full_name || user.email || "");
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      if (active) setUnread(count ?? 0);
      if (active) setAuthChecked(true);
    })();
    return () => {
      active = false;
    };
  }, [supabase, pathname]);

  const nav = NAV.filter((item) => !item.private || loggedIn);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = search.trim();
    router.push(query ? `/community?q=${encodeURIComponent(query)}` : "/community");
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" className="flex items-center gap-2 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-glass">
          Si
        </span>
        <span className="text-base font-bold text-slate-900 dark:text-slate-100">
          Sili<span className="text-brand-600">Collab</span>
        </span>
      </Link>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
              isActive(item.href)
                ? "bg-brand-100/80 text-brand-700 shadow-sm dark:bg-brand-900/40 dark:text-brand-200"
                : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-800"
            )}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
            {item.icon === "bell" && unread > 0 && (
              <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white">
                {unread}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/50 p-3 dark:border-slate-800">
        {loggedIn ? (
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar name={name || "?"} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                {name || "Memuat..."}
              </p>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600"
              >
                <Icon name="logout" size={13} /> Keluar
              </button>
            </div>
          </div>
        ) : authChecked ? (
          <div className="space-y-2 px-2 py-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Masuk untuk mulai kolaborasi.
            </p>
            <div className="flex gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-brand-200 px-2.5 py-1.5 text-center text-xs font-semibold text-brand-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-center text-xs font-semibold text-white hover:bg-brand-700"
              >
                Daftar
              </Link>
            </div>
          </div>
        ) : (
          <div className="h-[52px]" />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="glass fixed inset-y-0 left-0 z-30 hidden w-60 rounded-r-2xl lg:block dark:border-slate-800">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="glass absolute inset-y-0 left-0 w-64 rounded-r-2xl dark:border-slate-800">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="glass-soft sticky top-0 z-20 flex items-center gap-3 border-b border-white/40 px-4 py-2.5 dark:border-slate-800">
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-white/70 lg:hidden dark:hover:bg-slate-800"
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
          >
            <Icon name="menu" size={20} />
          </button>
          <form onSubmit={submitSearch} className="relative max-w-md flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari peneliti berdasarkan skill atau tool..."
              className="w-full rounded-xl border border-brand-200/70 bg-white/60 py-2 pl-9 pr-3 text-sm outline-none backdrop-blur transition focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
            />
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" size={16} />
            </span>
          </form>
          <Link
            href="/notifications"
            className="relative rounded-lg p-2 text-slate-500 hover:bg-white/70 dark:hover:bg-slate-800"
            aria-label="Notifikasi"
          >
            <Icon name="bell" size={18} />
            {unread > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
            )}
          </Link>
          <ThemeToggle />
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
