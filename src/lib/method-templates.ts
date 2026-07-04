// Library template metode in silico.
// Sumber kebenaran untuk generate pipeline saat proyek dibuat + katalog metode.
// Tiap stage punya tool yang disarankan + checklist parameter kunci (reprodusibilitas).

export interface TemplateStage {
  name: string;
  description: string;
  suggestedTools: string[];
  paramChecklist: string[];
}

export interface MethodTemplateDef {
  key: string;
  name: string;
  category: string;
  description: string;
  suggestedTools: string[];
  stages: TemplateStage[];
}

const S = (
  name: string,
  description: string,
  suggestedTools: string[] = [],
  paramChecklist: string[] = []
): TemplateStage => ({ name, description, suggestedTools, paramChecklist });

export const METHOD_TEMPLATES: MethodTemplateDef[] = [
  {
    key: "molecular_docking",
    name: "Molecular Docking",
    category: "Structure-based",
    description:
      "Penambatan molekul ligan ke situs aktif reseptor untuk memperkirakan pose & binding affinity.",
    suggestedTools: ["AutoDock Vina", "PyMOL", "Open Babel", "Discovery Studio", "PLIP"],
    stages: [
      S("Studi Literatur & Target", "Identifikasi target protein, situs aktif, dan senyawa uji dari pustaka.", ["PubMed", "Google Scholar"], ["Kriteria pemilihan target", "Kriteria seleksi senyawa"]),
      S("Preparasi Reseptor", "Ambil struktur dari PDB, hilangkan air/ligan bawaan, tambah hidrogen & muatan.", ["RCSB PDB", "AutoDockTools", "PyMOL"], ["PDB ID", "Resolusi struktur (Å)", "Penambahan polar hydrogen", "Gasteiger charges"]),
      S("Preparasi Ligan", "Optimasi geometri & konversi format ligan (2D→3D).", ["Open Babel", "PubChem", "Avogadro"], ["Sumber senyawa (PubChem CID)", "Optimasi energi (force field)", "Format file (pdbqt)"]),
      S("Validasi Metode (Redocking)", "Redocking ligan kristalografi untuk memvalidasi protokol (RMSD < 2 Å).", ["AutoDock Vina", "PyMOL"], ["Nilai RMSD redocking", "Ukuran grid box (x,y,z)", "Koordinat center grid"]),
      S("Docking & Skoring", "Docking senyawa uji dan pencatatan binding affinity.", ["AutoDock Vina"], ["Exhaustiveness", "Jumlah mode", "Random seed", "Binding affinity (kcal/mol)"]),
      S("Analisis Interaksi", "Analisis ikatan hidrogen, hidrofobik, dan visualisasi pose terbaik.", ["PLIP", "Discovery Studio", "LigPlot+", "PyMOL"], ["Residu interaksi kunci", "Tipe interaksi"]),
      S("Penulisan & Publikasi", "Rangkum metode, hasil, dan diskusi menuju manuskrip.", [], ["Kelengkapan tabel hasil", "Kelengkapan gambar interaksi"]),
    ],
  },
  {
    key: "virtual_screening",
    name: "Virtual Screening",
    category: "Structure-based",
    description:
      "Penapisan library senyawa berskala besar untuk menemukan kandidat hit terhadap target.",
    suggestedTools: ["AutoDock Vina", "PyRx", "Open Babel", "RDKit", "ZINC", "Lipinski filter"],
    stages: [
      S("Definisi Target & Library", "Tentukan target dan kumpulkan library senyawa (database/koleksi).", ["ZINC", "PubChem", "ChEMBL"], ["Sumber library", "Jumlah senyawa awal"]),
      S("Filter Drug-likeness", "Saring dengan aturan Lipinski/Veber sebelum docking.", ["RDKit", "SwissADME", "DataWarrior"], ["Aturan filter (Lipinski/Veber)", "Jumlah lolos filter"]),
      S("Preparasi Target & Library", "Siapkan reseptor & konversi batch ligan.", ["AutoDockTools", "Open Babel"], ["Grid box", "Protokol preparasi batch"]),
      S("High-throughput Docking", "Docking massal & peringkat berdasarkan skor.", ["PyRx", "AutoDock Vina"], ["Exhaustiveness", "Cutoff skor", "Jumlah kandidat top"]),
      S("Seleksi Hit & Validasi", "Pilih hit teratas, inspeksi pose & interaksi.", ["PLIP", "PyMOL"], ["Kriteria seleksi hit", "Residu interaksi"]),
      S("Analisis ADMET Awal", "Profil ADMET kandidat terpilih.", ["SwissADME", "pkCSM"], ["Parameter ADMET kunci"]),
      S("Penulisan & Publikasi", "Susun laporan penapisan.", [], ["Kelengkapan pipeline seleksi"]),
    ],
  },
  {
    key: "molecular_dynamics",
    name: "Molecular Dynamics (MD)",
    category: "Simulation",
    description:
      "Simulasi dinamika atomistik kompleks protein-ligan untuk menilai stabilitas sepanjang waktu.",
    suggestedTools: ["GROMACS", "AMBER", "CHARMM-GUI", "VMD", "PyMOL"],
    stages: [
      S("Preparasi Sistem", "Bangun topologi, solvasi, tambah ion & netralisasi.", ["CHARMM-GUI", "GROMACS", "AMBER"], ["Force field", "Model air", "Ukuran box & jenis", "Konsentrasi ion"]),
      S("Minimisasi Energi", "Minimisasi untuk menghilangkan clash.", ["GROMACS"], ["Algoritma minimisasi", "Jumlah step", "Toleransi Fmax"]),
      S("Ekuilibrasi (NVT/NPT)", "Ekuilibrasi suhu & tekanan.", ["GROMACS"], ["Durasi NVT (ps)", "Durasi NPT (ps)", "Suhu (K)", "Tekanan (bar)"]),
      S("Produksi MD", "Jalankan lintasan produksi.", ["GROMACS", "AMBER"], ["Durasi simulasi (ns)", "Timestep (fs)", "Ensemble", "Random seed"]),
      S("Analisis Lintasan", "RMSD, RMSF, Rg, SASA, ikatan hidrogen.", ["GROMACS", "VMD", "MDAnalysis"], ["RMSD rata-rata", "RMSF residu kunci", "Jumlah H-bond"]),
      S("Penulisan & Publikasi", "Interpretasi stabilitas & manuskrip.", [], ["Kelengkapan grafik analisis"]),
    ],
  },
  {
    key: "mmpbsa_gbsa",
    name: "MM/PBSA-GBSA",
    category: "Simulation",
    description:
      "Estimasi energi bebas ikatan protein-ligan dari lintasan MD (metode end-point).",
    suggestedTools: ["gmx_MMPBSA", "AMBER (MMPBSA.py)", "GROMACS"],
    stages: [
      S("Persiapan Lintasan MD", "Gunakan lintasan produksi MD yang stabil.", ["GROMACS", "AMBER"], ["Rentang frame yang dipakai", "Interval sampling"]),
      S("Konfigurasi Perhitungan", "Atur metode (PB/GB), garam, dan dielektrik.", ["gmx_MMPBSA"], ["Metode (PB/GB)", "Konsentrasi garam", "Konstanta dielektrik interior/eksterior"]),
      S("Perhitungan ΔG Binding", "Hitung energi bebas ikatan.", ["gmx_MMPBSA", "MMPBSA.py"], ["ΔG binding (kcal/mol)", "Kontribusi entropi (jika ada)"]),
      S("Dekomposisi Energi", "Dekomposisi per-residu untuk hotspot.", ["gmx_MMPBSA"], ["Residu kontributor utama"]),
      S("Penulisan & Publikasi", "Sintesis hasil energetika.", [], ["Kelengkapan tabel energi"]),
    ],
  },
  {
    key: "qsar",
    name: "QSAR / QSPR",
    category: "Ligand-based",
    description:
      "Model hubungan kuantitatif struktur-aktivitas untuk memprediksi aktivitas/properti senyawa.",
    suggestedTools: ["RDKit", "PaDEL-Descriptor", "R", "scikit-learn", "DataWarrior", "Weka"],
    stages: [
      S("Kurasi Dataset", "Kumpulkan senyawa + nilai aktivitas, bersihkan duplikat.", ["ChEMBL", "PubChem"], ["Ukuran dataset", "Satuan aktivitas (IC50/pIC50)", "Kriteria kurasi"]),
      S("Perhitungan Deskriptor/Fingerprint", "Hitung deskriptor molekuler.", ["PaDEL-Descriptor", "RDKit", "Mordred"], ["Jenis deskriptor/fingerprint", "Jumlah deskriptor"]),
      S("Seleksi Fitur & Split Data", "Reduksi fitur & pembagian train/test.", ["scikit-learn", "R"], ["Metode seleksi fitur", "Rasio train/test", "Random seed"]),
      S("Pembangunan Model", "Latih model (MLR/PLS/RF/SVM).", ["scikit-learn", "Weka", "R"], ["Algoritma", "Hyperparameter"]),
      S("Validasi Model", "Validasi internal & eksternal, applicability domain.", ["scikit-learn"], ["R²", "Q²", "RMSE", "Applicability domain"]),
      S("Penulisan & Publikasi", "Laporkan model & prediksi.", [], ["Kelengkapan metrik validasi"]),
    ],
  },
  {
    key: "pharmacophore",
    name: "Pharmacophore Modeling",
    category: "Ligand-based",
    description:
      "Pemodelan fitur farmakofor (donor/akseptor/hidrofobik) untuk penapisan berbasis fitur.",
    suggestedTools: ["LigandScout", "Pharmit", "PharmaGist", "RDKit"],
    stages: [
      S("Kumpulkan Ligan Aktif", "Set ligan aktif (dan inaktif) sebagai basis model.", ["ChEMBL"], ["Jumlah ligan aktif/inaktif"]),
      S("Bangun Model Farmakofor", "Turunkan fitur farmakofor dari ligan/kompleks.", ["PharmaGist", "LigandScout"], ["Jumlah fitur", "Jenis fitur", "Toleransi"]),
      S("Validasi Model", "Uji dengan set decoy (ROC/EF).", ["Pharmit"], ["AUC ROC", "Enrichment factor"]),
      S("Screening Berbasis Farmakofor", "Penapisan library dengan model.", ["Pharmit"], ["Ukuran library", "Kriteria hit"]),
      S("Penulisan & Publikasi", "Rangkum model & hasil penapisan.", [], ["Kelengkapan validasi"]),
    ],
  },
  {
    key: "admet",
    name: "ADMET / Drug-likeness",
    category: "Ligand-based",
    description:
      "Prediksi absorpsi, distribusi, metabolisme, ekskresi, toksisitas & kemiripan obat.",
    suggestedTools: ["SwissADME", "pkCSM", "admetSAR", "ProTox-II"],
    stages: [
      S("Kurasi Senyawa", "Siapkan daftar senyawa (SMILES).", ["PubChem"], ["Jumlah senyawa", "Sumber SMILES"]),
      S("Drug-likeness", "Evaluasi Lipinski, Veber, Egan.", ["SwissADME"], ["Aturan yang dipakai", "Jumlah pelanggaran"]),
      S("Prediksi Farmakokinetik", "Absorpsi, BBB, CYP, klirens.", ["pkCSM", "admetSAR"], ["Parameter PK kunci"]),
      S("Prediksi Toksisitas", "Hepatotoksisitas, mutagenisitas, LD50.", ["ProTox-II", "admetSAR"], ["Endpoint toksisitas", "Kelas toksisitas"]),
      S("Penulisan & Publikasi", "Tabulasi profil ADMET.", [], ["Kelengkapan tabel ADMET"]),
    ],
  },
  {
    key: "network_pharmacology",
    name: "Network Pharmacology",
    category: "Systems",
    description:
      "Pendekatan sistem: senyawa → target → jalur, cocok untuk bahan alam/jamu multi-komponen.",
    suggestedTools: ["SwissTargetPrediction", "STRING", "Cytoscape", "DAVID", "KEGG", "GeneCards"],
    stages: [
      S("Koleksi Senyawa Aktif", "Kumpulkan senyawa bahan alam & skrining oral bioavailability.", ["TCMSP", "PubChem"], ["Sumber senyawa", "Kriteria OB/DL"]),
      S("Prediksi Target Senyawa", "Prediksi target protein tiap senyawa.", ["SwissTargetPrediction", "TargetNet"], ["Ambang probabilitas target"]),
      S("Target Penyakit", "Kumpulkan target terkait penyakit.", ["GeneCards", "OMIM", "DisGeNET"], ["Kata kunci penyakit", "Ambang skor relevansi"]),
      S("Irisan & PPI Network", "Irisan target senyawa-penyakit → jaringan PPI.", ["STRING", "Venn", "Cytoscape"], ["Confidence score STRING", "Jumlah node irisan"]),
      S("Analisis Jaringan & Hub", "Analisis topologi & pemilihan hub gene.", ["Cytoscape", "cytoHubba"], ["Metrik topologi (degree/betweenness)", "Jumlah hub"]),
      S("Enrichment GO & KEGG", "Analisis pengayaan fungsi & jalur.", ["DAVID", "KEGG", "Metascape"], ["Ambang p-value/FDR", "Jalur signifikan teratas"]),
      S("Docking Validasi", "Validasi ikatan hub gene–senyawa kunci.", ["AutoDock Vina", "PyMOL"], ["Grid box", "Binding affinity"]),
      S("Penulisan & Publikasi", "Sintesis mekanisme & manuskrip.", [], ["Kelengkapan gambar jaringan"]),
    ],
  },
  {
    key: "homology_modeling",
    name: "Homology Modeling",
    category: "Structure-based",
    description:
      "Prediksi struktur 3D protein berbasis template ketika struktur eksperimental tidak tersedia.",
    suggestedTools: ["MODELLER", "SWISS-MODEL", "PROCHECK", "MolProbity", "PyMOL"],
    stages: [
      S("Ambil Sekuens Target", "Dapatkan sekuens protein target.", ["UniProt", "NCBI"], ["UniProt ID", "Panjang sekuens"]),
      S("Pencarian & Seleksi Template", "Cari template homolog (identitas memadai).", ["BLAST", "HHpred"], ["Template PDB ID", "% identitas sekuens", "Coverage"]),
      S("Alignment & Pembangunan Model", "Alignment & bangun model 3D.", ["MODELLER", "SWISS-MODEL"], ["Metode alignment", "Jumlah model dihasilkan"]),
      S("Refinement & Validasi", "Loop refinement & validasi Ramachandran.", ["PROCHECK", "MolProbity", "ProSA"], ["% residu favored region", "Skor QMEAN/DOPE"]),
      S("Penulisan & Publikasi", "Dokumentasi model.", [], ["Kelengkapan Ramachandran plot"]),
    ],
  },
  {
    key: "bioinformatics_seq",
    name: "Bioinformatics (Sequence/BLAST)",
    category: "Sequence",
    description:
      "Analisis sekuens: pencarian homolog, alignment berganda, dan filogenetika.",
    suggestedTools: ["BLAST", "Clustal Omega", "MEGA", "MAFFT", "Jalview"],
    stages: [
      S("Pengumpulan Sekuens", "Kumpulkan sekuens dari database.", ["NCBI", "UniProt"], ["Jumlah sekuens", "Kriteria pemilihan"]),
      S("Pencarian Homolog (BLAST)", "Cari sekuens serupa.", ["BLAST"], ["Program BLAST", "E-value cutoff", "% identitas"]),
      S("Multiple Sequence Alignment", "Alignment berganda.", ["Clustal Omega", "MAFFT"], ["Algoritma alignment", "Parameter gap"]),
      S("Analisis Filogenetik", "Bangun pohon filogenetik.", ["MEGA", "IQ-TREE"], ["Metode (NJ/ML)", "Bootstrap", "Model substitusi"]),
      S("Penulisan & Publikasi", "Interpretasi konservasi/filogeni.", [], ["Kelengkapan pohon & alignment"]),
    ],
  },
  {
    key: "genomics_transcriptomics",
    name: "Genomics / Transcriptomics (DEG)",
    category: "Omics",
    description:
      "Analisis ekspresi gen diferensial (DEG) dan pengayaan jalur dari data RNA-seq/microarray.",
    suggestedTools: ["GEO", "R (DESeq2/limma)", "edgeR", "clusterProfiler", "GSEA", "Enrichr"],
    stages: [
      S("Akuisisi Data", "Unduh dataset ekspresi & metadata.", ["GEO", "ArrayExpress", "TCGA"], ["Accession dataset (GSE)", "Jumlah sampel/grup"]),
      S("Pra-pemrosesan & QC", "Normalisasi & kontrol kualitas.", ["R", "FastQC"], ["Metode normalisasi", "Kriteria QC"]),
      S("Analisis DEG", "Identifikasi gen diferensial.", ["DESeq2", "limma", "edgeR"], ["Ambang log2FC", "Ambang p-adj/FDR", "Jumlah DEG"]),
      S("Enrichment & Pathway", "GO/KEGG/GSEA pada DEG.", ["clusterProfiler", "Enrichr", "GSEA"], ["Ambang signifikansi", "Jalur teratas"]),
      S("Visualisasi", "Volcano, heatmap, PCA.", ["R (ggplot2)", "pheatmap"], ["Kelengkapan plot"]),
      S("Penulisan & Publikasi", "Sintesis temuan ekspresi.", [], ["Kelengkapan tabel DEG"]),
    ],
  },
  {
    key: "systems_biology",
    name: "Systems Biology",
    category: "Systems",
    description:
      "Pemodelan jaringan biologis & simulasi dinamika sistem (jalur metabolik/regulasi).",
    suggestedTools: ["Cytoscape", "COPASI", "CellDesigner", "SBML"],
    stages: [
      S("Rekonstruksi Jaringan", "Bangun model jaringan/jalur.", ["CellDesigner", "Cytoscape"], ["Sumber interaksi", "Jumlah komponen"]),
      S("Parameterisasi Model", "Tetapkan laju & kondisi awal.", ["COPASI"], ["Sumber parameter kinetik", "Kondisi awal"]),
      S("Simulasi & Analisis", "Simulasi dinamika & analisis sensitivitas.", ["COPASI"], ["Jenis simulasi", "Durasi", "Parameter sensitif"]),
      S("Validasi", "Bandingkan dengan data eksperimen.", [], ["Kriteria validasi"]),
      S("Penulisan & Publikasi", "Dokumentasi model (SBML).", ["SBML"], ["Ketersediaan model SBML"]),
    ],
  },
  {
    key: "peptide_docking",
    name: "Molecular Docking Peptida",
    category: "Structure-based",
    description:
      "Docking ligan peptida ke reseptor dengan mempertimbangkan fleksibilitas peptida.",
    suggestedTools: ["HPEPDOCK", "HADDOCK", "GalaxyPepDock", "PyMOL"],
    stages: [
      S("Preparasi Reseptor & Peptida", "Siapkan reseptor & struktur peptida.", ["PyMOL", "PEP-FOLD"], ["Sumber struktur peptida", "Protokol preparasi"]),
      S("Prediksi/Docking Peptida", "Docking peptida-protein.", ["HPEPDOCK", "GalaxyPepDock", "HADDOCK"], ["Server/metode", "Jumlah model", "Skor docking"]),
      S("Seleksi & Refinement", "Pilih model & refine antarmuka.", ["HADDOCK", "FlexPepDock"], ["Kriteria seleksi model"]),
      S("Analisis Interaksi", "Analisis antarmuka & ikatan.", ["PLIP", "PyMOL"], ["Residu antarmuka kunci"]),
      S("Penulisan & Publikasi", "Rangkum hasil.", [], ["Kelengkapan analisis antarmuka"]),
    ],
  },
  {
    key: "drug_repurposing",
    name: "Drug Repurposing",
    category: "Ligand-based",
    description:
      "Penemuan indikasi baru untuk obat yang sudah ada melalui pendekatan in silico.",
    suggestedTools: ["DrugBank", "AutoDock Vina", "SwissTargetPrediction", "STRING", "Connectivity Map"],
    stages: [
      S("Koleksi Obat Terdaftar", "Kumpulkan obat approved sebagai kandidat.", ["DrugBank", "ZINC"], ["Sumber daftar obat", "Jumlah kandidat"]),
      S("Identifikasi Target Penyakit", "Tentukan target/biomarker penyakit.", ["GeneCards", "DisGeNET"], ["Target utama"]),
      S("Screening/Docking Ulang", "Docking obat terhadap target baru.", ["AutoDock Vina", "PyRx"], ["Grid box", "Cutoff skor"]),
      S("Analisis Jaringan Obat-Target", "Bangun jaringan obat-target-penyakit.", ["Cytoscape", "STRING"], ["Metrik jaringan"]),
      S("Prioritasi Kandidat", "Peringkat kandidat repurposing.", [], ["Kriteria prioritas"]),
      S("Penulisan & Publikasi", "Susun laporan.", [], ["Kelengkapan rasionalisasi"]),
    ],
  },
  {
    key: "custom",
    name: "Custom / From Scratch",
    category: "Custom",
    description: "Mulai dari nol dan susun tahapan pipeline sesuai kebutuhan tim.",
    suggestedTools: [],
    stages: [
      S("Perencanaan", "Definisikan tujuan, pertanyaan penelitian, dan alur kerja.", [], ["Tujuan penelitian", "Definisi keluaran"]),
      S("Pelaksanaan", "Kerjakan analisis inti.", [], []),
      S("Analisis Hasil", "Interpretasi & visualisasi hasil.", [], []),
      S("Penulisan & Publikasi", "Susun manuskrip.", [], []),
    ],
  },
];

export function getTemplate(key: string): MethodTemplateDef | undefined {
  return METHOD_TEMPLATES.find((m) => m.key === key);
}

export const METHOD_CATEGORIES = Array.from(
  new Set(METHOD_TEMPLATES.map((m) => m.category))
);
