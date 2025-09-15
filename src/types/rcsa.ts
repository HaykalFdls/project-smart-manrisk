export interface RCSA_AssessmentPayload {
  id?: number;                
  rcsa_master_id: number;     
  unit_id: number;            
  created_by: number;         

  // --- Field risiko utama ---
  potensi_risiko: string;   
  jenis_risiko?: string | null;
  penyebab_risiko?: string | null;

  // --- Penilaian Inheren ---
  dampak_inheren?: number | null;
  frekuensi_inheren?: number | null;

  // --- Pengendalian & Residual ---
  pengendalian?: string | null;
  dampak_residual?: number | null;
  kemungkinan_residual?: number | null;
  penilaian_kontrol?: string | null;

  // --- Action Plan ---
  action_plan?: string | null;
  pic?: string | null;

  // --- Metadata ---
  status?: "draft" | "submitted" | "reviewed" | string;
  keterangan_admin?: string | null;
  keterangan_user?: string | null;

  created_at?: string;
  updated_at?: string;
}
