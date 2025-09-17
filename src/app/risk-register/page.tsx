"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { fetchUsers, fetchRisks, createRisk, updateRisk, deleteRisk } from "@/lib/risk-register";
import { Risk } from "@/types/risk";
import { User } from "@/types/user";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, ArrowLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const riskSchema = z.object({
  kategori_risiko: z.string().min(1, "Kategori risiko wajib diisi."),
  jenis_risiko: z.string().min(1, "Jenis risiko wajib diisi."),
  skenario_risiko: z.string().min(1, "Skenario risiko wajib diisi."),
  root_cause: z.string().min(1, "Root cause wajib diisi."),
  dampak: z.string().min(1, "Dampak wajib diisi."),
  dampak_keuangan: z.number().min(0),
  tingkat_dampak_keuangan: z.string().min(1),
  dampak_operasional: z.number().min(0),
  tingkat_dampak_operasional: z.string().min(1),
  dampak_reputasi: z.number().min(0),
  tingkat_dampak_reputasi: z.string().min(1),
  dampak_regulasi: z.number().min(0),
  tingkat_dampak_regulasi: z.string().min(1),
  skor_kemungkinan: z.number().min(1),
  tingkat_kemungkinan: z.string().min(1),
  nilai_risiko: z.coerce.number().min(0),
  tingkat_risiko: z.string().min(1),
  rencana_penanganan: z.string().min(1),
  deskripsi_rencana_penanganan: z.string().min(1),
  risiko_residual: z.string().min(1),
  kriteria_penerimaan_risiko: z.string().min(1),
  pemilik_risiko: z.string().min(1),
  keterangan: z.string().optional(),
});

