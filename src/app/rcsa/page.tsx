'use client';

import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  getRcsaDraft, saveRcsaAssessment, submitRcsaAssessment,
  type RCSAData,
} from '@/lib/rcsa-data';
import { useToast } from '@/hooks/use-toast';
import { Save, Send, Info } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from "@/context/auth-context";

// Pilihan jenis risiko
const jenisRisikoOptions = [
  'Risiko Kredit', 'Risiko Pasar', 'Risiko Likuiditas', 'Risiko Operasional',
  'Risiko Hukum', 'Risiko Reputasi', 'Risiko Strategis', 'Risiko Kepatuhan',
  'Risiko Imbal Hasil', 'Risiko Investasi',
];

// Fungsi mapping level risiko
const getLevelFromBesaran = (besaran: number | null | undefined) => {
  if (besaran === null || besaran === undefined) return { label: '-', className: '' };
  if (besaran >= 20) return { label: 'Sangat Tinggi', className: 'bg-red-700 text-white' };
  if (besaran >= 12) return { label: 'Tinggi', className: 'bg-red-500 text-white' };
  if (besaran >= 5) return { label: 'Menengah', className: 'bg-yellow-400 text-black' };
  return { label: 'Rendah', className: 'bg-green-500 text-white' };
};

// Komponen kecil: nilai kalkulasi
const CalculatedValue = ({ label, value, className }: { label: string; value: string | number | null; className?: string }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <div className={`flex h-10 w-full items-center justify-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-bold ${className}`}>
      {value || '-'}
    </div>
  </div>
);

// Komponen kecil: badge level
const LevelBadge = ({ besaran }: { besaran: number | null | undefined }) => {
  const level = getLevelFromBesaran(besaran);
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">Level</p>
      <div className="flex h-10 items-center justify-center rounded-md border border-input bg-muted/50">
        <span className={`px-3 py-1 rounded text-xs font-semibold ${level.className || 'bg-muted/50'}`}>
          {level.label}
        </span>
      </div>
    </div>
  );
};

// Parser keterangan admin
const parseTargetAndDescription = (description: string | null) => {
  if (!description) return { target: null, cleanDescription: null };
  const lines = description.split('\n');
  const targetLine = lines.find((line) => line.startsWith('Target: '));
  if (targetLine) {
    const target = targetLine.replace('Target: ', '');
    const cleanDescription = lines.filter((line) => !line.startsWith('Target: ')).join('\n').trim();
    return { target, cleanDescription: cleanDescription || null };
  }
  return { target: null, cleanDescription: description };
};

/* ------------------- RiskCard Component (Memoized) ------------------- */
type RiskCardProps = {
  row: RCSAData & { besaranInheren: number | null; besaranResidual: number | null };
  index: number;
  onChange: (index: number, field: keyof Omit<RCSAData, "no">, value: any) => void;
};

