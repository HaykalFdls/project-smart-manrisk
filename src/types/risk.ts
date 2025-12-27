import { User } from "./user";

export interface Risk {
    id: number; // PRIMARY KEY
    kategori_risiko: string; 
    jenis_risiko: string; 
    skenario_risiko: string; 
    root_cause: string; 
    dampak: string; 
    
    // Kolom yang bersifat opsional (DEFAULT NULL di skema MySQL)
    dampak_keuangan?: number | null; 
    tingkat_dampak_keuangan?: string | null; 
    dampak_operasional?: number | null; 
    tingkat_dampak_operasional?: string | null;
    dampak_reputasi?: number | null;
    tingkat_dampak_reputasi?: string | null; 
    dampak_regulasi?: number | null; 
    tingkat_dampak_regulasi?: string | null; 
    skor_kemungkinan?: number | null; 
    tingkat_kemungkinan?: string | null; 
    nilai_risiko?: number | null; 
    tingkat_risiko?: string | null; 
    
    rencana_penanganan?: string | null; 
    deskripsi_rencana_penanganan?: string | null; 
    risiko_residual?: string | null; 
    kriteria_penerimaan_risiko?: string | null; 
    
    // Foreign Key
    pemilik_risiko: number | null; 

    // Timestamp fields
    created_at?: Date | string; 
    updated_at?: Date | string;
    status?: "draft" | "final" | "reviewed" | "approved";

    // Dipertahankan sebagai optional karena tidak ada dalam skema 'risks'
    pemilik_nama?: string;
    jabatan?: string;
    unit_kerja?: string;
    keterangan?: string;
    fraud_indicator?: boolean;
}

// type form (biasanya sama seperti Risk tapi tanpa id)
export type RiskFormValues = Omit<Risk, "id" | "created_at" | "updated_at"> & { id?: number };