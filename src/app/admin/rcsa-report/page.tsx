// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { getRcsaSubmitted, type RCSAData } from "@/lib/rcsa-data";
// import { Button } from "@/components/ui/button";
// import { RefreshCw, CheckCircle2, FileSpreadsheet } from "lucide-react";
// import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import * as XLSX from "xlsx";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { SearchableSelect } from "@/components/ui/searchable-select";

// // --- Helpers (tetap sama) ---
// const getLevelFromBesaran = (
//   besaran: number | null | undefined
// ): { label: string; color: string } => {
//   if (besaran === null || besaran === undefined)
//     return { label: "-", color: "bg-gray-400 text-white" };
//   if (besaran >= 20)
//     return { label: "Sangat Tinggi", color: "bg-red-600 text-white" };
//   if (besaran >= 12)
//     return { label: "Tinggi", color: "bg-orange-500 text-white" };
//   if (besaran >= 5)
//     return { label: "Menengah", color: "bg-yellow-400 text-black" };
//   return { label: "Rendah", color: "bg-green-500 text-white" };
// };

// const RCSAStaticTable = ({
//   submissions,
//   onApprove,
// }: {
//   submissions: (RCSAData & { approved?: boolean })[];
//   onApprove: (id: number | undefined) => void;
// }) => {
//   const [dataRows, setDataRows] = useState(submissions);

//   useEffect(() => {
//     setDataRows(submissions);
//   }, [submissions]);

//   // Fungsi untuk mensimulasikan persetujuan dalam tampilan tabel
//   const handleApproveInTable = (id: number | undefined) => {
//     onApprove(id); // Panggil fungsi approve di parent
//     setDataRows((prev) =>
//       prev.map((r) => (r.id === id ? { ...r, approved: true } : r))
//     );
//   };

//   console.log("Data Rows:", dataRows);

//   return (
//     <div className="relative border rounded-lg shadow-lg w-full flex flex-col bg-white">
//       <div className="flex-1 overflow-auto">
//         <table className="min-w-[4000px] divide-y divide-gray-200 border-gray-300">
//           {/* Header Tabel */}
//           <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-300">
//             <tr className="text-[12px] font-medium text-gray-500 uppercase tracking-wider">
//               <th className="px-3 py-3 text-center w-[40px] sticky left-0 bg-gray-50 border-r border-gray-300">
//                 No
//               </th>
//               <th className="px-20 py-3 text-center w-[100px] bg-gray-50 border-r border-gray-300">
//                 Unit Kerja
//               </th>
//               <th className="px-3 py-3 text-center w-[300px] bg-gray-50 border-r border-gray-300">
//                 Potensi Risiko
//               </th>
//               <th className="px-3 py-3 text-center w-[150px] bg-gray-50 border-r border-gray-300">
//                 Jenis Risiko
//               </th>
//               <th className="px-3 py-3 text-center w-[250px] bg-gray-50 border-r border-gray-300">
//                 Penyebab Risiko
//               </th>

//               <th
//                 colSpan={4}
//                 className="px-3 py-1 text-center bg-yellow-100 border-x border-gray-300 text-gray-700"
//               >
//                 RISIKO INHEREN
//               </th>
//               <th className="px-4 py-3 text-center w-[250px] bg-gray-50 border-r border-gray-300">
//                 PENGENDALIAN RISIKO
//               </th>
//               <th
//                 colSpan={4}
//                 className="px-3 py-1 text-center bg-blue-100 border-x border-gray-300 text-gray-700"
//               >
//                 RISIKO RESIDUAL
//               </th>