const RiskCard = memo(({ row, index, onChange }: RiskCardProps) => {
  const { cleanDescription } = parseTargetAndDescription(row.keteranganAdmin);

  return (
    <Card key={row.id ?? index}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>Potensi Risiko #{row.no}</CardTitle>
        </div>
        <CardDescription className="pt-2 text-base text-foreground">
          {row.potensiRisiko}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Jenis & Penyebab */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Jenis Risiko</Label>
            <Select
              value={row.jenisRisiko || ''}
              onValueChange={(value) => onChange(index, 'jenisRisiko', value)}
            >
              <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
              <SelectContent>
                {jenisRisikoOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Penyebab Risiko</Label>
            <Textarea
              value={row.penyebabRisiko || ''}
              onChange={(e) => onChange(index, 'penyebabRisiko', e.target.value)}
              className="min-h-[40px]"
            />
          </div>
        </div>

        <Separator />

        {/* Risiko Inheren */}
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-lg font-semibold">Risiko Inheren</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Dampak (1-5)</Label>
              <Input
                type="number" min="1" max="5"
                value={row.dampakInheren || ''}
                onChange={(e) => onChange(index, 'dampakInheren', parseInt(e.target.value) || null)}
                className="text-center"
              />
            </div>
            <div>
              <Label>Frekuensi (1-5)</Label>
              <Input
                type="number" min="1" max="5"
                value={row.frekuensiInheren || ''}
                onChange={(e) => onChange(index, 'frekuensiInheren', parseInt(e.target.value) || null)}
                className="text-center"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <CalculatedValue label="Besaran" value={row.besaranInheren} />
            <LevelBadge besaran={row.besaranInheren} />
          </div>
        </div>

        {/* Risiko Residual */}
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-lg font-semibold">Risiko Residual</h3>
          <div>
            <Label>Pengendalian/Mitigasi Risiko yang Ada</Label>
            <Textarea
              value={row.pengendalian || ''}
              onChange={(e) => onChange(index, 'pengendalian', e.target.value)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Dampak (1-5)</Label>
              <Input
                type="number" min="1" max="5"
                value={row.dampakResidual || ''}
                onChange={(e) => onChange(index, 'dampakResidual', parseInt(e.target.value) || null)}
                className="text-center"
              />
            </div>
            <div>
              <Label>Kemungkinan (1-5)</Label>
              <Input
                type="number" min="1" max="5"
                value={row.kemungkinanResidual || ''}
                onChange={(e) => onChange(index, 'kemungkinanResidual', parseInt(e.target.value) || null)}
                className="text-center"
              />
            </div>
            <CalculatedValue label="Besaran" value={row.besaranResidual} />
            <LevelBadge besaran={row.besaranResidual} />
          </div>

          <Separator />

          <div>
            <Label>Penilaian Tingkat Efektivitas Kontrol</Label>
            <Select
              value={row.penilaianKontrol || ''}
              onValueChange={(value) => onChange(index, 'penilaianKontrol', value)}
            >
              <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Efektif">Efektif</SelectItem>
                <SelectItem value="Cukup Efektif">Cukup Efektif</SelectItem>
                <SelectItem value="Tidak Efektif">Tidak Efektif</SelectItem>
                <SelectItem value="#N/A">N/A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Plan & PIC */}
        <div>
          <Label>Action Plan/Mitigasi</Label>
          <Textarea
            value={row.actionPlan || ''}
            onChange={(e) => onChange(index, 'actionPlan', e.target.value)}
            className="min-h-[40px]"
          />
        </div>
        <div>
          <Label>PIC</Label>
          <Input
            value={row.pic || ''}
            onChange={(e) => onChange(index, 'pic', e.target.value)}
          />
        </div>

        <Separator />

        <div>
          <Label>Keterangan (Opsional)</Label>
          <Textarea
            placeholder="Tambahkan catatan atau informasi tambahan di sini..."
            value={row.keteranganUser || ''}
            onChange={(e) => onChange(index, 'keteranganUser', e.target.value)}
            className="min-h-[60px]"
          />
        </div>
      </CardContent>

      {cleanDescription && (
        <>
          <Separator />
          <CardFooter className="pt-6">
            <p className="text-xs text-muted-foreground">
              <strong>Keterangan dari Admin:</strong> {cleanDescription}
            </p>
          </CardFooter>
        </>
      )}
    </Card>
  );
});
/* -------------------------------------------------------------------- */

export default function Rcsapage() {
  const { toast } = useToast();
  const [data, setData] = useState<RCSAData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  // Ambil draft dari backend
  useEffect(() => {
    if (!user || !user.id || !user.unit_id) return;
    const fetchDraft = async () => {
      try {
        const draft = await getRcsaDraft(user.id!, user.unit_id!);
        setData(draft);
      } catch (error) {
        console.error("Gagal load draft RCSA:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDraft();
  }, [user]);

  // Hitung besaran inheren & residual
  const calculatedData = useMemo(() => {
    return data.map((row) => {
      const besaranInheren = row.dampakInheren && row.frekuensiInheren ? row.dampakInheren * row.frekuensiInheren : null;
      const besaranResidual = row.dampakResidual && row.kemungkinanResidual ? row.dampakResidual * row.kemungkinanResidual : null;
      return { ...row, besaranInheren, besaranResidual };
    });
  }, [data]);

  // Ambil target dari keteranganAdmin
  const pageTarget = useMemo(() => {
    if (data.length > 0) {
      const { target } = parseTargetAndDescription(data[0].keteranganAdmin);
      return target;
    }
    return null;
  }, [data]);

  // Update form lokal pakai useCallback
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

  // Simpan draf
  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      for (const row of data) {
        await saveRcsaAssessment(row, user.id!, user.unit_id!);
      }
      toast({ title: "Draf berhasil disimpan" });
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal simpan draf" });
    } finally {
      setIsSaving(false);
    }
  };

  // Submit ke admin
  const handleSubmit = async () => {
    try {
      for (const row of data) {
        if (row.id) {
          await submitRcsaAssessment(row.id);
        }
      }
      toast({
        title: 'Data Terkirim!',
        description: 'Data RCSA Anda telah berhasil dikirim untuk ditinjau oleh admin.',
        variant: 'default',
      });
      setData([]);
    } catch (err) {
      console.error('Gagal kirim submission RCSA:', err);
      toast({
        title: 'Gagal!',
        description: 'Terjadi kesalahan saat mengirim data ke admin.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Control Self-Assessment (RCSA)</h1>
          <p className="text-muted-foreground">Lengkapi dan kelola data RCSA untuk unit operasional Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSave} disabled={isSaving || data.length === 0}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Draf'}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={data.length === 0}>
                <Send className="mr-2 h-4 w-4" /> Kirim ke Admin
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Pengiriman</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin mengirim data RCSA ini? Setelah dikirim, draf Anda akan dibersihkan dan laporan baru akan dibuat untuk admin.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>Ya, Kirim Data</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Info Target */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Untuk Unit Kerja Anda: {pageTarget || 'Tidak Ada'}</AlertTitle>
        <AlertDescription>
          Daftar potensi risiko di bawah ini telah disiapkan oleh admin untuk diisi oleh unit kerja Anda.
        </AlertDescription>
      </Alert>

      {/* Daftar Risiko */}
      <div className="space-y-6">
        {data.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            Tidak ada formulir RCSA yang ditugaskan untuk unit Anda saat ini.
          </div>
        )}

        {calculatedData.map((row, index) => (
          <RiskCard key={row.id ?? index} row={row} index={index} onChange={handleInputChange} />
        ))}
      </div>
    </div>
  );
}
