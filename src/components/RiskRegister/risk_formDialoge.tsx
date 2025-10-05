"use client";

import {
  Card, CardHeader, CardTitle, CardContent, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { RiskFormValues } from "@/types/risk";
import { User } from "@/types/user";

interface RiskFormProps {
  onSubmit: (values: RiskFormValues) => void;
  form: any; 
  editingRisk: RiskFormValues | null;
  selectedDivision: string;
  users: User[];
  onCancel?: () => void;
}

export function RiskForm({
  onSubmit,
  form,
  editingRisk,
  selectedDivision,
  users,
  onCancel,
}: RiskFormProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{editingRisk ? "Edit Risk" : "Add New Risk"}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {editingRisk
            ? "Update the details for the existing risk."
            : `Fill in the details for the new risk in the ${selectedDivision} division.`}
        </p>
      </CardHeader>

      <CardContent className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6">
            {/* Kategori Risiko */}
            <FormField control={form.control} name="kategori_risiko" render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori Risiko</FormLabel>
                <FormControl><Input placeholder="e.g., Sistem Bank" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Jenis Risiko */}
            <FormField control={form.control} name="jenis_risiko" render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Risiko</FormLabel>
                <FormControl><Input placeholder="e.g., Risiko Teknologi Informasi" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Skenario Risiko */}
            <FormField control={form.control} name="skenario_risiko" render={({ field }) => (
              <FormItem>
                <FormLabel>Skenario Risiko</FormLabel>
                <FormControl><Textarea placeholder="e.g., Penyalahgunaan akses" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Root Cause */}
            <FormField control={form.control} name="root_cause" render={({ field }) => (
              <FormItem>
                <FormLabel>Root Cause</FormLabel>
                <FormControl><Textarea placeholder="e.g., Kontrol lemah" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Dampak */}
            <FormField control={form.control} name="dampak" render={({ field }) => (
              <FormItem>
                <FormLabel>Dampak</FormLabel>
                <FormControl><Textarea placeholder="e.g., Kerugian finansial" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Skala Dampak */}
            {([
              { key: "dampak_keuangan", label: "Dampak Keuangan" },
              { key: "dampak_operasional", label: "Dampak Operasional" },
              { key: "dampak_reputasi", label: "Dampak Reputasi" },
              { key: "dampak_regulasi", label: "Dampak Regulasi" },
              { key: "skor_kemungkinan", label: "Skor Kemungkinan" },
            ] as { key: keyof RiskFormValues; label: string }[]).map(({ key, label }) => (
              <FormField key={key} control={form.control} name={key} render={({ field }) => (
                <FormItem>
                  <FormLabel>{label} (Skala 1–5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      placeholder="1-5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            ))}

            {/* Tingkat Risiko per Dampak */}
            {([
              { key: "tingkat_dampak_keuangan", label: "Tingkat Dampak Keuangan" },
              { key: "tingkat_dampak_operasional", label: "Tingkat Dampak Operasional" },
              { key: "tingkat_dampak_reputasi", label: "Tingkat Dampak Reputasi" },
              { key: "tingkat_dampak_regulasi", label: "Tingkat Dampak Regulasi" },
              { key: "tingkat_kemungkinan", label: "Tingkat Kemungkinan" },
            ] as { key: keyof RiskFormValues; label: string }[]).map(({ key, label }) => (
              <FormField key={key} control={form.control} name={key} render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val)} defaultValue={field.value ? String(field.value) : undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select one" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Rendah">Rendah</SelectItem>
                      <SelectItem value="Sedang">Sedang</SelectItem>
                      <SelectItem value="Tinggi">Tinggi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            ))}

            {/* Nilai Risiko */}
            <FormField control={form.control} name="nilai_risiko" render={({ field }) => (
              <FormItem>
                <FormLabel>Nilai Risiko</FormLabel>
                <FormControl><Input type="number" placeholder="e.g., 320" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Tingkat Risiko */}
            <FormField control={form.control} name="tingkat_risiko" render={({ field }) => (
              <FormItem>
                <FormLabel>Tingkat Risiko</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select one" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Rencana Penanganan */}
            <FormField control={form.control} name="rencana_penanganan" render={({ field }) => (
              <FormItem>
                <FormLabel>Rencana Penanganan</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select one" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Mitigasi">Mitigasi</SelectItem>
                    <SelectItem value="Terima">Terima</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                    <SelectItem value="Hindari">Hindari</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Deskripsi Rencana Penanganan */}
            <FormField control={form.control} name="deskripsi_rencana_penanganan" render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi Rencana Penanganan</FormLabel>
                <FormControl><Textarea placeholder="e.g., Audit internal tambahan" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Risiko Residual */}
            <FormField control={form.control} name="risiko_residual" render={({ field }) => (
              <FormItem>
                <FormLabel>Risiko Residual</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select one" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Rendah">Rendah</SelectItem>
                    <SelectItem value="Menengah">Menengah</SelectItem>
                    <SelectItem value="Tinggi">Tinggi</SelectItem>
                    <SelectItem value="Sangat Tinggi">Sangat Tinggi</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Kriteria Penerimaan Risiko */}
            <FormField control={form.control} name="kriteria_penerimaan_risiko" render={({ field }) => (
              <FormItem>
                <FormLabel>Kriteria Penerimaan Risiko</FormLabel>
                <FormControl><Textarea placeholder="e.g., Diterima oleh manajemen" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Pemilik Risiko */}
            <FormField control={form.control} name="pemilik_risiko" render={({ field }) => (
              <FormItem>
                <FormLabel>Pemilik Risiko</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Pilih Pemilik Risiko" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name} - {user.unit_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
          {editingRisk ? "Save Changes" : "Add Risk"}
        </Button>
      </CardFooter>
    </Card>
  );
}
