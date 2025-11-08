import { Tournament } from '../types';
import { getDb } from './dbService';

const TOURNAMENTS_KEY = 'crichit_tournaments';

// Function to get all tournaments from the database
export const getTournaments = async (): Promise<Tournament[]> => {
    try {
        const db = await getDb();
        const tournaments = await db.get(TOURNAMENTS_KEY);
        return tournaments || [];
    } catch (e) {
        console.error("Failed to get tournaments from db:", e);
        return [];
    }
};

// Function to save a tournament (handles create and update)
export const saveTournament = async (tournamentToSave: Tournament): Promise<void> => {
    try {
        const db = await getDb();
        const tournaments: Tournament[] = (await db.get(TOURNAMENTS_KEY)) || [];
        const existingTournamentIndex = tournaments.findIndex(t => t.id === tournamentToSave.id);

        if (existingTournamentIndex > -1) {
            // Update existing tournament
            tournaments[existingTournamentIndex] = tournamentToSave;
        } else {
            // Add new tournament
            tournaments.push(tournamentToSave);
        }

        await db.set(TOURNAMENTS_KEY, tournaments);
    } catch (e) {
        console.error("Failed to save tournament to db:", e);
    }
};

// Function to remove a tournament
export const deleteTournament = async (tournamentId: string): Promise<void> => {
    try {
        const db = await getDb();
        const tournaments: Tournament[] = (await db.get(TOURNAMENTS_KEY)) || [];
        const updatedTournaments = tournaments.filter(t => t.id !== tournamentId);

        await db.set(TOURNAMENTS_KEY, updatedTournaments);
    } catch (e) {
        console.error("Failed to remove tournament from db:", e);
    }
};
