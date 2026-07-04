import Link from "next/link";
import { LinkButton, Badge } from "@/components/ui";

const FEATURES = [
  { icon: "🧭", t: "Pipeline sadar-metode", d: "Pilih metode (docking, MD, QSAR, network pharmacology, dll) dan pipeline tahapan tersusun otomatis lengkap tool & checklist parameter." },
  { icon: "👥", t: "Matchmaking lintas kampus", d: "Posting proyek, rekrut anggota, dan temukan partner berdasarkan skill & tool." },
  { icon: "📊", t: "Tabulasi & reprodusibilitas", d: "Tabel data dinamis, catatan tool + parameter, sumber ber-DOI, dan export .xlsx/.csv." },
  { icon: "🗂️", t: "Kanban & timeline", d: "Bagi tugas, atur deadline & prioritas, pantau beban kerja tim." },
  { icon: "📚", t: "Referensi & sitasi", d: "Impor DOI, kelola pustaka, export BibTeX & daftar pustaka Vancouver." },
  { icon: "📝", t: "Pipeline publikasi", d: "Authorship, tracker submisi jurnal, checklist etik, & auto-draft Metode/Hasil." },
];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <nav className="mb-16 flex items-center justify-between">
        <span className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">Si</span>
          Sili<span className="text-brand-600">Collab</span>
        </span>
        <div className="flex gap-3">
          <LinkButton href="/login" variant="outline">Masuk</LinkButton>
          <LinkButton href="/register">Daftar</LinkButton>
        </div>
      </nav>

      <section className="text-center">
        <div className="mb-4 flex justify-center">
          <Badge tone="brand">Untuk mahasiswa kedokteran · farmasi · biologi</Badge>
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
          Dari ide sampai publikasi, <span className="text-brand-600">satu workspace</span> untuk riset in silico
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          SiliCollab mempertemukan peneliti lintas universitas, memandu seluruh pipeline metode in silico,
          menabulasi data, dan menjaga reprodusibilitas — tanpa keluar-masuk 10 tools.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <LinkButton href="/register" size="lg">Mulai gratis</LinkButton>
          <LinkButton href="/projects" variant="outline" size="lg">Lihat proyek terbuka</LinkButton>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Platform kolaborasi & dokumentasi — bukan mesin komputasi. Komputasi tetap di tools eksternal.
        </p>
      </section>

      {/* Ilustrasi pipeline */}
      <section className="mt-16 overflow-x-auto">
        <div className="mx-auto flex min-w-max items-center justify-center gap-2">
          {["Ide", "Bentuk tim", "Pipeline metode", "Tabulasi data", "Reprodusibilitas", "Publikasi"].map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                {s}
              </div>
              {i < arr.length - 1 && <span className="text-brand-400">→</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.t} className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 text-2xl">{f.icon}</div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{f.t}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="mt-20 rounded-2xl bg-brand-600 px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-white">Siap memulai riset in silico bersama tim?</h2>
        <p className="mx-auto mt-2 max-w-xl text-brand-100">
          Buat proyek pertamamu dari template metode dalam hitungan menit.
        </p>
        <div className="mt-6 flex justify-center">
          <LinkButton href="/register" variant="outline" size="lg" className="!border-white !bg-white !text-brand-700">
            Buat akun
          </LinkButton>
        </div>
      </section>

      <footer className="mt-16 border-t border-slate-200 py-8 text-center text-sm text-slate-400 dark:border-slate-800">
        <Link href="/login" className="hover:text-brand-600">Masuk</Link> ·{" "}
        <Link href="/register" className="hover:text-brand-600">Daftar</Link> ·{" "}
        <Link href="/projects" className="hover:text-brand-600">Proyek</Link>
      </footer>
    </main>
  );
}
