
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import type { RiskData } from '@/app/risk-register/page';

const formSchema = z.object({
  kategori: z.string().min(1, 'Kategori risiko harus diisi.'),
  riskEvent: z.string().min(1, 'Risk event/temuan harus diisi.'),
  rootCause: z.string().min(1, 'Root cause harus diisi.'),
  dampak: z.string().min(1, 'Dampak harus diisi.'),
  
  dampakKeuangan: z.coerce.number().min(1, 'Skor harus antara 1-5').max(5, 'Skor harus antara 1-5'),
  tingkatDampakKeuangan: z.enum(['Rendah', 'Menengah', 'Tinggi', 'Kritis']),
  dampakOperasional: z.coerce.number().min(1, 'Skor harus antara 1-5').max(5, 'Skor harus antara 1-5'),
  tingkatDampakOperasional: z.enum(['Rendah', 'Menengah', 'Tinggi', 'Kritis']),
  dampakReputasi: z.coerce.number().min(1, 'Skor harus antara 1-5').max(5, 'Skor harus antara 1-5'),
  tingkatDampakReputasi: z.enum(['Rendah', 'Menengah', 'Tinggi', 'Kritis']),
  dampakRegulasi: z.coerce.number().min(1, 'Skor harus antara 1-5').max(5, 'Skor harus antara 1-5'),
  tingkatDampakRegulasi: z.enum(['Rendah', 'Menengah', 'Tinggi', 'Kritis']),

  skorKemungkinan: z.coerce.number().min(1, 'Skor harus antara 1-5').max(5, 'Skor harus antara 1-5'),
  tingkatKemungkinan: z.enum(['Jarang', 'Mungkin', 'Sering']),
  
  risikoResidual: z.enum(['Rendah', 'Menengah', 'Tinggi', 'Kritis']),
  batasKriteria: z.enum(['Rendah', 'Menengah', 'Tinggi', 'Kritis']),
  
  riskOwner: z.string().min(1, 'Risk owner harus diisi.'),
  processOwner: z.string().optional(),
  productOwner: z.string().optional(),
  
  treatmentPlan: z.string().min(1, 'Risk treatment plan harus diisi.'),
  deskripsiTreatmentPlan: z.string().min(1, 'Deskripsi treatment plan harus diisi.'),
  isFraud: z.enum(['Ya', 'Tidak']),
  
  keterangan: z.string().optional(),
});

type AddRiskFormValues = z.infer<typeof formSchema>;