export default function RiskRegisterPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [viewingRisk, setViewingRisk] = useState<Risk | null>(null);
  const [deletingRisk, setDeletingRisk] = useState<Risk | null>(null);

  const userNameMap = Object.fromEntries(users.map(u => [u.id, u.name]));
  const userDivisionMap = Object.fromEntries(users.map(u => [u.id, u.division]));

  useEffect(() => {
    const loadData = async () => {
      try {
        const [risksData, usersData] = await Promise.all([
          fetchRisks(),
          fetchUsers(),
        ]);
        setRisks(risksData);
        setUsers(usersData);
      } catch (err) {
        toast({ title: "Error", description: "Gagal memuat data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  type RiskFormValues = z.infer<typeof riskSchema>;
  const form = useForm<RiskFormValues>({
    resolver: zodResolver(riskSchema),
    defaultValues: {
      kategori_risiko: "",
      jenis_risiko: "",
      skenario_risiko: "",
      root_cause: "",
      dampak: "",
      dampak_keuangan: 0,
      tingkat_dampak_keuangan: "",
      dampak_operasional: 0,
      tingkat_dampak_operasional: "",
      dampak_reputasi: 0,
      tingkat_dampak_reputasi: "",
      dampak_regulasi: 0,
      tingkat_dampak_regulasi: "",
      skor_kemungkinan: 0,
      tingkat_kemungkinan: "",
      nilai_risiko: 0,
      tingkat_risiko: "",
      rencana_penanganan: "",
      deskripsi_rencana_penanganan: "",
      risiko_residual: "",
      kriteria_penerimaan_risiko: "",
      pemilik_risiko: "",
      keterangan: "",
    },
  });

  const handleBackClick = () => setSelectedDivision(null);

  const handleAddNewRisk = () => {
    setEditingRisk(null);
    form.reset();
    setIsFormOpen(true);
  };

  const handleEditRisk = (risk: Risk) => {
    setEditingRisk(risk);
    form.reset({
      ...risk,
      pemilik_risiko: String(risk.pemilik_risiko),
    });
    setIsFormOpen(true);
  };

  const handleDeleteRisk = (risk: Risk) => setDeletingRisk(risk);

  const confirmDelete = async () => {
    if (deletingRisk) {
      try {
        await deleteRisk(deletingRisk.id);
        setRisks(risks.filter(r => r.id !== deletingRisk.id));
        toast({ title: "Risk Deleted", description: "Berhasil dihapus.", variant: "destructive" });
      } catch (err) {
        toast({ title: "Error", description: String(err), variant: "destructive" });
      } finally {
        setDeletingRisk(null);
      }
    }
  };

  const handleViewDetails = (risk: Risk) => setViewingRisk(risk);

  async function onSubmit(values: RiskFormValues) {
    try {
      const payload = {
        ...values,
        pemilik_risiko: parseInt(values.pemilik_risiko),
        divisi: selectedDivision,
      };

      if (editingRisk) {
        const updated = await updateRisk(editingRisk.id, payload);
        setRisks(risks.map(r => r.id === editingRisk.id ? updated : r));
        toast({ title: "Risk Updated", description: "Data berhasil diperbarui." });
      } else {
        const newRisk = await createRisk(payload);
        setRisks([...risks, newRisk]);
        toast({ title: "Risk Added", description: "Risiko baru berhasil ditambahkan." });
      }

      setIsFormOpen(false);
      setEditingRisk(null);
      form.reset();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  }

  const filteredRisks = selectedDivision
    ? risks.filter(risk => userDivisionMap[risk.pemilik_risiko]?.toString() === selectedDivision)
    : [];

  return (
    <>
      <div className="container mx-auto py-2 px-1">
        <PageHeader title={selectedDivision} description={`Risiko di divisi ${selectedDivision}`}>
          <Button variant="outline" onClick={handleBackClick}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleAddNewRisk}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Risk
          </Button>
        </PageHeader>
      </div>
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Kategori Risiko</TableHead>
                <TableHead>Jenis Risiko</TableHead>
                <TableHead>Risiko Residual</TableHead>
                <TableHead>Pemilik Risiko</TableHead>
                <TableHead>Divisi</TableHead>
                <TableHead>Rencana Penanganan</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRisks.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell>{risk.id}</TableCell>
                  <TableCell>{risk.kategori_risiko}</TableCell>
                  <TableCell>{risk.jenis_risiko}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        risk.risiko_residual === "Tinggi" || risk.risiko_residual === "Sangat Tinggi"
                          ? "destructive"
                          : risk.risiko_residual === "Menengah"
                          ? "warning"
                          : "success"
                      }
                    >
                      {risk.risiko_residual}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{userNameMap[risk.pemilik_risiko]}</span>
                      <Badge variant="outline" className="w-fit mt-1">
                        {userDivisionMap[risk.pemilik_risiko]}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{risk.divisi}</TableCell>
                  <TableCell>{risk.rencana_penanganan}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(risk)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditRisk(risk)}>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteRisk(risk)} className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Risk Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingRisk ? "Edit Risk" : "Add New Risk"}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6">
            <Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="kategori_risiko"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Kategori Risiko</FormLabel>
          <FormControl>
            <Input placeholder="Kategori Risiko" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="jenis_risiko"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Jenis Risiko</FormLabel>
          <FormControl>
            <Input placeholder="Jenis Risiko" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="skenario_risiko"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Skenario Risiko</FormLabel>
          <FormControl>
            <Textarea placeholder="Deskripsikan skenario risiko" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="root_cause"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Root Cause</FormLabel>
          <FormControl>
            <Textarea placeholder="Penyebab utama risiko" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="dampak"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dampak</FormLabel>
          <FormControl>
            <Textarea placeholder="Deskripsikan dampak risiko" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Dampak Keuangan */}
    <FormField
      control={form.control}
      name="dampak_keuangan"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dampak Keuangan</FormLabel>
          <FormControl>
            <Input type="number" placeholder="Nilai dampak keuangan" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="tingkat_dampak_keuangan"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tingkat Dampak Keuangan</FormLabel>
          <FormControl>
            <Input placeholder="Rendah / Sedang / Tinggi" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Dampak Operasional */}
    <FormField
      control={form.control}
      name="dampak_operasional"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dampak Operasional</FormLabel>
          <FormControl>
            <Input type="number" placeholder="Nilai dampak operasional" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="tingkat_dampak_operasional"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tingkat Dampak Operasional</FormLabel>
          <FormControl>
            <Input placeholder="Rendah / Sedang / Tinggi" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Dampak Reputasi */}
    <FormField
      control={form.control}
      name="dampak_reputasi"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dampak Reputasi</FormLabel>
          <FormControl>
            <Input type="number" placeholder="Nilai dampak reputasi" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="tingkat_dampak_reputasi"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tingkat Dampak Reputasi</FormLabel>
          <FormControl>
            <Input placeholder="Rendah / Sedang / Tinggi" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Dampak Regulasi */}
    <FormField
      control={form.control}
      name="dampak_regulasi"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dampak Regulasi</FormLabel>
          <FormControl>
            <Input type="number" placeholder="Nilai dampak regulasi" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="tingkat_dampak_regulasi"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tingkat Dampak Regulasi</FormLabel>
          <FormControl>
            <Input placeholder="Rendah / Sedang / Tinggi" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Skor Kemungkinan */}
    <FormField
      control={form.control}
      name="skor_kemungkinan"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Skor Kemungkinan</FormLabel>
          <FormControl>
            <Input type="number" placeholder="1 - 5" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="tingkat_kemungkinan"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tingkat Kemungkinan</FormLabel>
          <FormControl>
            <Input placeholder="Sangat Rendah / Rendah / Sedang / Tinggi" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Nilai & Tingkat Risiko */}
    <FormField
      control={form.control}
      name="nilai_risiko"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nilai Risiko</FormLabel>
          <FormControl>
            <Input type="number" placeholder="0" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="tingkat_risiko"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tingkat Risiko</FormLabel>
          <FormControl>
            <Input placeholder="Rendah / Sedang / Tinggi" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Rencana Penanganan */}
    <FormField
      control={form.control}
      name="rencana_penanganan"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Rencana Penanganan</FormLabel>
          <FormControl>
            <Textarea placeholder="Rencana penanganan risiko" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="deskripsi_rencana_penanganan"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Deskripsi Rencana Penanganan</FormLabel>
          <FormControl>
            <Textarea placeholder="Detail rencana penanganan risiko" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Residual & Kriteria */}
    <FormField
      control={form.control}
      name="risiko_residual"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Risiko Residual</FormLabel>
          <FormControl>
            <Input placeholder="Tinggi / Sedang / Rendah" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="kriteria_penerimaan_risiko"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Kriteria Penerimaan Risiko</FormLabel>
          <FormControl>
            <Input placeholder="Kriteria penerimaan risiko" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Pemilik Risiko */}
    <FormField
      control={form.control}
      name="pemilik_risiko"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Pemilik Risiko</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Pemilik Risiko" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={String(user.id)}>
                  {user.name} — {user.division}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="keterangan"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Keterangan</FormLabel>
          <FormControl>
            <Textarea placeholder="Tambahkan keterangan tambahan" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <DialogFooter className="sticky bottom-0 bg-background pt-4 -mr-6 px-6 pb-4 border-t">
      <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
        Cancel
      </Button>
      <Button type="submit">{editingRisk ? "Save Changes" : "Add Risk"}</Button>
    </DialogFooter>
  </form>
</Form>

          </div>
        </DialogContent>
      </Dialog>

      {/* View Details */}
      <Dialog open={!!viewingRisk} onOpenChange={(open) => !open && setViewingRisk(null)}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Risk Details</DialogTitle>
          </DialogHeader>
          {viewingRisk && (
            <div className="text-sm max-h-[70vh] overflow-y-auto pr-6">
              <dl className="divide-y">
                {Object.entries(viewingRisk).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4 py-2">
                    <dt className="font-semibold text-muted-foreground">{key}</dt>
                    <dd className="col-span-2">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingRisk(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingRisk} onOpenChange={(open) => !open && setDeletingRisk(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingRisk(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
