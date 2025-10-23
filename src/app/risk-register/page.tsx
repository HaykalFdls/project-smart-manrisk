"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Save, TrendingUp } from "lucide-react";

// --- Data Pilihan ---
const LEVEL_OPTIONS = [
  "1 (Sangat Rendah)",
  "2 (Rendah)",
  "3 (Sedang)",
  "4 (Tinggi)",
  "5 (Sangat Tinggi)",
];
const RISK_OPTIONS = [
  "Strategis",
  "Operasional",
  "Keuangan",
  "Kepatuhan",
  "Teknologi",
];

const RENDER_KEYS = [
  "kategori_risiko",
  "jenis_risiko",
  "skenario_risiko",
  "root_cause",
  "dampak", 
  "dampak_keuangan",
  "tingkat_dampak_keuangan",
  "dampak_operasional",
  "tingkat_dampak_operasional",
  "dampak_reputasi",
  "tingkat_dampak_reputasi",
  "dampak_regulasi",
  "tingkat_dampak_regulasi",
  "skor_kemungkinan",
  "tingkat_kemungkinan",
  "nilai_risiko",
  "tingkat_risiko",
  "rencana_penanganan",
  "deskripsi_rencana_penanganan",
  "risiko_residual",
  "kriteria_penerimaan_risiko",
  "pemilik_risiko",
];

