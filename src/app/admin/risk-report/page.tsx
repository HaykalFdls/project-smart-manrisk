"use client";

import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { fetchRisks, updateRisk } from "@/lib/risk-register";
import { RiskRegisterTable } from "@/components/riskregister/RiskRegisterTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, CheckCircle, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RiskRegisterPage() {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Ambil data risiko dari API
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchRisks(fetchWithAuth);
      setRows(data);
    } catch (err) {
      toast({
        title: "Gagal memuat data",
        description: "Pastikan server backend sedang berjalan.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update nilai baris (onChange input)
  const handleChange = (index: number, field: string, value: any) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Auto-save setiap kolom
  const handleAutoSave = async (row: any) => {
    try {
      await updateRisk(fetchWithAuth, row.id, row);
      toast({
        title: "Tersimpan",
        description: `Risiko "${
          row.nama_risiko || "Tanpa nama"
        }" berhasil disimpan.`,
        duration: 1500,
      });
    } catch {
      toast({
        title: "Gagal menyimpan",
        description: "Terjadi kesalahan saat menyimpan perubahan.",
        variant: "destructive",
      });
    }
  };

    const handleDownloadExcel = async () => {
    try {
      const res = await fetch("http://localhost:5000/approved-risks/export");
      if (!res.ok) throw new Error("Gagal download");

      // Buat blob dan trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "approved_risks.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Gagal download Excel" });
    }
  };


  // Filter data berdasarkan pencarian
  const filteredRows = rows.filter((r) =>
    (r.nama_risiko || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <header className="flex justify-between items-center border-b pb-4 border-gray-200">
        <PageHeader
          title="LAPORAN RISK REGISTER"
          description="Laporan risiko dari seluruh unit kerja bjb Syariah."
        />

        <div className="flex items-center gap-3">
          <Input
            placeholder="🔍 Cari Kategori risiko..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-80 bg-white border-gray-300 shadow-sm focus:border-blue-500 transition-all duration-300"
          />
          <Button
            onClick={loadData}
            className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Muat Ulang
          </Button>
          <Button onClick={handleDownloadExcel}>
            <FileDown className="mr-2 h-4 w-4" /> Download Excel
          </Button> 
        </div>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
        {loading ? (
          <div className="space-y-4 pt-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
            <div className="text-center text-gray-400 text-sm pt-4">
              Memuat data risiko, mohon tunggu sebentar... ⏳
            </div>
          </div>
        ) : (
          <RiskRegisterTable
            data={filteredRows}
            onChange={handleChange}
            onAutoSave={handleAutoSave}
            onBulkSubmit={async () => {
              toast({
                title: "Fitur kirim massal belum aktif",
                description: "Akan tersedia dalam pembaruan berikutnya.",
              });
            }}
          />
        )}
      </div>
    </main>
  );
}
