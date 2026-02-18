import { useAuth } from "@/context/auth-context";

export const API_URL = "http://localhost:5001";

/* =========================================================
    PAYLOAD BUILDER — FULL INPUT (Semua Kolom)
========================================================= */
function safeNull(v: any) {
  return v === undefined ? null : v;
}

function buildRiskPayload(data: any) {
  const payload: any = {
    kategori_risiko: data.kategori_risiko || null,
    jenis_risiko: data.jenis_risiko || null,
    skenario_risiko: data.skenario_risiko || null,
    root_cause: data.root_cause || null,
    dampak: data.dampak || null,
    dampak_keuangan: safeNull(data.dampak_keuangan),
    tingkat_dampak_keuangan: data.tingkat_dampak_keuangan || null,
    dampak_operasional: safeNull(data.dampak_operasional),
    tingkat_dampak_operasional: data.tingkat_dampak_operasional || null,
    dampak_reputasi: safeNull(data.dampak_reputasi),
    tingkat_dampak_reputasi: data.tingkat_dampak_reputasi || null,
    dampak_regulasi: safeNull(data.dampak_regulasi),
    tingkat_dampak_regulasi: data.tingkat_dampak_regulasi || null,
    skor_kemungkinan: safeNull(data.skor_kemungkinan),
    tingkat_kemungkinan: data.tingkat_kemungkinan || null,
    nilai_risiko: safeNull(data.nilai_risiko),
    tingkat_risiko: data.tingkat_risiko || null,
    rencana_penanganan: data.rencana_penanganan || null,
    deskripsi_rencana_penanganan: data.deskripsi_rencana_penanganan || null,
    risiko_residual: data.risiko_residual || null,
    kriteria_penerimaan_risiko: data.kriteria_penerimaan_risiko || null,
    pemilik_risiko: safeNull(data.pemilik_risiko),
  };

  if (data.status !== undefined && data.status !== null) {
    payload.status = data.status;
  }

  return payload;
}

/* =========================================================
    PAYLOAD BUILDER — MASTER KATEGORI RISIKO
========================================================= */
function buildMasterRiskPayload(data: any) {
  return {
    kategori_risiko: data.kategori_risiko,
    // hanya kategori yang wajib
    pemilik_risiko: data.pemilik_risiko || null, // dikirim ke unit kerja
    // semua field lain dikunci menjadi null
    jenis_risiko: null,
    skenario_risiko: null,
    root_cause: null,
    dampak: null,
    dampak_keuangan: null,
    tingkat_dampak_keuangan: null,
    dampak_operasional: null,
    tingkat_dampak_operasional: null,
    dampak_reputasi: null,
    tingkat_dampak_reputasi: null,
    dampak_regulasi: null,
    tingkat_dampak_regulasi: null,
    skor_kemungkinan: null,
    tingkat_kemungkinan: null,
    nilai_risiko: null,
    tingkat_risiko: null,
    rencana_penanganan: null,
    deskripsi_rencana_penanganan: null,
    risiko_residual: null,
    kriteria_penerimaan_risiko: null,
  };
}

/* =========================================================
    GET USERS
========================================================= */
export async function fetchUsers(fetchWithAuth: any) {
  const res = await fetchWithAuth(`${API_URL}/users`);
  if (!res.ok) throw new Error("Gagal mengambil data users");
  return res.json();
}

/* =========================================================
    GET ALL RISKS
========================================================= */
export async function fetchRisks(fetchWithAuth: any) {
  const res = await fetchWithAuth(`${API_URL}/risks`);
  if (!res.ok) throw new Error("Gagal mengambil data risiko");
  const payload = await res.json();

  // Normalisasi agar caller selalu menerima array rows.
  if (Array.isArray(payload)) return payload;
  if (payload?.success && Array.isArray(payload.data)) return payload.data;
  return [];
}

/* =========================================================
    CREATE RISK — FULL OR MASTER INPUT
    mode: "full" atau "master"
========================================================= */
export async function createRisk(fetchWithAuth: any, data: any) {
  const payload = buildRiskPayload(data);
  const res = await fetchWithAuth(`${API_URL}/risks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal menambah risiko");
  return res.json();
}

/* =========================================================
    UPDATE RISK (Full Update)
========================================================= */
export async function updateRisk(fetchWithAuth: any, id: number, data: any) {
  const payload = buildRiskPayload(data);
  const res = await fetchWithAuth(`${API_URL}/risks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let message = "Gagal mengupdate risiko";
    try {
      const err = await res.json();
      message = err?.message || message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }
  return res.json();
}

/* =========================================================
    DELETE RISK
========================================================= */
export async function deleteRisk(fetchWithAuth: any, id: number) {
  const res = await fetchWithAuth(`${API_URL}/risks/${id}`, { method: "DELETE" });
  if (!res.ok) {
    let message = "Gagal menghapus risiko";
    try {
      const err = await res.json();
      message = err?.message || message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }
  return res.json();
}


/* existing fetchUsers/fetchRisks remain the same (gunakan fetchWithAuth) */

export async function createMasterRisk(fetchWithAuth: any, data: any) {
  // data => { kategori_risiko, jenis_risiko?, skenario_risiko?, pemilik_risiko?, status? }
  const payload = {
    kategori_risiko: data.kategori_risiko,
    jenis_risiko: data.jenis_risiko || null,
    skenario_risiko: data.skenario_risiko || null,
    pemilik_risiko: data.pemilik_risiko || null,
    status: data.status || 'draft'
  };

  const res = await fetchWithAuth(`${API_URL}/risks/master`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal membuat master risk");
  return res.json();
}

export async function generateRiskFromMaster(fetchWithAuth: any, data: any) {
  // data => { master_id, target_unit_id?, pemilik_risiko? }
  const res = await fetchWithAuth(`${API_URL}/risks/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal generate risk dari master");
  return res.json();
}

// keep createRisk/updateRisk/deleteRisk as before

