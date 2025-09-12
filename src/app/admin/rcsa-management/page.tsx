'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Save, Trash2, Crosshair } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AddMasterDataModal } from "@/components/admin/add-master-data";
import { type RCSAData } from '@/lib/rcsa-data';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Helper pisahkan target dari description
const parseTargetAndDescription = (description: string | null) => {
  if (!description) return { target: null, cleanDescription: null };
  const lines = description.split('\n');
  const targetLine = lines.find(line => line.startsWith('Target: '));
  if (targetLine) {
    const target = targetLine.replace('Target: ', '');
    const cleanDescription = lines.filter(line => !line.startsWith('Target: ')).join('\n').trim();
    return { target, cleanDescription: cleanDescription || null };
  }
  return { target: null, cleanDescription: description };
};

export default function RcsaManagementPage() {
  const { toast } = useToast();
  const [data, setData] = useState<RCSAData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔴 state untuk notifikasi tab
  const [newUnits, setNewUnits] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/master-rcsa");
        const json = await res.json();
        setData(json.map((row: any, idx: number) => ({
          no: idx + 1,
          potensiRisiko: row.rcsa_name,
          keteranganAdmin: row.description,
          id: row.id,
          unit_id: row.unit_id,
          unit_name: row.unit_name,
        })));
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Gagal memuat data master RCSA" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleInputChange = (index: number, field: keyof Omit<RCSAData, 'no'>, value: string) => {
    const newData = [...data];
    // @ts-ignore
    newData[index][field] = value;
    setData(newData);
  };

  const handleDelete = async (indexToDelete: number) => {
    const row = data[indexToDelete];
    if (row.id) {
      try {
        await fetch(`http://localhost:5000/master-rcsa/${row.id}`, { method: "DELETE" });
        toast({ title: "Dihapus", description: "Master RCSA berhasil dihapus" });
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Gagal hapus data" });
      }
    }
    setData(prevData => prevData.filter((_, index) => index !== indexToDelete));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const row of data) {
        if (row.id) {
          await fetch(`http://localhost:5000/master-rcsa/${row.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rcsa_name: row.potensiRisiko,
              description: row.keteranganAdmin,
              unit_id: row.unit_id || 1,
            }),
          });
        }
      }
      toast({ title: "Sukses", description: "Data master RCSA berhasil diperbarui" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Gagal menyimpan perubahan" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8">Memuat data...</div>;

  // Ambil semua unit unik
  const unitOptions = Array.from(new Set(data.map(d => d.unit_name || "Unit Tidak Diketahui")));

  return (
    <>
      <AddMasterDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(newData) => {
        const safeUnitName = newData.unit_name ?? "Unit Tidak Diketahui";

        setData((prev) => [
          ...prev,
          {
            no: prev.length + 1,
            potensiRisiko: newData.potensiRisiko,
            keteranganAdmin: newData.keteranganAdmin || "",
            id: newData.id,
            unit_id: newData.unit_id,
            unit_name: safeUnitName,
          } as RCSAData,
        ]);
      
        setNewUnits((prev) => {
          if (!prev.includes(safeUnitName)) {
            return [...prev, safeUnitName];
          }
          return prev;
        });
      
        toast({ title: "Sukses", description: `Data baru ditambahkan ke unit ${safeUnitName}` });
      }}
      />

      <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kelola Data Master RCSA</h1>
            <p className="text-muted-foreground">Tambah, ubah, atau hapus data master yang akan diisi oleh unit operasional.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Master Risiko Baru
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>

        {/* Tabs per unit */}
        <Tabs
          defaultValue={unitOptions[0] || "Unit Tidak Diketahui"}
          className="w-full"
          onValueChange={(val) => {
            if (!val) return; 
            setNewUnits((prev) => prev.filter((u) => u !== val));
          }}
        >

          <TabsList className="flex flex-wrap gap-2 mb-6">
            {unitOptions.map((unit) => (
              <TabsTrigger key={unit} value={unit} className="relative">
                {unit}
                {newUnits.includes(unit) && (
                  <>
                    <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-red-500" />
                  </>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {unitOptions.map((unit) => (
            <TabsContent key={unit} value={unit} className="space-y-6">
              {data.filter(d => (d.unit_name || "Unit Tidak Diketahui") === unit).length === 0 ? (
                <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                  <p>Belum ada data master RCSA untuk unit ini.</p>
                </div>
              ) : (
                data.filter(d => (d.unit_name || "Unit Tidak Diketahui") === unit).map((row, index) => {
                  const { target, cleanDescription } = parseTargetAndDescription(row.keteranganAdmin);
                  return (
                    <Card key={row.id || row.no}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Master Risiko #{row.no}</CardTitle>
                            <p className="text-sm text-muted-foreground">Unit: {row.unit_name}</p>
                          </div>
                          {target && (
                            <Badge variant="secondary" className="flex items-center gap-2">
                              <Crosshair className="h-3 w-3" /> <span>{target}</span>
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Potensi Risiko</Label>
                          <Textarea
                            value={row.potensiRisiko}
                            onChange={(e) =>
                              handleInputChange(row.no - 1, 'potensiRisiko', e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label>Keterangan (Opsional)</Label>
                          <Textarea
                            value={cleanDescription || ''}
                            onChange={(e) => {
                              const currentTargetLine = target ? `Target: ${target}\n` : '';
                              const newDescription = `${currentTargetLine}${e.target.value}`;
                              handleInputChange(row.no - 1, 'keteranganAdmin', newDescription);
                            }}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end bg-muted/50 py-3 px-6 border-t">
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(row.no - 1)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}
