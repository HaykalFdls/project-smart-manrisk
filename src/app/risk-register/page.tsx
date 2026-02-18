"use client";

import { useAuth } from "@/context/auth-context";
import { useState, useEffect, useMemo } from "react";
import { fetchRisks, createRisk, updateRisk, deleteRisk } from "@/lib/risk-register"; 
import { RiskRegisterTable } from "@/components/RiskRegister/RiskRegisterTable";
import { RiskEntryForm } from "@/components/RiskRegister/RiskEntryForm"; // Komponen baru
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, ClipboardList, FileDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const hasPermissionValue = (value: unknown) => {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true";
  }
  return false;
};

export default function RiskRegisterPage() {
  const { fetchWithAuth, user } = useAuth();
  const { toast } = useToast();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const userUnit = user?.unit_name || "";
  const roleName = user?.role_name || "";
  const canApprove = hasPermissionValue(user?.permissions?.can_approve);
  const isAdminView =
    canApprove || ["Super User", "Administrator", "Supervisor", "Executive Reviewer"].includes(roleName);

  const statusTabs = isAdminView
    ? [{ value: "approved", label: "Approved" }]
    : [
        { value: "all", label: "Semua" },
        { value: "draft", label: "Draft" },
        { value: "final", label: "Final" },
        { value: "reviewed", label: "Reviewed" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ];

  const defaultTab = isAdminView ? "approved" : "all";

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: rows.length };
    rows.forEach((row) => {
      const s = String(row?.status || "").toLowerCase();
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [rows]);

  const tabbedRows = useMemo(() => {
    const withIndex = rows.map((row, idx) => ({ ...row, __sourceIndex: idx }));
    if (activeTab === "all") return withIndex;
    return withIndex.filter((row) => String(row?.status || "").toLowerCase() === activeTab);
  }, [rows, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchRisks(fetchWithAuth);
      const filtered = isAdminView
        ? data.filter((r: any) => String(r.status || "").toLowerCase() === "approved")
        : data;
      setRows(filtered);
    } catch (err) {
      toast({ title: "Gagal memuat data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) loadData(); }, [user?.id, roleName, canApprove]);

  const handleChange = (index: number, field: string, value: any) => {
    setRows((prev) => {
      const cloned = [...prev];
      cloned[index] = { ...cloned[index], [field]: value };
      return cloned;
    });
  };

  const handleAutoSave = async (row: any) => {
    if (isAdminView) return;
    try {
      await updateRisk(fetchWithAuth, row.id, row);
    } catch (error) {
      toast({
        title: "Gagal menyimpan",
        description: "Perubahan tidak tersimpan. Coba lagi.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitRows = async (rowsToSubmit: any[]) => {
    if (isAdminView || rowsToSubmit.length === 0) return;
    try {
      await Promise.all(
        rowsToSubmit.map((row) => updateRisk(fetchWithAuth, row.id, { ...row, status: "final" }))
      );
      toast({
        title: "Berhasil",
        description: `${rowsToSubmit.length} risk dikirim ke status FINAL.`,
      });
      loadData();
    } catch (error) {
      toast({
        title: "Gagal submit",
        description: "Tidak semua risk berhasil dikirim.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRow = async (row: any) => {
    if (isAdminView) return;
    try {
      await deleteRisk(fetchWithAuth, row.id);
      toast({ title: "Berhasil", description: `Risk #${row.id} berhasil dihapus.` });
      loadData();
    } catch (error: any) {
      toast({
        title: "Gagal menghapus",
        description: error?.message || "Hanya draft dari divisi sendiri yang bisa dihapus.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitNew = async (formData: any) => {
    if (isAdminView) {
      toast({
        title: "Akses ditolak",
        description: "Admin tidak dapat menambahkan Risk Register.",
        variant: "destructive",
      });
      return;
    }

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

  const handleDownloadExcel = async () => {
    try {
      const res = await fetchWithAuth("http://localhost:5001/api/approved-risks/export");
      if (!res.ok) throw new Error("Gagal download");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "approved_risks.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: "Error", description: "Gagal download Excel", variant: "destructive" });
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
        
        {isAdminView ? (
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-green-200"
          >
            <FileDown size={20} /> Download Excel
          </button>
        ) : (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200">
                <Plus size={20} /> Input Risiko Baru
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-800">Form Input Risiko</DialogTitle>
              </DialogHeader>
              <RiskEntryForm onSubmit={handleSubmitNew} onCancel={() => setIsModalOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {loading ? (
           <div className="p-8 space-y-4"><Skeleton className="h-16 w-full rounded-xl" /></div>
        ) : (
          <>
            <div className="px-4 md:px-6 pt-4 pb-2 border-b border-slate-100">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
                  {statusTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600"
                    >
                      {tab.label} ({tabCounts[tab.value] || 0})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <RiskRegisterTable
              data={tabbedRows}
              readOnly={isAdminView}
              showActions={!isAdminView}
              onChange={(visibleIndex, field, value) => {
                const sourceIndex = tabbedRows[visibleIndex]?.__sourceIndex;
                if (typeof sourceIndex !== "number") return;
                handleChange(sourceIndex, field, value);
              }}
              onAutoSave={async (row: any) => {
                const sourceIndex = row?.__sourceIndex;
                const sourceRow = typeof sourceIndex === "number" ? rows[sourceIndex] : row;
                await handleAutoSave(sourceRow);
              }}
              onBulkSubmit={async (rowsToSubmit: any[]) => {
                const originalRows = rowsToSubmit.map((row) => {
                  const sourceIndex = row?.__sourceIndex;
                  return typeof sourceIndex === "number" ? rows[sourceIndex] : row;
                });
                await handleSubmitRows(originalRows);
              }}
              onDelete={async (row: any) => {
                const sourceIndex = row?.__sourceIndex;
                const sourceRow = typeof sourceIndex === "number" ? rows[sourceIndex] : row;
                await handleDeleteRow(sourceRow);
              }}
              canDelete={(row: any) => !isAdminView && String(row?.status || "").toLowerCase() === "draft"}
            />
          </>
        )}
      </div>
    </main>
  );
}
