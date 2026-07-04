# Prompt untuk chat Cowork baru (model: Fable)

> Salin SELURUH teks di bawah garis ini, buka chat Cowork baru dengan folder `in silico research collab app` terhubung, lalu tempel sebagai pesan pertama.

---

Kamu adalah **lead full-stack engineer + product designer** untuk **InSilico Collab** — platform kolaborasi & orkestrasi *pipeline* penelitian *in silico* untuk mahasiswa kedokteran/farmasi/biologi lintas universitas di Indonesia.

## Positioning (WAJIB dipatuhi)
App ini **BUKAN mesin komputasi**. Ia **tidak menjalankan** docking, molecular dynamics, QSAR, dsb. Perannya: **mempertemukan peneliti, memandu & melacak seluruh pipeline in silico, menabulasi data, mencatat tool + parameter untuk reprodusibilitas, mengelola sumber & sitasi, dan mengantar tim dari ide hingga publikasi.** Hasil komputasi dari tools eksternal (AutoDock Vina, GROMACS, SwissADME, Cytoscape, dll) **masuk lewat import/link/upload**, bukan dieksekusi di dalam app. Jangan bangun engine docking apa pun. Nilai produk ada di **kolaborasi, alur kerja, dokumentasi, dan reprodusibilitas** — bukan pada komputasi.

## Keadaan saat ini (jangan mulai dari nol)
Folder terhubung sudah berisi scaffold berjalan. **Baca dulu** `README.md`, seluruh `src/`, dan `supabase/migrations/`. Sudah ada: Next.js 15 (App Router, TS) + Tailwind, klien Supabase (browser/server/middleware), skema DB + RLS (profiles, universities, projects, project_members, applications, research_stages, data_tables, data_rows, tasks, chat_messages), dan fitur inti: auth+profil, project board (open & join, lamaran, terima/tolak), group chat realtime, workspace tahapan dengan tabel tabulasi data + sumber + export .xlsx. Bangun DI ATAS ini, refactor bila perlu.

## Visi produk (bayangkan dengan hidup)
Seorang mahasiswa punya ide "network pharmacology jamu X untuk diabetes" tapi tak punya tim & bingung tahapannya. Ia buka InSilico Collab, pilih **template metode Network Pharmacology**, dan app langsung menyusun pipeline lengkap (kumpulkan senyawa → prediksi target → PPI network → enrichment → docking validasi → penulisan). Ia posting proyek, 4 mahasiswa dari kampus berbeda bergabung, tiap orang pegang stage. Di tiap stage ada tabel data siap-isi, checklist tool + parameter, tempat menaruh sumber ber-DOI, dan diskusi ber-thread. Progres tampil sebagai diagram alur berwarna. Saat riset kelar, app merangkai **draft bagian Metode & Hasil** dari log parameter, plus mengelola checklist submisi jurnal. Semua tanpa keluar-masuk 10 tools.

## FITUR LENGKAP yang harus dibangun

### 1. Komunitas & matchmaking
- Board proyek terbuka dengan filter (bidang/metode, universitas, role dibutuhkan, status).
- Profil kaya: universitas, prodi, semester, bidang minat, skill/tool yang dikuasai, portofolio proyek, badge reputasi (jumlah proyek selesai/publikasi).
- Direktori peneliti + pencarian by skill/tool, ajakan gabung (invite), dan lamaran (sudah ada — perluas).

### 2. Sistem pipeline sadar-metode (fitur pembeda utama)
- **Library template metode in silico**, tiap metode punya set tahapan default + tool yang disarankan + checklist parameter. Sediakan minimal template untuk: **Molecular Docking, Virtual Screening, Molecular Dynamics (MD), MM/PBSA-GBSA, QSAR/QSPR, Pharmacophore Modeling, ADMET/Drug-likeness, Network Pharmacology, Homology Modeling, Bioinformatics (sequence/BLAST/alignment), Genomics/Transcriptomics (DEG, pathway), Systems Biology, Molecular Docking Peptida, dan "Custom/From Scratch".**
- Saat buat proyek, user pilih satu/lebih metode → app generate stages otomatis (bisa diedit, ditambah, diurutkan drag-and-drop).
- **Pipeline builder visual**: tampilkan tahapan sebagai diagram alur (node) dengan status warna (belum mulai/berjalan/selesai/terblokir) dan % progres keseluruhan.

### 3. Workspace per-stage (inti kerja harian)
Tiap stage memuat:
- **Tabel tabulasi data** kolom dinamis (sudah ada — perluas: tipe kolom text/number/url/select, sortir, filter, duplikasi baris, import CSV, export .xlsx & .csv).
- **Panel Reprodusibilitas**: catat tool + versi, OS/hardware, parameter kunci (mis. ukuran grid box, force field, jumlah step MD, random seed), dan tautan input/output. Ini yang nanti dirangkai jadi draft Metode.
- **Sumber & referensi** per baris/stage (label + DOI/URL).
- **Lampiran**: upload file (Supabase Storage) atau tautkan Google Drive/Zenodo/GitHub.
- **Diskusi ber-thread & komentar** di level stage (mention @anggota).
- Tombol tandai stage selesai + checklist parameter wajib sebelum lanjut.

### 4. Registry tool & metode
- Katalog tool in silico umum (AutoDock Vina, GROMACS, AMBER, PyMOL, Discovery Studio, Schrödinger, SwissADME, pkCSM, admetSAR, Cytoscape, STRING, DAVID, Open Babel, RDKit, MODELLER, dll) berisi: fungsi, tahap penggunaannya, link resmi, tipe lisensi (gratis/akademik/berbayar), dan tips. Tim mencatat tool mana untuk stage mana.

