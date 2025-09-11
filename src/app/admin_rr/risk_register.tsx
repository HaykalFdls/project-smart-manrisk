'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { RiskRegisterData } from '@/lib/risk-register-data';

export default function RiskregisterManagementPage() {
  const { toast } = useToast();
  const [data, setData] = useState<RiskRegisterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/risk-register");
        const json = await res.json();
        setData(json.map((row: any, idx: number) => ({
          no: idx + 1,
          id: row.id,
          potensiRisiko: row.potensiRisiko,
          penyebab: row.penyebab,
          dampak: row.dampak,
          existingControl: row.existingControl,
          levelRisiko: row.levelRisiko,
          unit_id: row.unit_id,
          unit_name: row.unit_name,
        })));
      } catch (err) {
        toast({ title: "Error", description: "Gagal memuat data risk register" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleInputChange = (index: number, field: keyof RiskRegisterData, value: string) => {
    const newData = [...data];
    // @ts-ignore
    newData[index][field] = value;
    setData(newData);
  };

  const handleAdd = () => {
    setData(prev => [
      ...prev,
      {
        no: prev.length + 1,
        potensiRisiko: "",
        penyebab: "",
        dampak: "",
        existingControl: "",
        levelRisiko: "",
        unit_id: 1,
        unit_name: "Unit A",
      },
    ]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const row of data) {
        if (row.id) {
          // update
          await fetch(`http://localhost:5000/risk-register/${row.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(row),
          });
        } else {
          // insert baru
          await fetch(`http://localhost:5000/risk-register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(row),
          });
        }
      }
      toast({ title: "Sukses", description: "Risk register berhasil disimpan" });
    } catch (err) {
      toast({ title: "Error", description: "Gagal menyimpan risk register" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    const row = data[index];
    if (row.id) {
      try {
        await fetch(`http://localhost:5000/risk-register/${row.id}`, { method: "DELETE" });
        toast({ title: "Sukses", description: "Risk register dihapus" });
      } catch (err) {
        toast({ title: "Error", description: "Gagal hapus risk register" });
      }
    }
    setData(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="flex flex-col p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Risk Register Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Risiko
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> {isSaving ? "Menyimpan..." : "Simpan Semua"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {data.map((row, index) => (
          <Card key={row.id || row.no}>
            <CardHeader>
              <CardTitle>Risiko #{row.no} - {row.unit_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Potensi Risiko</Label>
                <Textarea
                  value={row.potensiRisiko}
                  onChange={(e) => handleInputChange(index, "potensiRisiko", e.target.value)}
                />
              </div>
              <div>
                <Label>Penyebab</Label>
                <Input
                  value={row.penyebab}
                  onChange={(e) => handleInputChange(index, "penyebab", e.target.value)}
                />
              </div>
              <div>
                <Label>Dampak</Label>
                <Input
                  value={row.dampak}
                  onChange={(e) => handleInputChange(index, "dampak", e.target.value)}
                />
              </div>
              <div>
                <Label>Existing Control</Label>
                <Input
                  value={row.existingControl}
                  onChange={(e) => handleInputChange(index, "existingControl", e.target.value)}
                />
              </div>
              <div>
                <Label>Level Risiko</Label>
                <Input
                  value={row.levelRisiko}
                  onChange={(e) => handleInputChange(index, "levelRisiko", e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="destructive" size="sm" onClick={() => handleDelete(index)}>
                <Trash2 className="mr-2 h-4 w-4" /> Hapus
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
