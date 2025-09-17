
// 'use client';

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from '@/components/ui/card';
// import { useRouter } from 'next/navigation';
// import { Cpu, Landmark, Gavel, Users, ClipboardList, ArrowRight, Shield, Building, BarChart, AreaChart, DollarSign, Briefcase, FileText, Scale, Handshake, Search, Lightbulb, UserCheck, FolderGit2, Coins } from 'lucide-react';
// import type { LucideIcon } from 'lucide-react';

// const divisionData: { division: string; total: number; Icon: LucideIcon; description: string }[] = [
//   {
//     division: 'Divisi Audit Internal',
//     total: 120,
//     Icon: Search,
//     description: 'Risiko terkait audit dan pengawasan internal.',
//   },
//   {
//     division: 'Divisi Sumber Daya Insani (SDI)',
//     total: 320,
//     Icon: Users,
//     description: 'Risiko terkait personil, talenta, dan budaya kerja.',
//   },
//   {
//     division: 'Divisi Perencanaan Strategis',
//     total: 85,
//     Icon: Lightbulb,
//     description: 'Risiko terkait perencanaan dan strategi jangka panjang.',
//   },
//   {
//     division: 'Divisi Penyelamatan & Penyelesaian Pembiayaan (P3)',
//     total: 450,
//     Icon: Handshake,
//     description: 'Risiko terkait penyelamatan dan penyelesaian kredit.',
//   },
//   {
//     division: 'Divisi Pembiayaan Konsumer',
//     total: 680,
//     Icon: UserCheck,
//     description: 'Risiko pada produk pembiayaan untuk konsumen.',
//   },
//   {
//     division: 'Divisi Dana Jasa Ritel',
//     total: 550,
//     Icon: Coins,
//     description: 'Risiko terkait pengelolaan dana dan jasa di segmen ritel.',
//   },
//   {
//     division: 'Divisi Dana Korporasi dan Institusi (Insbank)',
//     total: 720,
//     Icon: Landmark,
//     description: 'Risiko terkait pendanaan dari korporasi dan institusi.',
//   },
//   {
//     division: 'Divisi Kepatuhan',
//     total: 280,
//     Icon: Gavel,
//     description: 'Risiko terkait regulasi, hukum, dan kebijakan internal.',
//   },
//   {
//     division: 'Divisi Teknologi Informasi',
//     total: 500,
//     Icon: Cpu,
//     description: 'Risiko terkait infrastruktur, sistem, dan keamanan siber.',
//   },
//   {
//     division: 'Divisi Operasional',
//     total: 970,
//     Icon: ClipboardList,
//     description: 'Risiko terkait proses internal, kegagalan sistem, dan eksternal.',
//   },
//   {
//     division: 'Divisi Pengendalian Keuangan',
//     total: 350,
//     Icon: AreaChart,
//     description: 'Risiko terkait pasar, kredit, dan pelaporan keuangan.',
//   },
//   {
//     division: 'Divisi Risiko Pembiayaan',
//     total: 480,
//     Icon: DollarSign,
//     description: 'Analisis dan mitigasi risiko dari seluruh aktivitas pembiayaan.',
//   },
//   {
//     division: 'Divisi Pembiayaan UMKM, Ritel, & Komersil',
//     total: 820,
//     Icon: Briefcase,
//     description: 'Risiko dari pembiayaan untuk segmen UMKM, ritel, dan komersil.',
//   },
//   {
//     division: 'Divisi Manajemen Risiko',
//     total: 150,
//     Icon: Shield,
//     description: 'Pengelolaan kerangka kerja manajemen risiko secara keseluruhan.',
//   },
//   {
//     division: 'Divisi Bisnis Digital',
//     total: 410,
//     Icon: FolderGit2,
//     description: 'Risiko terkait inovasi dan operasional produk digital.',
//   },
//   {
//     division: 'Desk Sekretariat Perusahaan (Corsec)',
//     total: 95,
//     Icon: Building,
//     description: 'Risiko terkait komunikasi dan administrasi perusahaan.',
//   },
//   {
//     division: 'Desk Pengembangan Produk & Prosedur (Sysdur)',
//     total: 130,
//     Icon: BarChart,
//     description: 'Risiko dalam pengembangan produk dan penyusunan prosedur.',
//   },
//   {
//     division: 'Desk Administrasi Pembiayaan & Bisnis Legal (APBL)',
//     total: 210,
//     Icon: FileText,
//     description: 'Risiko terkait administrasi dan aspek legal pembiayaan.',
//   },
//   {
//     division: 'Desk Legal',
//     total: 180,
//     Icon: Scale,
//     description: 'Risiko hukum yang dihadapi oleh perusahaan.',
//   },
//   {
//     division: 'Desk Treasury',
//     total: 310,
//     Icon: DollarSign,
//     description: 'Risiko terkait pengelolaan likuiditas dan investasi keuangan.',
//   },
// ];

// export default function RiskRegisterPage() {
//   const router = useRouter();

//   const handleDivisionClick = (division: string) => {
//     router.push(`/risk-register/${encodeURIComponent(division)}`);
//   };

//   return (
//     <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold tracking-tight">Risk Register</h1>
//         <p className="text-muted-foreground">Pilih divisi untuk melihat detail risiko operasional.</p>
//       </div>
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//         {divisionData.map(({ division, total, Icon, description }) => (
//           <Card
//             key={division}
//             className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col"
//             onClick={() => handleDivisionClick(division)}
//           >
//             <CardHeader className="flex flex-row items-start gap-4 space-y-0">
//                 <div className="rounded-lg bg-primary p-3 text-primary-foreground">
//                     <Icon className="h-6 w-6" />
//                 </div>
//                 <div className="flex-1">
//                     <CardTitle className="text-base">{division}</CardTitle>
//                     <CardDescription className="text-xs">{description}</CardDescription>
//                 </div>
//             </CardHeader>
//             <CardContent className="flex-grow">
//                 <div className="text-4xl font-bold">{total}</div>
//                 <p className="text-xs text-muted-foreground">Total Risk Event / Potensi Risiko</p>
//             </CardContent>
//             <CardFooter className="flex items-center justify-end text-sm font-medium text-primary hover:underline mt-auto">
//                 <span>Lihat Detail</span>
//                 <ArrowRight className="ml-2 h-4 w-4" />
//             </CardFooter>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }