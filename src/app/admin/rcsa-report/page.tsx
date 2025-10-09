"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getRcsaSubmitted, type RCSAData } from "@/lib/rcsa-data";
import { Button } from "@/components/ui/button";
import {
    RefreshCw,
    CheckCircle2,
    FileSpreadsheet,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from "xlsx";
import { Textarea } from "@/components/ui/textarea"; // Diperlukan untuk konten panjang

// --- Helpers (tetap sama) ---
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

// --- Component Tabel Laporan RCSA (RCSAStaticTable) ---
const RCSAStaticTable = ({
    submissions,
    onApprove,
}: {
    submissions: (RCSAData & { approved?: boolean })[];
    onApprove: (id: number | undefined) => void;
}) => {
    // Kita akan menggunakan state lokal untuk menangani perubahan (simulasi edit) jika diperlukan
    const [dataRows, setDataRows] = useState(submissions);

    // useEffect untuk memperbarui state lokal ketika prop submissions berubah (misal setelah filter)
    useEffect(() => {
        setDataRows(submissions);
    }, [submissions]);

    // Fungsi untuk mensimulasikan persetujuan dalam tampilan tabel
    const handleApproveInTable = (id: number | undefined) => {
        onApprove(id); // Panggil fungsi approve di parent
        setDataRows(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
    };


    return (
        <div className="overflow-x-auto border rounded-lg shadow-lg">
            {/* Minimal lebar diatur lebih besar untuk menampung semua kolom */}
            <table className="min-w-[3000px] divide-y divide-gray-200">
                {/* Header Tabel */}
                <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-3 py-3 text-left w-[40px] sticky left-0 bg-gray-50">No</th>
                        <th className="px-3 py-3 text-left w-[100px]">Divisi</th>
                        <th className="px-3 py-3 text-left w-[180px]">Potensi Risiko</th>
                        <th className="px-3 py-3 text-left w-[150px]">Jenis Risiko</th>
                        <th className="px-3 py-3 text-left w-[250px]">Penyebab Risiko</th>
                        
                        <th colSpan={3} className="px-3 py-1 text-center bg-red-100 border-x">RISIKO INHEREN</th>
                        <th colSpan={3} className="px-3 py-1 text-center bg-yellow-100 border-x">RISIKO RESIDUAL</th>
                        
                        <th className="px-3 py-3 text-left w-[120px]">Penilaian Kontrol</th>
                        <th className="px-3 py-3 text-left w-[250px]">Action Plan</th>
                        <th className="px-3 py-3 text-left w-[100px]">PIC</th>
                        <th className="px-3 py-3 text-left w-[80px]">Status</th>
                        <th className="px-3 py-3 text-left w-[80px] sticky right-0 bg-gray-50">Aksi</th>
                    </tr>
                    <tr className="text-[10px] font-bold text-gray-600 uppercase tracking-wider bg-red-50">
                        <th className="px-3 py-1 text-left sticky left-0 bg-red-50"></th>
                        <th className="px-3 py-1 text-left"></th>
                        <th className="px-3 py-1 text-left"></th>
                        <th className="px-3 py-1 text-left"></th>
                        <th className="px-3 py-1 text-left"></th>
                        
                        {/* Sub Header Inheren */}
                        <th className="px-2 py-1 text-center bg-red-200">Dampak x Frek</th>
                        <th className="px-2 py-1 text-center bg-red-200">Besaran</th>
                        <th className="px-2 py-1 text-center bg-red-200">Level</th>

                        {/* Sub Header Residual */}
                        <th className="px-2 py-1 text-center bg-yellow-200">Dampak x Kemung.</th>
                        <th className="px-2 py-1 text-center bg-yellow-200">Besaran</th>
                        <th className="px-2 py-1 text-center bg-yellow-200">Level</th>

                        <th className="px-3 py-1 text-left"></th>
                        <th className="px-3 py-1 text-left"></th>
                        <th className="px-3 py-1 text-left"></th>
                        <th className="px-3 py-1 text-left"></th>
                        <th className="px-3 py-1 text-left sticky right-0 bg-red-50"></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {dataRows.map((data, index) => {
                        const besaranInheren = data.dampakInheren && data.frekuensiInheren ? data.dampakInheren * data.frekuensiInheren : null;
                        const levelInheren = getLevelFromBesaran(besaranInheren);
                        const besaranResidual = data.dampakResidual && data.kemungkinanResidual ? data.dampakResidual * data.kemungkinanResidual : null;
                        const levelResidual = getLevelFromBesaran(besaranResidual);

                        return (
                            <tr key={data.id} className="text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                {/* Kolom Kunci (Sticky) */}
                                <td className="px-3 py-2 whitespace-nowrap text-left font-semibold text-xs sticky left-0 bg-white border-r border-gray-200">{data.no}</td>
                                
                                {/* Kolom Data Dasar */}
                                <td className="px-3 py-2 whitespace-nowrap text-left text-xs">{data.unit_name}</td>
                                <td className="px-3 py-2 text-left truncate max-w-[180px] text-xs">{data.potensiRisiko}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-left text-xs">{data.jenisRisiko}</td>
                                
                                {/* Penyebab Risiko (Menggunakan Textarea untuk konten panjang) */}
                                <td className="px-2 py-1 align-top">
                                    <Textarea 
                                        value={data.penyebabRisiko} 
                                        className="h-12 min-w-[250px] text-xs resize-y border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
                                        readOnly // Biasanya laporan tidak bisa diedit di sini
                                    />
                                </td>

                                {/* Kolom Inheren */}
                                <td className="px-2 py-2 text-center text-xs text-red-700 bg-red-50">{data.dampakInheren} x {data.frekuensiInheren}</td>
                                <td className="px-2 py-2 text-center font-bold text-red-800 bg-red-100">{besaranInheren || "-"}</td>
                                <td className="px-2 py-2 text-center">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${levelInheren.color}`}>
                                        {levelInheren.label}
                                    </span>
                                </td>

                                {/* Kolom Residual */}
                                <td className="px-2 py-2 text-center text-xs text-yellow-700 bg-yellow-50">{data.dampakResidual} x {data.kemungkinanResidual}</td>
                                <td className="px-2 py-2 text-center font-bold text-yellow-800 bg-yellow-100">{besaranResidual || "-"}</td>
                                <td className="px-2 py-2 text-center">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${levelResidual.color}`}>
                                        {levelResidual.label}
                                    </span>
                                </td>
                                
                                {/* Penilaian Kontrol, Action Plan, PIC */}
                                <td className="px-3 py-2 text-left text-xs">{data.penilaianKontrol || "-"}</td>
                                <td className="px-2 py-1 align-top">
                                    <Textarea 
                                        value={data.actionPlan} 
                                        className="h-12 min-w-[250px] text-xs resize-y border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
                                        readOnly
                                    />
                                </td>
                                <td className="px-3 py-2 text-left text-xs whitespace-nowrap">{data.pic || "-"}</td>


                                {/* Status */}
                                <td className="px-3 py-2 text-left">
                                    <Badge variant={data.approved ? "outline" : "secondary"} className={data.approved ? "text-green-600 border-green-600" : ""}>
                                        {data.approved ? "Approved" : "Pending"}
                                    </Badge>
                                </td>

                                {/* Aksi Approve (Sticky) */}
                                <td className="px-3 py-2 text-right sticky right-0 bg-white border-l border-gray-200">
                                    {!data.approved && (
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleApproveInTable(data.id)}
                                            className="h-7 px-2 text-xs"
                                        >
                                            Approve
                                        </Button>
                                    )}
                                    {data.approved && (
                                        <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// --- Main Page (RCSAReportPage) ---
export default function RcsaReportPage() {
    const [submissions, setSubmissions] = useState<
        (RCSAData & { approved?: boolean })[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDivision, setSelectedDivision] = useState<string>("all");

    // --- (Load data, handleApprove, downloadExcel, useMemo, useEffect, uniqueDivisions tetap sama) ---
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
        // Hanya update state global
        setSubmissions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, approved: true } : s))
        );
    };
    
    // ... (downloadExcel, filteredSubmissions, useEffect, uniqueDivisions tetap sama) ...
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
    // ------------------------------------------------------------------------------------

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
                    <Button onClick={downloadExcel} variant="default" className="bg-green-600 hover:bg-green-700">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Download Approved
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

            {/* Tampilan Tabel Statis */}
            {filteredSubmissions.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                    Tidak ada laporan RCSA untuk filter ini.
                </div>
            ) : (
                <RCSAStaticTable
                    submissions={filteredSubmissions}
                    onApprove={handleApprove}
                />
            )}
        </div>
    );
}