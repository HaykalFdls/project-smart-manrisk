"use client";

import { MasterRCSA, fetchMasterRCSA } from "./rcsa-master-data";

export type RCSAData = {
  id?: number;               // id assessment
  no: number;
  rcsa_master_id?: number;   // link ke master
  unit_id?: number;
  unit_name?: string;
  unit_type?: string;
  potensiRisiko: string;
  jenisRisiko: string | null;
  penyebabRisiko: string | null;
  dampakInheren: number | null;
  frekuensiInheren: number | null;
  pengendalian: string | null;
  dampakResidual: number | null;
  kemungkinanResidual: number | null;
  penilaianKontrol: string | null;
  actionPlan: string | null;
  pic: string | null;
  keteranganAdmin: string | null;
  keteranganUser: string | null;
  status?: "draft" | "submitted" | "reviewed";
};

export function mapMasterToRCSA(master: MasterRCSA, no: number, userId: number, unitId: number): RCSAData {
  return {
    id: undefined,
    no,
    rcsa_master_id: master.id,
    unit_id: unitId,
    potensiRisiko: master.rcsa_name,
    jenisRisiko: null,
    penyebabRisiko: null,
    dampakInheren: null,
    frekuensiInheren: null,
    pengendalian: null,
    dampakResidual: null,
    kemungkinanResidual: null,
    penilaianKontrol: null,
    actionPlan: null,
    pic: null,
    keteranganAdmin: master.description || null,
    keteranganUser: null,
    status: "draft",
  };
}

// ================= API CALLS =================

const API_BASE = "http://localhost:5000";

// Ambil draft user (assessment yang belum submit)
export const getRcsaDraft = async (userId: number, unitId: number): Promise<RCSAData[]> => {
  try {
    // 🔹 Ambil draft assessment dari backend
    const res = await fetch(`${API_BASE}/rcsa/assessment?created_by=${userId}&unit_id=${unitId}`);
    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Fetch gagal:", res.status, text);
      throw new Error("Gagal ambil draft RCSA");
    }
    const data = await res.json();
    if (data.length > 0) return data;

    // 🔹 Kalau belum ada draft → generate dari master sesuai unit
    const masterRes = await fetch(`${API_BASE}/rcsa/master/${unitId}`);
    if (!masterRes.ok) throw new Error("Gagal ambil master RCSA");

    const master = await masterRes.json();
    return master.map((m: any, i: number) =>
      mapMasterToRCSA(m, i + 1, userId, unitId)
    );
  } catch (err) {
    console.error("getRcsaDraft error:", err);
    return [];
  }
};

// Simpan assessment (insert ke DB)
export const saveRcsaAssessment = async (row: RCSAData, userId: number, unitId: number) => {
  const payload = {
    rcsa_master_id: row.rcsa_master_id,
    unit_id: unitId,
    created_by: userId,
    jenis_risiko: row.jenisRisiko,
    penyebab_risiko: row.penyebabRisiko,
    risk_description: row.potensiRisiko,
    dampak_inheren: row.dampakInheren,
    frekuensi_inheren: row.frekuensiInheren,
    pengendalian: row.pengendalian,
    dampak_residual: row.dampakResidual,
    kemungkinan_residual: row.kemungkinanResidual,
    penilaian_kontrol: row.penilaianKontrol,
    action_plan: row.actionPlan,
    pic: row.pic,
    status: "draft",
  };

  const res = await fetch(
    row.id ? `${API_BASE}/rcsa/assessment/${row.id}` : `${API_BASE}/rcsa/assessment`,
    {
      method: row.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) throw new Error("Gagal simpan assessment");
  return await res.json();
};

// Submit assessment (ubah status ke submitted)
export const submitRcsaAssessment = async (id: number) => {
  try {
    const res = await fetch(`${API_BASE}/rcsa/assessment/${id}/submit`, { method: "PUT" });
    if (!res.ok) throw new Error("Gagal submit assessment");
    return await res.json();
  } catch (err) {
    console.error("submitRcsaAssessment error:", err);
    throw err;
  }
};

// Ambil semua submissions (untuk admin)
export const getAllRcsaSubmissions = async (): Promise<RCSAData[]> => {
  try {
    const res = await fetch(`${API_BASE}/rcsa/assessment`);
    if (!res.ok) throw new Error("Gagal ambil submissions");
    return await res.json();
  } catch (err) {
    console.error("getAllRcsaSubmissions error:", err);
    return [];
  }
};