export function AddRiskForm({
  onSuccess,
  division,
  existingData,
}: {
  onSuccess: (data: RiskData) => void;
  division: string;
  existingData?: RiskData | null;
}) {
  const { toast } = useToast();
  const form = useForm<AddRiskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kategori: '',
      riskEvent: '',
      rootCause: '',
      dampak: '',
      dampakKeuangan: 1,
      tingkatDampakKeuangan: 'Rendah',
      dampakOperasional: 1,
      tingkatDampakOperasional: 'Rendah',
      dampakReputasi: 1,
      tingkatDampakReputasi: 'Rendah',
      dampakRegulasi: 1,
      tingkatDampakRegulasi: 'Rendah',
      skorKemungkinan: 1,
      tingkatKemungkinan: 'Jarang',
      risikoResidual: 'Rendah',
      batasKriteria: 'Rendah',
      riskOwner: `Kantor Pusat - Divisi ${division}`,
      processOwner: '',
      productOwner: '',
      treatmentPlan: '',
      deskripsiTreatmentPlan: '',
      isFraud: 'Tidak',
      keterangan: '',
    },
  });

  useEffect(() => {
    if (existingData) {
      form.reset({
        ...form.getValues(), // keep defaults for fields not in existingData
        kategori: existingData.kategori,
        riskEvent: existingData.riskEvent,
        risikoResidual: existingData.risikoResidual,
        riskOwner: existingData.riskOwner,
        treatmentPlan: existingData.treatmentPlan,
        isFraud: existingData.isFraud ? 'Ya' : 'Tidak',
      });
    }
  }, [existingData, form, division]);

  function onSubmit(values: AddRiskFormValues) {
    const riskData: RiskData = {
      id: existingData ? existingData.id : `TEMP-${Date.now()}`,
      kategori: values.kategori,
      riskEvent: values.riskEvent,
      risikoResidual: values.risikoResidual,
      riskOwner: values.riskOwner,
      treatmentPlan: values.treatmentPlan,
      isFraud: values.isFraud === 'Ya',
    };

    toast({
      title: 'Sukses!',
      description: `Data risiko berhasil ${existingData ? 'diperbarui' : 'ditambahkan'}.`,
    });
    onSuccess(riskData);
  }
  
  const renderInput = (name: keyof AddRiskFormValues, label: string, placeholder: string, type: string = "text", disabled: boolean = false) => (
      <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
              <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                      <Input placeholder={placeholder} type={type} {...field} disabled={disabled} />
                  </FormControl>
                  <FormMessage />
              </FormItem>
          )}
      />
  );
  
  const renderTextarea = (name: keyof AddRiskFormValues, label: string, placeholder: string) => (
    <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
            <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                    <Textarea placeholder={placeholder} {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
        )}
    />
  );
  
  const renderSelect = (name: keyof AddRiskFormValues, label: string, placeholder: string, items: string[]) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value as string}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {items.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ScrollArea className="h-[60vh] pr-6">
            <div className="space-y-6">
                <h3 className="text-lg font-medium border-b pb-2">Informasi Dasar Risiko</h3>
                {renderInput('kategori', 'Kategori Risiko/Proses', 'Contoh: Tata Kelola TI')}
                {renderInput('riskEvent', 'Risk Event/Potensi Risiko', 'Contoh: Kegagalan implementasi platform baru')}
                {renderTextarea('rootCause', 'Root Cause', 'Deskripsi penyebab utama risiko...')}
                {renderTextarea('dampak', 'Dampak', 'Deskripsi dampak yang mungkin terjadi...')}
                
                <h3 className="text-lg font-medium border-b pb-2">Penilaian Dampak</h3>
                <div className="grid grid-cols-2 gap-4">
                  {renderInput('dampakKeuangan', 'Skor Dampak Keuangan', '1-5', 'number')}
                  {renderSelect('tingkatDampakKeuangan', 'Tingkat Dampak Keuangan', 'Pilih tingkat', ['Rendah', 'Menengah', 'Tinggi', 'Kritis'])}
                  {renderInput('dampakOperasional', 'Skor Dampak Operasional', '1-5', 'number')}
                  {renderSelect('tingkatDampakOperasional', 'Tingkat Dampak Operasional', 'Pilih tingkat', ['Rendah', 'Menengah', 'Tinggi', 'Kritis'])}
                  {renderInput('dampakReputasi', 'Skor Dampak Reputasi', '1-5', 'number')}
                  {renderSelect('tingkatDampakReputasi', 'Tingkat Dampak Reputasi', 'Pilih tingkat', ['Rendah', 'Menengah', 'Tinggi', 'Kritis'])}
                  {renderInput('dampakRegulasi', 'Skor Dampak Regulasi', '1-5', 'number')}
                  {renderSelect('tingkatDampakRegulasi', 'Tingkat Dampak Regulasi', 'Pilih tingkat', ['Rendah', 'Menengah', 'Tinggi', 'Kritis'])}
                </div>

                <h3 className="text-lg font-medium border-b pb-2">Penilaian Kemungkinan</h3>
                 <div className="grid grid-cols-2 gap-4">
                    {renderInput('skorKemungkinan', 'Skor Kemungkinan', '1-5', 'number')}
                    {renderSelect('tingkatKemungkinan', 'Tingkat Kemungkinan', 'Pilih tingkat', ['Jarang', 'Mungkin', 'Sering'])}
                </div>

                <h3 className="text-lg font-medium border-b pb-2">Tingkat Risiko</h3>
                 <div className="grid grid-cols-2 gap-4">
                    {renderSelect('risikoResidual', 'Risiko Residual', 'Pilih tingkat', ['Rendah', 'Menengah', 'Tinggi', 'Kritis'])}
                    {renderSelect('batasKriteria', 'Batas Kriteria', 'Pilih tingkat', ['Rendah', 'Menengah', 'Tinggi', 'Kritis'])}
                </div>

                <h3 className="text-lg font-medium border-b pb-2">Kepemilikan Risiko</h3>
                {renderInput('riskOwner', 'Risk Owner', '', 'text', true)}
                {renderInput('processOwner', 'Process Owner', 'Contoh: Kepala Divisi Operasional')}
                {renderInput('productOwner', 'Product Owner', 'Contoh: Manajer Produk Digital')}
                
                <h3 className="text-lg font-medium border-b pb-2">Rencana Penanganan</h3>
                {renderInput('treatmentPlan', 'Risk Treatment Plan', 'Contoh: Mitigate')}
                {renderTextarea('deskripsiTreatmentPlan', 'Deskripsi Rencana Penanganan', 'Jelaskan secara detail rencana penanganan...')}
                {renderSelect('isFraud', 'Indikasi Fraud', 'Pilih indikasi', ['Ya', 'Tidak'])}
                
                <h3 className="text-lg font-medium border-b pb-2">Lainnya</h3>
                 {renderTextarea('keterangan', 'Keterangan Tambahan', 'Informasi tambahan jika ada...')}
            </div>
        </ScrollArea>
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit">Simpan Risiko</Button>
        </div>
      </form>
    </Form>
  );
}

    