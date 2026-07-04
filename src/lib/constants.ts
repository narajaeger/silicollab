// Konstanta domain in silico
import type { StageStatus, TaskStatus, TaskPriority, ManuscriptStatus } from "@/types/database";

// Tahapan default (fallback bila tak memilih template metode)
export const DEFAULT_STAGES: { name: string; description: string }[] = [
  { name: "Studi Literatur", description: "Pencarian pustaka, identifikasi gap, dan penentuan target." },
  { name: "Preparasi Target & Ligan", description: "Persiapan struktur protein/reseptor dan senyawa uji." },
  { name: "Analisis Inti", description: "Pelaksanaan metode in silico utama." },
  { name: "Analisis & Visualisasi", description: "Interpretasi hasil dan visualisasi." },
  { name: "Penulisan & Publikasi", description: "Penyusunan manuskrip hingga submisi jurnal." },
];

// Bidang penelitian in silico (untuk filter board)
export const RESEARCH_FIELDS = [
  "Molecular Docking",
  "Virtual Screening",
  "Molecular Dynamics",
  "MM/PBSA-GBSA",
  "QSAR / QSPR",
  "Pharmacophore Modeling",
  "ADMET / Drug-likeness",
  "Network Pharmacology",
  "Homology Modeling",
  "Bioinformatics",
  "Genomics / Transcriptomics",
  "Systems Biology",
  "Drug Repurposing",
  "Lainnya",
] as const;

// Contoh posisi/role dalam tim
export const SUGGESTED_ROLES = [
  "Literature Review",
  "Target Preparation",
  "Docking Lead",
  "MD Simulation",
  "Data Analyst",
  "Bioinformatician",
  "Manuscript Writer",
  "Project Coordinator",
];

// Label & warna status stage
export const STAGE_STATUS_META: Record<
  StageStatus,
  { label: string; tone: "slate" | "brand" | "emerald" | "amber"; hex: string }
> = {
  not_started: { label: "Belum mulai", tone: "slate", hex: "#94a3b8" },
  in_progress: { label: "Berjalan", tone: "brand", hex: "#2563eb" },
  done: { label: "Selesai", tone: "emerald", hex: "#059669" },
  blocked: { label: "Terblokir", tone: "amber", hex: "#d97706" },
};

export const TASK_STATUS_META: Record<TaskStatus, { label: string }> = {
  todo: { label: "Todo" },
  in_progress: { label: "In Progress" },
  review: { label: "Review" },
  done: { label: "Done" },
};

export const TASK_STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "review", "done"];

export const TASK_PRIORITY_META: Record<
  TaskPriority,
  { label: string; tone: "slate" | "amber" | "rose" }
> = {
  low: { label: "Rendah", tone: "slate" },
  medium: { label: "Sedang", tone: "amber" },
  high: { label: "Tinggi", tone: "rose" },
};

export const PROJECT_STATUS_META: Record<
  string,
  { label: string; tone: "brand" | "amber" | "emerald" | "slate" }
> = {
  open: { label: "Terbuka", tone: "brand" },
  in_progress: { label: "Berjalan", tone: "amber" },
  completed: { label: "Selesai", tone: "emerald" },
  archived: { label: "Arsip", tone: "slate" },
};

export const MANUSCRIPT_STATUS_META: Record<
  ManuscriptStatus,
  { label: string; tone: "slate" | "brand" | "amber" | "emerald" | "rose" }
> = {
  draft: { label: "Draft", tone: "slate" },
  submitted: { label: "Submitted", tone: "brand" },
  revision: { label: "Revision", tone: "amber" },
  accepted: { label: "Accepted", tone: "emerald" },
  rejected: { label: "Rejected", tone: "rose" },
};

// Checklist kelengkapan submisi jurnal (medis)
export const MANUSCRIPT_CHECKLIST_DEFAULT = [
  "Persetujuan etik (jika berlaku)",
  "Pernyataan ketersediaan data (data availability)",
  "Pernyataan conflict of interest",
  "Kontribusi penulis (authorship) disepakati",
  "Cover letter disiapkan",
  "Format sesuai pedoman jurnal target",
  "Daftar pustaka lengkap & konsisten",
];
