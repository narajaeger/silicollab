# Keterbatasan SiliCollab (WAJIB DIBACA)

SiliCollab adalah **alat kolaborasi, orkestrasi pipeline, dan dokumentasi**
penelitian in silico — **bukan mesin komputasi**. Bagian ini ditulis jujur agar
ekspektasi pengguna tepat.

## Apa yang TIDAK dilakukan aplikasi ini

- **Tidak menjalankan komputasi apa pun.** Aplikasi tidak melakukan molecular
  docking, molecular dynamics (MD), MM/PBSA, QSAR, prediksi ADMET, analisis
  jaringan, alignment sekuens, atau analisis omics. Tidak ada engine docking,
  solver MD, atau model prediktif di dalamnya.
- **Tidak menggantikan tools eksternal.** AutoDock Vina, GROMACS, AMBER,
  SwissADME, pkCSM, Cytoscape, STRING, DAVID, MODELLER, RDKit, dan lainnya tetap
  dijalankan pengguna di lingkungan masing-masing. Hasilnya **dimasukkan** ke
  aplikasi lewat input manual, import CSV, upload file, atau tautan
  (Drive/Zenodo/GitHub) — **bukan dieksekusi** oleh aplikasi.
- **Tidak memvalidasi kebenaran ilmiah data.** Angka binding affinity, RMSD,
  p-value, dsb. yang dimasukkan tidak diverifikasi ulang secara komputasional.

## Peran sebenarnya aplikasi ini

- Mempertemukan peneliti lintas universitas (matchmaking & rekrutmen).
- Memandu & melacak seluruh pipeline metode in silico (template metode, tahapan,
  status, progres).
- Menabulasi data, mencatat **tool + parameter** untuk reprodusibilitas.
- Mengelola sumber, referensi, dan sitasi.
- Mengoordinasikan tugas, diskusi, dan alur menuju publikasi.

## Tentang fitur "auto-draft" Metode & Hasil

- Draft bagian **Metode** dirangkai dari catatan **Panel Reprodusibilitas**
  (tool, versi, OS/hardware, parameter). Draft bagian **Hasil** dirangkai dari
  ringkasan **tabel data** (nama tabel, variabel, jumlah entri).
- Ini murni penataan teks dari data yang **kamu** masukkan — **bukan** analisis
  atau interpretasi ilmiah. **Wajib diperiksa, dikoreksi, dan disunting** oleh
  peneliti sebelum dipakai. Jangan pernah men-submit draft otomatis tanpa
  verifikasi.

## Tentang import DOI (Crossref)

- Import metadata referensi memanggil API publik Crossref dari browser. Akurasi
  bergantung pada data Crossref dan **harus diperiksa** setelah diimpor.

## Akurasi & tanggung jawab hasil

- Akurasi dan validitas hasil penelitian **sepenuhnya bergantung pada tools
  eksternal** dan keputusan metodologis pengguna. Aplikasi hanya menyimpan,
  menata, dan menyajikan apa yang dimasukkan.

## Tentang model Fable

- Model **Claude Fable 5** dipakai untuk membantu **menulis/menyusun kode
  aplikasi ini** (kualitas & kecepatan penulisan kode). Ini **tidak ada
  hubungannya** dengan performa komputasi riset in silico. Fable tidak
  menjalankan docking/MD/QSAR dan tidak meningkatkan akurasi ilmiah hasil.

## Batasan teknis lain

- **Upload file** memerlukan Supabase Storage bucket bernama `attachments`
  (lihat checklist setup). Tanpa bucket, gunakan fitur "tautkan URL".
- **Realtime** (chat & komentar) memerlukan Realtime aktif pada tabel terkait
  (sudah diaktifkan di migrasi).
- Aplikasi mengandalkan **Row Level Security (RLS)** Supabase; pastikan seluruh
  migrasi RLS dijalankan agar data antar-proyek terlindungi.
