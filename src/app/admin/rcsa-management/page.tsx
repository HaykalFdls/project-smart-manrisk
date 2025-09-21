"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddMasterDataModal } from "@/components/admin/add-master-data";
import { type RCSAData } from "@/lib/rcsa-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RcsaManagementPage() {
  const { toast } = useToast();
  const [data, setData] = useState<RCSAData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/master-rcsa");
        const json = await res.json();
        setData(
          json.map((row: any, idx: number) => ({
            no: idx + 1,
            potensiRisiko: row.rcsa_name,
            keteranganAdmin: row.description,
            id: row.id,
            unit_id: row.unit_id,
            unit_name: row.unit_name,
          }))
        );
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Gagal memuat data master RCSA" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

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
      toast({
        title: "Sukses",
        description: "Data master RCSA berhasil diperbarui",
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Gagal menyimpan perubahan" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (row: RCSAData) => {
    if (row.id) {
      try {
        await fetch(`http://localhost:5000/master-rcsa/${row.id}`, {
          method: "DELETE",
        });
        setData((prev) =>
          prev
            .filter((r) => r.id !== row.id)
            .map((r, idx) => ({ ...r, no: idx + 1 }))
        );
        toast({ title: "Dihapus", description: "Master RCSA berhasil dihapus" });
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Gagal hapus data" });
      }
    }
  };

  if (isLoading) return <div className="p-8">Memuat data...</div>;

  // langsung daftar unit/divisi, tanpa kategori pusat/cabang
  const unitOptions = Array.from(
    new Set(data.map((d) => d.unit_name || "Unit Tidak Diketahui"))
  );
  const filteredData = data.filter((d) => d.unit_name === selectedUnit);

  return (
    <>
      <AddMasterDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(newData) => {
          setData((prev) => [
            {
              no: 1,
              potensiRisiko: newData.potensiRisiko,
              keteranganAdmin: newData.keteranganAdmin || "",
              id: newData.id,
              unit_id: newData.unit_id,
              unit_name: newData.unit_name ?? "Unit Tidak Diketahui",
            },
            ...prev.map((r, idx) => ({
              ...r,
              no: idx + 2,
            })),
          ]);
          toast({ title: "Sukses", description: `Data baru ditambahkan.` });
        }}
      />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Kelola Data Master RCSA</h1>
            <p className="text-muted-foreground">
              Pilih unit/divisi terlebih dahulu untuk melihat data risiko.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Risiko
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />{" "}
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>

        {/* Dropdown pilih unit */}
        <div className="mb-6 w-72">
          <Label>Unit</Label>
          <Select onValueChange={setSelectedUnit} value={selectedUnit}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih unit/divisi..." />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabel data */}
        {selectedUnit ? (
          filteredData.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-center">NO</th>
                    <th className="p-3 text-center">Potensi Risiko</th>
                    <th className="p-3 text-center">Keterangan</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {filteredData.map((row, idx) => (
                    <tr key={row.id} className="border-t">
                      <td className="p-1">{idx + 1}</td>
                      <td className="p-6">
                        <Textarea
                          value={row.potensiRisiko}
                          onChange={(e) =>
                            setData((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? { ...r, potensiRisiko: e.target.value }
                                  : r
                              )
                            )
                          }
                        />
                      </td>
                      <td className="p-3">
                        <Textarea
                          value={row.keteranganAdmin || ""}
                          onChange={(e) =>
                            setData((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? { ...r, keteranganAdmin: e.target.value }
                                  : r
                              )
                            )
                          }
                        />
                      </td>
                      <td>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(row)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Belum ada data untuk unit ini.
            </p>
          )
        ) : (
          <p className="text-muted-foreground">
            Silakan pilih unit terlebih dahulu.
          </p>
        )}
      </div>
    </>
  );
}
