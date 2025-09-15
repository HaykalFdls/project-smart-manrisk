"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, FileDown } from "lucide-react";

export type RiskReportData = {
  id: number;
  potensiRisiko: string;
  keteranganAdmin?: string | null;
  unit_id?: number;
  unit_name?: string;
  approved?: boolean; // tanda sudah di-approve
};

export default function RiskReportPage() {
  const { toast } = useToast();
  const [data, setData] = useState<RiskReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/risks");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Gagal memuat data risiko" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleApprove = async (risk: RiskReportData) => {
    try {
      // Simpan ke tabel approved_risks
      await fetch("http://localhost:5000/approved-risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(risk),
      });

      // Update UI
      setData((prev) =>
        prev.map((r) =>
          r.id === risk.id ? { ...r, approved: true } : r
        )
      );

      toast({
        title: "Approved",
        description: `Risiko ${risk.potensiRisiko} berhasil disetujui`,
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Gagal approve data" });
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const res = await fetch("http://localhost:5000/approved-risks/export");
      if (!res.ok) throw new Error("Gagal download");

      // Buat blob dan trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "approved_risks.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Gagal download Excel" });
    }
  };

  if (isLoading) return <div className="p-8">Memuat laporan risiko...</div>;

  const unitOptions = Array.from(new Set(data.map((d) => d.unit_name || "Unit Tidak Diketahui")));

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Report</h1>
          <p className="text-muted-foreground">Laporan risiko dari seluruh unit, bisa di-approve oleh admin.</p>
        </div>
        <Button onClick={handleDownloadExcel}>
          <FileDown className="mr-2 h-4 w-4" /> Download Excel
        </Button>
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
                <p>Belum ada laporan risiko untuk unit ini.</p>
              </div>
            ) : (
              data
                .filter((d) => (d.unit_name || "Unit Tidak Diketahui") === unit)
                .map((row, index) => (
                  <Card key={row.id}>
                    <CardHeader>
                      <CardTitle>Risiko #{index + 1}</CardTitle>
                      <p className="pt-2 text-sm text-muted-foreground">Unit: {row.unit_name}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Potensi Risiko</Label>
                        <p className="mt-1">{row.potensiRisiko}</p>
                      </div>
                      <div>
                        <Label>Keterangan Admin</Label>
                        <p className="mt-1">
                          {row.keteranganAdmin ? row.keteranganAdmin : "-"}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end bg-muted/50 py-3 px-6 border-t">
                      {row.approved ? (
                        <Button variant="outline" size="sm" disabled>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approved
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleApprove(row)}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Approve
                        </Button>
                      )}
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
