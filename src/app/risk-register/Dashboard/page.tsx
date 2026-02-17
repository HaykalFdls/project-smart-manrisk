"use client";
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

// Warna identitas Bank (Biru & Kuning)
const COLORS = ['#005495', '#FDB913', '#0072bc', '#ffcc00'];

const dataDummy = [
  { name: 'Sistem Bank', total: 12 },
  { name: 'Operasional', total: 19 },
  { name: 'Pasar', total: 5 },
  { name: 'Likuiditas', total: 8 },
];

export default function RiskDashboardPage() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Risk Register Analytics</h1>
        <p className="text-slate-500 text-sm">Monitor dan analisis profil risiko Divisi Teknologi Informasi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Risiko', value: '44', desc: 'Risiko terdaftar' },
          { label: 'High Priority', value: '7', desc: 'Butuh penanganan' },
          { label: 'In Progress', value: '15', desc: 'Sedang dimitigasi' },
          { label: 'Resolved', value: '22', desc: 'Tindakan selesai' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-extrabold text-slate-800 my-1">{stat.value}</p>
            <p className="text-green-600 text-xs font-medium">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Utama (Bar) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribusi Kategori Risiko</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataDummy}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="total" fill="#005495" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart (Composition) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Proporsi Risiko</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataDummy}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="total"
                >
                  {dataDummy.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}