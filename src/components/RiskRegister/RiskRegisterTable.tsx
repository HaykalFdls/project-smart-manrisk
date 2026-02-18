"use client";

import React, { FC, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Eye, Trash2 } from "lucide-react";

const MIN_SCORE = 1;
const MAX_SCORE = 5;

const ScoreInput: FC<{
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) return onChange(null);
    if (val < MIN_SCORE) val = MIN_SCORE;
    if (val > MAX_SCORE) val = MAX_SCORE;
    onChange(val);
  };

  return (
    <Input
      type="number"
      min={MIN_SCORE}
      max={MAX_SCORE}
      value={value ?? ""}
      onChange={handleChange}
      disabled={disabled}
      className="h-8 text-xs"
      placeholder="1-5"
    />
  );
};

const getLevelFromValue = (v: number | null) => {
  if (!v) return { label: "-", color: "bg-gray-100 text-gray-500" };
  if (v >= 20) return { label: "Sangat Tinggi", color: "bg-red-700 text-white" };
  if (v >= 12) return { label: "Tinggi", color: "bg-red-500 text-white" };
  if (v >= 5) return { label: "Menengah", color: "bg-yellow-400 text-black" };
  return { label: "Rendah", color: "bg-green-600 text-white" };
};

const JENIS_RISIKO_OPTIONS = [
  "Risiko Operasional",
  "Risiko Pasar",
  "Risiko Likuiditas",
  "Risiko Hukum",
  "Risiko Strategik",
  "Risiko Kepatuhan Syariah",
  "Risiko Pembiayaan",
  "Risiko Investasi",
];

type RiskRegisterTableProps = {
  data: any[];
  onChange?: (index: number, field: string, value: any) => void;
  onAutoSave?: (row: any) => Promise<void>;
  onBulkSubmit?: (rows: any[]) => Promise<void>;
  onDelete?: (row: any) => Promise<void>;
  canDelete?: (row: any) => boolean;
  readOnly?: boolean;
  showActions?: boolean;
};

const getStatusBadge = (status?: string) => {
  const s = String(status || "").toLowerCase();
  if (s === "approved") return "bg-green-100 text-green-700 border-green-200";
  if (s === "rejected") return "bg-red-100 text-red-700 border-red-200";
  if (s === "final") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (s === "reviewed") return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
};

const formatDateTime = (value: any) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("id-ID");
  } catch {
    return "-";
  }
};

const calcNilaiRisiko = (row: any) => {
  const dampaks = [row.dampak_keuangan, row.dampak_operasional, row.dampak_reputasi, row.dampak_regulasi].filter(
    (v) => typeof v === "number" && !Number.isNaN(v)
  );
  if (!dampaks.length || !row.skor_kemungkinan) return row.nilai_risiko ?? null;
  return Math.max(...dampaks) * row.skor_kemungkinan;
};

