"use client";

import { useState } from "react";

export function RiskEntryForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    kategori_risiko: "",
    jenis_risiko: "",
    skenario_risiko: "",
    root_cause: "",
    dampak: ""
  });

  return (
    <div className="space-y-4 py-4">
      <div>
        <label className="text-sm font-semibold text-slate-700">Kategori Risiko</label>
        <input 
          className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Contoh: Operasional TI"
          onChange={(e) => setForm({...form, kategori_risiko: e.target.value})}
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700">Jenis Risiko</label>
        <select 
          className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
          onChange={(e) => setForm({...form, jenis_risiko: e.target.value})}
        >
          <option value="">Pilih Jenis...</option>
          <option value="Risiko Operasional">Risiko Operasional</option>
          <option value="Risiko Pasar">Risiko Pasar</option>
          <option value="Risiko Kredit">Risiko Kredit</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700">Skenario Risiko</label>
        <textarea 
          className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          rows={3}
          placeholder="Ceritakan apa yang mungkin terjadi..."
          onChange={(e) => setForm({...form, skenario_risiko: e.target.value})}
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700">Akar Penyebab (Root Cause)</label>
        <textarea 
          className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          rows={2}
          placeholder="Mengapa hal ini bisa terjadi?"
          onChange={(e) => setForm({...form, root_cause: e.target.value})}
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button 
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-medium"
        >
          Batal
        </button>
        <button 
          onClick={() => onSubmit(form)}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-md shadow-blue-100"
        >
          Kirim Risiko
        </button>
      </div>
    </div>
  );
}