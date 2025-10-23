"use client";

import React, { useState, useMemo, useEffect, useCallback, memo, FC } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  submitRcsaAssessment,
  type RCSAData,
  getRcsaDraft,
  mapToAssessment,
  saveRcsaAssessment,
} from "@/lib/rcsa-data";
import { useToast } from "@/hooks/use-toast";
import { Save, Send, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/auth-context";
import { toCamelCase } from "@/lib/utils";
import { motion } from "framer-motion";

type RCSADataWithCalculations = RCSAData & {
  besaranInheren: number | null;
  besaranResidual: number | null;
};

// Pilihan jenis risiko
const JENIS_RISIKO_OPTIONS = [
  "Risiko Kredit",
  "Risiko Pasar",
  "Risiko Likuiditas",
  "Risiko Operasional",
  "Risiko Hukum",
  "Risiko Reputasi",
  "Risiko Strategis",
  "Risiko Kepatuhan",
  "Risiko Imbal Hasil",
  "Risiko Investasi",
] as const;

// Batasan nilai Dampak/Frekuensi/Kemungkinan
const MIN_SCORE = 1;
const MAX_SCORE = 5;
const UNIT_API_URL = "http://localhost:5000/units";

// --- UTILITAS/HELPER FUNCTIONS ---
const getLevelFromBesaran = (besaran: number | null | undefined) => {
  if (besaran === null || besaran === undefined) {
    return { label: "-", className: "bg-muted/40 text-muted-foreground" };
  }
  if (besaran >= 20) return { label: "Sangat Tinggi", className: "bg-red-700 text-white" };
  if (besaran >= 12) return { label: "Tinggi", className: "bg-red-500 text-white" };
  if (besaran >= 5) return { label: "Menengah", className: "bg-yellow-400 text-black" };
  return { label: "Rendah", className: "bg-green-500 text-white" };
};

const parseTargetAndDescription = (description: string | null) => {
  if (!description) return { target: null, cleanDescription: null };

  const lines = description.split("\n");
  const targetLine = lines.find((line) => line.startsWith("Target: "));

  if (targetLine) {
    const target = targetLine.replace("Target: ", "").trim();
    const cleanDescription = lines
      .filter((line) => !line.startsWith("Target: "))
      .join("\n")
      .trim();
    return { target: target || null, cleanDescription: cleanDescription || null };
  }
  return { target: null, cleanDescription: description };
};

// --- KOMPONEN KECIL (MICRO-COMPONENTS) ---

const ScoreInput: FC<{
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}> = ({ label, value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value) || null;
    if (val !== null) {
      if (val < MIN_SCORE) val = MIN_SCORE;
      if (val > MAX_SCORE) val = MAX_SCORE;
    }
    onChange(val);
  };

  return (
    <div>
      <Label>{label} ({MIN_SCORE}-{MAX_SCORE})</Label>
      <Input
        type="number"
        min={MIN_SCORE}
        max={MAX_SCORE}
        value={value || ""}
        onChange={handleChange}
        className="text-center"
      />
    </div>
  );
};

const CalculatedValue: FC<{
  label: string;
  value: string | number | null;
  className?: string;
}> = ({ label, value, className = "" }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <div
      className={`flex h-10 w-full items-center justify-center rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm font-bold shadow-sm ${className}`}
    >
      {value || "-"}
    </div>
  </div>
);

const LevelBadge: FC<{ besaran: number | null | undefined }> = ({ besaran }) => {
  const level = getLevelFromBesaran(besaran);
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">Level</p>
      <div className="flex h-10 items-center justify-center rounded-lg border border-input bg-muted/40 shadow-sm">
        <span className={`px-3 py-1 rounded text-xs font-semibold ${level.className}`}>
          {level.label}
        </span>
      </div>
    </div>
  );
};

// --- KOMPONEN UTAMA (RiskCard Component) ---

type RiskCardProps = {
  row: RCSADataWithCalculations;
  index: number;
  onChange: (index: number, field: keyof Omit<RCSAData, "no">, value: any) => void;
  // Prop baru untuk pengiriman individual
  onIndividualSubmit: (riskId: number | string) => void;
};