export const RiskRegisterTable: FC<RiskRegisterTableProps> = ({
  data,
  onChange = () => {},
  onAutoSave = async () => {},
  onBulkSubmit = async () => {},
  onDelete = async () => {},
  canDelete = () => false,
  readOnly = false,
  showActions = true,
}) => {
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [detailRisk, setDetailRisk] = useState<any | null>(null);

  const triggerAutoSave = (index: number) => {
    if (debounceTimeout) clearTimeout(debounceTimeout);

    const newTimeout = setTimeout(async () => {
      const row = data[index];
      try {
        await onAutoSave(row);
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 700);

    setDebounceTimeout(newTimeout);
  };

  return (
    <>
      <div className="relative border rounded-xl shadow-lg w-full flex flex-col bg-white">
        <div className="flex-1 overflow-auto max-h-[100vh]">
          <table className="w-full min-w-[1500px] divide-y divide-gray-200">
            <thead className="bg-slate-100 sticky top-0 z-10">
              <tr className="text-xs font-semibold text-slate-700">
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Unit</th>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Jenis</th>
                <th className="px-4 py-3 text-left">Skenario</th>
                <th className="px-4 py-3 text-left">Root Cause</th>
                <th className="px-4 py-3 text-left">Dampak</th>
                <th className="px-4 py-3 text-left">Skor</th>
                <th className="px-4 py-3 text-left">Nilai</th>
                <th className="px-4 py-3 text-left">Tingkat</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Updated</th>
                {showActions && <th className="px-4 py-3 text-center">Aksi</th>}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 13 : 12} className="px-4 py-10 text-center text-sm text-slate-500">
                    Tidak ada data risk.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  const isApproved = String(row?.status || "").toLowerCase() === "approved";
                  const canEdit = !readOnly && !isApproved;
                  const nilaiRisiko = calcNilaiRisiko(row);
                  const levelRisiko = getLevelFromValue(nilaiRisiko);

                  return (
                    <tr key={row.id || idx} className="hover:bg-slate-50 align-top">
                      <td className="px-4 py-3 text-sm text-slate-700">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{row.unit_name || "-"}</td>

                      <td className="px-4 py-2 min-w-[180px]">
                        {canEdit ? (
                          <Input
                            value={row.kategori_risiko ?? ""}
                            onChange={(e) => {
                              onChange(idx, "kategori_risiko", e.target.value);
                              triggerAutoSave(idx);
                            }}
                            className="h-8 text-xs"
                          />
                        ) : (
                          <div className="text-sm text-slate-700">{row.kategori_risiko || "-"}</div>
                        )}
                      </td>

                      <td className="px-4 py-2 min-w-[170px]">
                        {canEdit ? (
                          <Select
                            value={row.jenis_risiko || undefined}
                            onValueChange={(val) => {
                              onChange(idx, "jenis_risiko", val);
                              triggerAutoSave(idx);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Pilih jenis" />
                            </SelectTrigger>
                            <SelectContent>
                              {JENIS_RISIKO_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-sm text-slate-700">{row.jenis_risiko || "-"}</div>
                        )}
                      </td>

                      <td className="px-4 py-2 min-w-[220px]">
                        {canEdit ? (
                          <Textarea
                            value={row.skenario_risiko ?? ""}
                            onChange={(e) => {
                              onChange(idx, "skenario_risiko", e.target.value);
                              triggerAutoSave(idx);
                            }}
                            className="text-xs min-h-[52px]"
                          />
                        ) : (
                          <div className="text-sm text-slate-700 line-clamp-3">{row.skenario_risiko || "-"}</div>
                        )}
                      </td>

                      <td className="px-4 py-2 min-w-[220px]">
                        {canEdit ? (
                          <Textarea
                            value={row.root_cause ?? ""}
                            onChange={(e) => {
                              onChange(idx, "root_cause", e.target.value);
                              triggerAutoSave(idx);
                            }}
                            className="text-xs min-h-[52px]"
                          />
                        ) : (
                          <div className="text-sm text-slate-700 line-clamp-3">{row.root_cause || "-"}</div>
                        )}
                      </td>

                      <td className="px-4 py-2 min-w-[220px]">
                        {canEdit ? (
                          <Textarea
                            value={row.dampak ?? ""}
                            onChange={(e) => {
                              onChange(idx, "dampak", e.target.value);
                              triggerAutoSave(idx);
                            }}
                            className="text-xs min-h-[52px]"
                          />
                        ) : (
                          <div className="text-sm text-slate-700 line-clamp-3">{row.dampak || "-"}</div>
                        )}
                      </td>

                      <td className="px-4 py-2 min-w-[220px]">
                        <div className="grid grid-cols-2 gap-2">
                          <ScoreInput
                            value={row.dampak_keuangan ?? null}
                            disabled={!canEdit}
                            onChange={(v) => {
                              onChange(idx, "dampak_keuangan", v);
                              triggerAutoSave(idx);
                            }}
                          />
                          <ScoreInput
                            value={row.skor_kemungkinan ?? null}
                            disabled={!canEdit}
                            onChange={(v) => {
                              onChange(idx, "skor_kemungkinan", v);
                              triggerAutoSave(idx);
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Keuangan | Kemungkinan</p>
                      </td>

                      <td className="px-4 py-3 text-sm font-semibold text-slate-700">{nilaiRisiko ?? "-"}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${levelRisiko.color}`}>{row.tingkat_risiko || levelRisiko.label}</Badge>
                      </td>

                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusBadge(row.status)}`}>
                          {String(row.status || "-").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{formatDateTime(row.updated_at)}</td>

                      {showActions && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setDetailRisk(row)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {!readOnly && (
                              <Button
                                size="icon"
                                className="h-7 w-7 bg-green-600 hover:bg-green-700"
                                onClick={() => onBulkSubmit([row])}
                                disabled={String(row.status || "").toLowerCase() === "approved"}
                              >
                                <Send className="h-3 w-3" />
                              </Button>
                            )}
                            {!readOnly && canDelete(row) && (
                              <Button
                                size="icon"
                                variant="destructive"
                                className="h-7 w-7"
                                onClick={async () => {
                                  const confirmed = window.confirm("Hapus risk ini? Hanya draft yang bisa dihapus.");
                                  if (!confirmed) return;
                                  await onDelete(row);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={Boolean(detailRisk)}
        onOpenChange={(open) => {
          if (!open) setDetailRisk(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Risk #{detailRisk?.id}</DialogTitle>
          </DialogHeader>
          {detailRisk && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold">Unit:</span> {detailRisk.unit_name || "-"}
              </div>
              <div>
                <span className="font-semibold">Status:</span> {detailRisk.status || "-"}
              </div>
              <div>
                <span className="font-semibold">Kategori:</span> {detailRisk.kategori_risiko || "-"}
              </div>
              <div>
                <span className="font-semibold">Jenis:</span> {detailRisk.jenis_risiko || "-"}
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold">Skenario:</span> {detailRisk.skenario_risiko || "-"}
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold">Root Cause:</span> {detailRisk.root_cause || "-"}
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold">Dampak:</span> {detailRisk.dampak || "-"}
              </div>
              <div>
                <span className="font-semibold">Nilai Risiko:</span> {detailRisk.nilai_risiko ?? "-"}
              </div>
              <div>
                <span className="font-semibold">Tingkat Risiko:</span> {detailRisk.tingkat_risiko || "-"}
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold">Rencana:</span> {detailRisk.rencana_penanganan || "-"}
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold">Deskripsi Rencana:</span> {detailRisk.deskripsi_rencana_penanganan || "-"}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
