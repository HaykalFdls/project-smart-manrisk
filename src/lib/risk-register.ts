import { useAuth } from "@/context/auth-context";

export const API_URL = "http://localhost:5000";

function buildRiskPayload(data: any) {
  return {
    kategori_risiko: data.kategori_risiko || null,
    jenis_risiko: data.jenis_risiko || null,
    skenario_risiko: data.skenario_risiko || null,
    root_cause: data.root_cause || null,
    dampak: data.dampak || null,
    dampak_keuangan: data.dampak_keuangan || null,
    tingkat_dampak_keuangan: data.tingkat_dampak_keuangan || null,
    dampak_operasional: data.dampak_operasional || null,
    tingkat_dampak_operasional: data.tingkat_dampak_operasional || null,
    dampak_reputasi: data.dampak_reputasi || null,
    tingkat_dampak_reputasi: data.tingkat_dampak_reputasi || null,
    dampak_regulasi: data.dampak_regulasi || null,
    tingkat_dampak_regulasi: data.tingkat_dampak_regulasi || null,
    skor_kemungkinan: data.skor_kemungkinan || null,
    tingkat_kemungkinan: data.tingkat_kemungkinan || null,
    nilai_risiko: data.nilai_risiko || null,
    tingkat_risiko: data.tingkat_risiko || null,
    rencana_penanganan: data.rencana_penanganan || null,
    deskripsi_rencana_penanganan: data.deskripsi_rencana_penanganan || null,
    risiko_residual: data.risiko_residual || null,
    kriteria_penerimaan_risiko: data.kriteria_penerimaan_risiko || null,
    pemilik_risiko: data.pemilik_risiko || null,
  };
}

// Ambil data users
export async function fetchUsers(fetchWithAuth: any) {
  const res = await fetchWithAuth(`${API_URL}/users`);
  if (!res.ok) throw new Error("Gagal mengambil data users");
  return res.json();
}

// Ambil semua risiko
export async function fetchRisks(fetchWithAuth: any) {
  const res = await fetchWithAuth(`${API_URL}/risks`);
  if (!res.ok) throw new Error("Gagal mengambil data risiko");
  return res.json();
}

// Tambah risiko baru
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

// Update risiko
export async function updateRisk(fetchWithAuth: any, id: number, data: any) {
  const payload = buildRiskPayload(data);
  const res = await fetchWithAuth(`${API_URL}/risks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal mengupdate risiko");
  return res.json();
}

// Hapus risiko
export async function deleteRisk(fetchWithAuth: any, id: number) {
  const res = await fetchWithAuth(`${API_URL}/risks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus risiko");
  return res.json();
}
