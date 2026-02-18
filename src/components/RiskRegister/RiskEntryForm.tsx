"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RiskEntryFormProps = {
  onSubmit: (data: any) => void | Promise<void>;
  onCancel: () => void;
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

const RENCANA_OPTIONS = ["Mitigasi", "Transfer", "Hindari", "Terima"];
const RESIDUAL_OPTIONS = ["Rendah", "Menengah", "Tinggi", "Sangat Tinggi"];

const toImpactLevel = (score: number | null) => {
  if (!score) return null;
  if (score >= 5) return "Sangat Tinggi";
  if (score >= 4) return "Tinggi";
  if (score >= 3) return "Sedang";
  return "Rendah";
};

const toLikelihoodLevel = (score: number | null) => {
  if (!score) return null;
  if (score >= 5) return "Hampir Pasti";
  if (score >= 4) return "Sering";
  if (score >= 3) return "Kadang Terjadi";
  if (score >= 2) return "Jarang";
  return "Sangat Jarang";
};

const toRiskLevel = (nilai: number | null) => {
  if (!nilai) return null;
  if (nilai >= 12) return "High";
  if (nilai >= 5) return "Medium";
  return "Low";
};

const toScore = (v: string) => {
  if (v.trim() === "") return null;
  const num = Number(v);
  if (Number.isNaN(num)) return null;
  return Math.max(1, Math.min(5, Math.trunc(num)));
};

type ScoreField =
  | "dampak_keuangan"
  | "dampak_operasional"
  | "dampak_reputasi"
  | "dampak_regulasi"
  | "skor_kemungkinan";

