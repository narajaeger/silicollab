# CHECKLIST LANGKAH MANUAL SAYA

Ikuti berurutan. Setelah selesai, aplikasi berjalan penuh.

## 1. Buat proyek Supabase
1. Buka https://supabase.com → **New project** (pilih region terdekat, mis. Singapore).
2. Simpan **Project URL** dan **anon public key** dari **Project Settings → API**.

## 2. Isi `.env.local`
Di root folder proyek, salin `.env.example` menjadi `.env.local` lalu isi:
```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
```

## 3. Jalankan migrasi + seed (SQL Editor)
Buka **Supabase → SQL Editor**, lalu jalankan **berurutan** isi file berikut
(copy-paste seluruh isi tiap file, jalankan satu per satu):
1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/migrations/0003_expand.sql`
4. `supabase/migrations/0004_rls.sql`
5. `supabase/migrations/0005_seed.sql`  ← universitas + 15 template metode + registry tool

> Catatan: `0003` memakai `ALTER TYPE ... ADD VALUE`. Jika SQL Editor menolak
> karena "cannot run inside a transaction block", jalankan **baris ALTER TYPE
> tersebut sendiri** lebih dulu, lalu jalankan sisa file.

## 4. Buat Storage bucket (untuk upload lampiran)
1. **Supabase → Storage → New bucket** → nama persis: `attachments`.
2. Centang **Public bucket** (agar tautan file bisa dibuka anggota).
   - Jika ingin privat, sesuaikan kebijakan akses Storage sendiri.
   - Tanpa bucket ini, fitur **upload file** nonaktif; gunakan **"tautkan URL"**
     (Drive/Zenodo/GitHub) yang tetap berfungsi.

## 5. (Opsional) Pengaturan Auth
- **Authentication → Providers → Email**: aktif secara default.
- Untuk pengujian cepat, **matikan "Confirm email"** (Authentication → Providers →
  Email) agar registrasi langsung membuat sesi dan diarahkan ke onboarding.
  Jika dibiarkan aktif, verifikasi email dulu sebelum login.

## 6. Install & jalankan
```
npm install
npm run dev
```
Buka http://localhost:3000

> Verifikasi tipe kapan saja: `npm run typecheck` (harus bersih).

## 7. Uji alur end-to-end
1. **Daftar** dua akun berbeda (mis. dua browser/incognito). Lengkapi **onboarding**
   (universitas, minat, tool).
2. Akun A: **Buat proyek** → pilih satu/lebih **metode** (mis. Network
   Pharmacology) → cek pipeline yang tergenerate → **Buat proyek & pipeline**.
3. Akun A: buka tab **Pipeline** → seret tahap untuk reorder, ubah status,
   **buka workspace tahap** → buat **tabel data**, isi baris + sumber, **import
   CSV**, lalu **export .xlsx/.csv**. Isi **Panel Reprodusibilitas**, tambahkan
   **lampiran/tautan**, tulis **komentar** (coba mention `@nama`), centang
   **checklist parameter**, lalu **tandai tahap selesai**.
4. Akun B: buka **Proyek** (board) → temukan proyek A → **Lamar bergabung**.
5. Akun A: cek **Notifikasi**/overview → **Terima** lamaran. Akun B kini anggota.
6. Tab **Tugas**: buat tugas, assign ke anggota, set deadline/prioritas, seret
   antar kolom. Cek **beban kerja** & **deadline terdekat**.
7. Tab **Chat**: kirim pesan (realtime antar dua akun).
8. Tab **Referensi**: **import DOI** (mis. `10.1021/ci500020m`), simpan, lalu
   **export BibTeX** & **Vancouver**.
9. Tab **Publikasi**: atur authorship & urutan, target jurnal + status,
   klik **Auto-draft Metode** & **Auto-draft Hasil**, isi checklist, **Simpan**.
10. Tandai seluruh tahap selesai → progres pipeline 100%. Cek **Aktivitas** &
    **Dashboard** (proyek saya, tugas jatuh tempo, aktivitas terbaru).

Selesai — alur ide → tim → pipeline → data → publikasi berjalan end-to-end.
