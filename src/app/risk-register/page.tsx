"use client";

import { useState } from "react";
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

const LEVEL_OPTIONS = [
  "1 (Sangat Rendah)",
  "2 (Rendah)",
  "3 (Sedang)",
  "4 (Tinggi)",
  "5 (Sangat Tinggi)",
];
const RISK_OPTIONS = ["Strategis", "Operasional", "Keuangan", "Kepatuhan"];

export default function RiskRegisterPage() {
  const [rows, setRows] = useState([
    {
      kategori_risiko: "",
      jenis_risiko: "",
      skenario_risiko: "",
      root_cause: "",
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
      {
        kategori_risiko: "",
        jenis_risiko: "",
        skenario_risiko: "",
        root_cause: "",
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

  const renderInput = (i: number, key: string, value: string) => {
    const onChange = (e: any) => handleChange(i, key, e.target.value);
    const onSelectChange = (v: string) => handleChange(i, key, v);

    // Select fields
    if (
      key.startsWith("tingkat_dampak") ||
      key.startsWith("tingkat_kemungkinan") ||
      key === "tingkat_risiko"
    ) {
      return (
        <Select value={value} onValueChange={onSelectChange}>
          <SelectTrigger className="w-[140px] text-xs">
            <SelectValue placeholder="Tingkat" />
          </SelectTrigger>
          <SelectContent>
            {LEVEL_OPTIONS.map((opt) => (
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
        <Select value={value} onValueChange={onSelectChange}>
          <SelectTrigger className="w-[160px] text-xs">
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

    // Textarea untuk deskripsi panjang
    if (
      key.includes("skenario") ||
      key.includes("rencana") ||
      key.includes("root_cause") ||
      key.includes("dampak") ||
      key.includes("deskripsi") ||
      key.includes("kriteria")
    ) {
      return (
        <Textarea
          value={value}
          onChange={onChange}
          className="min-w-[200px] h-20 text-xs"
        />
      );
    }

    // Input angka atau teks pendek
    return (
      <Input
        type={key.includes("skor") || key.includes("nilai") ? "number" : "text"}
        value={value}
        onChange={onChange}
        className="min-w-[120px] text-xs text-center"
      />
    );
  };

  return (
    <Card className="p-6 shadow-xl rounded-xl">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Register Risiko Bisnis Inti
        </CardTitle>
        <p className="text-gray-500 text-sm mt-1">
          Gunakan tabel ini untuk mencatat, menilai, dan merencanakan mitigasi
          risiko.
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Tombol Aksi */}
        <div className="flex gap-4 mb-4">
          <Button
            variant="outline"
            onClick={addRow}
            className="flex items-center gap-2 text-primary border-primary hover:bg-primary/5"
          >
            <Plus size={18} /> Tambah Baris
          </Button>
          <Button
            onClick={saveData}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Save size={18} /> Simpan Data
          </Button>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-[2800px] border-collapse text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-3 py-2 border w-[200px] bg-gray-700">
                  Kategori & Jenis Risiko
                </th>
                <th className="px-3 py-2 border w-[250px]">
                  Skenario & Penyebab Utama
                </th>
                <th colSpan={8} className="px-3 py-2 border bg-red-700 text-center">
                  Penilaian Dampak (Inherent)
                </th>
                <th colSpan={4} className="px-3 py-2 border bg-yellow-600 text-center">
                  Skor Inherent
                </th>
                <th colSpan={3} className="px-3 py-2 border bg-blue-700 text-center">
                  Penanganan & Residual
                </th>
              </tr>
              <tr className="bg-gray-700">
                {[
                  "Dampak Keuangan",
                  "Tingkat Dampak Keu.",
                  "Dampak Operasional",
                  "Tingkat Dampak Ops.",
                  "Dampak Reputasi",
                  "Tingkat Dampak Rep.",
                  "Dampak Regulasi",
                  "Tingkat Dampak Reg.",
                  "Skor Kemungkinan",
                  "Tingkat Kemungkinan",
                  "Nilai Risiko",
                  "Tingkat Risiko",
                  "Rencana Penanganan",
                  "Risiko Residual",
                  "Kriteria Penerimaan",
                ].map((header) => (
                  <th
                    key={header}
                    className="border px-3 py-1 text-xs font-normal whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50">
                  <td className="border px-2 py-2 align-top">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold">Kategori</p>
                      {renderInput(i, "kategori_risiko", row.kategori_risiko)}
                      <p className="text-xs font-semibold mt-2">Jenis</p>
                      {renderInput(i, "jenis_risiko", row.jenis_risiko)}
                    </div>
                  </td>
                  <td className="border px-2 py-2 align-top">
                    <p className="text-xs font-semibold">Skenario</p>
                    {renderInput(i, "skenario_risiko", row.skenario_risiko)}
                    <p className="text-xs font-semibold mt-2">Root Cause</p>
                    {renderInput(i, "root_cause", row.root_cause)}
                  </td>

                  {/* Field lainnya */}
                  {Object.keys(row)
                    .filter(
                      (k) =>
                        ![
                          "kategori_risiko",
                          "jenis_risiko",
                          "skenario_risiko",
                          "root_cause",
                          "deskripsi_rencana_penanganan",
                        ].includes(k)
                    )
                    .map((key) => (
                      <td key={key} className="border px-2 py-2 align-top">
                        {key === "rencana_penanganan" ? (
                          <>
                            {renderInput(i, "rencana_penanganan", row.rencana_penanganan)}
                            <p className="text-xs font-semibold mt-2">Deskripsi</p>
                            {renderInput(
                              i,
                              "deskripsi_rencana_penanganan",
                              row.deskripsi_rencana_penanganan
                            )}
                          </>
                        ) : (
                          renderInput(i, key, row[key as keyof typeof row])
                        )}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