//               <th className="px-3 py-3 text-center w-[250px] bg-gray-50 border-r border-gray-300">
//                 Action Plan
//               </th>
//               <th className="px-3 py-3 text-center w-[100px] bg-gray-50 border-r border-gray-300">
//                 PIC
//               </th>
//               <th className="px-3 py-3 text-center w-[80px] bg-gray-50 border-r border-gray-300">
//                 Status
//               </th>
//               <th className="px-3 py-3 text-center w-[80px] sticky right-0 bg-gray-50">
//                 Aksi
//               </th>
//             </tr>
//             <tr className="text-[12px] font-bold text-gray-600 uppercase tracking-wider">
//               <th className="px-3 py-1 text-center sticky left-0 bg-gray-50 border-r border-gray-300"></th>
//               <th className="px-3 py-1 text-center bg-gray-50 border-r border-gray-300"></th>
//               <th className="px-3 py-1 text-center bg-gray-50 border-r border-gray-300"></th>
//               <th className="px-3 py-1 text-center bg-gray-50 border-r border-gray-300"></th>
//               <th className="px-3 py-1 text-center bg-gray-50 border-r border-gray-300"></th>

//               <th className="px-1 py-1 text-center bg-yellow-200 border-r border-gray-300">
//                 Dampak
//               </th>
//               <th className="px-1 py-1 text-center bg-yellow-200 border-r border-gray-300">
//                 Frekuensi
//               </th>
//               <th className="px-1 py-1 text-center bg-yellow-200 border-r border-gray-300">
//                 Besaran
//               </th>
//               <th className="px-1 py-1 text-center bg-yellow-200 border-r border-gray-300">
//                 Level
//               </th>

//               <th className="px-3 py-1 text-center bg-gray-50 border-r border-gray-300"></th>

//               <th className="px-1 py-1 text-center bg-blue-200 border-r border-gray-300">
//                 Dampak
//               </th>
//               <th className="px-1 py-1 text-center bg-blue-200 border-r border-gray-300">
//                 Kemungkinan
//               </th>
//               <th className="px-1 py-1 text-center bg-blue-200 border-r border-gray-300">
//                 Besaran
//               </th>
//               <th className="px-1 py-1 text-center bg-blue-200 border-r border-gray-300">
//                 Level
//               </th>

//               <th className="px-3 py-1 text-center bg-gray-50 border-r border-gray-300"></th>
//               <th className="px-3 py-1 text-center bg-gray-50 border-r border-gray-300"></th>
//               <th className="px-3 py-1 text-center bg-gray-50 border-r border-gray-300"></th>
//               <th className="px-3 py-1 text-center sticky bg-gray-50 border-r border-gray-300"></th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {dataRows.map((data, index) => {
//               const besaranInheren =
//                 data.dampakInheren && data.frekuensiInheren
//                   ? data.dampakInheren * data.frekuensiInheren
//                   : null;
//               const levelInheren = getLevelFromBesaran(besaranInheren);
//               const besaranResidual =
//                 data.dampakResidual && data.kemungkinanResidual
//                   ? data.dampakResidual * data.kemungkinanResidual
//                   : null;
//               const levelResidual = getLevelFromBesaran(besaranResidual);

//               return (
//                 <tr
//                   key={data.id}
//                   className="text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//                 >
//                   {/* Kolom Kunci (Sticky) - Tambahkan border-r */}
//                   <td className="px-3 py-2 whitespace-nowrap text-left font-semibold text-xs sticky left-0 bg-white border-r border-gray-200">
//                     {data.no}
//                   </td>

//                   {/* Kolom Data Dasar - Tambahkan border-r */}
//                   <td className="px-3 py-2 whitespace-nowrap text-left text-xs border-r border-gray-200">
//                     {data.unit_name}
//                   </td>
//                   <td className="px-3 py-2 text-left truncate max-w-[180px] text-xs border-r border-gray-200">
//                     {data.potensiRisiko}
//                   </td>
//                   <td className="px-3 py-2 whitespace-nowrap text-left text-xs border-r border-gray-200">
//                     {data.jenisRisiko}
//                   </td>

