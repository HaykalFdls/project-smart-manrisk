"use client";

import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { fetchRisks, updateRisk, createRisk } from "@/lib/risk-register"; 
import { RiskRegisterTable } from "@/components/RiskRegister/RiskRegisterTable";
import { RiskEntryForm } from "@/components/RiskRegister/RiskEntryForm"; // Komponen baru
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, ClipboardList } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function RiskRegisterPage() {
  const { fetchWithAuth, user } = useAuth();
  const { toast } = useToast();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userUnit = user?.unit_name || "";

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchRisks(fetchWithAuth);
      // Filter: Hanya yang milik unit user dan berstatus draft
      const filtered = data.filter(
        (r: any) => r.unit_kerja?.toLowerCase() === userUnit.toLowerCase() && r.status === "draft"
      );
      setRows(filtered);
    } catch (err) {
      toast({ title: "Gagal memuat data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) loadData(); }, [user?.id]);

  const handleSubmitNew = async (formData: any) => {
    try {
      // Pastikan menyertakan unit kerja user yang sedang login
      await createRisk(fetchWithAuth, { ...formData, unit_kerja: userUnit, status: "draft" });
      toast({ title: "Berhasil Terkirim", description: "Risiko telah ditambahkan ke daftar tunggu admin." });
      setIsModalOpen(false);
      loadData(); // Refresh tabel
    } catch (error) {
      toast({ title: "Gagal mengirim", variant: "destructive" });
    }
  };

  return (
    <main className="p-6 md:p-10 space-y-6 bg-[#f8fafc] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><ClipboardList size={28} /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Risk Register</h1>
            <p className="text-slate-500 text-sm italic">Unit: {userUnit}</p>
          </div>
        </div>
        
        {/* MODAL INPUT FORM */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200">
              <Plus size={20} /> Input Risiko Baru
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">Form Input Risiko</DialogTitle>
            </DialogHeader>
            <RiskEntryForm onSubmit={handleSubmitNew} onCancel={() => setIsModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {loading ? (
           <div className="p-8 space-y-4"><Skeleton className="h-16 w-full rounded-xl" /></div>
        ) : (
          <RiskRegisterTable
            data={rows}
            onChange={() => {}} // Nonaktifkan edit langsung jika ingin lewat form saja
            onAutoSave={async () => {}}
            onBulkSubmit={async () => {}}
          />
        )}
      </div>
    </main>
  );
}