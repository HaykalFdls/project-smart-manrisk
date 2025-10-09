"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, TrendingUp, TrendingDown } from "lucide-react"; // Import ikon

// --- Data Dummy Pilihan (untuk demonstrasi penggunaan Select) ---
const LEVEL_OPTIONS = ["1 (Sangat Rendah)", "2 (Rendah)", "3 (Sedang)", "4 (Tinggi)", "5 (Sangat Tinggi)"];
const RISK_OPTIONS = ["Strategis", "Operasional", "Keuangan", "Kepatuhan"];
// -------------------------------------------------------------

export default function RiskRegisterPage() {
  const [rows, setRows] = useState([
    // ... (Data inisial tetap sama)
    {
      kategori_risiko: "",
      jenis_risiko: "",
      skenario_risiko: "",
      root_cause: "",
      dampak: "",
      dampak_keuangan: "",
      tingkat_dampak_keuangan: "",
      dampak_operasional: "",
      tingkat_dampak_operasional: "",
      dampak_reputasi: "",
      tingkat_dampak_reputasi: "",
      dampak_regulasi: "",
      tingkat_dampak_regulasi: "",
      skor_kemungkinan: "",
      tingkat_kemungkinan: "",
      nilai_risiko: "",
      tingkat_risiko: "",
      rencana_penanganan: "",
      deskripsi_rencana_penanganan: "",
      risiko_residual: "",
      kriteria_penerimaan_risiko: "",
    },
  ]);

  const handleChange = (index: number, field: string, value: string) => {
    const newRows = [...rows];
    (newRows[index] as any)[field] = value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      // ... (Objek baris baru)
      {
        kategori_risiko: "",
        jenis_risiko: "",
        skenario_risiko: "",
        root_cause: "",
        dampak: "",
        dampak_keuangan: "",
        tingkat_dampak_keuangan: "",
        dampak_operasional: "",
        tingkat_dampak_operasional: "",
        dampak_reputasi: "",
        tingkat_dampak_reputasi: "",
        dampak_regulasi: "",
        tingkat_dampak_regulasi: "",
        skor_kemungkinan: "",
        tingkat_kemungkinan: "",
        nilai_risiko: "",
        tingkat_risiko: "",
        rencana_penanganan: "",
        deskripsi_rencana_penanganan: "",
        risiko_residual: "",
        kriteria_penerimaan_risiko: "",
      },
    ]);
  };

  const saveData = async () => {
    // ... (Logika penyimpanan)
    try {
      const res = await fetch("http://localhost:5000/risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data risiko");
      alert("✅ Data risiko berhasil disimpan!");
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Gagal menyimpan data risiko.");
    }
  };

  // Fungsi utilitas untuk menentukan komponen yang akan di-render
  const renderFieldComponent = (row: any, key: string, i: number) => {
    const value = row[key] || "";
    const onChange = (e: any) => handleChange(i, key, e.target.value);
    const onSelectChange = (v: string) => handleChange(i, key, v);

    // 1. SELECT Components (untuk konsistensi data)
    if (key.startsWith('tingkat_dampak') || key.startsWith('tingkat_kemungkinan') || key.startsWith('tingkat_risiko')) {
      return (
        <Select onValueChange={onSelectChange} value={value}>
          <SelectTrigger className="w-[120px] text-xs">
            <SelectValue placeholder="Tingkat" />
          </SelectTrigger>
          <SelectContent>
            {LEVEL_OPTIONS.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (key === 'kategori_risiko' || key === 'jenis_risiko') {
      return (
        <Select onValueChange={onSelectChange} value={value}>
          <SelectTrigger className="w-[150px] text-xs">
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            {RISK_OPTIONS.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (key === 'skor_kemungkinan' || key === 'nilai_risiko') {
      return (
        <Input
          type="number"
          value={value}
          onChange={onChange}
          className="w-[80px] text-center font-bold bg-yellow-50"
        />
      );
    }

    // 2. TEXTAREA Components (untuk input panjang)
    if (
      key.includes("deskripsi") ||
      key.includes("skenario") ||
      key.includes("rencana") ||
      key.includes("kriteria") ||
      key.includes("root_cause") ||
      key.includes("dampak")
    ) {
      return (
        <Textarea
          value={value}
          onChange={onChange}
          className="min-w-[220px] h-20 text-xs resize-y" // Tinggi tetap dan bisa di-resize
        />
      );
    }

    // 3. INPUT Components (default)
    return (
      <Input
        value={value}
        onChange={onChange}
        className="min-w-[150px] text-xs"
      />
    );
  };


  return (
    <Card className="p-6 shadow-xl rounded-xl">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
          <TrendingUp className="w-6 h-6" /> 
          Register Risiko Bisnis Inti
        </CardTitle>
        <p className="text-gray-500 text-sm mt-1">Gunakan tabel ini untuk mencatat, menilai, dan merencanakan mitigasi risiko.</p>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Aksi Tombol */}
        <div className="flex gap-4 mb-4">
          <Button variant="outline" onClick={addRow} className="flex items-center gap-2 text-primary border-primary hover:bg-primary/5">
            <Plus size={18} /> Tambah Baris
          </Button>
          <Button onClick={saveData} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
            <Save size={18} /> Simpan Data
          </Button>
        </div>

        {/* Tabel Utama */}
        <div className="overflow-x-auto border rounded-lg shadow-inner">
          <table className="min-w-[2800px] border-collapse text-sm"> 
            <thead className="bg-gray-800 text-white sticky top-0 z-10">
              <tr>
                <th rowSpan={2} className="border border-gray-700 px-3 py-2 whitespace-nowrap w-[150px] bg-gray-700">Kategori & Jenis Risiko</th>
                <th rowSpan={2} className="border border-gray-700 px-3 py-2 whitespace-nowrap w-[250px]">Skenario & Penyebab Utama</th>
                <th colSpan={4} className="border border-gray-700 px-3 py-1 text-center bg-red-700">Penilaian Dampak (Inherent)</th>
                <th colSpan={2} className="border border-gray-700 px-3 py-1 text-center bg-yellow-600">Skor Inherent</th>
                <th colSpan={3} className="border border-gray-700 px-3 py-1 text-center bg-blue-700">Penanganan & Residual</th>
              </tr>
              <tr>
                {[
                  "Dampak Keuangan", "Tingkat Dampak Keu.",
                  "Dampak Operasional", "Tingkat Dampak Ops.",
                  "Dampak Reputasi", "Tingkat Dampak Rep.",
                  "Dampak Regulasi", "Tingkat Dampak Reg.",
                  "Skor Kemungkinan", "Tingkat Kemungkinan",
                  "Nilai Risiko", "Tingkat Risiko",
                  "Rencana Penanganan", "Risiko Residual", "Kriteria Penerimaan"
                ].map((header, idx) => {
                  const isImpact = header.includes("Dampak");
                  const isLevel = header.includes("Tingkat");
                  const isScore = header.includes("Skor");
                  const isRiskValue = header.includes("Nilai Risiko");
                  const isMitigation = header.includes("Rencana") || header.includes("Residual") || header.includes("Penerimaan");

                  let bgClass = "bg-gray-700";
                  if (isImpact) bgClass = "bg-red-700";
                  if (isLevel) bgClass = "bg-red-800";
                  if (isScore || isRiskValue) bgClass = "bg-yellow-600";
                  if (isMitigation) bgClass = "bg-blue-700";
                  
                  return (
                      <th key={idx} className={`border border-gray-700 px-3 py-1 text-left whitespace-nowrap ${bgClass} font-normal text-xs`}>
                        {header}
                      </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50 transition-colors">
                  {Object.keys(row).map((key) => {
                    
                    // Kustomisasi Cell berdasarkan Key
                    let cellClasses = "border border-gray-200 px-2 py-1 align-top";
                    if (key.includes("skor") || key.includes("nilai")) {
                        cellClasses += " bg-yellow-50"; // Highlight skor
                    }

                    // Kategori dan Jenis Risiko digabungkan di sini untuk kerapihan visual
                    if (key === 'kategori_risiko') {
                        return (
                            <td key={'kategori_jenis'} className={cellClasses + " min-w-[150px]"}>
                                <div className="space-y-2">
                                    <p className="font-semibold text-xs text-gray-700">Kategori</p>
                                    {renderFieldComponent(row, 'kategori_risiko', i)}
                                    <p className="font-semibold text-xs text-gray-700">Jenis</p>
                                    {renderFieldComponent(row, 'jenis_risiko', i)}
                                </div>
                            </td>
                        );
                    }
                    if (key === 'jenis_risiko') return null; // Skip rendering jenis_risiko terpisah

                    // Skenario & Root Cause digabungkan
                    if (key === 'skenario_risiko') {
                        return (
                            <td key={'skenario_rootcause'} className={cellClasses + " min-w-[250px]"}>
                                <div className="space-y-2">
                                    <p className="font-semibold text-xs text-gray-700">Skenario</p>
                                    {renderFieldComponent(row, 'skenario_risiko', i)}
                                    <p className="font-semibold text-xs text-gray-700">Root Cause</p>
                                    {renderFieldComponent(row, 'root_cause', i)}
                                </div>
                            </td>
                        );
                    }
                    if (key === 'root_cause') return null; // Skip rendering root_cause terpisah

                    // Rencana Penanganan & Deskripsi digabungkan
                    if (key === 'rencana_penanganan') {
                        return (
                            <td key={'rencana_deskripsi'} className={cellClasses + " min-w-[250px]"}>
                                <div className="space-y-2">
                                    <p className="font-semibold text-xs text-gray-700">Rencana Penanganan</p>
                                    {renderFieldComponent(row, 'rencana_penanganan', i)}
                                    <p className="font-semibold text-xs text-gray-700">Deskripsi Rencana</p>
                                    {renderFieldComponent(row, 'deskripsi_rencana_penanganan', i)}
                                </div>
                            </td>
                        );
                    }
                    if (key === 'deskripsi_rencana_penanganan') return null; // Skip rendering deskripsi_rencana_penanganan terpisah
                    
                    return (
                      <td key={key} className={cellClasses}>
                        {renderFieldComponent(row, key, i)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Aksi */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <p className="text-gray-500 text-sm italic">Pastikan semua data diisi sebelum menyimpan.</p>
            <div className="flex gap-3">
                <Button variant="outline" onClick={addRow} className="flex items-center gap-2 text-primary border-primary hover:bg-primary/5">
                    <Plus size={18} /> Tambah Baris
                </Button>
                <Button onClick={saveData} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                    <Save size={18} /> Simpan Data
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}