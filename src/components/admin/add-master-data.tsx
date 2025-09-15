'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/context/auth-context";
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
import { createMasterRCSA } from '@/lib/rcsa-master-data';

type AddMasterDataModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<RCSAData, 'no'>) => void;
};

type Unit = {
  id: number;
  unit_name: string;
  unit_type: 'pusat' | 'cabang' | 'lainnya';
};

export function AddMasterDataModal({
  isOpen,
  onClose,
  onSave,
}: AddMasterDataModalProps) {
  const { user } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [targetType, setTargetType] = useState<'pusat' | 'cabang' | ''>('');
  const [division, setDivision] = useState('');
  const [branchType, setBranchType] = useState('');
  const [potensiRisiko, setPotensiRisiko] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Ambil daftar unit
  useEffect(() => {
    fetch("http://localhost:5000/units")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((u: any) => {
          let type: 'pusat' | 'cabang' | 'lainnya' = 'lainnya';
          if (u.unit_type === "Kantor Pusat" || u.unit_type === "Divisi") {
            type = "pusat";
          } else if (u.unit_type === "Cabang" || u.unit_type === "KCP") {
            type = "cabang";
          }
          return { ...u, unit_type: type };
        });
        setUnits(mapped);
      })
      .catch((err) => console.error("Gagal fetch units:", err));
  }, []);

  // filter unit
  const pusatUnits = units.filter((u) => u.unit_type === "pusat");
  const cabangUnits = units.filter((u) => u.unit_type === "cabang");

  const isTargetSelected = useMemo(() => {
    if (targetType === 'pusat' && division) return true;
    if (targetType === 'cabang' && branchType) return true;
    return false;
  }, [targetType, division, branchType]);

  const isSaveDisabled = useMemo(() => {
    return !isTargetSelected || !potensiRisiko;
  }, [isTargetSelected, potensiRisiko]);

  // Simpan master baru
const handleSave = async () => {
  let unitId = 0;

  if (targetType === "pusat" && division) {
    unitId = Number(division);
  } else if (targetType === "cabang" && branchType) {
    unitId = Number(branchType);
  }

  if (!user) {
    console.error("❌ User belum login, tidak bisa simpan");
    return;
  }

    console.log("👤 User dari useAuth:", user);

  try {
    const newMaster = await createMasterRCSA({
      rcsa_name: potensiRisiko,
      description: keterangan,
      unit_id: unitId,
      created_by: user.id,
    });

    if (newMaster) {
      const selectedUnit = units.find((u) => u.id === unitId);
      onSave({
        id: newMaster.id,
        unit_id: newMaster.unit_id,
        potensiRisiko,
        keteranganAdmin: keterangan,
        keteranganUser: "",
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
        unit_name: selectedUnit?.unit_name ?? "Unit Tidak Diketahui",
        unit_type: selectedUnit?.unit_type ?? "",
      });
      resetForm();
      onClose();
    }
  } catch (err) {
    console.error("❌ handleSave error:", err);
  }
};


  // Reset form
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
          {/* Step 1: Pilih Tujuan */}
          <div className="space-y-4 rounded-md border p-4">
            <h4 className="font-semibold text-sm">Langkah 1: Pilih Tujuan</h4>
            <div className="space-y-2">
              <Label>Tujuan</Label>
              <Select
                onValueChange={(value: 'pusat' | 'cabang') => {
                  setTargetType(value);
                  setDivision('');
                  setBranchType('');
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
              <Select
                onValueChange={(value) => setDivision(value)}
                value={division}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih divisi..." />
                </SelectTrigger>
                <SelectContent>
                  {pusatUnits.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.unit_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {targetType === 'cabang' && (
              <div className="space-y-2">
                <Label>Jenis Kantor Cabang</Label>
                <Select
                  onValueChange={(value) => setBranchType(value)}
                  value={branchType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih cabang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cabangUnits.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.unit_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}  
          </div>

          {/* Step 2: Isi Detail Risiko */}
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
                  placeholder="Informasi atau panduan tambahan..."
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
