// Export/Import tabel tabulasi data (.xlsx & .csv)
import * as XLSX from "xlsx";
import type { ColumnDef, DataRow } from "@/types/database";

function buildAoa(columns: ColumnDef[], rows: DataRow[]): (string | number)[][] {
  const header = [...columns.map((c) => c.label), "Sumber", "Tautan Sumber"];
  const body = rows.map((row) => [
    ...columns.map((c) => row.values[c.key] ?? ""),
    row.source_label ?? "",
    row.source_url ?? "",
  ]);
  return [header, ...body];
}

function safeName(name: string) {
  return name.replace(/[^a-z0-9-_]+/gi, "_") || "tabel";
}

export function exportTableToXlsx(tableName: string, columns: ColumnDef[], rows: DataRow[]) {
  const worksheet = XLSX.utils.aoa_to_sheet(buildAoa(columns, rows));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, tableName.slice(0, 31) || "Data");
  XLSX.writeFile(workbook, `${safeName(tableName)}.xlsx`);
}

export function exportTableToCsv(tableName: string, columns: ColumnDef[], rows: DataRow[]) {
  const worksheet = XLSX.utils.aoa_to_sheet(buildAoa(columns, rows));
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName(tableName)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Parse CSV → array of {values} berdasarkan pencocokan header dengan kolom.
export function parseCsvToRows(
  csvText: string,
  columns: ColumnDef[]
): { values: Record<string, string>; source_label: string; source_url: string }[] {
  const wb = XLSX.read(csvText, { type: "string" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const aoa = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, blankrows: false });
  if (aoa.length < 2) return [];
  const header = (aoa[0] as string[]).map((h) => String(h).trim().toLowerCase());

  // Peta index kolom CSV → key kolom tabel (cocokkan berdasarkan label)
  const colIndex: Record<string, number> = {};
  columns.forEach((c) => {
    const idx = header.indexOf(c.label.trim().toLowerCase());
    if (idx >= 0) colIndex[c.key] = idx;
  });
  const srcIdx = header.findIndex((h) => ["sumber", "source"].includes(h));
  const urlIdx = header.findIndex((h) => ["tautan sumber", "url", "doi", "tautan"].includes(h));

  return (aoa.slice(1) as string[][]).map((r) => {
    const values: Record<string, string> = {};
    columns.forEach((c) => {
      const idx = colIndex[c.key];
      values[c.key] = idx != null && r[idx] != null ? String(r[idx]) : "";
    });
    return {
      values,
      source_label: srcIdx >= 0 && r[srcIdx] != null ? String(r[srcIdx]) : "",
      source_url: urlIdx >= 0 && r[urlIdx] != null ? String(r[urlIdx]) : "",
    };
  });
}
