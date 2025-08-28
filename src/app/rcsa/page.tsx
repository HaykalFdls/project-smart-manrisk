
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  addRcsaSubmission,
  getRcsaDraft,
  updateRcsaDraft,
  type RCSAData,
} from '@/lib/rcsa-data';
import { useToast } from '@/hooks/use-toast';
import { Save, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { getRcsaMasterData } from '@/lib/rcsa-master-data';

const jenisRisikoOptions = [
  'Risiko Kredit',
  'Risiko Pasar',
  'Risiko Likuiditas',
  'Risiko Operasional',
  'Risiko Hukum',
  'Risiko Reputasi',
  'Risiko Strategis',
  'Risiko Kepatuhan',
  'Risiko Imbal Hasil',
  'Risiko Investasi',
];

const getLevelFromBesaran = (besaran: number | null | undefined) => {
  if (besaran === null || besaran === undefined)
    return { label: '-', className: '' };
  if (besaran >= 20)
    return { label: 'Sangat Tinggi', className: 'bg-red-700 text-white' };
  if (besaran >= 12)
    return { label: 'Tinggi', className: 'bg-red-500 text-white' };
  if (besaran >= 5)
    return { label: 'Menengah', className: 'bg-yellow-400 text-black' };
  return { label: 'Rendah', className: 'bg-green-500 text-white' };
};

const CalculatedValue = ({ label, value, className }: { label: string, value: string | number | null, className?: string }) => (
    <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`flex h-10 w-full items-center justify-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-bold ${className}`}>
           {value || '-'}
        </div>
    </div>
);

const LevelBadge = ({ besaran }: { besaran: number | null | undefined }) => {
  const level = getLevelFromBesaran(besaran);
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">Level</p>
      <div className="flex h-10 items-center justify-center rounded-md border border-input bg-muted/50">
        <span
          className={`px-3 py-1 rounded text-xs font-semibold ${
            level.className || 'bg-muted/50'
          }`}
        >
          {level.label}
        </span>
      </div>
    </div>
  );
};


