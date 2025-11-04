import { Match } from '../types';

const COMPLETED_MATCHES_KEY = 'crichit_completed_matches';

const getDb = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            if ((window as any).aistudio?.db) {
                clearInterval(interval);
                resolve((window as any).aistudio.db);
            } else if (Date.now() - startTime > 5000) { // 5 second timeout
                clearInterval(interval);
                reject(new Error("Database API did not initialize."));
            }
        }, 100);
    });
};

// Function to get all completed matches from the database
export const getCompletedMatches = async (): Promise<Match[]> => {
    try {
        const db = await getDb();
        const matches = await db.get(COMPLETED_MATCHES_KEY);
        return matches || [];
    } catch (e) {
        console.error("Failed to get completed matches from db:", e);
        return [];
    }
};

// Function to save a completed match
export const saveCompletedMatch = async (matchToSave: Match): Promise<void> => {
    try {
        const db = await getDb();
        const matches: Match[] = (await db.get(COMPLETED_MATCHES_KEY)) || [];
        
        // Check if match already exists to avoid duplicates
        const existingMatchIndex = matches.findIndex(m => m.id === matchToSave.id);

        if (existingMatchIndex > -1) {
            matches[existingMatchIndex] = matchToSave; // Update if it exists
        } else {
            matches.push(matchToSave);
        }

        await db.set(COMPLETED_MATCHES_KEY, matches);
    } catch (e) {
        console.error("Failed to save completed match to db:", e);
    }
};