### 5. Manajemen tugas & timeline
- **Kanban** per proyek (Todo/In Progress/Review/Done), assign ke anggota, deadline, prioritas. Tabel `tasks` sudah ada.
- **Timeline/Gantt** ringan untuk melihat deadline seluruh pipeline.
- Beban kerja per anggota (siapa pegang apa).

### 6. Referensi & sitasi
- Manajer referensi per proyek (judul, penulis, tahun, jurnal, DOI/URL), import via DOI, **export BibTeX & daftar pustaka** (format Vancouver untuk medis).

### 7. Pipeline publikasi
- Stage khusus manuskrip: kontribusi penulis (authorship & urutan), target jurnal + tracker status submisi (draft/submitted/revision/accepted), checklist kelengkapan (etik, data availability, conflict of interest), dan **auto-draft bagian Metode & Hasil** dari Panel Reprodusibilitas + tabel data.

### 8. Pendukung
- **Notifikasi** (lamaran, diterima/ditolak, tugas di-assign, mention, deadline dekat) — in-app badge + halaman notifikasi.
- **Dashboard** personal: proyek saya, tugas jatuh tempo, aktivitas terbaru, undangan.
- **Roles & izin** (owner/co-lead/member/viewer) dengan RLS yang sesuai.
- Aktivitas/audit ringan per proyek.

## BRIEF UI/UX (buat sangat rapi & modern)
Bangun design system konsisten, jangan tampilan generik.

- **Brand & nuansa**: ilmiah tapi ramah & muda. Aksen biru (#2563eb) sudah dipakai; tambah sekunder teal/emerald untuk status "selesai", amber untuk "perlu perhatian", slate untuk netral. Sudut membulat (rounded-xl), bayangan halus, banyak ruang putih.
- **Tipografi**: heading tegas (Inter/Geist), badan teks nyaman dibaca, angka tabular untuk data numerik.
- **Layout**: sidebar kiri (navigasi proyek, dashboard, komunitas, notifikasi) + top bar (search global, profil). Konten maksimal ~1200px, grid responsif.
- **Layar kunci yang harus dipoles**:
  - *Landing* memikat dengan value prop + ilustrasi pipeline.
  - *Onboarding* singkat (pilih universitas, minat, tool) + tur 3 langkah.
  - *Project board* berupa kartu dengan chip metode & role, filter di kiri.
  - *Halaman proyek* dengan header ringkas + tab (Overview, Pipeline, Tasks, Chat, Files, References, Publication).
  - *Pipeline view* diagram node berwarna yang bisa diklik ke stage.
  - *Stage workspace* dua kolom: tabel data (utama) + panel samping (reprodusibilitas, sumber, lampiran, diskusi).
  - *Kanban* drag-and-drop halus.
- **Micro-interactions**: transisi lembut, skeleton loading, toast sukses/gagal, konfirmasi hapus, autosave dengan indikator "tersimpan".
- **Empty states** yang membimbing (ilustrasi + CTA jelas, mis. "Belum ada tabel — buat tabel pertamamu").
- **Responsif** penuh (mobile → desktop), **aksesibilitas** (kontras, fokus keyboard, aria-label), dan **dark mode**.
- Komponen konsisten: Button, Input, Select, Card, Badge, Tabs, Modal, Toast, Avatar, Table, Drawer — kembangkan dari `src/components/ui`.

## Model data (perluas skema)
Tambahkan tabel/migrasi baru sesuai kebutuhan di atas, mis.: `method_templates`, `tools`, `project_methods`, `stage_reproducibility`, `references`, `attachments`, `comments`, `notifications`, `manuscript`, `activity_log`. Sertakan RLS untuk setiap tabel (ikuti pola helper `is_project_member`/`is_project_owner` yang sudah ada). Sediakan seed untuk template metode & registry tool.

## Batasan yang WAJIB ditulis jujur
Buat/perbarui `KETERBATASAN.md`: app ini alat **kolaborasi & dokumentasi pipeline**, bukan mesin komputasi; ia tidak menjalankan/menggantikan tools in silico; akurasi/hasil sepenuhnya tergantung tools eksternal yang dipakai user; auto-draft Metode/Hasil adalah bantuan awal yang tetap harus diverifikasi peneliti; performa model (Fable) hanya soal kualitas/kecepatan penulisan kode, bukan performa komputasi riset.

## Aturan kerja
- Pakai task list; kerjakan setuntas mungkin dalam sesi ini secara autonom, jangan berhenti bertanya di tengah kecuali benar-benar terblokir.
- Tulis semua kode ke folder proyek yang terhubung (bukan scratchpad) agar bisa kulihat.
- Jaga `npm run typecheck`/build tetap konsisten; refactor scaffold bila perlu, jangan rusak fitur yang sudah jalan.
- JANGAN sisipkan langkah manual di tengah. Di AKHIR beri satu **CHECKLIST LANGKAH MANUAL SAYA** yang urut & actionable: buat proyek Supabase, isi `.env.local`, jalankan semua migrasi + seed di SQL Editor, buat storage bucket, `npm install && npm run dev`, dan cara menguji alur end-to-end (daftar → buat proyek dari template metode → isi stage → export → publikasi).
- Di akhir, presentasikan file kunci: `README.md`, `KETERBATASAN.md`, dan checklist.

Mulai sekarang: baca scaffold yang ada, susun rencana di task list, lalu bangun semuanya.
