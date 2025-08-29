
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
                          keteranganAdmin: string | null; // Renamed from keterangan
                          keteranganUser: string | null; // New field for user input
};

export type RCSASubmission = {
    id: string;
    submittedAt: string;
    division: string | null;
    data: RCSAData[];
}

const RCSA_DRAFT_KEY = 'rcsaDraftStore';
const RCSA_SUBMISSIONS_KEY = 'rcsaSubmissionsStore';

const parseTarget = (keterangan: string | null): string | null => {
    if (!keterangan) return null;
    const match = keterangan.match(/^Target: (.*)/);
    return match ? match[1] : null;
};


// --- Functions for Draft Data (User's current work) ---

// Function to get the current DRAFT data
export const getRcsaDraft = (): RCSAData[] => {
    if (typeof window === 'undefined') {
        return []; // Return a default structure on server
    }
    try {
        const item = window.localStorage.getItem(RCSA_DRAFT_KEY);
        if (item) {
            const parsed = JSON.parse(item);
            // Migration for old structure
            return parsed.map((d: any) => ({
                ...d,
                keteranganAdmin: d.keteranganAdmin ?? d.keterangan,
                keteranganUser: d.keteranganUser ?? null
            }));
        }
        // If no draft exists, initialize it with master data
        const masterData = getRcsaMasterData().map(d => ({...d, keteranganUser: null}));
        window.localStorage.setItem(RCSA_DRAFT_KEY, JSON.stringify(masterData));
        return masterData;
    } catch (error) {
        console.error("Failed to read draft from localStorage", error);
        // Fallback to master data in case of parsing error on client
        return getRcsaMasterData().map(d => ({...d, keteranganUser: null}));
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
        const parsed = item ? JSON.parse(item) : [];
         // Migration for old structure
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

// Function to ADD a new submission
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
        
        // After submitting, we clear the draft by replacing it with an empty array
        updateRcsaDraft([]);
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
    if (typeof window === 'undefined') {
        return;
    }
    try {
        // Find all submissions and update their corresponding drafts if they match the target
        const allSubmissions = getAllRcsaSubmissions();
        const targetsToUpdate = new Set(newData.map(d => parseTarget(d.keteranganAdmin)));

        targetsToUpdate.forEach(target => {
            if (!target) return;
            const relevantData = newData.filter(d => parseTarget(d.keteranganAdmin) === target);
            // This is a bit of a hack: we're setting a draft for each division.
            // A better approach would be a proper database.
            const draftKey = `rcsaDraft_${target}`;
            window.localStorage.setItem(draftKey, JSON.stringify(relevantData));
        });
        
        // The master data itself is stored in the main draft key
        window.localStorage.setItem(RCSA_DRAFT_KEY, JSON.stringify(newData));


    } catch (error) {
        console.error("Failed to update master data in localStorage", error);
    }
};
