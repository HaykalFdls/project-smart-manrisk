
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// This matches the structure of the data in the page, with more details
type RiskData = {
  id: string;
  kategori: string;
  riskEvent: string;
  risikoResidual: 'Rendah' | 'Menengah' | 'Tinggi' | 'Kritis';
  riskOwner: string;
  treatmentPlan: string;
  isFraud: boolean;
};

// Add more detailed fields based on the image
const detailedRiskData: { [key: string]: any } = {
  'IT-001': {
    jenisRisiko: 'Risiko teknologi informasi',
    rootCause: 'Kurangnya proteksi dan pembaruan sistem keamanan',
    lokasi: 'Kantor Pusat',
    dampak: 'Gangguan operasional, potensi kerugian finansial, dan penurunan kepercayaan nasabah',
    dampakKeuangan: 4,
    dampakOperasional: 5,
    dampakReputasi: 5,
    dampakRegulasi: 4,
    skorKemungkinan: 3,
    deskripsiTreatmentPlan: 'Meningkatkan firewall dan mengimplementasikan sistem deteksi intrusi',
    batasKriteria: 'Menengah',
    processOwner: 'Kantor Pusat - Divisi Teknologi Informasi',
    productOwner: 'Tidak ada',
    keterangan: 'Risiko ini membutuhkan perhatian khusus',
    divisi: 'Teknologi Informasi',
  },
  // Add other detailed data here if needed
};

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-3 gap-4 py-2 border-b">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="col-span-2 text-sm">{value}</dd>
  </div>
);

export function RiskDetailsModal({
  risk,
  isOpen,
  onClose,
}: {
  risk: RiskData | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!risk) return null;

  const details = { ...risk, ...detailedRiskData[risk.id] };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Risk Details</DialogTitle>
          <DialogDescription>
            Viewing details for risk no. {details.id}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-4">
          <dl>
            <DetailRow label="No" value={details.id.split('-')[1]} />
            <DetailRow label="Kategori Risiko/Proses" value={details.kategori} />
            <DetailRow label="Jenis Risiko" value={details.jenisRisiko || 'N/A'} />
            <DetailRow label="Risk Event/Potensi Risiko" value={details.riskEvent} />
            <DetailRow label="Root Cause" value={details.rootCause || 'N/A'} />
            <DetailRow label="Lokasi" value={details.lokasi || 'N/A'} />
            <DetailRow label="Dampak" value={details.dampak || 'N/A'} />
            <DetailRow label="Dampak Keuangan" value={details.dampakKeuangan || 'N/A'} />
            <DetailRow label="Dampak Operasional" value={details.dampakOperasional || 'N/A'} />
            <DetailRow label="Dampak Reputasi" value={details.dampakReputasi || 'N/A'} />
            <DetailRow label="Dampak Regulasi" value={details.dampakRegulasi || 'N/A'} />
            <DetailRow label="Skor Kemungkinan" value={details.skorKemungkinan || 'N/A'} />
            <DetailRow label="Risk Treatment Plan" value={details.treatmentPlan} />
            <DetailRow label="Deskripsi Risk Treatment Plan" value={details.deskripsiTreatmentPlan || 'N/A'} />
            <DetailRow label="Risiko Residual" value={details.risikoResidual} />
            <DetailRow label="Batas Kriteria Penerimaan Risiko" value={details.batasKriteria || 'N/A'} />
            <DetailRow label="Risk Owner" value={details.riskOwner} />
            <DetailRow label="Process Owner" value={details.processOwner || 'N/A'} />
            <DetailRow label="Product Owner" value={details.productOwner || 'N/A'} />
            <DetailRow label="Fraud Indicator" value={details.isFraud ? 'Yes' : 'No'} />
            <DetailRow label="Keterangan" value={details.keterangan || 'N/A'} />
            <DetailRow label="Divisi" value={details.divisi || 'N/A'} />
          </dl>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
