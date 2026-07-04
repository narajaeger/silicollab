"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LinkButton, Badge } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";

const FEATURES: { icon: IconName; t: string; d: string }[] = [
  {
    icon: "compass",
    t: "Pipeline yang paham metode",
    d: "Pilih metodenya (docking, MD, QSAR, network pharmacology, dan lainnya), lalu tahapan kerja tersusun sendiri lengkap dengan tool dan checklist parameter.",
  },
  {
    icon: "users",
    t: "Cari partner lintas kampus",
    d: "Posting proyek, rekrut anggota, dan temukan rekan riset berdasarkan skill dan tool yang mereka kuasai.",
  },
  {
    icon: "chart",
    t: "Tabulasi dan reprodusibilitas",
    d: "Tabel data yang bisa diedit, catatan tool dan parameter, sumber ber-DOI, plus export ke .xlsx dan .csv.",
  },
  {
    icon: "folder",
    t: "Kanban dan timeline",
    d: "Bagi tugas, atur deadline dan prioritas, dan pantau beban kerja tiap anggota tim.",
  },
  {
    icon: "book",
    t: "Referensi dan sitasi",
    d: "Impor DOI, kelola daftar pustaka, dan export BibTeX serta sitasi format Vancouver.",
  },
  {
    icon: "edit",
    t: "Jalur menuju publikasi",
    d: "Atur urutan penulis, lacak status submisi jurnal, cek kelengkapan etik, dan susun draft awal Metode dan Hasil.",
  },
];

const STEPS = ["Ide", "Bentuk tim", "Pipeline metode", "Tabulasi data", "Reprodusibilitas", "Publikasi"];

export default function LandingPage() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  useEffect(() => {
    function onMove(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setTilt({ x, y });
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <main className="relative mx-auto max-w-6xl px-6 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-20 left-0 h-72 w-72 animate-float-slow rounded-full bg-brand-300/40 blur-3xl"
          style={{ transform: `translate(${tilt.x * 18}px, ${tilt.y * 18}px)` }}
        />
        <div
          className="absolute right-0 top-24 h-80 w-80 animate-float rounded-full bg-brand-200/50 blur-3xl"
          style={{ transform: `translate(${tilt.x * -22}px, ${tilt.y * -14}px)` }}
        />
      </div>

      <nav className="mb-16 flex items-center justify-between">
        <span className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-glass">
            Si
          </span>
          Sili<span className="text-brand-600">Collab</span>
        </span>
        <div className="flex gap-3">
          <LinkButton href="/login" variant="outline">Masuk</LinkButton>
          <LinkButton href="/register">Daftar</LinkButton>
        </div>
      </nav>

      <section className="animate-fade-up text-center">
        <div className="mb-4 flex justify-center">
          <Badge tone="brand">Buat mahasiswa kedokteran, farmasi, dan biologi</Badge>
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
          Dari ide sampai publikasi, <span className="text-brand-600">satu ruang kerja</span> untuk riset in silico
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          SiliCollab mempertemukan peneliti dari berbagai kampus, memandu tiap tahap metode in silico,
          merapikan data, dan menjaga reprodusibilitas. Tidak perlu lagi bolak-balik antar sepuluh tool.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <LinkButton href="/register" size="lg">Mulai gratis</LinkButton>
          <LinkButton href="/projects" variant="outline" size="lg">Lihat proyek terbuka</LinkButton>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Ini ruang kolaborasi dan dokumentasi, bukan mesin komputasi. Komputasi tetap berjalan di tool eksternal.
        </p>
      </section>

      <section className="mt-16 overflow-x-auto pb-2">
        <div className="mx-auto flex min-w-max items-center justify-center gap-2">
          {STEPS.map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="glass animate-fade-up rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                {s}
              </div>
              {i < arr.length - 1 && (
                <Icon name="arrow-right" size={16} className="shrink-0 text-brand-400" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <div
            key={f.t}
            className="glass group animate-fade-up rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-glass-lg"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100/80 text-brand-600 transition group-hover:scale-110 dark:bg-slate-800 dark:text-brand-300">
              <Icon name={f.icon} size={24} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{f.t}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="mt-20 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-500 px-8 py-12 text-center shadow-glass-lg">
        <h2 className="text-2xl font-bold text-white">Siap mulai riset in silico bareng tim?</h2>
        <p className="mx-auto mt-2 max-w-xl text-brand-100">
          Bikin proyek pertamamu dari template metode dalam hitungan menit.
        </p>
        <div className="mt-6 flex justify-center">
          <LinkButton href="/register" size="lg" className="!bg-white !text-brand-700 hover:!bg-brand-50">
            Buat akun
          </LinkButton>
        </div>
      </section>

      <footer className="mt-16 border-t border-white/50 py-8 text-center text-sm text-slate-400 dark:border-slate-800">
        <Link href="/login" className="hover:text-brand-600">Masuk</Link>
        {" · "}
        <Link href="/register" className="hover:text-brand-600">Daftar</Link>
        {" · "}
        <Link href="/projects" className="hover:text-brand-600">Proyek</Link>
      </footer>
    </main>
  );
}