//                   {/* Penyebab Risiko (Textarea) - Tambahkan border-r */}
//                   <td className="px-2 py-1 align-top border-r border-gray-200">
//                     <Textarea
//                       value={data.penyebabRisiko ?? ""}
//                       className="h-12 min-w-[250px] text-xs resize-y border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
//                       readOnly
//                     />
//                   </td>

//                   {/* Kolom Inheren - Tambahkan border-r */}
//                   <td className="px-2 py-2 text-center text-xs text-black-700 bg-yellow-50 border-r border-gray-200">
//                     {data.dampakInheren}
//                   </td>
//                   <td className="px-2 py-2 text-center text-xs text-black-700 bg-yellow-50 border-r border-gray-200">
//                     {data.frekuensiInheren}
//                   </td>
//                   <td className="px-2 py-2 text-center font-bold text-black-800 bg-yellow-100 border-r border-gray-200">
//                     {besaranInheren || "-"}
//                   </td>
//                   <td className="px-2 py-2 text-center border-r border-gray-200">
//                     <span
//                       className={`px-2 py-0.5 rounded text-xs font-semibold  ${levelInheren.color}`}
//                     >
//                       {levelInheren.label}
//                     </span>
//                   </td>

//                   {/* Pengendalian Risiko (Textarea) - Tambahkan border-r */}
//                   <td className="px-2 py-1 align-top border-r border-gray-200">
//                     <Textarea
//                       value={data.pengendalian ?? ""}
//                       className="h-12 min-w-[250px] text-xs resize-y border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
//                       readOnly
//                     />
//                   </td>

//                   {/* Kolom Residual - Tambahkan border-r */}
//                   <td className="px-2 py-2 text-center text-xs text-black-700 bg-blue-50 border-r border-gray-200">
//                     {data.dampakResidual}
//                   </td>
//                   <td className="px-2 py-2 text-center text-xs text-black-700 bg-blue-50 border-r border-gray-200">
//                     {data.kemungkinanResidual}
//                   </td>
//                   <td className="px-2 py-2 text-center font-bold text-black-800 bg-blue-100 border-r border-gray-200">
//                     {besaranResidual || "-"}
//                   </td>
//                   <td className="px-2 py-2 text-center border-r border-gray-200">
//                     <span
//                       className={`px-2 py-0.5 rounded text-xs font-semibold ${levelResidual.color}`}
//                     >
//                       {levelResidual.label}
//                     </span>
//                   </td>
//                   <td className="px-2 py-1 align-top border-r border-gray-200">
//                     <Textarea
//                       value={data.actionPlan ?? ""}
//                       className="h-12 min-w-[250px] text-xs resize-y border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
//                       readOnly
//                     />
//                   </td>
//                   <td className="px-3 py-2 text-left text-xs whitespace-nowrap border-r border-gray-200">
//                     {data.pic || "-"}
//                   </td>

//                   {/* Status - Tambahkan border-r */}
//                   <td className="px-3 py-2 text-left border-r border-gray-200">
//                     <Badge
//                       variant={data.approved ? "outline" : "secondary"}
//                       className={
//                         data.approved ? "text-green-600 border-green-600" : ""
//                       }
//                     >
//                       {data.approved ? "Approved" : "Pending"}
//                     </Badge>
//                   </td>

//                   {/* Aksi Approve (Sticky) - Tidak perlu border-r karena ini kolom terakhir */}
//                   <td className="px-3 py-2 text-right sticky right-0 bg-white border-l border-gray-200">
//                     {!data.approved && (
//                       <Button
//                         size="sm"
//                         onClick={() => handleApproveInTable(data.id)}
//                         className="h-7 px-2 text-xs"
//                       >
//                         Approve
//                       </Button>
//                     )}
//                     {data.approved && (
//                       <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// // --- Main Page (RCSAReportPage) ---
// export default function RcsaReportPage() {
//   const [submissions, setSubmissions] = useState<
//     (RCSAData & { approved?: boolean })[]
//   >([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedDivision, setSelectedDivision] = useState<string>("all");

