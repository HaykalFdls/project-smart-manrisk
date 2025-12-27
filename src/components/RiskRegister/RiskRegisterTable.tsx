"use client";

import React, { FC, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
// import {} from "@/lib/risk-register"; // Dibiarkan jika diperlukan

const MIN_SCORE = 1;
const MAX_SCORE = 5;

// ======================= HELPER COMPONENTS & FUNCTIONS =======================

// Komponen input angka validasi skala 1–5
const ScoreInput: FC<{
    value: number | null;
    onChange: (value: number | null) => void;
}> = ({ value, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = parseInt(e.target.value);
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
            className="text-center h-8 text-xs bg-white/70"
            placeholder="1-5" />
    );
};

// Fungsi helper: menentukan level risiko (warna label)
const getLevelFromValue = (v: number | null) => {
    if (!v) return { label: "-", color: "bg-gray-100 text-gray-500" };
    if (v >= 20) return { label: "Sangat Tinggi", color: "bg-red-700 text-white" };
    if (v >= 12) return { label: "Tinggi", color: "bg-red-500 text-white" };
    if (v >= 5) return { label: "Menengah", color: "bg-yellow-400 text-black" };
    return { label: "Rendah", color: "bg-green-600 text-white" };
};

// Fungsi helper: mendapatkan tingkat dampak (asumsi: hanya labelnya berdasarkan skor 1-5)
const getTingkatDampak = (score: number | null) => {
    if (!score) return { label: "-", color: "text-gray-500" };
    if (score === 5) return { label: "Sangat Signifikan", color: "text-red-700 font-semibold" };
    if (score === 4) return { label: "Signifikan", color: "text-red-500" };
    if (score === 3) return { label: "Cukup", color: "text-amber-500" };
    if (score === 2) return { label: "Ringan", color: "text-green-600" };
    return { label: "Tidak Signifikan", color: "text-green-800" };
};

// Pilihan jenis risiko
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

// ======================= KOMPONEN UTAMA =======================

type RiskRegisterTableProps = {
    data: any[]; // Gunakan Risk[] atau RiskFormValues[] jika sudah diimpor
    onChange: (index: number, field: string, value: any) => void;
    onAutoSave: (row: any) => Promise<void>;
    onBulkSubmit: (rows: any[]) => Promise<void>;
};

export const RiskRegisterTable: FC<RiskRegisterTableProps> = ({
    data,
    onChange,
    onAutoSave,
    onBulkSubmit,
}) => {
    const [savingIndex, setSavingIndex] = useState<number | null>(null);

    // Debounce state untuk auto-save
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

    // Fungsi untuk melakukan auto-save dengan debounce
    const triggerAutoSave = (index: number) => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        
        const newTimeout = setTimeout(async () => {
            setSavingIndex(index);
            const row = data[index];
            try {
                await onAutoSave(row);
                // Status berhasil (opsional)
            } catch (error) {
                console.error("Auto-save failed:", error);
                // Tampilkan notifikasi error (opsional)
            } finally {
                // Tampilkan status "Tersimpan" sebentar
                setTimeout(() => setSavingIndex(null), 1000); 
            }
        }, 800); // Debounce 800ms
        
        setDebounceTimeout(newTimeout);
    };

    // Tombol kirim semua
    const handleBulkSubmitClick = async () => {
        await onBulkSubmit(data);
    };

    // Definisi lebar kolom dan offset sticky
    const W_NO = "w-[40px]";
    const W_KATEGORI = "w-[250px]";
    const W_JENIS = "w-[150px]";
    const W_SCORE_INPUT = "w-[80px]";
    const W_SCORE_LABEL = "w-[120px]";

    // Hitung offset sticky untuk kolom Kategori Risiko
    const OFFSET_KATEGORI = W_NO.replace(/[^\d]/g, '') + 'px'; // '40px'

    return (
        <div className="relative border rounded-xl shadow-lg w-full flex flex-col bg-white">
            {/* Tombol Kirim Semua */}
            {/* <div className="flex justify-between items-center p-3 border-b bg-gray-50 rounded-t-xl">
                <h2 className="text-sm font-semibold text-gray-700"></h2>
                <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-xs shadow-md"
                    onClick={handleBulkSubmitClick}
                >
                    <Send className="h-3 w-3 mr-1" /> Kirim Semua Data
                </Button>
            </div> */}

            <div className="flex-1 overflow-auto max-h-[100vh]">
                <table className="min-w-[4200px] divide-y divide-gray-200">
                    <thead className="sticky top-0 z-20">
                        {/* Baris Header Utama */}
                        <tr className="text-xs font-bold text-white uppercase tracking-wider bg-gray-800 border-b border-gray-600">
                            <th className={`px-3 py-3 text-center sticky left-0 z-30 ${W_NO} bg-red-800 border-r border-gray-300 shadow-lg shadow-gray-900/10`}>No</th>
                            {/* Sticky Left: Kategori Risiko */}
                            <th className={`px-3 py-3 text-left sticky left-[${OFFSET_KATEGORI}] z-30 w-[350px] bg-red-800 border-r border-gray-300 shadow-lg shadow-gray-900/10`}>Kategori Risiko</th>
                            
                            {/* Kolom Tengah */}
                            <th className={`px-3 py-3 w-[250px] text-center bg-red-800 border-r border-gray-300`}>Jenis Risiko</th>
                            <th className="px-3 py-3 w-[250px] text-center bg-red-800 border-r border-gray-300">Skenario Risiko</th>
                            <th className="px-3 py-3 w-[250px] text-center bg-red-800 border-r border-gray-300">Root Cause</th>
                            <th className="px-3 py-2 w-[200px] text-center bg-red-800 border-r border-gray-300">Dampak (Deskripsi)</th>
                            
                            <th className="px-3 py-2 w-[250px] text-center bg-red-800 border-r border-gray-300">Dampak Keuangan (1-5)</th>
                            <th className="px-3 py-2 w-[250px] text-center bg-red-800 border-r border-gray-300">Tingkat Dampak Keuangan</th>
                            <th className="px-3 py-2 w-[250px] text-center bg-red-800 border-r border-gray-300">Dampak Operasional (1-5)</th>
                            <th className="px-3 py-2 w-[250px] text-center bg-red-800 border-r border-gray-300">Tingkat Dampak Operasional</th>
                            <th className="px-3 py-2 w-[250px] text-center bg-red-800 border-r border-gray-300">Dampak Reputasi (1-5)</th>
                            <th className="px-3 py-2 w-[250px] text-center bg-red-800 border-r border-gray-300">Tingkat Dampak Reputasi</th>
                            <th className="px-3 py-2 w-[250px] text-center bg-red-800 border-r border-gray-300">Dampak Regulasi (1-5)</th>
                            <th className="px-3 py-2 w-[250px] text-center bg-red-800 border-r border-gray-300">Tingkat Dampak Regulasi</th>

                            {/* Detail Risiko (Bg: Gray-400) */}
                            <th className="px-3 py-2 w-[250px] text-center bg-red-800 border-r border-gray-300">Skor Kemungkinan</th>
                            <th className="px-3 py-2 w-[250px] text-center bg-red-800 border-r border-gray-300">Tingkat Kemungkinan</th>
                            <th className="px-3 py-2 w-[120px] text-center bg-red-800 text-white border-r border-gray-300">Nilai Risiko</th>
                            <th className="px-3 py-2 w-[120px] text-center bg-red-800 text-white border-r border-gray-300">Tingkat Risiko</th>

                            {/* Detail Penanganan (Bg: Gray-300) */}
                            <th className="px-3 py-2 w-[250px] text-center bg-red-800 border-r border-gray-300">Rencana Penanganan Risiko (Risk Treatment Plan)</th>
                            <th className="px-3 py-2 w-[250px] text-center bg-red-800 border-r border-gray-300">Deskripsi Rencana Penanganan Risiko</th>
                            <th className="px-3 py-2 w-[250px] text-center bg-red-800 border-r border-gray-300">Risiko Residual</th>
                            <th className="px-3 py-2 w-[150px] text-center bg-red-800 border-r border-gray-300">Kriteria Penerimaan</th>
                            <th className="px-3 py-3 w-[100px] text-center bg-red-800 border-r border-gray-600">Pemilik Risiko</th>                            
                            {/* Sticky Right: Aksi */}
                            <th className="px-3 py-3 w-[80px] text-center sticky right-0 z-30 bg-red-800 border-l border-gray-600 shadow-lg shadow-gray-900/10">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {data.map((row, index) => {
                            // Hitung Dampak Agregat (ambil nilai dampak tertinggi)
                            const dampaks = [
                                row.dampak_keuangan,
                                row.dampak_operasional,
                                row.dampak_reputasi,
                                row.dampak_regulasi
                            ].filter(v => typeof v === 'number' && v !== null);

                            const maxDampak = dampaks.length > 0 ? Math.max(...dampaks) : null;
                            
                            // Hitung Nilai Risiko
                            // Nilai Risiko = Max Dampak * Skor Kemungkinan
                            const nilaiRisiko = maxDampak && row.skor_kemungkinan
                                ? maxDampak * row.skor_kemungkinan
                                : null;
                            const levelRisiko = getLevelFromValue(nilaiRisiko);

                            const isSaving = savingIndex === index;

                            return (
                                <tr key={index} className="text-xs text-gray-800 hover:bg-slate-50 transition-colors group">
                                    
                                    {/* No (Sticky Left) */}
                                    <td className={`text-center sticky left-0 z-10 ${W_NO} bg-white group-hover:bg-slate-50 border-r border-gray-200 font-bold p-2`}>
                                        {index + 1}
                                    </td>

                                    {/* Kategori Risiko (Sticky Left Offset) */}
                                    <td className={`text-left px-3 py-2 sticky left-[${OFFSET_KATEGORI}] z-10 ${W_KATEGORI} bg-white group-hover:bg-slate-50 border-r border-gray-200`}>
                                        <Textarea
                                            value={row.kategori_risiko ?? ""}
                                            onChange={(e) => {
                                                onChange(index, "kategori_risiko", e.target.value);
                                                triggerAutoSave(index);
                                            }}
                                            className="text-xs h-10"
                                            placeholder="Deskripsi risiko..."
                                        />
                                    </td>

                                    {/* Jenis Risiko */}
                                    <td className="px-2 py-1 border-r">
                                        <Select
                                            value={row.jenis_risiko || ""}
                                            onValueChange={(val) => {
                                                onChange(index, "jenis_risiko", val);
                                                triggerAutoSave(index);
                                            }}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Pilih Jenis" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {JENIS_RISIKO_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </td>

                                    {/* Skenario Risiko */}
                                    <td className="px-2 py-1 border-r">
                                        <Textarea
                                            value={row.skenario_risiko ?? ""}
                                            onChange={(e) => {
                                                onChange(index, "skenario_risiko", e.target.value);
                                                triggerAutoSave(index);
                                            }}
                                            className="text-xs h-10"
                                            placeholder="Skenario..."
                                        />
                                    </td>

                                    {/* Root Cause */}
                                    <td className="px-2 py-1 border-r">
                                        <Textarea
                                            value={row.root_cause ?? ""}
                                            onChange={(e) => {
                                                onChange(index, "root_cause", e.target.value);
                                                triggerAutoSave(index);
                                            }}
                                            className="text-xs h-10"
                                            placeholder="Akar penyebab..."
                                        />
                                    </td>

                                    {/* Dampak (Deskripsi) */}
                                    <td className="px-2 py-1 border-r bg-gray-100">
                                        <Textarea
                                            value={row.dampak ?? ""}
                                            onChange={(e) => {
                                                // Koreksi field ke "dampak" (sesuai skema)
                                                onChange(index, "dampak", e.target.value); 
                                                triggerAutoSave(index);
                                            }}
                                            className="text-xs h-10"
                                            placeholder="Jelaskan dampak..."
                                        />
                                    </td>

                                    {/* Dampak Keuangan (Input & Tingkat) */}
                                    <td className={`text-center border-r bg-gray-50 ${W_SCORE_INPUT} p-1`}>
                                        <ScoreInput
                                            value={row.dampak_keuangan ?? null}
                                            onChange={(v) => {
                                                onChange(index, "dampak_keuangan", v);
                                                triggerAutoSave(index);
                                            }}
                                        />
                                    </td>
                                    <td className={`text-center border-r bg-gray-100 ${W_SCORE_LABEL} p-2`}>
                                        <span className={getTingkatDampak(row.dampak_keuangan).color}>
                                            {getTingkatDampak(row.dampak_keuangan).label}
                                        </span>
                                    </td>

                                    {/* Dampak Operasional (Input & Tingkat) */}
                                    <td className={`text-center border-r bg-gray-50 ${W_SCORE_INPUT} p-1`}>
                                        <ScoreInput
                                            value={row.dampak_operasional ?? null}
                                            onChange={(v) => {
                                                onChange(index, "dampak_operasional", v);
                                                triggerAutoSave(index);
                                            }}
                                        />
                                    </td>
                                    <td className={`text-center border-r bg-gray-100 ${W_SCORE_LABEL} p-2`}>
                                        <span className={getTingkatDampak(row.dampak_operasional).color}>
                                            {getTingkatDampak(row.dampak_operasional).label}
                                        </span>
                                    </td>

                                    {/* Dampak Reputasi (Input & Tingkat) */}
                                    <td className={`text-center border-r bg-gray-50 ${W_SCORE_INPUT} p-1`}>
                                        <ScoreInput
                                            value={row.dampak_reputasi ?? null}
                                            onChange={(v) => {
                                                onChange(index, "dampak_reputasi", v);
                                                triggerAutoSave(index);
                                            }}
                                        />
                                    </td>
                                    <td className={`text-center border-r bg-gray-100 ${W_SCORE_LABEL} p-2`}>
                                        <span className={getTingkatDampak(row.dampak_reputasi).color}>
                                            {getTingkatDampak(row.dampak_reputasi).label}
                                        </span>
                                    </td>

                                    {/* Dampak Regulasi (Input & Tingkat) */}
                                    <td className={`text-center border-r bg-gray-50 ${W_SCORE_INPUT} p-1`}>
                                        <ScoreInput
                                            value={row.dampak_regulasi ?? null}
                                            onChange={(v) => {
                                                onChange(index, "dampak_regulasi", v);
                                                triggerAutoSave(index);
                                            }}
                                        />
                                    </td>
                                    <td className={`text-center border-r bg-gray-100 ${W_SCORE_LABEL} p-2`}>
                                        <span className={getTingkatDampak(row.dampak_regulasi).color}>
                                            {getTingkatDampak(row.dampak_regulasi).label}
                                        </span>
                                    </td>

                                    {/* Skor Kemungkinan */}
                                    <td className={`text-center border-r bg-gray-200 ${W_SCORE_INPUT} p-1`}>
                                        <ScoreInput
                                            value={row.skor_kemungkinan ?? null}
                                            onChange={(v) => {
                                                onChange(index, "skor_kemungkinan", v);
                                                triggerAutoSave(index);
                                            }}
                                        />
                                    </td>
                                    <td className={`text-center border-r bg-gray-200 ${W_SCORE_LABEL} p-2`}>
                                        {/* TINGKAT KEMUNGKINAN: Asumsi menggunakan fungsi yang sama */}
                                        <span className={getTingkatDampak(row.skor_kemungkinan).color}>
                                            {getTingkatDampak(row.skor_kemungkinan).label}
                                        </span>
                                    </td>

                                    {/* Nilai Risiko (Result) */}
                                    <td className="text-center border-r font-bold bg-gray-300 p-2">
                                        {nilaiRisiko || "-"}
                                    </td>

                                    {/* Tingkat Risiko (Level) */}
                                    <td className="text-center border-r bg-gray-300 p-2">
                                        <Badge className={`justify-center w-full shadow-sm ${levelRisiko.color}`}>
                                            {levelRisiko.label}
                                        </Badge>
                                    </td>

                                    {/* Rencana Penanganan Risiko */}
                                    <td className="px-2 py-1 border-r">
                                        <Textarea
                                            value={row.rencana_penanganan ?? ""}
                                            onChange={(e) => {
                                                onChange(index, "rencana_penanganan", e.target.value);
                                                triggerAutoSave(index);
                                            }}
                                            className="text-xs h-10"
                                            placeholder="Tipe Penanganan (Mis: Menghindari, Mengurangi, dst.)..."
                                        />
                                    </td>

                                    {/* Deskripsi Rencana Penanganan */}
                                    <td className="px-2 py-1 border-r">
                                        <Textarea
                                            value={row.deskripsi_rencana_penanganan ?? ""}
                                            onChange={(e) => {
                                                onChange(index, "deskripsi_rencana_penanganan", e.target.value);
                                                triggerAutoSave(index);
                                            }}
                                            className="text-xs h-10"
                                            placeholder="Detail aksi mitigasi..."
                                        />
                                    </td>

                                    {/* Risiko Residual */}
                                    <td className="px-2 py-1 border-r">
                                        <Input
                                            value={row.risiko_residual ?? ""}
                                            onChange={(e) => {
                                                onChange(index, "risiko_residual", e.target.value);
                                                triggerAutoSave(index);
                                            }}
                                            className="text-xs h-8"
                                            placeholder="Tingkat Residual..."
                                        />
                                    </td>

                                    {/* Kriteria Penerimaan Risiko */}
                                    <td className="px-2 py-1 border-r">
                                        <Textarea
                                            value={row.kriteria_penerimaan_risiko ?? ""}
                                            onChange={(e) => {
                                                onChange(index, "kriteria_penerimaan_risiko", e.target.value);
                                                triggerAutoSave(index);
                                            }}
                                            className="text-xs h-10"
                                            placeholder="Kriteria penerimaan..."
                                        />
                                    </td>
                                    
                                    {/* Pemilik Risiko (Input ID/Nama) */}
                                    <td className="px-2 py-1 border-r">
                                        <Input
                                            // Asumsi: Anda menginput ID pemilik risiko, atau nama yang di-map ke ID
                                            value={row.pemilik_risiko ?? ""} 
                                            onChange={(e) => {
                                                onChange(index, "pemilik_risiko", e.target.value);
                                                triggerAutoSave(index);
                                            }}
                                            className="text-xs h-8"
                                            placeholder="ID/Nama PIC..."
                                        />
                                    </td>

                                    {/* Status & Aksi (Sticky Right) */}
                                    <td className="sticky right-0 z-10 w-[80px] bg-white group-hover:bg-slate-50 text-center border-l border-gray-200 p-2 flex flex-col items-center justify-center space-y-1">
                                        <Button
                                            size="icon"
                                            className="h-6 px-2 text-[10px] bg-green-600 hover:bg-green-700 shadow-md"
                                            onClick={() => onBulkSubmit([row])}
                                        >
                                            <Send className="h-3 w-3" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};