export default function Rcsapage() {
  const { toast } = useToast();
  const [data, setData] = useState<RCSAData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load current working data from draft, or master data if none exists
    setData(getRcsaDraft());
    setIsLoading(false);
  }, []);

  const calculatedData = useMemo(() => {
    return data.map((row) => {
      const dampakInheren = row.dampakInheren;
      const frekuensiInheren = row.frekuensiInheren;
      const besaranInheren =
        dampakInheren !== null &&
        frekuensiInheren !== null &&
        dampakInheren > 0 &&
        frekuensiInheren > 0
          ? dampakInheren * frekuensiInheren
          : null;

      const dampakResidual = row.dampakResidual;
      const kemungkinanResidual = row.kemungkinanResidual;
      const besaranResidual =
        dampakResidual !== null &&
        kemungkinanResidual !== null &&
        dampakResidual > 0 &&
        kemungkinanResidual > 0
          ? dampakResidual * kemungkinanResidual
          : null;

      return {
        ...row,
        besaranInheren,
        besaranResidual,
      };
    });
  }, [data]);

  const handleInputChange = (
    index: number,
    field: keyof Omit<RCSAData, 'no'>,
    value: string | number | null
  ) => {
    const newData = [...data];
    const updatedRow = { ...newData[index] };
    // @ts-ignore
    updatedRow[field] = value;
    newData[index] = updatedRow;
    setData(newData);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateRcsaDraft(data);
      toast({
        title: 'Sukses!',
        description: 'Data RCSA berhasil disimpan sebagai draf.',
      });
      setIsSaving(false);
    }, 1000);
  };

  const handleSubmit = () => {
    addRcsaSubmission(data);
    toast({
      title: 'Data Terkirim!',
      description:
        'Data RCSA Anda telah berhasil dikirim untuk ditinjau oleh admin.',
      variant: 'default',
    });
    // Reset form to master data after submission
    setData(getRcsaMasterData());
  };

  if (isLoading) {
    return <div className="p-8">Memuat data...</div>;
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Risk Control Self-Assessment (RCSA)
          </h1>
          <p className="text-muted-foreground">
            Lengkapi dan kelola data RCSA untuk unit operasional Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Draf'}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Kirim ke Admin
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Pengiriman</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin mengirim data RCSA ini? Setelah
                  dikirim, draf Anda akan dibersihkan dan laporan baru akan
                  dibuat untuk admin.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>
                  Ya, Kirim Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="space-y-6">
        {calculatedData.map((row, index) => (
          <Card key={row.no}>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Potensi Risiko #{row.no}</CardTitle>
                  </div>
              </div>
              <CardDescription className="pt-2 text-base text-foreground">
                {row.potensiRisiko}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <Label htmlFor={`jenis-risiko-${index}`}>Jenis Risiko</Label>
                         <Select
                          value={row.jenisRisiko || ''}
                          onValueChange={(value) => handleInputChange(index, 'jenisRisiko', value)}
                        >
                          <SelectTrigger id={`jenis-risiko-${index}`}><SelectValue placeholder="Pilih..." /></SelectTrigger>
                          <SelectContent>
                            {jenisRisikoOptions.map(option => (
                               <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                     </div>
                     <div>
                        <Label htmlFor={`penyebab-risiko-${index}`}>Penyebab Risiko</Label>
                        <Textarea
                          id={`penyebab-risiko-${index}`}
                          value={row.penyebabRisiko || ''}
                          onChange={(e) => handleInputChange(index, 'penyebabRisiko', e.target.value)}
                          className="min-h-[40px]"
                        />
                     </div>
                </div>

                <Separator />
                
                <div>
                    <h3 className="text-lg font-semibold mb-4">Risiko Inheren</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor={`dampak-inheren-${index}`}>Dampak (1-5)</Label>
                            <Input id={`dampak-inheren-${index}`} type="number" min="1" max="5" value={row.dampakInheren || ''} onChange={(e) => handleInputChange(index, 'dampakInheren', parseInt(e.target.value) || null)} className="text-center" />
                        </div>
                         <div>
                            <Label htmlFor={`frekuensi-inheren-${index}`}>Frekuensi (1-5)</Label>
                            <Input id={`frekuensi-inheren-${index}`} type="number" min="1" max="5" value={row.frekuensiInheren || ''} onChange={(e) => handleInputChange(index, 'frekuensiInheren', parseInt(e.target.value) || null)} className="text-center" />
                        </div>
                        <CalculatedValue label="Besaran" value={row.besaranInheren} />
                        <LevelBadge besaran={row.besaranInheren} />
                    </div>
                </div>

                <Separator />
                
                 <div>
                    <Label htmlFor={`pengendalian-${index}`}>Pengendalian/Mitigasi Risiko yang Ada</Label>
                    <Textarea
                        id={`pengendalian-${index}`}
                        value={row.pengendalian || ''}
                        onChange={(e) => handleInputChange(index, 'pengendalian', e.target.value)}
                    />
                </div>

                <Separator />

                <div>
                    <h3 className="text-lg font-semibold mb-4">Risiko Residual</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                           <Label htmlFor={`dampak-residual-${index}`}>Dampak (1-5)</Label>
                           <Input id={`dampak-residual-${index}`} type="number" min="1" max="5" value={row.dampakResidual || ''} onChange={(e) => handleInputChange(index, 'dampakResidual', parseInt(e.target.value) || null)} className="text-center" />
                        </div>
                        <div>
                           <Label htmlFor={`kemungkinan-residual-${index}`}>Kemungkinan (1-5)</Label>
                           <Input id={`kemungkinan-residual-${index}`} type="number" min="1" max="5" value={row.kemungkinanResidual || ''} onChange={(e) => handleInputChange(index, 'kemungkinanResidual', parseInt(e.target.value) || null)} className="text-center" />
                        </div>
                        <CalculatedValue label="Besaran" value={row.besaranResidual} />
                        <LevelBadge besaran={row.besaranResidual} />
                    </div>
                </div>

                 <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor={`penilaian-kontrol-${index}`}>Penilaian Tingkat Efektivitas Kontrol</Label>
                        <Select
                            value={row.penilaianKontrol || ''}
                            onValueChange={(value) => handleInputChange(index, 'penilaianKontrol', value)}
                        >
                            <SelectTrigger id={`penilaian-kontrol-${index}`}><SelectValue placeholder="Pilih..." /></SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Efektif">Efektif</SelectItem>
                            <SelectItem value="Cukup Efektif">Cukup Efektif</SelectItem>
                            <SelectItem value="Tidak Efektif">Tidak Efektif</SelectItem>
                            <SelectItem value="#N/A">N/A</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor={`action-plan-${index}`}>Action Plan/Mitigasi</Label>
                        <Textarea
                            id={`action-plan-${index}`}
                            value={row.actionPlan || ''}
                            onChange={(e) => handleInputChange(index, 'actionPlan', e.target.value)}
                             className="min-h-[40px]"
                        />
                    </div>
                    <div>
                        <Label htmlFor={`pic-${index}`}>PIC</Label>
                        <Input id={`pic-${index}`} value={row.pic || ''} onChange={(e) => handleInputChange(index, 'pic', e.target.value)} />
                    </div>
                </div>
            </CardContent>
            {row.keterangan && (
                <>
                <Separator />
                <CardFooter className="pt-6">
                    <p className="text-xs text-muted-foreground">
                        <strong>Keterangan dari Admin:</strong> {row.keterangan}
                    </p>
                </CardFooter>
                </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
