'use client';

import { MasterRCSA, fetchMasterRCSA } from "./rcsa-master-data";

export type RCSAData = {
  id?: number;              // ID dari database (opsional kalau baru dibuat di frontend)
  no: number;
  unit_id?: number;         // Unit kerja
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
};

export function mapMasterToRCSA(master: MasterRCSA, no: number): RCSAData {
  return {
    id: master.id,
    no,
    unit_id: master.unit_id,
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
  };
}

export type RCSASubmission = {
  id: string;
  submittedAt: string;
  division: string | null;
  data: RCSAData[];
};

const RCSA_DRAFT_KEY = 'rcsaDraftStore';
const RCSA_SUBMISSIONS_KEY = 'rcsaSubmissionsStore';

const parseTarget = (keterangan: string | null): string | null => {
  if (!keterangan) return null;
  const match = keterangan.match(/^Target: (.*)/);
  return match ? match[1] : null;
};

// --- Functions for Draft Data (User's current work) ---

// Ambil DRAFT, fallback ke master jika kosong
export const getRcsaDraft = async (): Promise<RCSAData[]> => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const item = window.localStorage.getItem(RCSA_DRAFT_KEY);
    if (item) {
      const parsed = JSON.parse(item);
      return parsed.map((d: any) => ({
        ...d,
        keteranganAdmin: d.keteranganAdmin ?? d.keterangan,
        keteranganUser: d.keteranganUser ?? null
      }));
    }
    // Ambil master data dari API
    const master = await fetchMasterRCSA();
    const masterData = master.map((m, i) => mapMasterToRCSA(m, i + 1));
    window.localStorage.setItem(RCSA_DRAFT_KEY, JSON.stringify(masterData));
    return masterData;
  } catch (error) {
    console.error("Failed to read draft from localStorage", error);
    const master = await fetchMasterRCSA();
    return master.map((m, i) => mapMasterToRCSA(m, i + 1));
  }
};

// Update draft
export const updateRcsaDraft = (newData: RCSAData[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(RCSA_DRAFT_KEY, JSON.stringify(newData));
  } catch (error) {
    console.error("Failed to write draft to localStorage", error);
  }
};

// --- Functions for Submissions (Admin view) ---
export const getAllRcsaSubmissions = (): RCSASubmission[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const item = window.localStorage.getItem(RCSA_SUBMISSIONS_KEY);
    const parsed = item ? JSON.parse(item) : [];
    return parsed.map((submission: any) => ({
      ...submission,
      data: submission.data.map((d: any) => ({
        ...d,
        keteranganAdmin: d.keteranganAdmin ?? d.keterangan,
        keteranganUser: d.keteranganUser ?? null
      }))
    }));
  } catch (error) {
    console.error("Failed to read submissions from localStorage", error);
    return [];
  }
};

export const addRcsaSubmission = (submissionData: RCSAData[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const allSubmissions = getAllRcsaSubmissions();
    const division = submissionData.length > 0 ? parseTarget(submissionData[0].keteranganAdmin) : null;

    const newSubmission: RCSASubmission = {
      id: (allSubmissions.length + 1).toString(),
      submittedAt: new Date().toISOString(),
      division,
      data: submissionData,
    };
    const updatedSubmissions = [...allSubmissions, newSubmission];
    window.localStorage.setItem(RCSA_SUBMISSIONS_KEY, JSON.stringify(updatedSubmissions));

    updateRcsaDraft([]); // reset draft setelah submit
  } catch (error) {
    console.error("Failed to add submission to localStorage", error);
  }
};

// --- Functions for Master Data Template (Admin management) ---
export const getRcsaData = async (): Promise<RCSAData[]> => {
  const master = await fetchMasterRCSA();
  return master.map((m, i) => mapMasterToRCSA(m, i + 1));
};

export const updateRcsaData = (newData: RCSAData[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const allSubmissions = getAllRcsaSubmissions();
    const targetsToUpdate = new Set(newData.map(d => parseTarget(d.keteranganAdmin)));

    targetsToUpdate.forEach(target => {
      if (!target) return;
      const relevantData = newData.filter(d => parseTarget(d.keteranganAdmin) === target);
      const draftKey = `rcsaDraft_${target}`;
      window.localStorage.setItem(draftKey, JSON.stringify(relevantData));
    });

    window.localStorage.setItem(RCSA_DRAFT_KEY, JSON.stringify(newData));
  } catch (error) {
    console.error("Failed to update master data in localStorage", error);
  }
};
