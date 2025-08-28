
'use client';

import { getRcsaMasterData } from './rcsa-master-data';

export type RCSAData = {
  no: number;
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
  keterangan: string | null;
};

export type RCSASubmission = {
    id: string;
    submittedAt: string;
    data: RCSAData[];
}

const RCSA_DRAFT_KEY = 'rcsaDraftStore';
const RCSA_SUBMISSIONS_KEY = 'rcsaSubmissionsStore';

// --- Functions for Draft Data (User's current work) ---

// Function to get the current DRAFT data
export const getRcsaDraft = (): RCSAData[] => {
  if (typeof window === 'undefined') {
    return []; // Return a default structure on server
  }
  try {
    const item = window.localStorage.getItem(RCSA_DRAFT_KEY);
    if (item) {
      return JSON.parse(item);
    }
    // If no draft exists, initialize it with master data
    const masterData = getRcsaMasterData();
    window.localStorage.setItem(RCSA_DRAFT_KEY, JSON.stringify(masterData));
    return masterData;
  } catch (error) {
    console.error("Failed to read draft from localStorage", error);
    // Fallback to master data in case of parsing error on client
    return getRcsaMasterData();
  }
};


// Function to update the DRAFT data
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

// Function to get ALL submissions
export const getAllRcsaSubmissions = (): RCSASubmission[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const item = window.localStorage.getItem(RCSA_SUBMISSIONS_KEY);
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error("Failed to read submissions from localStorage", error);
        return [];
    }
};

// Function to ADD a new submission
export const addRcsaSubmission = (submissionData: RCSAData[]) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        const allSubmissions = getAllRcsaSubmissions();
        const newSubmission: RCSASubmission = {
            id: (allSubmissions.length + 1).toString(),
            submittedAt: new Date().toISOString(),
            data: submissionData,
        };
        const updatedSubmissions = [...allSubmissions, newSubmission];
        window.localStorage.setItem(RCSA_SUBMISSIONS_KEY, JSON.stringify(updatedSubmissions));
        
        // After submitting, we clear the draft by replacing it with a fresh master template
        const masterData = getRcsaMasterData();
        updateRcsaDraft(masterData);
    } catch (error) {
        console.error("Failed to add submission to localStorage", error);
    }
};

// --- Functions for Master Data Template (Admin management) ---

// Function to get the MASTER data template
export const getRcsaData = (): RCSAData[] => {
    // This is now just an alias for getting a fresh template.
    // The "draft" is the user's working copy.
    return getRcsaMasterData();
};

// Function to update the MASTER data template
export const updateRcsaData = (newData: RCSAData[]) => {
    // In a real app, this would write to a DB.
    // For our simulation, we can't directly modify the imported masterData constant.
    // For now, let's update what the user starts with by overwriting the draft key
    // IF AND ONLY IF there is no data there. This is a bit of a hack for local dev.
    if (typeof window === 'undefined') {
        return;
    }
    try {
        // This is a destructive action for the sake of the demo. A real app would have a dedicated "master" key.
        window.localStorage.setItem(RCSA_DRAFT_KEY, JSON.stringify(newData));
    } catch (error) {
        console.error("Failed to update master data in localStorage", error);
    }
};
