
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { RCSAData } from '@/lib/rcsa-data';
import { Separator } from '../ui/separator';

type AddMasterDataModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<RCSAData, 'no'>) => void;
};

const divisions = [
  'Divisi Audit Internal', 'Divisi Sumber Daya Insani (SDI)', 'Divisi Perencanaan Strategis',
  'Divisi Penyelamatan & Penyelesaian Pembiayaan (P3)', 'Divisi Pembiayaan Konsumer',
  'Divisi Dana Jasa Ritel', 'Divisi Dana Korporasi dan Institusi (Insbank)', 'Divisi Kepatuhan',
  'Divisi Teknologi Informasi', 'Divisi Operasional', 'Divisi Pengendalian Keuangan',
  'Divisi Risiko Pembiayaan', 'Divisi Pembiayaan UMKM, Ritel, & Komersil', 'Divisi Manajemen Risiko',
  'Divisi Bisnis Digital', 'Desk Sekretariat Perusahaan (Corsec)',
  'Desk Pengembangan Produk & Prosedur (Sysdur)', 'Desk Administrasi Pembiayaan & Bisnis Legal (APBL)',
  'Desk Legal', 'Desk Treasury'
];

export function AddMasterDataModal({ isOpen, onClose, onSave }: AddMasterDataModalProps) {
  const [targetType, setTargetType] = useState<'pusat' | 'cabang' | ''>('');
  const [division, setDivision] = useState('');
  const [branchType, setBranchType] = useState('');
  const [potensiRisiko, setPotensiRisiko] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const isTargetSelected = useMemo(() => {
    if (targetType === 'pusat' && division) return true;
    if (targetType === 'cabang' && branchType) return true;
    return false;
  }, [targetType, division, branchType]);

  const isSaveDisabled = useMemo(() => {
    return !isTargetSelected || !potensiRisiko;
  }, [isTargetSelected, potensiRisiko]);

  const handleSave = () => {
    let targetInfo = '';
    if (targetType === 'pusat') {
        targetInfo = `Target: ${division}`;
    } else if (targetType === 'cabang') {
        targetInfo = `Target: ${branchType}`;
    }

    const finalKeterangan = `${targetInfo}\n${keterangan}`;
    
    const newData: Omit<RCSAData, 'no'> = {
        potensiRisiko,
        keterangan: finalKeterangan,
        jenisRisiko: null,
        penyebabRisiko: null,
        dampakInheren: null,
        frekuensiInheren: null,
        pengendalian: null,
        dampakResidual: null,
        kemungkinanResidual: null,
        penilaianKontrol: null,
        actionPlan: null,
        pic: null,
    };
    onSave(newData);
    resetForm();
  };

  const resetForm = () => {
    setTargetType('');
    setDivision('');
    setBranchType('');
    setPotensiRisiko('');
    setKeterangan('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Tambah Master Risiko Baru</DialogTitle>
          <DialogDescription>
            Pilih tujuan unit kerja terlebih dahulu, kemudian isi detail risiko.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-semibold text-sm">Langkah 1: Pilih Tujuan</h4>
                 <div className="space-y-2">
                    <Label>Tujuan</Label>
                    <Select onValueChange={(value: 'pusat' | 'cabang') => {
                        setTargetType(value);
                        setDivision('');
                        setBranchType('');
                    }} value={targetType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih tujuan..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pusat">Kantor Pusat</SelectItem>
                        <SelectItem value="cabang">Kantor Cabang</SelectItem>
                    </SelectContent>
                    </Select>
                </div>

                {targetType === 'pusat' && (
                    <div className="space-y-2">
                    <Label>Divisi Kantor Pusat</Label>
                    <Select onValueChange={setDivision} value={division}>
                        <SelectTrigger>
                        <SelectValue placeholder="Pilih divisi..." />
                        </SelectTrigger>
                        <SelectContent>
                        {divisions.map(div => <SelectItem key={div} value={div}>{div}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    </div>
                )}

                {targetType === 'cabang' && (
                    <div className="space-y-2">
                    <Label>Jenis Kantor Cabang</Label>
                    <Select onValueChange={setBranchType} value={branchType}>
                        <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis cabang..." />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Kantor Cabang">Kantor Cabang</SelectItem>
                        <SelectItem value="Kantor Cabang Pembantu">Kantor Cabang Pembantu</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                )}
            </div>

          {isTargetSelected && (
            <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-semibold text-sm">Langkah 2: Isi Detail Risiko</h4>
                <div className="space-y-2">
                    <Label htmlFor="potensi-risiko">Potensi Risiko</Label>
                    <Textarea
                    id="potensi-risiko"
                    placeholder="Contoh: Terdapat selisih KAS Teller"
                    value={potensiRisiko}
                    onChange={(e) => setPotensiRisiko(e.target.value)}
                    className="min-h-[80px]"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="keterangan">Keterangan Tambahan (Opsional)</Label>
                    <Textarea
                        id="keterangan"
                        placeholder="Informasi atau panduan tambahan untuk unit kerja..."
                        value={keterangan}
                        onChange={(e) => setKeterangan(e.target.value)}
                        className="min-h-[60px]"
                    />
                </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isSaveDisabled}>
            Simpan Master Risiko
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
