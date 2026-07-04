"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Input, Select, Badge, useToast } from "@/components/ui";
import { exportTableToXlsx, exportTableToCsv, parseCsvToRows } from "@/lib/export-xlsx";
import type { DataRow, DataTable } from "@/types/database";

export function DataTableEditor({
  table,
  initialRows,
}: {
  table: DataTable;
  initialRows: DataRow[];
}) {
  const supabase = createClient();
  const toast = useToast();
  const [rows, setRows] = useState<DataRow[]>(initialRows);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const columns = table.columns;

  function markSaved() {
    setSavedAt(new Date().toLocaleTimeString("id-ID"));
  }

  async function addRow(values?: Record<string, string>) {
    const empty: Record<string, string> = {};
    columns.forEach((c) => (empty[c.key] = values?.[c.key] ?? ""));
    const { data } = await supabase
      .from("data_rows")
      .insert({ table_id: table.id, values: empty, position: rows.length })
      .select()
      .single();
    if (data) setRows((r) => [...r, data as DataRow]);
  }

  async function duplicateRow(row: DataRow) {
    const { data } = await supabase
      .from("data_rows")
      .insert({
        table_id: table.id,
        values: row.values,
        source_label: row.source_label,
        source_url: row.source_url,
        position: rows.length,
      })
      .select()
      .single();
    if (data) setRows((r) => [...r, data as DataRow]);
    toast.push("Baris diduplikasi.", "success");
  }

  function updateCell(rowId: string, key: string, value: string) {
    setRows((r) =>
      r.map((row) => (row.id === rowId ? { ...row, values: { ...row.values, [key]: value } } : row))
    );
  }

  function updateSource(rowId: string, field: "source_label" | "source_url", value: string) {
    setRows((r) => r.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));
  }

  async function persistRow(row: DataRow) {
    await supabase
      .from("data_rows")
      .update({ values: row.values, source_label: row.source_label, source_url: row.source_url })
      .eq("id", row.id);
    markSaved();
  }

  async function deleteRow(rowId: string) {
    await supabase.from("data_rows").delete().eq("id", rowId);
    setRows((r) => r.filter((row) => row.id !== rowId));
    markSaved();
  }

  async function importCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCsvToRows(text, columns);
    if (parsed.length === 0) {
      toast.push("Tidak ada baris cocok. Pastikan header CSV sama dengan label kolom.", "error");
      return;
    }
    const payload = parsed.map((p, i) => ({
      table_id: table.id,
      values: p.values,
      source_label: p.source_label || null,
      source_url: p.source_url || null,
      position: rows.length + i,
    }));
    const { data } = await supabase.from("data_rows").insert(payload).select();
    if (data) setRows((r) => [...r, ...(data as DataRow[])]);
    toast.push(`${parsed.length} baris diimpor.`, "success");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{table.name}</h3>
          {savedAt && <span className="text-xs text-emerald-600">✓ tersimpan {savedAt}</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept=".csv" onChange={importCsv} className="hidden" />
          <Button size="sm" variant="subtle" onClick={() => fileRef.current?.click()}>Import CSV</Button>
          <Button size="sm" variant="outline" onClick={() => exportTableToCsv(table.name, columns, rows)}>.csv</Button>
          <Button size="sm" variant="outline" onClick={() => exportTableToXlsx(table.name, columns, rows)}>.xlsx</Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="mb-3 text-sm text-slate-500">Belum ada baris. Tambah baris atau import CSV.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
                {columns.map((c) => (
                  <th key={c.key} className="px-2 py-2 font-medium">{c.label}</th>
                ))}
                <th className="px-2 py-2 font-medium">Sumber</th>
                <th className="px-2 py-2 font-medium">Tautan / DOI</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800">
                  {columns.map((c) => (
                    <td key={c.key} className="px-1 py-1">
                      {c.type === "select" ? (
                        <Select
                          value={row.values[c.key] ?? ""}
                          onChange={(e) => {
                            updateCell(row.id, c.key, e.target.value);
                          }}
                          onBlur={() => persistRow(rows.find((r) => r.id === row.id)!)}
                        >
                          <option value="">—</option>
                          {(c.options ?? []).map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          type={c.type === "number" ? "number" : "text"}
                          className={c.type === "number" ? "tabular-nums" : ""}
                          value={row.values[c.key] ?? ""}
                          onChange={(e) => updateCell(row.id, c.key, e.target.value)}
                          onBlur={() => persistRow(rows.find((r) => r.id === row.id)!)}
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-1 py-1">
                    <Input
                      value={row.source_label ?? ""}
                      onChange={(e) => updateSource(row.id, "source_label", e.target.value)}
                      onBlur={() => persistRow(rows.find((r) => r.id === row.id)!)}
                      placeholder="mis. PubChem"
                    />
                  </td>
                  <td className="px-1 py-1">
                    <Input
                      value={row.source_url ?? ""}
                      onChange={(e) => updateSource(row.id, "source_url", e.target.value)}
                      onBlur={() => persistRow(rows.find((r) => r.id === row.id)!)}
                      placeholder="DOI / URL"
                    />
                  </td>
                  <td className="whitespace-nowrap px-1 py-1 text-right">
                    <button
                      onClick={() => duplicateRow(row)}
                      className="mr-2 text-xs text-slate-400 hover:text-brand-600"
                      title="Duplikat"
                    >
                      ⧉
                    </button>
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="text-xs text-slate-400 hover:text-rose-600"
                      title="Hapus"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" onClick={() => addRow()}>+ Tambah baris</Button>
        <Badge tone="slate">{rows.length} baris</Badge>
      </div>
    </Card>
  );
}
