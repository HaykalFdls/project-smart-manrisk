
import { mapMasterToRCSA, RCSAData } from "./rcsa-data";

export type MasterRCSA = {
  id: number;
  rcsa_name: string;
  description: string;
  unit_id: number;
};

const API_URL = "http://localhost:5000";

// Ambil master RCSA untuk user tertentu
export async function getRcsaMasterData(
  unitId: number,
  userId: number
): Promise<RCSAData[]> {
  const masters = await fetchMasterRCSA(unitId);
  return masters.map((m, idx) => mapMasterToRCSA(m, idx + 1, userId, unitId));
}


// Ambil daftar master RCSA per unit
export async function fetchMasterRCSA(unitId?: number): Promise<MasterRCSA[]> {
  try {
    const res = await fetch(`${API_URL}/master-rcsa${unitId ? `?unit_id=${unitId}` : ""}`);
    if (!res.ok) throw new Error("Gagal ambil master RCSA");
    return await res.json();
  } catch (err) {
    console.error("fetchMasterRCSA error:", err);
    return [];
  }
}

// Tambah data master RCSA
export async function createMasterRCSA(data: {
  rcsa_name: string;
  description: string;
  unit_id: number;
  created_by: number;   // WAJIB user.id valid
}): Promise<MasterRCSA | null> {
  try {
    const res = await fetch(`${API_URL}/master-rcsa`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "authorization-user": String(data.created_by), // ⬅️ kirim user.id valid
      },
      body: JSON.stringify({
        rcsa_name: data.rcsa_name,
        description: data.description,
        unit_id: data.unit_id,
      }),
    });

    if (!res.ok) throw new Error("Gagal tambah master RCSA");
    return await res.json();
  } catch (err) {
    console.error("createMasterRCSA error:", err);
    return null;
  }
}

// Update data master RCSA
export async function updateMasterRCSA(
  id: number,
  data: Partial<Pick<MasterRCSA, "rcsa_name" | "description" | "unit_id">>
): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/master-rcsa/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error("updateMasterRCSA error:", err);
    return false;
  }
}

// Hapus data master RCSA
export async function deleteMasterRCSA(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/master-rcsa/${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.error("deleteMasterRCSA error:", err);
    return false;
  }
}