export function RiskEntryForm({ onSubmit, onCancel }: RiskEntryFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    kategori_risiko: "",
    jenis_risiko: "",
    skenario_risiko: "",
    root_cause: "",
    dampak: "",
    dampak_keuangan: null as number | null,
    dampak_operasional: null as number | null,
    dampak_reputasi: null as number | null,
    dampak_regulasi: null as number | null,
    skor_kemungkinan: null as number | null,
    rencana_penanganan: "",
    deskripsi_rencana_penanganan: "",
    risiko_residual: "",
    kriteria_penerimaan_risiko: "",
  });

  const nilaiRisiko = useMemo(() => {
    const impacts = [
      form.dampak_keuangan,
      form.dampak_operasional,
      form.dampak_reputasi,
      form.dampak_regulasi,
    ].filter((v): v is number => typeof v === "number");

    if (!impacts.length || !form.skor_kemungkinan) return null;
    return Math.max(...impacts) * form.skor_kemungkinan;
  }, [
    form.dampak_keuangan,
    form.dampak_operasional,
    form.dampak_reputasi,
    form.dampak_regulasi,
    form.skor_kemungkinan,
  ]);

  const tingkatRisiko = useMemo(() => toRiskLevel(nilaiRisiko), [nilaiRisiko]);

  const updateScore = (key: ScoreField, value: string) => {
    setForm((prev) => ({ ...prev, [key]: toScore(value) }));
  };

  const handleSubmit = async () => {
    if (!form.kategori_risiko.trim() || !form.jenis_risiko || !form.skenario_risiko.trim() || !form.root_cause.trim()) {
      setError("Kategori, jenis, skenario, dan root cause wajib diisi.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        tingkat_dampak_keuangan: toImpactLevel(form.dampak_keuangan),
        tingkat_dampak_operasional: toImpactLevel(form.dampak_operasional),
        tingkat_dampak_reputasi: toImpactLevel(form.dampak_reputasi),
        tingkat_dampak_regulasi: toImpactLevel(form.dampak_regulasi),
        tingkat_kemungkinan: toLikelihoodLevel(form.skor_kemungkinan),
        nilai_risiko: nilaiRisiko,
        tingkat_risiko: tingkatRisiko,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">Kategori Risiko</label>
          <Input
            className="mt-1.5"
            placeholder="Contoh: Operasional TI"
            value={form.kategori_risiko}
            onChange={(e) => setForm((prev) => ({ ...prev, kategori_risiko: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Jenis Risiko</label>
          <Select
            value={form.jenis_risiko || undefined}
            onValueChange={(value) => setForm((prev) => ({ ...prev, jenis_risiko: value }))}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Pilih jenis risiko" />
            </SelectTrigger>
            <SelectContent>
              {JENIS_RISIKO_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Rencana Penanganan</label>
          <Select
            value={form.rencana_penanganan || undefined}
            onValueChange={(value) => setForm((prev) => ({ ...prev, rencana_penanganan: value }))}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Pilih rencana" />
            </SelectTrigger>
            <SelectContent>
              {RENCANA_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">Skenario Risiko</label>
          <Textarea
            className="mt-1.5"
            rows={3}
            placeholder="Ceritakan apa yang mungkin terjadi..."
            value={form.skenario_risiko}
            onChange={(e) => setForm((prev) => ({ ...prev, skenario_risiko: e.target.value }))}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">Akar Penyebab (Root Cause)</label>
          <Textarea
            className="mt-1.5"
            rows={2}
            placeholder="Mengapa hal ini bisa terjadi?"
            value={form.root_cause}
            onChange={(e) => setForm((prev) => ({ ...prev, root_cause: e.target.value }))}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">Dampak (Deskripsi)</label>
          <Textarea
            className="mt-1.5"
            rows={2}
            placeholder="Jelaskan dampak apabila risiko terjadi"
            value={form.dampak}
            onChange={(e) => setForm((prev) => ({ ...prev, dampak: e.target.value }))}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-800">Skoring Risiko (1-5)</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-600">Dampak Keuangan</label>
            <Input
              type="number"
              min={1}
              max={5}
              value={form.dampak_keuangan ?? ""}
              onChange={(e) => updateScore("dampak_keuangan", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">Dampak Operasional</label>
            <Input
              type="number"
              min={1}
              max={5}
              value={form.dampak_operasional ?? ""}
              onChange={(e) => updateScore("dampak_operasional", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">Dampak Reputasi</label>
            <Input
              type="number"
              min={1}
              max={5}
              value={form.dampak_reputasi ?? ""}
              onChange={(e) => updateScore("dampak_reputasi", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">Dampak Regulasi</label>
            <Input
              type="number"
              min={1}
              max={5}
              value={form.dampak_regulasi ?? ""}
              onChange={(e) => updateScore("dampak_regulasi", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">Skor Kemungkinan</label>
            <Input
              type="number"
              min={1}
              max={5}
              value={form.skor_kemungkinan ?? ""}
              onChange={(e) => updateScore("skor_kemungkinan", e.target.value)}
            />
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
            <p className="text-xs text-slate-500">Nilai Risiko</p>
            <p className="text-sm font-semibold text-slate-800">{nilaiRisiko ?? "-"}</p>
            <p className="text-xs text-slate-500 mt-1">Tingkat: {tingkatRisiko || "-"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-700">Risiko Residual</label>
          <Select
            value={form.risiko_residual || undefined}
            onValueChange={(value) => setForm((prev) => ({ ...prev, risiko_residual: value }))}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Pilih tingkat residual" />
            </SelectTrigger>
            <SelectContent>
              {RESIDUAL_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">Deskripsi Rencana Penanganan</label>
          <Textarea
            className="mt-1.5"
            rows={2}
            placeholder="Contoh: audit internal tambahan, perbaikan SOP, monitoring berkala"
            value={form.deskripsi_rencana_penanganan}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, deskripsi_rencana_penanganan: e.target.value }))
            }
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">Kriteria Penerimaan Risiko</label>
          <Textarea
            className="mt-1.5"
            rows={2}
            placeholder="Contoh: risiko diterima setelah kontrol tambahan efektif"
            value={form.kriteria_penerimaan_risiko}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, kriteria_penerimaan_risiko: e.target.value }))
            }
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-medium"
          disabled={submitting}
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-md shadow-blue-100 disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Menyimpan..." : "Kirim Risiko"}
        </button>
      </div>
    </div>
  );
}
