"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRcsaSubmitted, type RCSAData } from "@/lib/rcsa-data";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  CheckCircle2,
  FileSpreadsheet,
  ChevronRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from "xlsx";

// --- helpers
const getLevelFromBesaran = (
  besaran: number | null | undefined
): { label: string; color: string } => {
  if (besaran === null || besaran === undefined)
    return { label: "-", color: "bg-gray-400 text-white" };
  if (besaran >= 20) return { label: "Sangat Tinggi", color: "bg-red-600 text-white" };
  if (besaran >= 12) return { label: "Tinggi", color: "bg-orange-500 text-white" };
  if (besaran >= 5) return { label: "Menengah", color: "bg-yellow-400 text-black" };
  return { label: "Rendah", color: "bg-green-500 text-white" };
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between py-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right">{value || "-"}</span>
  </div>
);

// --- Detail Card
const RiskReportDetail = ({
  data,
  onApprove,
}: {
  data: RCSAData & { approved?: boolean };
  onApprove: (id: number | undefined) => void;
}) => {
  const besaranInheren =
    data.dampakInheren && data.frekuensiInheren
      ? data.dampakInheren * data.frekuensiInheren
      : null;
  const levelInheren = getLevelFromBesaran(besaranInheren);
  const besaranResidual =
    data.dampakResidual && data.kemungkinanResidual
      ? data.dampakResidual * data.kemungkinanResidual
      : null;
  const levelResidual = getLevelFromBesaran(besaranResidual);

  return (
    <Card className="mb-6 border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">
          Risiko #{data.no}: {data.potensiRisiko}
        </CardTitle>
        {data.approved ? (
          <Badge
            variant="outline"
            className="flex items-center gap-1 text-green-600 border-green-600"
          >
            <CheckCircle2 className="h-4 w-4" /> Approved
          </Badge>
        ) : (
          <Button size="sm" onClick={() => onApprove(data.id)}>
            Approve
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Info dasar */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Informasi Risiko</h4>
          <DetailRow label="Jenis Risiko" value={data.jenisRisiko} />
          <DetailRow
            label="Penyebab Risiko"
            value={<span className="whitespace-normal">{data.penyebabRisiko}</span>}
          />
        </div>
        <Separator />

        {/* Inheren */}
        <div className="bg-muted/30 rounded-lg p-3">
          <h4 className="text-sm font-semibold mb-2">Risiko Inheren</h4>
          <DetailRow label="Dampak" value={data.dampakInheren} />
          <DetailRow label="Frekuensi" value={data.frekuensiInheren} />
          <DetailRow label="Besaran" value={besaranInheren} />
          <DetailRow
            label="Level"
            value={
              <span className={`px-2 py-0.5 rounded ${levelInheren.color}`}>
                {levelInheren.label}
              </span>
            }
          />
        </div>
        <Separator />

        {/* Residual */}
        <div className="bg-muted/30 rounded-lg p-3">
          <h4 className="text-sm font-semibold mb-2">
            Pengendalian & Risiko Residual
          </h4>
          <DetailRow label="Pengendalian" value={data.pengendalian} />
          <DetailRow label="Dampak Residual" value={data.dampakResidual} />
          <DetailRow label="Kemungkinan Residual" value={data.kemungkinanResidual} />
          <DetailRow label="Besaran Residual" value={besaranResidual} />
          <DetailRow
            label="Level Residual"
            value={
              <span className={`px-2 py-0.5 rounded ${levelResidual.color}`}>
                {levelResidual.label}
              </span>
            }
          />
        </div>
        <Separator />

        {/* Kontrol & Mitigasi */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Kontrol & Mitigasi</h4>
          <DetailRow label="Penilaian Efektivitas" value={data.penilaianKontrol} />
          <DetailRow
            label="Action Plan / Mitigasi"
            value={<span className="whitespace-normal">{data.actionPlan}</span>}
          />
          <DetailRow label="PIC" value={data.pic} />
        </div>

        {/* Notes */}
        {data.keteranganUser && (
          <div className="bg-muted/20 rounded-md p-3">
            <h4 className="text-sm font-semibold mb-1">Keterangan dari User</h4>
            <p className="text-sm whitespace-pre-wrap">{data.keteranganUser}</p>
          </div>
        )}
      </CardContent>
      {data.keteranganAdmin && (
        <CardFooter>
          <p className="text-xs text-muted-foreground whitespace-pre-wrap">
            <strong>Keterangan Admin:</strong>{" "}
            {data.keteranganAdmin
              .split("\n")
              .filter((line) => !line.startsWith("Target:"))
              .join("\n")}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

// --- Main Page
export default function RcsaReportPage() {
  const [submissions, setSubmissions] = useState<
    (RCSAData & { approved?: boolean })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState<string>("all");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await getRcsaSubmitted();
      const withApproval = result.map((r) => ({ ...r, approved: false }));
      setSubmissions(withApproval);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = (id: number | undefined) => {
    if (!id) return;
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, approved: true } : s))
    );
  };

  const downloadExcel = () => {
    const approvedReports = submissions.filter((s) => s.approved);
    if (approvedReports.length === 0) {
      alert("Belum ada laporan yang di-approve.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      approvedReports.map((r) => ({
        ID: r.id,
        Unit: r.unit_name,
        PotensiRisiko: r.potensiRisiko,
        JenisRisiko: r.jenisRisiko,
        PenyebabRisiko: r.penyebabRisiko,
        DampakInheren: r.dampakInheren,
        FrekuensiInheren: r.frekuensiInheren,
        DampakResidual: r.dampakResidual,
        KemungkinanResidual: r.kemungkinanResidual,
        ActionPlan: r.actionPlan,
        PIC: r.pic,
        KeteranganUser: r.keteranganUser,
        KeteranganAdmin: r.keteranganAdmin,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Approved RCSA");
    XLSX.writeFile(workbook, "approved_rcsa.xlsx");
  };

  const filteredSubmissions = useMemo(() => {
    if (selectedDivision === "all") return submissions;
    return submissions.filter((s) => s.unit_name === selectedDivision);
  }, [selectedDivision, submissions]);

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return <div className="p-8">Memuat data...</div>;
  }

  const uniqueDivisions = Array.from(
    new Set(submissions.map((s) => s.unit_name).filter(Boolean))
  );

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan RCSA</h1>
          <p className="text-muted-foreground">
            Tinjau semua data RCSA yang telah dikirim oleh unit operasional.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadExcel} variant="default">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Download Excel
          </Button>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Muat Ulang Data
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter Divisi:</span>
        <Select
          value={selectedDivision}
          onValueChange={(val) => setSelectedDivision(val)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Pilih Divisi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            {uniqueDivisions.map((div, idx) => (
              <SelectItem key={idx} value={div!}>
                {div}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          Tidak ada laporan RCSA untuk filter ini.
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {filteredSubmissions.map((submission, index) => (
            <AccordionItem
              value={`item-${index}`}
              key={submission.id}
              className="border rounded-lg bg-card shadow-sm"
            >
              <AccordionTrigger className="px-6 py-3 hover:no-underline">
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-col text-left">
                    <span className="font-semibold">
                      Laporan #{submission.id}
                    </span>
                    {submission.unit_name && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {submission.unit_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={submission.approved ? "outline" : "secondary"}>
                      {submission.approved ? "Approved" : "Pending"}
                    </Badge>
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-0">
                <RiskReportDetail
                  data={submission}
                  onApprove={handleApprove}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
