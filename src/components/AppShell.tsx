"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, cn } from "@/components/ui";

type IconName =
  | "dashboard"
  | "projects"
  | "community"
  | "tools"
  | "bell"
  | "profile";

function Icon({ name }: { name: IconName }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      );
    case "projects":
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      );
    case "community":
      return (
        <svg {...common}>
          <circle cx="9" cy="7" r="3" />
          <path d="M2 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1" />
          <path d="M16 3.5a3 3 0 0 1 0 7" />
        </svg>
      );
    case "tools":
      return (
        <svg {...common}>
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2z" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      );
    case "profile":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-1a6 6 0 0 1 12 0v1" />
        </svg>
      );
  }
}

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/projects", label: "Proyek", icon: "projects" },
  { href: "/community", label: "Komunitas", icon: "community" },
  { href: "/tools", label: "Registry Tool", icon: "tools" },
  { href: "/notifications", label: "Notifikasi", icon: "bell" },
  { href: "/profile", label: "Profil", icon: "profile" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;
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
    })();
    return () => {
      active = false;
    };
  }, [supabase, pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/community?q=${encodeURIComponent(q)}` : "/community");
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" className="flex items-center gap-2 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          Si
        </span>
        <span className="text-base font-bold text-slate-900 dark:text-slate-100">
          Sili<span className="text-brand-600">Collab</span>
        </span>
      </Link>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              isActive(item.href)
                ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            )}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.icon === "bell" && unread > 0 && (
              <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white">
                {unread}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={name || "?"} size={32} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
              {name || "Memuat..."}
            </p>
            <button onClick={signOut} className="text-xs text-slate-500 hover:text-rose-600">
              Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
        {sidebar}
      </aside>

      {/* Sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-2.5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
          >
            ☰
          </button>
          <form onSubmit={submitSearch} className="relative max-w-md flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari peneliti berdasarkan skill / tool..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>
          </form>
          <Link
            href="/notifications"
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Notifikasi"
          >
            <Icon name="bell" />
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
