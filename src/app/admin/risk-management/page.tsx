"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Save, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export type RiskData = {
  id?: number;
  no: number;
  potensiRisiko: string;
  keteranganAdmin?: string | null;
  unit_id?: number;
  unit_name?: string;
};

export default function RiskRegisterPage() {
  const { toast } = useToast();
  const [data, setData] = useState<RiskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/risks");
        const json = await res.json();
        setData(
          json.map((row: any, idx: number) => ({
            no: idx + 1,
            potensiRisiko: row.potensiRisiko,
            keteranganAdmin: row.keteranganAdmin,
            id: row.id,
            unit_id: row.unit_id,
            unit_name: row.unit_name,
          }))
        );
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Gagal memuat data Risk Register" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleInputChange = (index: number, field: keyof Omit<RiskData, "no">, value: string) => {
    const newData = [...data];
    // @ts-ignore
    newData[index][field] = value;
    setData(newData);
  };

  const handleAdd = () => {
    const newRisk: RiskData = {
      no: data.length + 1,
      potensiRisiko: "",
      keteranganAdmin: "",
      unit_id: 1,
      unit_name: "Unit Tidak Diketahui",
    };
    setData([...data, newRisk]);
  };

  const handleDelete = async (indexToDelete: number) => {
    const row = data[indexToDelete];
    if (row.id) {
      try {
        await fetch(`http://localhost:5000/risks/${row.id}`, { method: "DELETE" });
        toast({ title: "Dihapus", description: "Risiko berhasil dihapus" });
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Gagal hapus data" });
      }
    }
    setData((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const row of data) {
        if (row.id) {
          // update
          await fetch(`http://localhost:5000/risks/${row.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              potensiRisiko: row.potensiRisiko,
              keteranganAdmin: row.keteranganAdmin,
              unit_id: row.unit_id || 1,
            }),
          });
        } else {
          // insert baru
          await fetch("http://localhost:5000/risks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              potensiRisiko: row.potensiRisiko,
              keteranganAdmin: row.keteranganAdmin,
              unit_id: row.unit_id || 1,
            }),
          });
        }
      }
      toast({ title: "Sukses", description: "Data Risk Register berhasil diperbarui" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Gagal menyimpan perubahan" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8">Memuat data...</div>;

  const unitOptions = Array.from(new Set(data.map((d) => d.unit_name || "Unit Tidak Diketahui")));

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Register</h1>
          <p className="text-muted-foreground">Data risiko yang telah dicatat oleh admin.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Risiko Baru
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue={unitOptions[0] || "Unit Tidak Diketahui"} className="w-full">
        <TabsList className="flex flex-wrap gap-2 mb-6">
          {unitOptions.map((unit) => (
            <TabsTrigger key={unit} value={unit}>
              {unit}
            </TabsTrigger>
          ))}
        </TabsList>

        {unitOptions.map((unit) => (
          <TabsContent key={unit} value={unit} className="space-y-6">
            {data.filter((d) => (d.unit_name || "Unit Tidak Diketahui") === unit).length === 0 ? (
              <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                <p>Belum ada data Risk Register untuk unit ini.</p>
              </div>
            ) : (
              data
                .filter((d) => (d.unit_name || "Unit Tidak Diketahui") === unit)
                .map((row, index) => (
                  <Card key={row.id || row.no}>
                    <CardHeader>
                      <CardTitle>Risiko #{row.no}</CardTitle>
                      <p className="pt-2 text-sm text-muted-foreground">Unit: {row.unit_name}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Potensi Risiko</Label>
                        <Textarea
                          value={row.potensiRisiko}
                          onChange={(e) =>
                            handleInputChange(row.no - 1, "potensiRisiko", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label>Keterangan Admin</Label>
                        <Textarea
                          value={row.keteranganAdmin || ""}
                          onChange={(e) =>
                            handleInputChange(row.no - 1, "keteranganAdmin", e.target.value)
                          }
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end bg-muted/50 py-3 px-6 border-t">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(row.no - 1)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
