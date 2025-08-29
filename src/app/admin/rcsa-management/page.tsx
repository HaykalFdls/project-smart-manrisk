
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getRcsaData, updateRcsaData, type RCSAData } from '@/lib/rcsa-data';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Save, Trash2, Crosshair } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AddMasterDataModal } from '@/components/admin/add-master-data';
import { Badge } from '@/components/ui/badge';

// Helper function to extract target from the description
const parseTargetAndDescription = (description: string | null) => {
    if (!description) {
        return { target: null, cleanDescription: null };
    }
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

  useEffect(() => {
    // Start with an empty page
    // const allData = getRcsaData();
    setData([]);
    setIsLoading(false);
  }, []);

  const handleInputChange = (
    index: number,
    field: keyof Omit<RCSAData, 'no'>,
    value: string
  ) => {
    const newData = [...data];
    // @ts-ignore
    newData[index][field] = value;
    setData(newData);
  };
  
  const handleAddNew = (newRisk: Omit<RCSAData, 'no'>) => {
    const newEntry: RCSAData = {
        no: data.length > 0 ? Math.max(...data.map(d => d.no)) + 1 : 1,
        ...newRisk,
    };
    setData([...data, newEntry]);
    setIsModalOpen(false);
    toast({
        title: 'Sukses!',
        description: 'Data master baru berhasil ditambahkan.',
    });
  };

  const handleDelete = (indexToDelete: number) => {
    setData(prevData => prevData.filter((_, index) => index !== indexToDelete));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate async operation
    setTimeout(() => {
      const updatedNos = new Set(data.map(d => d.no));

      const finalData = data.map((adminRow) => {
          const existingRow = getRcsaData().find(d => d.no === adminRow.no) || {};
          return {
              ...existingRow,
              ...adminRow,
          };
      }) as RCSAData[];

      const finalDataWithoutRemoved = finalData.filter(d => updatedNos.has(d.no))
         .map((d, index) => ({...d, no: index + 1}));


      updateRcsaData(finalDataWithoutRemoved);
      
      setData(finalDataWithoutRemoved);

      toast({
        title: 'Sukses!',
        description: 'Data master RCSA berhasil diperbarui.',
      });
      setIsSaving(false);
    }, 1000);
  };

  if (isLoading) {
    return <div className="p-8">Memuat data...</div>;
  }

  return (
    <>
      <AddMasterDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddNew}
      />
      <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Kelola Master RCSA
            </h1>
            <p className="text-muted-foreground">
              Tambah, ubah, atau hapus data master yang akan diisi oleh unit operasional.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Master Risiko Baru
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {data.length === 0 && (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                <p>Belum ada data master RCSA.</p>
                <p className="text-sm">Klik "Tambah Master Risiko Baru" untuk memulai.</p>
            </div>
          )}
          {data.map((row, index) => {
            const { target, cleanDescription } = parseTargetAndDescription(row.keteranganAdmin);
            return (
              <Card key={row.no}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Master Risiko #{index + 1}</CardTitle>
                    {target && (
                      <Badge variant="secondary" className="flex items-center gap-2">
                        <Crosshair className="h-3 w-3" />
                        <span>{target}</span>
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`potensi-risiko-${index}`}>Potensi Risiko (Pertanyaan untuk User)</Label>
                    <Textarea
                      id={`potensi-risiko-${index}`}
                      value={row.potensiRisiko}
                      onChange={(e) =>
                        handleInputChange(index, 'potensiRisiko', e.target.value)
                      }
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`keterangan-${index}`}>Keterangan (Opsional, untuk User)</Label>
                    <Textarea
                      id={`keterangan-${index}`}
                      value={cleanDescription || ''}
                      onChange={(e) => {
                          const currentTargetLine = target ? `Target: ${target}\n` : '';
                          const newDescription = `${currentTargetLine}${e.target.value}`;
                          handleInputChange(index, 'keteranganAdmin', newDescription);
                      }}
                      className="min-h-[60px]"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end bg-muted/50 py-3 px-6 border-t">
                     <Button variant="destructive" size="sm" onClick={() => handleDelete(index)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                    </Button>
                </CardFooter>
              </Card>
            );
            })}
        </div>
      </div>
    </>
  );
}
