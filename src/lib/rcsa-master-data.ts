
import type { RCSAData } from './rcsa-data';

// This file now acts as the master template for a clean RCSA form.
// It starts empty, and the admin populates it via the UI.
const masterData: Omit<RCSAData, 'besaranInheren' | 'levelInheren' | 'besaranResidual' | 'levelResidual' | 'keteranganUser'>[] = [];

export const getRcsaMasterData = (): RCSAData[] => {
    // Return a deep copy to prevent accidental mutation of the master data
    return JSON.parse(JSON.stringify(masterData)).map((d: Omit<RCSAData, 'keteranganUser'>) => ({
        ...d,
        keteranganUser: null,
    }));
}
