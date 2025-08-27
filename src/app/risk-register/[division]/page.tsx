
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, FilePlus } from 'lucide-react';
import { useParams } from 'next/navigation';

type RiskData = {
  id: string;
  riskEvent: string;
  category: string;
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Closed' | 'In Progress';
};

const mockRiskData: { [key: string]: RiskData[] } = {
  'Teknologi Informasi': [
    { id: 'IT-001', riskEvent: 'Kegagalan server database utama', category: 'Infrastruktur', level: 'High', status: 'Open' },
    { id: 'IT-002', riskEvent: 'Serangan DDoS pada aplikasi web', category: 'Keamanan Siber', level: 'Critical', status: 'In Progress' },
    { id: 'IT-003', riskEvent: 'Data backup tidak lengkap', category: 'Operasional TI', level: 'Medium', status: 'Closed' },
  ],
  'Pengendalian Keuangan': [
     { id: 'FIN-001', riskEvent: 'Kesalahan perhitungan laporan kuartalan', category: 'Pelaporan', level: 'Medium', status: 'Open' },
     { id: 'FIN-002', riskEvent: 'Peningkatan kredit macet di sektor retail', category: 'Kredit', level: 'High', status: 'In Progress' },
  ],
  'Kepatuhan': [
      { id: 'COM-001', riskEvent: 'Keterlambatan pelaporan ke regulator', category: 'Regulasi', level: 'Low', status: 'Closed' },
  ],
  'Sumber Daya Insani': [
      { id: 'HR-001', riskEvent: 'Tingkat turnover karyawan tinggi', category: 'Talenta', level: 'Medium', status: 'Open' },
  ],
  'Operasional': [
      { id: 'OPS-001', riskEvent: 'Gangguan pada sistem antrian teller', category: 'Proses Internal', level: 'Medium', status: 'In Progress' },
      { id: 'OPS-002', riskEvent: 'Pemadaman listrik di kantor cabang utama', category: 'Eksternal', level: 'High', status: 'Open' },
  ],
};

const getLevelBadgeVariant = (level: RiskData['level']) => {
  switch (level) {
    case 'Critical':
      return 'destructive';
    case 'High':
      return 'destructive';
    case 'Medium':
      return 'secondary';
    case 'Low':
    default:
      return 'outline';
  }
};


export default function RiskDetailPage() {
  const params = useParams();
  const division = decodeURIComponent(params.division as string);
  const risks = mockRiskData[division] || [];

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
            <Button variant="ghost" asChild className="mb-2">
                <Link href="/risk-register">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Risk Register
                </Link>
            </Button>
          <h1 className="text-3xl font-bold tracking-tight">Detail Risiko: {division}</h1>
          <p className="text-muted-foreground">Daftar kejadian risiko yang teridentifikasi untuk divisi ini.</p>
        </div>
        <Button>
          <FilePlus className="mr-2 h-4 w-4" />
          Tambah Risiko Baru
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Risiko</TableHead>
                <TableHead>Risk Event</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Level Risiko</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.length > 0 ? (
                risks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell className="font-medium">{risk.id}</TableCell>
                    <TableCell>{risk.riskEvent}</TableCell>
                    <TableCell>{risk.category}</TableCell>
                    <TableCell>
                      <Badge variant={getLevelBadgeVariant(risk.level)}>{risk.level}</Badge>
                    </TableCell>
                    <TableCell>{risk.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Tidak ada data risiko untuk divisi ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
