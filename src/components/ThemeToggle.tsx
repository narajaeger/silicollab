"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Ganti tema"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/70 dark:text-slate-400 dark:hover:bg-slate-800"
    >
      {dark ? <Icon name="sun" size={18} /> : <Icon name="moon" size={18} />}
    </button>
  );
}
