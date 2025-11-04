import { Match } from '../types';

const LIVE_MATCHES_KEY = 'crichit_live_matches';

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

// Function to get all live matches from the database
export const getLiveMatches = async (): Promise<Match[]> => {
    try {
        const db = await getDb();
        const matches = await db.get(LIVE_MATCHES_KEY);
        return matches || [];
    } catch (e) {
        console.error("Failed to get live matches from db:", e);
        return [];
    }
};

// Function to save a match to the live list
export const saveLiveMatch = async (matchToSave: Match): Promise<void> => {
    try {
        const db = await getDb();
        const matches: Match[] = (await db.get(LIVE_MATCHES_KEY)) || [];
        const existingMatchIndex = matches.findIndex(m => m.id === matchToSave.id);

        if (existingMatchIndex > -1) {
            // Update existing match
            matches[existingMatchIndex] = matchToSave;
        } else {
            // Add new match
            matches.push(matchToSave);
        }

        await db.set(LIVE_MATCHES_KEY, matches);
    } catch (e) {
        console.error("Failed to save live match to db:", e);
    }
};

// Function to remove a match from the live list
export const removeLiveMatch = async (matchId: string): Promise<void> => {
    try {
        const db = await getDb();
        const matches: Match[] = (await db.get(LIVE_MATCHES_KEY)) || [];
        const updatedMatches = matches.filter(m => m.id !== matchId);

        await db.set(LIVE_MATCHES_KEY, updatedMatches);
    } catch (e) {
        console.error("Failed to remove live match from db:", e);
    }
};