export default function RiskRegisterPage() {
  // State untuk menampung data baris tabel
  const [rows, setRows] = useState([
    {
      kategori_risiko: "Operasional",
      jenis_risiko: "Kegagalan Proses",
      skenario_risiko:
        "Keterlambatan penyelesaian proyek karena miskomunikasi antar tim.",
      root_cause:
        "Kurangnya platform manajemen proyek terpusat dan SOP komunikasi yang jelas.",
      dampak:
        "Proyek tertunda, biaya membengkak, dan reputasi internal menurun.", 
      dampak_keuangan: "3",
      tingkat_dampak_keuangan: LEVEL_OPTIONS[2],
      dampak_operasional: "4",
      tingkat_dampak_operasional: LEVEL_OPTIONS[3],
      dampak_reputasi: "2",
      tingkat_dampak_reputasi: LEVEL_OPTIONS[1],
      dampak_regulasi: "1",
      tingkat_dampak_regulasi: LEVEL_OPTIONS[0],
      skor_kemungkinan: "4",
      tingkat_kemungkinan: LEVEL_OPTIONS[3],
      nilai_risiko: "16", // 4 * 4
      tingkat_risiko: "Tinggi",
      rencana_penanganan:
        "Mengimplementasikan sistem JIRA/Trello dan mengadakan pelatihan SOP komunikasi.",
      deskripsi_rencana_penanganan:
        "Sistem akan diterapkan dalam 1 bulan. Penanggung jawab: PMO.",
      risiko_residual: "3",
      kriteria_penerimaan_risiko:
        "Keterlambatan maksimal 5 hari kerja per proyek.",
      pemilik_risiko: "Pemimpin Divisi Manajemen Risiko",
    },
  ]);

  // Handler untuk perubahan input
  const handleChange = useCallback((index, field, value) => {
    setRows((prevRows) => {
      const newRows = [...prevRows];
      newRows[index][field] = value;

      // --- Logika Perhitungan Nilai Risiko (Contoh) ---
      if (field === "dampak_operasional" || field === "skor_kemungkinan") {
        const impact = parseInt(newRows[index].dampak_operasional) || 0;
        const likelihood = parseInt(newRows[index].skor_kemungkinan) || 0;
        const score = impact * likelihood;

        newRows[index].nilai_risiko = score.toString();

        // Menentukan tingkat risiko (contoh sederhana)
        if (score >= 15) {
          newRows[index].tingkat_risiko = "Sangat Tinggi";
        } else if (score >= 10) {
          newRows[index].tingkat_risiko = "Tinggi";
        } else if (score >= 5) {
          newRows[index].tingkat_risiko = "Sedang";
        } else {
          newRows[index].tingkat_risiko = "Rendah";
        }
      }
      // --- End Logika Perhitungan ---

      return newRows;
    });
  }, []);

  // Handler untuk menambah baris
  const addRow = useCallback(() => {
    setRows((prevRows) => [
      ...prevRows,
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
        pemilik_risiko: ""
      },
    ]);
  }, []);

  const saveData = async () => {
    // Implementasi logis penyimpanan data ke backend
    try {
      console.log("Data yang akan disimpan:", rows);
      // Ganti alert dengan modal/toast kustom jika ini di lingkungan produksi
      window.alert(
        " Logika penyimpanan (Simulasi) berhasil dijalankan! Cek console untuk data."
      );
    } catch (err) {
      console.error("Error:", err);
      window.alert("❌ Gagal menyimpan data risiko.");
    }
  };

  const renderFieldComponent = (row, key, i) => {
    const value = row[key] || "";
    const onChange = (e) => handleChange(i, key, e.target.value);
    const onSelectChange = (v) => handleChange(i, key, v);

    // 1. SELECT Components (untuk Kategori, Jenis, dan Tingkat/Level)
    if (
      key.startsWith("tingkat_") ||
      key === "risiko_residual" ||
      key === "tingkat_kemungkinan" ||
      key === "tingkat_risiko"
    ) {
      const options =
        key === "risiko_residual"
          ? LEVEL_OPTIONS.map((_, index) => (index + 1).toString())
          : LEVEL_OPTIONS;
      const placeholder =
        key === "risiko_residual" ? "Residual Score (1-5)" : "Tingkat";

      return (
        <Select
          onValueChange={onSelectChange}
          value={value}
          key={key + i + value}
        >
          <SelectTrigger className="w-full text-xs h-8">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (key === "kategori_risiko" || key === "jenis_risiko") {
      return (
        <Select
          onValueChange={onSelectChange}
          value={value}
          key={key + i + value}
        >
          <SelectTrigger className="w-full text-xs h-8">
            <SelectValue placeholder="Pilih" />
          </SelectTrigger>
          <SelectContent>
            {RISK_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // 2. TEXTAREA Components (untuk input panjang)
    if (
      key === "dampak" || 
      key.includes("deskripsi") ||
      key.includes("skenario") ||
      key.includes("rencana") ||
      key.includes("kriteria") ||
      key.includes("root_cause")
    ) {
      return (
        <Textarea
          value={value}
          onChange={onChange}
          className="w-full h-16 text-xs resize-y"
          placeholder={`Masukkan ${key.replace(/_/g, " ")}...`}
          key={key + i}
        />
      );
    }

    // 3. INPUT Type Number/Text (untuk Dampak dan Skor)
    if (
      key.startsWith("dampak_") ||
      key === "skor_kemungkinan" ||
      key === "nilai_risiko"
    ) {
      const readOnly = key === "nilai_risiko"; 
      const inputType =
        key.startsWith("dampak_") && !key.includes("tingkat")
          ? "text"
          : "number";
      const bgClass = readOnly ? "bg-yellow-100 font-bold" : "bg-white";

      return (
        <Input
          type={inputType}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          className={`w-full text-center text-xs h-8 ${bgClass}`}
          placeholder={readOnly ? "Otomatis" : "1-5"}
          min={inputType === "number" ? "1" : undefined}
          max={inputType === "number" ? "5" : undefined}
          key={key + i}
        />
      );
    }

    // 4. INPUT Components (default/Sisanya)
    return (
      <Input
        value={value}
        onChange={onChange}
        className="w-full text-xs h-8"
        placeholder={`Masukkan ${key.replace(/_/g, " ")}...`}
        key={key + i}
      />
    );
  };

  // Mapping untuk label header yang lebih rapi
  const HEADER_LABELS = useMemo(
    () => ({
      kategori_risiko: "Kategori Risiko",
      jenis_risiko: "Jenis Risiko",
      skenario_risiko: "Skenario Risiko",
      root_cause: "Root Cause",
      dampak: "Dampak (Uraian)", 
      dampak_keuangan: "Dampak Keuangan (Skala 1-5)",
      tingkat_dampak_keuangan: "Tingkat Dampak Keuangan",
      dampak_operasional: "Dampak Operasional (Skala 1-5)",
      tingkat_dampak_operasional: "Tingkat Dampak Operasional",
      dampak_reputasi: "Dampak Reputasi (Skala 1-5)",
      tingkat_dampak_reputasi: "Tingkat Dampak Reputasi",
      dampak_regulasi: "Dampak Regulasi (Skala 1 -  5)",
      tingkat_dampak_regulasi: "Tingkat Dampak Regulasi",
      skor_kemungkinan: "Skor Kemungkinan",
      tingkat_kemungkinan: "Tingkat Kemungkinan",
      nilai_risiko: "Nilai Risiko",
      tingkat_risiko: "Tingkat Risiko",
      rencana_penanganan: "Rencana Penanganan Risiko (Risk Treatment Plan)",
      deskripsi_rencana_penanganan: "Deskripsi Rencana Penanganan Risiko",
      risiko_residual: "Risiko Residual",
      kriteria_penerimaan_risiko: "Kriteria Penerimaan Risiko",
      pemilik_risiko: "Pemilik Risiko",
    }),
    []
  );

  // Mapping untuk menentukan styling background header
  const HEADER_COLORS = useMemo(
    () => ({
      kategori_risiko: "bg-gray-700 w-[150px]",
      jenis_risiko: "bg-gray-700 w-[150px]",
      skenario_risiko: "bg-gray-700 w-[250px]",
      root_cause: "bg-gray-700 w-[250px]",
      dampak: "bg-gray-700 w-[250px]",
      dampak_keuangan: "bg-red-700 w-[120px]",
      tingkat_dampak_keuangan: "bg-red-800 w-[120px]",
      dampak_operasional: "bg-red-700 w-[120px]",
      tingkat_dampak_operasional: "bg-red-800 w-[120px]",
      dampak_reputasi: "bg-red-700 w-[120px]",
      tingkat_dampak_reputasi: "bg-red-800 w-[120px]",
      dampak_regulasi: "bg-red-700 w-[120px]",
      tingkat_dampak_regulasi: "bg-red-800 w-[120px]",
      skor_kemungkinan: "bg-yellow-600 w-[100px]",
      tingkat_kemungkinan: "bg-yellow-700 w-[120px]",
      nilai_risiko: "bg-yellow-600 w-[100px]",
      tingkat_risiko: "bg-yellow-700 w-[120px]",
      rencana_penanganan: "bg-blue-700 w-[200px]",
      deskripsi_rencana_penanganan: "bg-blue-700/80 w-[200px]",
      risiko_residual: "bg-blue-700 w-[150px]",
      kriteria_penerimaan_risiko: "bg-blue-700/80 w-[200px]",
    }),
    []
  );

  return (
    <Card className="p-6 shadow-2xl rounded-xl bg-white min-h-screen font-inter">
      <CardHeader className="pb-4 border-b border-gray-200">
        <CardTitle className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-green-600" />
          RISK REGISTER
        </CardTitle>
        <p className="text-gray-600 text-sm mt-2">
          Tabel dinamis untuk mencatat, menilai (Inheren), dan merencanakan
          mitigasi risiko. Seluruh kolom telah disederhanakan menjadi satu baris
          header.
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Tabel Utama */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-lg">

          <table className="min-w-[4800px] border-collapse text-xl">
            <thead className="bg-gray-800 text-white sticky top-0 z-10">
              <tr>
                {RENDER_KEYS.map((key) => (
                  <th
                    key={key}
                    className={`border border-gray-700 px-3 py-3 whitespace-nowrap align-middle text-center text-[13px] font-medium ${HEADER_COLORS[key]}`}>
                    {HEADER_LABELS[key]}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                  {RENDER_KEYS.map((key) => {
                    let cellClasses =
                      "border border-gray-200 px-2 py-1 align-top text-gray-800";

                    // Warna latar belakang sel untuk pengelompokan visual
                    if (key === "kategori_risiko" || key === "jenis_risiko")
                      cellClasses += " bg-gray-50";
                    if (key.includes("dampak_")) cellClasses += " bg-red-50";
                    if (key.includes("tingkat_dampak"))
                      cellClasses += " bg-red-100 font-semibold";
                    if (
                      key.includes("skor_kemungkinan") ||
                      key.includes("nilai_risiko")
                    )
                      cellClasses += " bg-yellow-50";
                    if (
                      key.includes("tingkat_kemungkinan") ||
                      key.includes("tingkat_risiko")
                    )
                      cellClasses += " bg-yellow-100 font-bold";
                    if (key.includes("risiko_residual"))
                      cellClasses += " bg-blue-50 font-semibold";

                    // Alignment
                    if (
                      key.includes("score") ||
                      key.includes("nilai") ||
                      key.includes("tingkat") ||
                      key.includes("residual") ||
                      key === "dampak_keuangan" ||
                      key === "dampak_operasional" ||
                      key === "dampak_reputasi" ||
                      key === "dampak_regulasi"
                    ) {
                      cellClasses += " text-center";
                    } else {
                      cellClasses += " text-left";
                    }

                    return (
                      <td key={key} className={cellClasses + " p-1.5"}>
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
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-gray-500 text-sm italic">
            Pastikan semua data diisi sebelum menyimpan. Total kolom yang
            ditampilkan: {RENDER_KEYS.length}.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={addRow}
              className="flex items-center gap-2 text-primary border-primary hover:bg-primary/5 transition duration-150">
              <Plus size={18} /> Tambah Baris
            </Button>
            <Button
              onClick={saveData}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition duration-150 shadow-md"
            >
              <Save size={18} /> Simpan Data (Simulasi)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
