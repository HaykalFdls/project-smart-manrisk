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

// Data cabang + cabang pembantu
const branchOptions: Record<string, string[]> = {
  "Pelajar Pejuang": [
    "Kantor Cabang Pelajar Pejuang",
    "KCP Soreang",
    "KCP Garut",
    "KCP Rancaekek",
    "KCP Sumedang",
    "KCP Bojongsoang",
    "KCP Arcamanik",
    "KCP Mohammad Toha",
    "KCP Majalaya",
    "KCP UIN Sunan Gunung Djati",
  ],

  "Tasikmalaya": [
    "Kantor Cabang Tasikmalaya",
    "KCP Banjar",
    "KCP Singaparna",
    "KCP Ciawi",
    "KCP Bantar Kalong",
    "KCP Cikurubuk",
    "KK Jasa Kartini",
    "KCP Tipe B Universitas Siliwangi",
  ],
  "Cirebon": [
    "Kantor Cabang Cibiru",
    "KCP Kuningan",
    "KCP Majalengka",
    "KCP Arjawinangun",
    "KCP Ciledug Cirebon",
    "KCP Sumber",
  ],

  "Bogor": [
    "Kantor Cabang Bogor",
    "KCP Cibinong",
    "KCP Jembatan Merah",
  ],

  "Serang": [
    "Kantor Cabang Serang",
    "KCP Pandeglang",
    "KCP Cilegon",
    "KCP Rangkasbitung",
  ],

  "Bekasi": [
    "Kantor Cabang Bekasi",
    "KCP Cikarang",
    "KCP Pondok Gede",
    "KCP Tambun",
    "KCP Harapan Indah",
    "KCP Lippo Cikarang",
    "KCP Bantar Gebang",
  ],

  "Jakarta Soepomo" : [
    "Kantor Cabang Jakarta Soepomo",
    "KCP Rawamangun",
    "KCP Rawamangun",
    "KCP Kramat Jati",
    "KCP Pondok Labu",
  ],

  "Bandung Braga" : [
    "Kantor Cabang Bandung Braga",
    "KCP Sukajadi",
    "KCP Cimahi",
    "KCP Jamika",
    "KCP Margaasih",
    "KCP Lembang",
    "KCP Padalarang",
  ],

  "Tangerang" : [
    "Kantor Cabang Tangerang",
    "KCP Ciledug",
    "KCP BSD",
    "KCP Ciputat",
    "KCP Citra Raya",
  ],

  "Depok" : [
    "Kantor Cabang Depok",
    "KCP Cibubur",
    "KCP Sawangan",
  ],

  "Karawang" : [
    "Kantor Cabang Karawang",
    "KCP Purwakarta",
    "KCP Subang",
    "KCP Cikampek",
  ],

  "Sukabumi" : [
    "Kantor Cabang Sukabumi",
    "KCP Cianjur",
    "KCP Palabuhan Ratu"
  ],

  "Indramayu" : [
    "Kantor Cabang Indramayu",
    "KCP Jatibarang",
    "KCP Patrol"
  ],
};

export function AddMasterDataModal({ isOpen, onClose, onSave }: AddMasterDataModalProps) {
  const [targetType, setTargetType] = useState<'pusat' | 'cabang' | ''>('');
  const [division, setDivision] = useState('');
  const [branchType, setBranchType] = useState('');
  const [branchSubType, setBranchSubType] = useState('');
  const [potensiRisiko, setPotensiRisiko] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const isTargetSelected = useMemo(() => {
    if (targetType === 'pusat' && division) return true;
    if (targetType === 'cabang' && branchSubType) return true;
    return false;
  }, [targetType, division, branchSubType]);

  const isSaveDisabled = useMemo(() => {
    return !isTargetSelected || !potensiRisiko;
  }, [isTargetSelected, potensiRisiko]);

const handleSave = () => {
  let targetInfo = '';
  if (targetType === 'pusat') {
    targetInfo = `Target: ${division}`;
  } else if (targetType === 'cabang') {
    targetInfo = `Target: ${branchSubType}`;
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

  // ✅ hanya reset soal, divisi/cabang jangan dihapus
  resetRiskForm();
};

// Reset hanya soal (biar divisi/cabang tetap ada)
const resetRiskForm = () => {
  setPotensiRisiko('');
  setKeterangan('');
};

// Reset semua hanya dipanggil kalau modal ditutup
const resetAllForm = () => {
  setTargetType('');
  setDivision('');
  setBranchType('');
  setBranchSubType('');
  setPotensiRisiko('');
  setKeterangan('');
};

const handleClose = () => {
  resetAllForm(); // ✅ tetap kosongkan kalau user bener2 nutup modal
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
              <Select
                onValueChange={(value: 'pusat' | 'cabang') => {
                  setTargetType(value);
                  setDivision('');
                  setBranchType('');
                  setBranchSubType('');
                }}
                value={targetType}
              >
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
                    {divisions.map((div) => (
                      <SelectItem key={div} value={div}>
                        {div}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {targetType === 'cabang' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Pilih Kantor Cabang</Label>
                  <Select
                    onValueChange={(value) => {
                      setBranchType(value);
                      setBranchSubType('');
                    }}
                    value={branchType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kantor cabang..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(branchOptions).map((cab) => (
                        <SelectItem key={cab} value={cab}>
                          {cab}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {branchType && (
                  <div className="space-y-2">
                    <Label>Pilih Unit</Label>
                    <Select
                      onValueChange={setBranchSubType}
                      value={branchSubType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih cabang / cabang pembantu..." />
                      </SelectTrigger>
                      <SelectContent>
                        {branchOptions[branchType].map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