const RiskCard: FC<RiskCardProps> = memo(({ row, index, onChange, onIndividualSubmit }) => {
  const { cleanDescription } = parseTargetAndDescription(row.keteranganAdmin);
  const canSubmit = !!row.id; // Hanya bisa submit jika sudah ada ID (sudah tersimpan)

  const handleScoreChange = useCallback(
    (field: keyof Omit<RCSAData, "no">, value: number | null) => {
      onChange(index, field, value);
    },
    [index, onChange]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}>
      <Card key={row.id ?? index} className="shadow-xl border-2 border-blue-200 rounded-2xl">
        <CardHeader className="pb-4 bg-blue-50/70 rounded-t-2xl">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl font-bold text-blue-800">
              {row.no}. Potensi Risiko
            </CardTitle>
            <CardDescription className="text-base text-gray-700 leading-snug">
              {row.potensiRisiko}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Jenis & Penyebab */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`jenisRisiko-${index}`}>Jenis Risiko</Label>
              <Select
                value={row.jenisRisiko || ""}
                onValueChange={(value) => onChange(index, "jenisRisiko", value)}
              >
                <SelectTrigger id={`jenisRisiko-${index}`}>
                  <SelectValue placeholder="Pilih jenis risiko..." />
                </SelectTrigger>
                <SelectContent>
                  {JENIS_RISIKO_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`penyebabRisiko-${index}`}>Penyebab Risiko</Label>
              <Textarea
                id={`penyebabRisiko-${index}`}
                value={row.penyebabRisiko || ""}
                onChange={(e) => onChange(index, "penyebabRisiko", e.target.value)}
                placeholder="Jelaskan penyebab utama risiko..."
                className="min-h-[50px]"
              />
            </div>
          </div>

          <Separator />

          {/* Risiko Inheren */}
          <div className="rounded-xl border p-4 space-y-4 bg-red-50/50">
            <h3 className="text-lg font-semibold text-red-700">Risiko Inheren (Sebelum Pengendalian)</h3>
            <div className="grid grid-cols-2 gap-4">
              <ScoreInput
                label="Dampak"
                value={row.dampakInheren}
                onChange={(v) => handleScoreChange("dampakInheren", v)}
              />
              <ScoreInput
                label="Frekuensi"
                value={row.frekuensiInheren}
                onChange={(v) => handleScoreChange("frekuensiInheren", v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CalculatedValue label="Besaran Inheren" value={row.besaranInheren} />
              <LevelBadge besaran={row.besaranInheren} />
            </div>
          </div>

          {/* Risiko Residual */}
          <div className="rounded-xl border p-4 space-y-4 bg-green-50/50">
            <h3 className="text-lg font-semibold text-green-700">Risiko Residual (Setelah Pengendalian)</h3>
            <div>
              <Label htmlFor={`pengendalian-${index}`}>
                Pengendalian/Mitigasi Risiko yang Ada (Existing Control)
              </Label>
              <Textarea
                id={`pengendalian-${index}`}
                value={row.pengendalian || ""}
                onChange={(e) => onChange(index, "pengendalian", e.target.value)}
                placeholder="Jelaskan pengendalian yang sudah ada..."
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <ScoreInput
                label="Dampak"
                value={row.dampakResidual}
                onChange={(v) => handleScoreChange("dampakResidual", v)}
              />
              <ScoreInput
                label="Kemungkinan"
                value={row.kemungkinanResidual}
                onChange={(v) => handleScoreChange("kemungkinanResidual", v)}
              />

              <CalculatedValue label="Besaran Residual" value={row.besaranResidual} />
              <LevelBadge besaran={row.besaranResidual} />
            </div>
          </div>

          {/* Action Plan & PIC */}
          <div>
            <Label htmlFor={`actionPlan-${index}`}>Action Plan/Mitigasi Lanjutan</Label>
            <Textarea
              id={`actionPlan-${index}`}
              value={row.actionPlan || ""}
              onChange={(e) => onChange(index, "actionPlan", e.target.value)}
              placeholder="Rencana tindakan tambahan untuk mengurangi risiko..."
              className="min-h-[50px]"
            />
          </div>
          <div>
            <Label htmlFor={`pic-${index}`}>Person In Charge (PIC)</Label>
            <Input
              id={`pic-${index}`}
              value={row.pic || ""}
              onChange={(e) => onChange(index, "pic", e.target.value)}
              placeholder="Nama atau Jabatan PIC"
            />
          </div>

          <Separator />

          <div>
            <Label htmlFor={`keteranganUser-${index}`}>Keterangan (Opsional)</Label>
            <Textarea
              id={`keteranganUser-${index}`}
              placeholder="Tambahkan catatan atau informasi tambahan di sini..."
              value={row.keteranganUser || ""}
              onChange={(e) => onChange(index, "keteranganUser", e.target.value)}
              className="min-h-[60px]"
            />
          </div>
        </CardContent>

        {/* CardFooter untuk Tombol Kirim Risiko Ini dan Keterangan Admin */}
        <CardFooter className="pt-4 pb-6 flex justify-between items-center">
          {cleanDescription && (
            <p className="text-xs text-muted-foreground max-w-sm">
              <strong className="text-sm text-foreground">Keterangan dari Admin:</strong>{" "}
              {cleanDescription}
            </p>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {!canSubmit && (
              <span className="text-xs text-red-500">Simpan draf untuk mengaktifkan kirim</span>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 transition-colors"
                  disabled={!canSubmit} 
                >
                  <Send className="mr-2 h-4 w-4" /> Kirim Risiko Ini
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Pengiriman Risiko Individual</AlertDialogTitle>
                  <AlertDialogDescription>
                    Anda yakin ingin mengirim {row.no}. {row.potensiRisiko} ke admin? 
                    Setelah dikirim, risiko ini akan **hilang** dari daftar RCSA Anda.
                    <br/><br/>
                    **PENTING: Pastikan Anda telah menekan tombol "Simpan Draf" untuk menyimpan data terbaru sebelum mengirim.**
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onIndividualSubmit(row.id!)}
                    disabled={!canSubmit}
                  >
                    Ya, Kirim Sekarang
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
});

// --- KOMPONEN HALAMAN UTAMA (Rcsapage) ---

export default function Rcsapage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [data, setData] = useState<RCSAData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [unitInfo, setUnitInfo] = useState<{ name: string; type: string } | null>(null);
  
  // State baru untuk melacak risiko mana yang sedang ditampilkan
  const [activeRiskIndex, setActiveRiskIndex] = useState(0); 

  // --- LOGIKA PENGAMBILAN DATA (useEffect) ---
  useEffect(() => {
    const loadDraftAndUnit = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const draft = await getRcsaDraft(user.id, user.unit_id!);
        const mappedData = toCamelCase(draft) as RCSAData[];
        setData(mappedData);

        const unitRes = await fetch(`${UNIT_API_URL}/${user.unit_id}`);
        if (unitRes.ok) {
          const u = await unitRes.json();
          setUnitInfo({ name: u.unit_name, type: u.unit_type });
        }
      } catch (err) {
        console.error("Gagal memuat data awal:", err);
        toast({
          title: "Gagal memuat data",
          description: "Terjadi kesalahan saat mengambil draft RCSA atau info unit.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadDraftAndUnit();
  }, [user, toast]);

  const unitName = unitInfo?.name || null;

  // --- LOGIKA KALKULASI (useMemo) ---
  const calculatedData: RCSADataWithCalculations[] = useMemo(() => {
    return data.map((row) => {
      const besaranInheren =
        row.dampakInheren && row.frekuensiInheren ? row.dampakInheren * row.frekuensiInheren : null;
      const besaranResidual =
        row.dampakResidual && row.kemungkinanResidual
          ? row.dampakResidual * row.kemungkinanResidual
          : null;
      return { ...row, besaranInheren, besaranResidual };
    });
  }, [data]);

  const totalRisks = calculatedData.length;
  const activeRisk = calculatedData[activeRiskIndex];

  // ---  NAVIGASI (useCallback) ---
  // Fungsi untuk maju ke risiko berikutnya
  const handleNext = useCallback(() => {
    setActiveRiskIndex((prev) => Math.min(prev + 1, totalRisks - 1));
  }, [totalRisks]);

  // Fungsi untuk mundur ke risiko sebelumnya
  const handlePrevious = useCallback(() => {
    setActiveRiskIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Pastikan indeks aktif valid jika data berubah (misal, setelah submit)
  useEffect(() => {
    if (totalRisks > 0) {
      setActiveRiskIndex((prev) => Math.min(prev, totalRisks - 1));
    } else {
      setActiveRiskIndex(0);
    }
  }, [totalRisks]);

  // --- HANDLER PERUBAHAN INPUT (useCallback) ---
  const handleInputChange = useCallback(
    (index: number, field: keyof Omit<RCSAData, "no">, value: any) => {
      setData((prev) => {
        const newData = [...prev];
        newData[index] = { ...newData[index], [field]: value };
        return newData;
      });
    },
    []
  );

  // --- HANDLER AKSI (Save, Submit All, Submit Individual) ---

  // Simpan draf (Semua data disimpan, bukan hanya yang aktif)
  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Mapping dan simpan semua baris
      const savePromises = data.map(async (row) => {
        const payload = mapToAssessment(row, user.id!, user.unit_id!);
        console.log("🧩 Data dikirim ke backend:", payload);

        return saveRcsaAssessment(payload);
      });

      const savedRows = await Promise.all(savePromises);

      // Update state dengan data yang sudah disimpan (termasuk ID jika baru)
      const updatedData = data.map((row, index) => ({
        ...row,
        // Pastikan kita menggunakan ID dari response save jika belum ada (id = null)
        id: row.id || savedRows[index].id, 
        // Overwrite dengan data lain dari response save (jika ada)
        ...savedRows[index], 
      }));
      setData(updatedData);

      toast({ title: "Draf berhasil disimpan! ✅" });
    } catch (err) {
      console.error("Gagal simpan draf:", err);
      toast({
        title: "Gagal simpan draf ❌",
        description: "Terjadi kesalahan saat menyimpan data ke server.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Submit ke admin (Semua data terkirim) - Fungsi ini dikembalikan
  const handleSubmitAll = async () => {
    try {
      // Periksa apakah semua row memiliki ID sebelum submit (sudah disimpan)
      const unsavedRows = data.filter((row) => !row.id);
      if (unsavedRows.length > 0) {
        toast({
          title: "Aksi Gagal!",
          description: `Mohon simpan draf Anda terlebih dahulu (terdapat ${unsavedRows.length} item belum tersimpan) sebelum mengirim ke admin.`,
          variant: "destructive",
        });
        return;
      }

      const submitPromises = data.map((row) => submitRcsaAssessment(row.id!));
      await Promise.all(submitPromises);

      toast({
        title: "Data Terkirim! 🎉",
        description: "Semua data RCSA Anda telah berhasil dikirim untuk ditinjau oleh admin.",
      });
      // Kosongkan data setelah berhasil submit
      setData([]);
      setActiveRiskIndex(0); // Reset indeks
    } catch (err) {
      console.error("Gagal kirim submission RCSA:", err);
      toast({
        title: "Gagal Mengirim! ❌",
        description: "Terjadi kesalahan saat mengirim data ke admin. Cek koneksi Anda.",
        variant: "destructive",
      });
    }
  };

  // Submit ke admin (Satu per satu) - Fungsi ini BARU/DIUBAH
  const handleIndividualSubmit = async (riskId: number | string) => {
    if (!user) return;
    try {
      await submitRcsaAssessment(riskId); // Kirim ke API

      // Hapus data yang berhasil dikirim dari state lokal
      setData((prev) => {
        const newData = prev.filter((row) => row.id !== riskId);
        
        // PENTING: Update nomor urut (no) pada data yang tersisa agar penomoran tetap berurutan
        return newData.map((row, idx) => ({ ...row, no: idx + 1 }));
      });
      
      toast({
        title: "Risiko Terkirim! 🎉",
        description: `Potensi risiko ID ${riskId} telah berhasil dikirim ke admin.`,
      });
    } catch (err) {
      console.error(`Gagal kirim submission RCSA ID ${riskId}:`, err);
      toast({
        title: "Gagal Mengirim! ❌",
        description: `Terjadi kesalahan saat mengirim data ID ${riskId}. Cek status simpan Anda.`,
        variant: "destructive",
      });
    }
  };

  // --- RENDER ---

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 min-h-screen">
        <p className="text-xl text-muted-foreground animate-pulse">Memuat data RCSA...</p>
      </div>
    );
  }

  const isDataEmpty = data.length === 0;

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      
      {/* Header & Tombol Aksi */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            📊 Risk Control Self-Assessment (RCSA)
          </h1>
          <p className="text-muted-foreground">
            Lengkapi dan kelola data RCSA untuk unit operasional Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tombol Simpan Draf */}
          <Button variant="outline" onClick={handleSave} disabled={isSaving || isDataEmpty}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Menyimpan..." : "Simpan Draf"}
          </Button>
          {/* Tombol Kirim Semua (Global Submit) */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isDataEmpty}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <Send className="mr-2 h-4 w-4" /> Kirim Semua ({totalRisks} Item)
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Pengiriman Semua Data</AlertDialogTitle>
                <AlertDialogDescription>
                  Anda akan mengirim **{totalRisks}** potensi risiko sekaligus. Pastikan semua item telah diisi dan disimpan. Setelah dikirim, semua data akan dikunci.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmitAll}>Ya, Kirim Semua Data</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Info Unit & Progress */}
      <Alert className="mb-6 border-l-4 border-blue-600 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle>
          Unit Kerja:{" "}
          <span className="font-bold text-blue-800">
            {unitName || "Tidak Ada Unit Ditemukan"}
          </span>
        </AlertTitle>
        <AlertDescription>
          {isDataEmpty ? (
            "Semua RCSA telah diselesaikan. Tidak ada risiko aktif saat ini."
          ) : (
            <>
              Anda sedang mengerjakan RCSA ke-{activeRiskIndex + 1} dari {totalRisks}.
              Anda dapat menggunakan tombol Kirim Risiko Ini di bawah kartu untuk mengirim satu per satu, atau Kirim Semua di atas untuk sekaligus.
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Daftar Risiko (Hanya 1 kartu yang dirender) */}
      <div className="space-y-6">
        {isDataEmpty && (
          <div className="text-center text-muted-foreground py-12 text-lg border border-dashed rounded-lg p-10 bg-white/70">
            <Info className="h-6 w-6 mx-auto mb-3" />
            <p>Semua formulir RCSA telah selesai Anda kirim.</p>
          </div>
        )}

        {/* Render hanya satu kartu risiko aktif, passing fungsi submit individual */}
        {activeRisk && (
          <RiskCard 
            key={activeRisk.id ?? activeRiskIndex} 
            row={activeRisk} 
            index={activeRiskIndex} 
            onChange={handleInputChange} 
            onIndividualSubmit={handleIndividualSubmit} // Prop untuk Kirim Satu per Satu
          />
        )}
      </div>
      
      {/* Navigasi (Paging) */}
      {!isDataEmpty && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <Button 
            onClick={handlePrevious} 
            disabled={activeRiskIndex === 0} 
            variant="outline"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Risiko Sebelumnya
          </Button>
          <div className="text-sm font-semibold text-gray-600">
            Item {activeRiskIndex + 1} dari {totalRisks}
          </div>
          <Button 
            onClick={handleNext} 
            disabled={activeRiskIndex === totalRisks - 1}
          >
            Risiko Berikutnya <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}