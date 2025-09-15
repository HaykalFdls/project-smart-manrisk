'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllRcsaSubmissions, type RCSASubmission, type RCSAData } from '@/lib/rcsa-data';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const getLevelFromBesaran = (besaran: number | null | undefined) => {
  if (besaran === null || besaran === undefined) return { label: '-', variant: 'secondary' as const };
  if (besaran >= 20) return { label: 'Sangat Tinggi', variant: 'destructive' as const };
  if (besaran >= 12) return { label: 'Tinggi', variant: 'destructive' as const };
  if (besaran >= 5) return { label: 'Menengah', variant: 'secondary' as const };
  return { label: 'Rendah', variant: 'outline' as const };
};

const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div className="grid grid-cols-2 justify-between py-2">
    <div className="text-sm text-muted-foreground">{label}</div>
    <div className="text-sm font-medium text-right">{value || '-'}</div>
  </div>
);

const RiskReportDetail = ({ data }: { data: RCSAData }) => {
  const besaranInheren = (data.dampakInheren && data.frekuensiInheren)
    ? data.dampakInheren * data.frekuensiInheren
    : null;
  const levelInheren = getLevelFromBesaran(besaranInheren);

  const besaranResidual = (data.dampakResidual && data.kemungkinanResidual)
    ? data.dampakResidual * data.kemungkinanResidual
    : null;
  const levelResidual = getLevelFromBesaran(besaranResidual);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Risiko #{data.no}: {data.potensiRisiko}</CardTitle>
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
            <div className="text-sm text-muted-foreground pt-1 whitespace-pre-wrap">
              {data.keteranganUser}
            </div>
          </>
        )}
      </CardContent>
      {data.keteranganAdmin && (
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            <strong>Keterangan dari Admin:</strong>{' '}
            {data.keteranganAdmin.split('\n').filter(line => !line.startsWith('Target:')).join('\n')}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default function RcsaReportPage() {
  const [submissions, setSubmissions] = useState<RCSASubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getAllRcsaSubmissions(); // tunggu hasil async
      const sorted = (data ?? []).sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() -
          new Date(a.submittedAt).getTime()
      );
      setSubmissions(sorted);
    } catch (err) {
      console.error("Gagal memuat submissions:", err);
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Laporan RCSA Terkirim</h1>
          <p className="text-muted-foreground">
            Tinjau semua data RCSA yang telah dikirim oleh unit operasional.
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Muat Ulang Data
        </Button>
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
                value={`item-${index}`}
                key={submission.id}
                className="border rounded-lg bg-card"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col text-left">
                      <span className="font-semibold">Laporan #{submission.id}</span>
                      {submission.division && (
                        <span className="text-sm font-normal">{submission.division}</span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Dikirim pada: {new Date(submission.submittedAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pt-0">
                  <Separator className="mb-4" />
                  {submission.data.map(item => (
                    <RiskReportDetail key={item.no} data={item} />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
