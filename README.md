# SiliCollab

**Satu workspace untuk riset in silico — dari ide, bentuk tim, sampai publikasi.**

SiliCollab (dari *in silico* + *collab*) adalah platform kolaborasi & orkestrasi
**pipeline penelitian in silico** untuk mahasiswa kedokteran, farmasi, dan biologi
lintas universitas di Indonesia. Ia mempertemukan peneliti, menyusun pipeline
metode secara otomatis, menabulasi data, menjaga reprodusibilitas (tool +
parameter), serta mengelola referensi dan alur publikasi — tanpa keluar-masuk
banyak tools. SiliCollab mengorkestrasi dan mendokumentasikan riset, bukan
menjalankan komputasinya.

> **Penting:** aplikasi ini **bukan mesin komputasi**. Ia tidak menjalankan
> docking/MD/QSAR/dsb. Nilainya ada pada kolaborasi, alur kerja, dokumentasi, dan
> reprodusibilitas. Baca **[KETERBATASAN.md](./KETERBATASAN.md)**.

## Fitur

- **Komunitas & matchmaking** — board proyek dengan filter (bidang, status, role),
  profil kaya (universitas, prodi, semester, minat, skill/tool, badge reputasi),
  direktori peneliti dengan pencarian by skill/tool, dan sistem lamaran.
- **Pipeline sadar-metode** — 15 template metode in silico (Molecular Docking,
  Virtual Screening, MD, MM/PBSA-GBSA, QSAR, Pharmacophore, ADMET, Network
  Pharmacology, Homology Modeling, Bioinformatics, Genomics/Transcriptomics,
  Systems Biology, Peptide Docking, Drug Repurposing, Custom). Pilih metode →
  pipeline tahapan (dengan tool disarankan & checklist parameter) tersusun
  otomatis. **Pipeline builder visual** (node berwarna, status, % progres,
  drag-and-drop reorder).
- **Workspace per-stage** — tabel tabulasi data kolom dinamis (text/number/url/
  select, import CSV, export .xlsx/.csv, duplikasi baris), **Panel
  Reprodusibilitas** (tool+versi, OS/hardware, parameter, tautan input/output),
  sumber ber-DOI per baris, lampiran (upload/tautan), **diskusi ber-thread**
  dengan mention, checklist parameter, dan tandai-selesai.
- **Registry tool & metode** — katalog tool in silico umum (fungsi, tahap,
  lisensi, tautan resmi, tips).
- **Manajemen tugas** — Kanban (Todo/In Progress/Review/Done) dengan assign,
  deadline, prioritas, drag-and-drop; ringkasan beban kerja & deadline terdekat.
- **Referensi & sitasi** — manajer referensi, import via DOI (Crossref), export
  **BibTeX** & **daftar pustaka Vancouver**.
- **Pipeline publikasi** — authorship & urutan, target jurnal + tracker status
  submisi, checklist kelengkapan (etik, data availability, CoI), dan **auto-draft
  Metode & Hasil** dari Panel Reprodusibilitas + tabel data.
- **Pendukung** — notifikasi in-app (lamaran, hasil, tugas, mention) + badge,
  dashboard personal, activity log per proyek, dark mode, desain responsif.

## Tech stack

- **Next.js 15** (App Router, TypeScript) + **Tailwind CSS** (design system
  ringan, dark mode)
- **Supabase** (Auth, Postgres, RLS, Realtime, Storage)
- **SheetJS (xlsx)** untuk export/import spreadsheet

## Struktur

```
src/
  app/                     # Route (App Router)
    (auth)/                # login & register
    dashboard/             # dashboard personal
    projects/              # board, buat proyek, detail + tab
      [id]/                # layout tab: overview/pipeline/tasks/chat/
                           #   references/publication/activity + workspace/[stageId]
    community/ tools/ notifications/ onboarding/ profile/
  components/              # AppShell, UI system, dan komponen fitur
  lib/
    supabase/              # klien browser/server/middleware
    method-templates.ts    # 15 template metode (sumber pipeline)
    tools-registry.ts      # katalog tool in silico
    references.ts          # BibTeX, Vancouver, import DOI
    export-xlsx.ts         # export/import tabel data
    constants.ts, notify.ts
  types/database.ts        # tipe DB (selaras migrasi)
supabase/migrations/       # 0001..0005 (skema, RLS, ekspansi, seed)
```

## Setup singkat

Lihat **[CHECKLIST.md](./CHECKLIST.md)** untuk langkah manual lengkap
(buat proyek Supabase, `.env.local`, jalankan migrasi + seed, buat storage
bucket, `npm install && npm run dev`, dan cara uji alur end-to-end).

```bash
npm install
cp .env.example .env.local   # isi URL & anon key Supabase
npm run dev
```

## Skrip

- `npm run dev` — jalankan dev server
- `npm run build` / `npm run start` — build & serve produksi
- `npm run typecheck` — pemeriksaan tipe (tsc)
- `npm run lint` — ESLint (tidak menggagalkan build)
