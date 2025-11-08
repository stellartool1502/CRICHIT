import { Match } from '../types';
import { getDb } from './dbService';

const COMPLETED_MATCHES_KEY = 'crichit_completed_matches';

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
