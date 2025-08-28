"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { fetchRisks, createRisk, updateRisk, deleteRisk } from "@/lib/api";
import { fetchUsers } from "@/lib/api";
import axios from "axios";
import {Risk} from "@/types/risk";
import {User} from "@/types/user";

import {
  Card,
  CardContent,
  CardDescription,
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
import { PlusCircle, MoreHorizontal, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const riskSchema = z.object({
  kategori_risiko: z.string().min(1, "Kategori risiko wajib diisi."),
  jenis_risiko: z.string().min(1, "Jenis risiko wajib diisi."),
  skenario_risiko: z.string().min(1, "Skenario risiko wajib diisi."),
  root_cause: z.string().min(1, "Root cause wajib diisi."),
  dampak: z.string().min(1, "Dampak wajib diisi."),
  dampak_keuangan: z.number().min(0, "Dampak keuangan harus berupa angka."),
  tingkat_dampak_keuangan: z.string().min(1, "Tingkat dampak keuangan wajib diisi."),
  dampak_operasional: z.number().min(0, "Dampak operasional harus berupa angka."),
  tingkat_dampak_operasional: z.string().min(1, "Tingkat dampak operasional wajib diisi."),
  dampak_reputasi: z.number().min(0, "Dampak reputasi harus berupa angka."),
  tingkat_dampak_reputasi: z.string().min(1, "Tingkat dampak reputasi wajib diisi."),
  dampak_regulasi: z.number().min(0, "Dampak regulasi harus berupa angka."),
  tingkat_dampak_regulasi: z.string().min(1, "Tingkat dampak regulasi wajib diisi."),
  skor_kemungkinan: z.number().min(1, "Skor kemungkinan minimal 1."),
  tingkat_kemungkinan: z.string().min(1, "Tingkat kemungkinan wajib diisi."),
  nilai_risiko: z.coerce.number().min(0, "Nilai risiko harus berupa angka."),
  tingkat_risiko: z.string().min(1, "Tingkat risiko wajib diisi."),
  rencana_penanganan: z.string().min(1, "Rencana penanganan wajib diisi."),
  deskripsi_rencana_penanganan: z.string().min(1, "Deskripsi rencana penanganan wajib diisi."),
  risiko_residual: z.string().min(1, "Risiko residual wajib diisi."),
  kriteria_penerimaan_risiko: z.string().min(1, "Kriteria penerimaan risiko wajib diisi."),
  pemilik_risiko: z.string().min(1, "Pemilik risiko wajib diisi."),
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
        fetchUsers()
      ]);
      // console.log("Users:", usersData);
      // console.log("Risks:", risksData);
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


  const handleDivisionClick = (divisionName: string) => {
    setSelectedDivision(divisionName);
  };

  const handleBackClick = () => {
    setSelectedDivision(null);
  };

  const handleAddNewRisk = () => {
    setEditingRisk(null);
    form.reset();
    setIsFormOpen(true);
  };

const handleEditRisk = (risk: Risk) => {
  setEditingRisk(risk);
  form.reset({
    kategori_risiko: risk.kategori_risiko || "",
    jenis_risiko: risk.jenis_risiko || "",
    skenario_risiko: risk.skenario_risiko || "",
    root_cause: risk.root_cause || "",
    dampak: risk.dampak || "",
    dampak_keuangan: risk.dampak_keuangan || 0,
    tingkat_dampak_keuangan: risk.tingkat_dampak_keuangan || "",
    dampak_operasional: risk.dampak_operasional || 0,
    tingkat_dampak_operasional: risk.tingkat_dampak_operasional || "",
    dampak_reputasi: risk.dampak_reputasi || 0,
    tingkat_dampak_reputasi: risk.tingkat_dampak_reputasi || "",
    dampak_regulasi: risk.dampak_regulasi || 0,
    tingkat_dampak_regulasi: risk.tingkat_dampak_regulasi || "",
    skor_kemungkinan: risk.skor_kemungkinan || 1,
    tingkat_kemungkinan: risk.tingkat_kemungkinan || "",
    nilai_risiko: risk.nilai_risiko || 0,
    tingkat_risiko: risk.tingkat_risiko || "",
    rencana_penanganan: risk.rencana_penanganan || "",
    deskripsi_rencana_penanganan: risk.deskripsi_rencana_penanganan || "",
    risiko_residual: risk.risiko_residual || "",
    kriteria_penerimaan_risiko: risk.kriteria_penerimaan_risiko || "",
    pemilik_risiko: String(risk.pemilik_risiko || ""),
    keterangan: risk.keterangan || "",
  });
  setIsFormOpen(true);
};


  const handleDeleteRisk = (risk: Risk) => {
    setDeletingRisk(risk);
  };

  const confirmDelete = async () => {
    if (deletingRisk) {
      try {
        await deleteRisk(deletingRisk.id);
        setRisks(risks.filter(r => r.id !== deletingRisk.id));
        toast({ title: "Risk Deleted", description: "The risk has been successfully deleted.", variant: "destructive" });
      } catch (err) {
        toast({ title: "Error", description: String(err), variant: "destructive" });
      } finally {
        setDeletingRisk(null);
      }
    }
  };

  
  const handleViewDetails = (risk: Risk) => {
    setViewingRisk(risk);
  };

  async function onSubmit(values: z.infer<typeof riskSchema>) {
    try {
      if (editingRisk) {
        const payload = {
          kategori_risiko: values.kategori_risiko,
          jenis_risiko: values.jenis_risiko,
          skenario_risiko: values.skenario_risiko,
          root_cause: values.root_cause,
          dampak: values.dampak,
        
          dampak_keuangan: values.dampak_keuangan,
          tingkat_dampak_keuangan: values.tingkat_dampak_keuangan,
          dampak_operasional: values.dampak_operasional,
          tingkat_dampak_operasional: values.tingkat_dampak_operasional,
          dampak_reputasi: values.dampak_reputasi,
          tingkat_dampak_reputasi: values.tingkat_dampak_reputasi,
          dampak_regulasi: values.dampak_regulasi,
          tingkat_dampak_regulasi: values.tingkat_dampak_regulasi,
        
          skor_kemungkinan: values.skor_kemungkinan,
          tingkat_kemungkinan: values.tingkat_kemungkinan,
          nilai_risiko: values.nilai_risiko,
          tingkat_risiko: values.tingkat_risiko,
        
          rencana_penanganan: values.rencana_penanganan,
          deskripsi_rencana_penanganan: values.deskripsi_rencana_penanganan,
          risiko_residual: values.risiko_residual,
          kriteria_penerimaan_risiko: values.kriteria_penerimaan_risiko,
          pemilik_risiko: parseInt(values.pemilik_risiko),
          keterangan: values.keterangan,
          divisi: selectedDivision,
        };
      
        const updated = await updateRisk(editingRisk.id, payload);
        setRisks(risks.map(r => r.id === editingRisk.id ? updated : r));
        toast({ title: "Risk Updated", description: "The risk has been successfully updated." });
      } else { 
        // Add new risk
        const newRisk = await createRisk({
          kategori_risiko: values.kategori_risiko,
          jenis_risiko: values.jenis_risiko,
          skenario_risiko: values.skenario_risiko,
          root_cause: values.root_cause,
          dampak: values.dampak,
          dampak_keuangan: values.dampak_keuangan,
          tingkat_dampak_keuangan: values.tingkat_dampak_keuangan,
          dampak_operasional: values.dampak_operasional,
          tingkat_dampak_operasional: values.tingkat_dampak_operasional,
          dampak_reputasi: values.dampak_reputasi,
          tingkat_dampak_reputasi: values.tingkat_dampak_reputasi,
          dampak_regulasi: values.dampak_regulasi,
          tingkat_dampak_regulasi: values.tingkat_dampak_regulasi,
          skor_kemungkinan: values.skor_kemungkinan,
          tingkat_kemungkinan: values.tingkat_kemungkinan,
          nilai_risiko: values.nilai_risiko,
          tingkat_risiko: values.tingkat_risiko,
          rencana_penanganan: values.rencana_penanganan,
          deskripsi_rencana_penanganan: values.deskripsi_rencana_penanganan,
          risiko_residual: values.risiko_residual,
          kriteria_penerimaan_risiko: values.kriteria_penerimaan_risiko,
          pemilik_risiko: parseInt(values.pemilik_risiko),
          keterangan: values.keterangan,
          divisi: selectedDivision,
        });

        setRisks([...risks, newRisk]);
        toast({ title: "Risk Added", description: "The new risk has been successfully added." });
      }

      setIsFormOpen(false);
      setEditingRisk(null);
      form.reset();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  }

// console.log("userNameMap:", userNameMap);
// console.log("userDivisionMap:", userDivisionMap);
// console.log("Risks:", risks);
// console.log("Users:", users);

const filteredRisks = selectedDivision
  ? risks.filter(risk => userDivisionMap[risk.pemilik_risiko]?.toString() === selectedDivision)
  : [];


  
  const divisionTotals = users
  .map(user => {
    const totalRisk = risks.filter(r => r.pemilik_risiko === user.id).length;
    return { name: user.division, total: totalRisk };
  })
  .filter(div => div.total > 0);  

  if (!selectedDivision) {
    return (
      <>
        <PageHeader
            title="Operational Risk Register"
            description="Total Risk Event / Potensi Risiko per Divisi">
        </PageHeader>
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Divisi</TableHead>
                        <TableHead className="text-right">Total RE/PR</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {divisionTotals.map((division) => (
                        <TableRow key={division.name} onClick={() => handleDivisionClick(division.name)} className="cursor-pointer">
                        <TableCell className="font-medium">{division.name}</TableCell>
                        <TableCell className="text-right">{division.total}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
        <PageHeader title={selectedDivision} description={`A list of risks for the ${selectedDivision} division.`}>
        <Button variant="outline" onClick={handleBackClick}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
        <Button onClick={handleAddNewRisk}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Risk
        </Button>
        </PageHeader>
        <Card>
        <CardContent className="p-6">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Kategori Risiko</TableHead>
                <TableHead>Jenis Resiko</TableHead>
                <TableHead>Risiko Residual</TableHead>
                <TableHead>Pemilik Risiko</TableHead>
                <TableHead>Divisi</TableHead>
                <TableHead>Rencana Penanganan Risiko</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredRisks.map((risk) => (
                <TableRow key={risk.id}>
                    <TableCell className="font-medium">{risk.id}</TableCell>
                    <TableCell>{risk.kategori_risiko}</TableCell>
                    <TableCell>{risk.jenis_risiko}</TableCell>
                    <TableCell>
                      <Badge
                          variant={
                          risk.risiko_residual === 'Tinggi' || risk.risiko_residual === 'Sangat Tinggi'
                              ? 'destructive'
                              : risk.risiko_residual === 'Menengah' ? 'warning' : 'success'
                          } className="capitalize">{risk.risiko_residual}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{risk.pemilik_nama}</span>
                        <Badge variant="outline" className="w-fit mt-1">
                          {risk.jabatan}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{risk.divisi}</TableCell>
                    <TableCell  className="flex items-center justify-center">{risk.rencana_penanganan}</TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
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
      <DialogTitle>{editingRisk ? 'Edit Risk' : 'Add New Risk'}</DialogTitle>
      <DialogDescription>
        {editingRisk
          ? 'Update the details for the existing risk.'
          : `Fill in the details for the new risk in the ${selectedDivision} division.`}
      </DialogDescription>
    </DialogHeader>
    <div className="flex-grow overflow-y-auto pr-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* Kategori Risiko */}
          <FormField control={form.control} name="kategori_risiko" render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori Risiko</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Sistem Bank" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Jenis Risiko */}
          <FormField control={form.control} name="jenis_risiko" render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Risiko</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Risiko Teknologi Informasi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Skenario Risiko */}
          <FormField control={form.control} name="skenario_risiko" render={({ field }) => (
            <FormItem>
              <FormLabel>Skenario Risiko</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Penyalahgunaan akses" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Root Cause */}
          <FormField control={form.control} name="root_cause" render={({ field }) => (
            <FormItem>
              <FormLabel>Root Cause</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Kontrol lemah" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Dampak */}
          <FormField control={form.control} name="dampak" render={({ field }) => (
            <FormItem>
              <FormLabel>Dampak</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Kerugian finansial" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Skala Dampak 1–5 */}
          {([
            { key: 'dampak_keuangan', label: 'Dampak Keuangan' },
            { key: 'dampak_operasional', label: 'Dampak Operasional' },
            { key: 'dampak_reputasi', label: 'Dampak Reputasi' },
            { key: 'dampak_regulasi', label: 'Dampak Regulasi' },
            { key: 'skor_kemungkinan', label: 'Skor Kemungkinan' },
          ] as { key: keyof RiskFormValues; label: string }[]).map(({ key, label }) => (
            <FormField
              key={key}
              control={form.control}
              name={key}
              render={({ field }) => (
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
              )}
            />
          ))}

          {/* Tingkat Risiko untuk tiap dampak */}
          {([
            { key: 'tingkat_dampak_keuangan', label: 'Tingkat Dampak Keuangan' },
            { key: 'tingkat_dampak_operasional', label: 'Tingkat Dampak Operasional' },
            { key: 'tingkat_dampak_reputasi', label: 'Tingkat Dampak Reputasi' },
            { key: 'tingkat_dampak_regulasi', label: 'Tingkat Dampak Regulasi' },
            { key: 'tingkat_kemungkinan', label: 'Tingkat Kemungkinan' },
          ] as { key: keyof RiskFormValues; label: string }[]).map(({ key, label }) => (
            <FormField
              key={key}
              control={form.control}
              name={key}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val)}
                    defaultValue={field.value ? String(field.value) : undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select one" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Rendah">Rendah</SelectItem>
                      <SelectItem value="Sedang">Sedang</SelectItem>
                      <SelectItem value="Tinggi">Tinggi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}


          {/* Nilai Risiko */}
          <FormField control={form.control} name="nilai_risiko" render={({ field }) => (
            <FormItem>
              <FormLabel>Nilai Risiko</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 320" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Tingkat Risiko */}
          <FormField control={form.control} name="tingkat_risiko" render={({ field }) => (
            <FormItem>
              <FormLabel>Tingkat Risiko</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select one" />
                  </SelectTrigger>
                </FormControl>
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
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select one" />
                  </SelectTrigger>
                </FormControl>
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
              <FormControl>
                <Textarea placeholder="e.g., Audit internal tambahan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Risiko Residual */}
          <FormField control={form.control} name="risiko_residual" render={({ field }) => (
            <FormItem>
              <FormLabel>Risiko Residual</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select one" />
                  </SelectTrigger>
                </FormControl>
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
              <FormControl>
                <Textarea placeholder="e.g., Diterima oleh manajemen" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Pemilik Risiko */}
          <FormField control={form.control} name="pemilik_risiko" render={({ field }) => (
            <FormItem>
              <FormLabel>Pemilik Risiko</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Pemilik Risiko" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name} - {user.division}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          {/* Footer Buttons */}
          <DialogFooter className="sticky bottom-0 bg-background pt-4 -mr-6 px-6 pb-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit">{editingRisk ? 'Save Changes' : 'Add Risk'}</Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  </DialogContent>
</Dialog>
      
      {/* View Details Dialog */}
      <Dialog open={!!viewingRisk} onOpenChange={(open) => !open && setViewingRisk(null)}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Risk Details</DialogTitle>
            <DialogDescription>
              Viewing details for risk no. {viewingRisk?.id}.
            </DialogDescription>
          </DialogHeader>
          {viewingRisk && (
            <div className="text-sm max-h-[70vh] overflow-y-auto pr-6">
              <dl className="divide-y">
                {Object.entries(viewingRisk).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4 py-2">
                    <dt className="font-semibold text-muted-foreground">{key}</dt>
                    <dd className="col-span-2 whitespace-pre-wrap break-words break-words leading-relaxed">
                      {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
                    </dd>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingRisk} onOpenChange={(open) => !open && setDeletingRisk(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the risk
              from the register.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingRisk(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
