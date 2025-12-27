"use client";

import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { fetchRisks, updateRisk } from "@/lib/risk-register";
import { RiskRegisterTable } from "@/components/riskregister/RiskRegisterTable";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function RiskRegisterPage() {
  const { fetchWithAuth, user } = useAuth();
  const { toast } = useToast();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 🟦 Get unit kerja / ID user login
  const userUnit = user?.unit_name?.toLowerCase() || "";
  const userId = user?.id;

  // 🔍 Detect data yang belum lengkap (entry master saja)
const isIncomplete = (r: any) => r.status === "draft";


  // 🟦 Fetch risks & filter otomatis sesuai unit login
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchRisks(fetchWithAuth);

      // 🔍 Filter berdasarkan unit kerja user login
      const filtered = data.filter(
        (r: any) =>
          (r.unit_kerja?.toLowerCase() === userUnit ||
            r.pemilik_risiko === userId) &&
          isIncomplete(r) // hanya data belum lengkap
      );

      setRows(filtered);
    } catch (err) {
      toast({
        title: "Gagal memuat data",
        description: "Pastikan server backend berjalan.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (!user) return;        // mencegah render pertama
  loadData();
  }, [user?.id]);             // dependency selalu stabil


  // Update cell data
  const handleChange = (index: number, field: string, value: any) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Auto-save per kolom
  const handleAutoSave = async (row: any) => {
    try {
      await updateRisk(fetchWithAuth, row.id, row);
      toast({
        title: "Tersimpan",
        description: `Risiko "${row.nama_risiko || row.kategori_risiko}" disimpan.`,
        duration: 1500,
      });
    } catch {
      toast({
        title: "Gagal menyimpan",
        description: "Terjadi kesalahan server.",
        variant: "destructive",
      });
    }
  };

  // Filter by search
  const filteredRows = rows.filter((r) =>
    (r.nama_risiko || r.kategori_risiko || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <header className="flex justify-between items-center border-b pb-4 border-gray-200">
        <PageHeader
          title="Kertas Kerja Risk Register"
          description={`Risiko milik Unit: ${user?.unit_name || "-"}`}
        />
      </header>

      <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
        {loading ? (
          <div className="space-y-4 pt-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
            <div className="text-center text-gray-400 text-sm pt-4">
              Memuat data risiko... ⏳
            </div>
          </div>
        ) : (
          <RiskRegisterTable
            data={filteredRows}
            onChange={handleChange}
            onAutoSave={handleAutoSave}
            onBulkSubmit={() =>
              toast({
                title: "Fitur belum tersedia",
                description: "Kirim massal akan diaktifkan nanti.",
              })
            }
          />
        )}
      </div>
    </main>
  );
}
