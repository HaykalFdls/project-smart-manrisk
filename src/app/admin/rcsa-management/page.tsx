
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getRcsaData, updateRcsaData, type RCSAData } from '@/lib/rcsa-data';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type RCSAAdminData = Pick<RCSAData, 'no' | 'potensiRisiko' | 'keterangan'>;

export default function RcsaManagementPage() {
  const { toast } = useToast();
  const [data, setData] = useState<RCSAAdminData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const allData = getRcsaData();
    const adminViewData = allData.map(({ no, potensiRisiko, keterangan }) => ({ no, potensiRisiko, keterangan }));
    setData(adminViewData);
    setIsLoading(false);
  }, []);

  const handleInputChange = (
    index: number,
    field: keyof Omit<RCSAAdminData, 'no'>,
    value: string
  ) => {
    const newData = [...data];
    // @ts-ignore
    newData[index][field] = value;
    setData(newData);
  };
  
  const handleAddNew = () => {
    const newRisk: RCSAAdminData = {
        no: data.length > 0 ? Math.max(...data.map(d => d.no)) + 1 : 1,
        potensiRisiko: '',
        keterangan: '',
    };
    setData([...data, newRisk]);
  };

  const handleDelete = (indexToDelete: number) => {
    setData(prevData => prevData.filter((_, index) => index !== indexToDelete));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate async operation
    setTimeout(() => {
      const existingData = getRcsaData();
      
      const updatedNos = new Set(data.map(d => d.no));

      const finalData = data.map((adminRow) => {
          const existingRow = existingData.find(d => d.no === adminRow.no) || {};
          return {
              ...existingRow,
              ...adminRow,
          };
      }) as RCSAData[];

      const finalDataWithoutRemoved = finalData.filter(d => updatedNos.has(d.no))
         .map((d, index) => ({...d, no: index + 1}));


      updateRcsaData(finalDataWithoutRemoved);
      
      setData(finalDataWithoutRemoved.map(({ no, potensiRisiko, keterangan }) => ({ no, potensiRisiko, keterangan })));

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
          <Button variant="outline" onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Baris
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {data.map((row, index) => (
          <Card key={row.no}>
            <CardHeader>
              <CardTitle>Master Risiko #{index + 1}</CardTitle>
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
                  value={row.keterangan || ''}
                  onChange={(e) =>
                    handleInputChange(index, 'keterangan', e.target.value)
                  }
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
        ))}
      </div>
    </div>
  );
}