//   const loadData = async () => {
//     setIsLoading(true);
//     try {
//       const result = await getRcsaSubmitted();
//       const withApproval = result.map((r) => ({ ...r, approved: false }));
//       setSubmissions(withApproval);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleApprove = (id: number | undefined) => {
//     if (!id) return;
//     // Hanya update state global
//     setSubmissions((prev) =>
//       prev.map((s) => (s.id === id ? { ...s, approved: true } : s))
//     );
//   };

//   const downloadExcel = () => {
//     const approvedReports = submissions.filter((s) => s.approved);
//     if (approvedReports.length === 0) {
//       alert("Belum ada laporan yang di-approve.");
//       return;
//     }

//     const worksheet = XLSX.utils.json_to_sheet(
//       approvedReports.map((r) => ({
//         ID: r.id,
//         Unit: r.unit_name,
//         PotensiRisiko: r.potensiRisiko,
//         JenisRisiko: r.jenisRisiko,
//         PenyebabRisiko: r.penyebabRisiko,
//         DampakInheren: r.dampakInheren,
//         FrekuensiInheren: r.frekuensiInheren,
//         DampakResidual: r.dampakResidual,
//         KemungkinanResidual: r.kemungkinanResidual,
//         ActionPlan: r.actionPlan,
//         PIC: r.pic,
//         KeteranganUser: r.keteranganUser,
//         KeteranganAdmin: r.keteranganAdmin,
//       }))
//     );

//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Approved RCSA");
//     XLSX.writeFile(workbook, "approved_rcsa.xlsx");
//   };

//   const filteredSubmissions = useMemo(() => {
//     if (selectedDivision === "all") return submissions;
//     return submissions.filter((s) => s.unit_name === selectedDivision);
//   }, [selectedDivision, submissions]);

//   useEffect(() => {
//     loadData();
//   }, []);

//   if (isLoading) {
//     return <div className="p-8">Memuat data...</div>;
//   }

//   const uniqueDivisions = Array.from(
//     new Set(submissions.map((s) => s.unit_name).filter(Boolean))
//   );

//   return (
//     <div className="flex flex-col h-full overflow-hidden">
//       {/* Header */}
//       <div className="flex-shrink-0 mb-4 md:mb-8">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Laporan RCSA</h1>
//             <p className="text-muted-foreground">
//               Tinjau semua data RCSA yang telah dikirim oleh unit operasional.
//             </p>
//           </div>
//           <div className="flex gap-2">
//             <Button
//               onClick={downloadExcel}
//               variant="default"
//               className="bg-green-600 hover:bg-green-700"
//             >
//               <FileSpreadsheet className="mr-2 h-4 w-4" />
//               Download Approved
//             </Button>
//             <Button onClick={loadData} variant="outline">
//               <RefreshCw className="mr-2 h-4 w-4" />
//               Muat Ulang Data
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Filter */}
//       <div className="flex-shrink-0 mb-4 flex flex-col gap-2">
//         <Label className="text-sm font-medium">Filter Unit Kerja</Label>
//         <div className="w-72">
//           <SearchableSelect
//             options={[
//               { label: "Semua", value: "all" },
//               ...uniqueDivisions.map((div) => ({
//                 label: div!,
//                 value: div!,
//               })),
//             ]}
//             value={selectedDivision}
//             onValueChange={setSelectedDivision}
//             placeholder="Pilih atau cari divisi..."
//           />
//         </div>
//       </div>

//       <div className="flex-1 overflow-auto">
//         {filteredSubmissions.length === 0 ? (
//           <div className="text-center text-muted-foreground py-12">
//             Tidak ada laporan RCSA untuk filter ini.
//           </div>
//         ) : (
//           <RCSAStaticTable
//             submissions={filteredSubmissions}
//             onApprove={handleApprove}
//           />
//         )}
//       </div>
//     </div>
//   );
// }
