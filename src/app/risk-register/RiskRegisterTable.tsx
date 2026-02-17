"use client";

import { Save, Send, AlertCircle } from "lucide-react";

interface Props {
  data: any[];
  onChange: (index: number, field: string, value: any) => void;
  onAutoSave: (row: any) => void;
  onBulkSubmit: () => void;
}

export function RiskRegisterTable({ data, onChange, onAutoSave, onBulkSubmit }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400">
        <AlertCircle size={48} className="mb-4 opacity-20" />
        <p>Tidak ada data risiko draft untuk unit ini.</p>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200">
          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-12 text-center">No</th>
          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Kategori & Jenis</th>
          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Skenario Risiko</th>
          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Root Cause</th>
          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left w-20 text-center">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {data.map((row, idx) => (
          <tr key={row.id} className="group hover:bg-blue-50/30 transition-all duration-200">
            <td className="p-4 text-center text-sm text-slate-400 font-medium">{idx + 1}</td>
            <td className="p-3 space-y-2 min-w-[250px]">
              <textarea
                className="w-full p-2 bg-transparent hover:bg-white focus:bg-white border-transparent hover:border-slate-200 focus:border-blue-500 border rounded-lg text-sm transition-all resize-none outline-none focus:shadow-sm"
                rows={2}
                value={row.kategori_risiko || ""}
                placeholder="Isi kategori..."
                onChange={(e) => onChange(idx, "kategori_risiko", e.target.value)}
              />
              <select 
                className="w-full p-2 bg-slate-50 border-none rounded-lg text-xs font-semibold text-slate-600 outline-none cursor-pointer hover:bg-slate-100"
                value={row.jenis_risiko || ""}
                onChange={(e) => onChange(idx, "jenis_risiko", e.target.value)}
              >
                <option value="">Pilih Jenis...</option>
                <option value="Risiko Pasar">Risiko Pasar</option>
                <option value="Risiko Operasional">Risiko Operasional</option>
                <option value="Risiko Likuiditas">Risiko Likuiditas</option>
              </select>
            </td>
            <td className="p-3 min-w-[300px]">
              <textarea
                className="w-full p-2 bg-transparent hover:bg-white focus:bg-white border-transparent hover:border-slate-200 focus:border-blue-500 border rounded-lg text-sm transition-all resize-none outline-none"
                rows={3}
                value={row.skenario_risiko || ""}
                placeholder="Jelaskan skenario..."
                onChange={(e) => onChange(idx, "skenario_risiko", e.target.value)}
              />
            </td>
            <td className="p-3 min-w-[300px]">
              <textarea
                className="w-full p-2 bg-transparent hover:bg-white focus:bg-white border-transparent hover:border-slate-200 focus:border-blue-500 border rounded-lg text-sm transition-all resize-none outline-none"
                rows={3}
                value={row.root_cause || ""}
                placeholder="Apa penyebab utamanya?..."
                onChange={(e) => onChange(idx, "root_cause", e.target.value)}
              />
            </td>
            <td className="p-3 text-center">
              <button
                onClick={() => onAutoSave(row)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm"
                title="Simpan Perubahan"
              >
                <Send size={18} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}