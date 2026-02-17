"use client";
import React, { useEffect, useState } from 'react';
import { Check, X, Search, Filter, AlertCircle } from "lucide-react";

interface RiskItem {
  id: number;
  unit_name: string;
  description: string;
  score: number;
  status: 'pending' | 'approved' | 'declined';
}

export default function AdminVerificationPage() {
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');

  // 1. Ambil data risiko dari semua unit
  const fetchRisks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/admin/risk-list`); // Sesuaikan endpoint API Anda
      const data = await response.json();
      if (data.success) {
        setRisks(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  // 2. Fungsi untuk Approve/Decline
  const handleAction = async (id: number, status: 'approved' | 'declined') => {
    const confirmMsg = status === 'approved' ? "Setujui risiko ini?" : "Tolak risiko ini?";
    if (!confirm(confirmMsg)) return;

    try {
      const response = await fetch(`http://localhost:5001/api/admin/verify-risk`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (response.ok) {
        alert(`Berhasil di-${status}`);
        fetchRisks(); // Refresh data setelah aksi
      }
    } catch (error) {
      alert("Gagal melakukan aksi");
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Verifikasi Risk Register</h1>
        <p className="text-slate-500 text-sm">Review dan validasi kiriman risiko dari unit kerja.</p>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari risiko atau unit..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <select 
          className="p-2 border border-slate-200 rounded-lg text-sm outline-none"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="pending">Menunggu Verifikasi</option>
          <option value="approved">Sudah Disetujui</option>
          <option value="declined">Ditolak</option>
        </select>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Unit Pengirim</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Deskripsi Risiko</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Skor</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Aksi Verifikasi</th>
            </tr>
          </thead>
          <tbody>
            {risks.filter(r => r.status === filterStatus).map((risk) => (
              <tr key={risk.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <span className="font-semibold text-slate-700 text-sm">{risk.unit_name}</span>
                </td>
                <td className="p-4 text-sm text-slate-600">{risk.description}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${risk.score > 15 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {risk.score}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    {risk.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleAction(risk.id, 'approved')}
                          className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-600 hover:text-white transition-all text-xs font-bold"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleAction(risk.id, 'declined')}
                          className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition-all text-xs font-bold"
                        >
                          <X size={14} /> Decline
                        </button>
                      </>
                    ) : (
                      <span className={`text-xs font-bold uppercase ${risk.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                        {risk.status}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {risks.length === 0 && !loading && (
          <div className="p-12 text-center text-slate-400">
            <AlertCircle className="mx-auto mb-2 opacity-20" size={48} />
            <p>Tidak ada data risiko yang perlu diverifikasi.</p>
          </div>
        )}
      </div>
    </div>
  );
}