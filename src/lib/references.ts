// Utilitas manajemen referensi & sitasi (BibTeX + Vancouver + import DOI via Crossref)
import type { Reference } from "@/types/database";

function citeKey(ref: Pick<Reference, "authors" | "year" | "title">): string {
  const firstAuthor =
    (ref.authors || "")
      .split(/,|and|;/)[0]
      ?.trim()
      .split(/\s+/)
      .pop() || "ref";
  const year = ref.year || "n.d.";
  const word =
    (ref.title || "")
      .split(/\s+/)
      .find((w) => w.length > 3)
      ?.replace(/[^a-zA-Z]/g, "") || "";
  return `${firstAuthor}${year}${word}`.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function toBibTeX(refs: Reference[]): string {
  return refs
    .map((r) => {
      const key = citeKey(r);
      const fields: string[] = [];
      if (r.authors) fields.push(`  author = {${r.authors}}`);
      if (r.title) fields.push(`  title = {${r.title}}`);
      if (r.journal) fields.push(`  journal = {${r.journal}}`);
      if (r.year) fields.push(`  year = {${r.year}}`);
      if (r.doi) fields.push(`  doi = {${r.doi}}`);
      if (r.url) fields.push(`  url = {${r.url}}`);
      return `@article{${key},\n${fields.join(",\n")}\n}`;
    })
    .join("\n\n");
}

// Format Vancouver (umum untuk jurnal medis)
export function toVancouver(refs: Reference[]): string {
  return refs
    .map((r, i) => {
      const parts: string[] = [];
      if (r.authors) parts.push(r.authors.replace(/\s*;\s*$/, "") + ".");
      if (r.title) parts.push(r.title.replace(/\.?$/, ".") + "");
      const tail: string[] = [];
      if (r.journal) tail.push(r.journal + ".");
      if (r.year) tail.push(String(r.year) + ";");
      let line = `${i + 1}. ${parts.join(" ")} ${tail.join(" ")}`.trim();
      if (r.doi) line += ` doi:${r.doi}.`;
      else if (r.url) line += ` Available from: ${r.url}`;
      return line;
    })
    .join("\n");
}

// Unduh teks sebagai file di browser
export function downloadText(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Import metadata dari DOI menggunakan Crossref (client-side fetch)
export interface DoiMeta {
  title: string;
  authors: string;
  year: number | null;
  journal: string;
  doi: string;
}

export async function fetchDoiMetadata(doiRaw: string): Promise<DoiMeta> {
  const doi = doiRaw.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  if (!res.ok) throw new Error("DOI tidak ditemukan");
  const json = await res.json();
  const m = json.message;
  const authors: string = (m.author || [])
    .map((a: { family?: string; given?: string }) =>
      [a.family, a.given].filter(Boolean).join(" ")
    )
    .join("; ");
  const year =
    m.issued?.["date-parts"]?.[0]?.[0] ??
    m.published?.["date-parts"]?.[0]?.[0] ??
    null;
  return {
    title: Array.isArray(m.title) ? m.title[0] : m.title || "",
    authors,
    year: year ? Number(year) : null,
    journal: Array.isArray(m["container-title"])
      ? m["container-title"][0]
      : m["container-title"] || "",
    doi,
  };
}
