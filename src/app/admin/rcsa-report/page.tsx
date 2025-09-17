'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getRcsaSubmitted, type RCSAData } from '@/lib/rcsa-data';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
// import * as XLSX from 'xlsx';

const getLevelFromBesaran = (besaran: number | null | undefined) => {
  if (besaran === null || besaran === undefined) return { label: '-', variant: 'secondary' as const };
  if (besaran >= 20) return { label: 'Sangat Tinggi', variant: 'destructive' as const };
  if (besaran >= 12) return { label: 'Tinggi', variant: 'destructive' as const };
  if (besaran >= 5) return { label: 'Menengah', variant: 'secondary' as const };
  return { label: 'Rendah', variant: 'outline' as const };
};

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-2 justify-between py-2">
    <div className="text-sm text-muted-foreground">{label}</div>
    <div className="text-sm font-medium text-right">{value || '-'}</div>
  </div>
);

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
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Potensi Risiko {data.no} : {data.potensiRisiko}
          </CardTitle>
          {data.approved ? (
            <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-600">
              <CheckCircle2 className="h-4 w-4" /> Approved
            </Badge>
          ) : (
            <Button size="sm" onClick={() => onApprove(data.id)}>
              Approve
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <DetailRow label="Jenis Risiko" value={data.jenisRisiko} />
        <DetailRow label="Penyebab Risiko" value={<span className="whitespace-normal">{data.penyebabRisiko}</span>} />
        <Separator />
        <h4 className="font-semibold pt-2">Risiko Inheren</h4>
        <DetailRow label="Dampak" value={data.dampakInheren} />
        <DetailRow label="Frekuensi" value={data.frekuensiInheren} />
        <DetailRow label="Besaran" value={besaranInheren} />
        <DetailRow label="Level" value={<Badge variant={levelInheren.variant}>{levelInheren.label}</Badge>} />
        <Separator />
        <h4 className="font-semibold pt-2">Pengendalian & Risiko Residual</h4>
        <div className="text-sm text-right font-medium">Pengendalian</div>
        <div className="text-sm text-right">{data.pengendalian || '-'}</div>
        <Separator />
        <DetailRow label="Dampak Residual" value={data.dampakResidual} />
        <DetailRow label="Kemungkinan Residual" value={data.kemungkinanResidual} />
        <DetailRow label="Besaran Residual" value={besaranResidual} />
        <DetailRow label="Level Residual" value={<Badge variant={levelResidual.variant}>{levelResidual.label}</Badge>} />
        <Separator />
        <DetailRow label="Penilaian Efektivitas Kontrol" value={data.penilaianKontrol} />
        <DetailRow label="Action Plan / Mitigasi" value={<span className="whitespace-normal">{data.actionPlan}</span>} />
        <DetailRow label="PIC" value={data.pic} />
        {data.keteranganUser && (
          <>
            <Separator />
            <h4 className="font-semibold pt-2">Keterangan dari User</h4>
            <div className="text-sm text-muted-foreground pt-1 whitespace-pre-wrap">{data.keteranganUser}</div>
          </>
        )}
      </CardContent>
      {data.keteranganAdmin && (
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            <strong>Keterangan dari Admin:</strong>{" "}
            {data.keteranganAdmin.split('\n').filter(line => !line.startsWith('Target:')).join('\n')}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default function RcsaReportPage() {
  const [submissions, setSubmissions] = useState<(RCSAData & { approved?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

    const worksheet = XLSX.utils.json_to_sheet(approvedReports.map((r) => ({
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
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Approved RCSA");
    XLSX.writeFile(workbook, "approved_rcsa.xlsx");
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return <div className="p-8">Memuat data...</div>;
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
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

      <div>
        {submissions.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            Belum ada laporan RCSA yang dikirim.
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {submissions.map((submission, index) => (
              <AccordionItem
                value={`item-${index}`} key={submission.id}
                className="border rounded-lg bg-card">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col text-left">
                      <span className="font-semibold">Laporan #{submission.id}</span>
                      {submission.unit_name && (
                        <span className="text-sm font-normal">{submission.unit_name}</span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Status: {submission.status}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pt-0">
                  <Separator className="mb-4" />
                  <RiskReportDetail data={submission} onApprove={handleApprove} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
