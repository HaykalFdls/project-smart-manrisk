"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { createMasterRisk, fetchUsers } from "@/lib/risk-register";

export default function MasterRiskForm({ fetchWithAuth, onSuccess }: any) {
  const [open, setOpen] = useState(false);
  const [kategori, setKategori] = useState("");
  const [pemilik, setPemilik] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await fetchUsers(fetchWithAuth);
        setUsers(u);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [fetchWithAuth]);

  const submit = async () => {
    try {
      if (!kategori.trim()) {
        toast({ title: "Kategori risiko wajib diisi", variant: "destructive" });
        return;
      }

      if (!pemilik) {
        toast({ title: "Pemilik risiko wajib dipilih", variant: "destructive" });
        return;
      }

      setLoading(true);

      await createMasterRisk(fetchWithAuth, {
        kategori_risiko: kategori,
        pemilik_risiko: pemilik,
      });

      toast({ title: "Master Risk berhasil dibuat" });
      setOpen(false);
      setKategori("");
      setPemilik(null);
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast({ title: err?.message || "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Kategori Risiko (Master)</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Kategori Risiko (Master)</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">

            {/* Input kategori */}
            <div>
              <Label>Kategori Risiko <span className="text-red-500">*</span></Label>
              <Input
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                placeholder="Contoh: Risiko Keterlambatan Proses"
              />
            </div>

            {/* Pemilik risiko */}
            <div>
              <Label>Pemilik Risiko <span className="text-red-500">*</span></Label>
              <select
                className="w-full p-2 rounded border"
                value={pemilik ?? ""}
                onChange={(e) => setPemilik(Number(e.target.value))}
              >
                <option value="">-- Pilih Pemilik Risiko --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unit_name ? `${u.unit_name} — ${u.name}` : u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button onClick={submit} disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
