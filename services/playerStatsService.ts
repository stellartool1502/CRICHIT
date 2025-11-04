import { Match, PlayerProfile } from '../types';

const PLAYER_PROFILES_KEY = 'crichit_player_profiles';

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

const createEmptyProfile = (name: string, photoUrl: string | null): PlayerProfile => ({
  name,
  photoUrl,
  matchesPlayed: 0,
  inningsBatted: 0,
  totalRuns: 0,
  ballsFaced: 0,
  fours: 0,
  sixes: 0,
  notOuts: 0,
  highestScore: 0,
  ballsBowled: 0,
  runsConceded: 0,
  wicketsTaken: 0,
  bestBowlingWickets: 0,
  bestBowlingRuns: 999, // High initial value for comparison
});

// Get all player profiles from the database
export const getAllPlayerProfiles = async (): Promise<PlayerProfile[]> => {
  try {
    const db = await getDb();
    const profiles = await db.get(PLAYER_PROFILES_KEY);
    return profiles || [];
  } catch (e) {
    console.error("Failed to get player profiles from db:", e);
    return [];
  }
};

// Save all player profiles to the database
const saveAllPlayerProfiles = async (profiles: PlayerProfile[]): Promise<void> => {
  try {
    const db = await getDb();
    await db.set(PLAYER_PROFILES_KEY, profiles);
  } catch (e) {
    console.error("Failed to save player profiles to db:", e);
  }
};

// Update player stats from a completed match
export const updatePlayerStatsFromMatch = async (match: Match): Promise<void> => {
  const profiles = await getAllPlayerProfiles();
  const processedPlayers = new Set<string>();

  match.innings.forEach(inning => {
    // Update batting stats
    inning.batsmen.forEach(batsman => {
      if (batsman.balls > 0 || batsman.isOut) { // Only count players who participated
        let profile = profiles.find(p => p.name === batsman.name);
        if (!profile) {
          profile = createEmptyProfile(batsman.name, batsman.photoUrl);
          profiles.push(profile);
        }
        
        // General stats (only once per match)
        if (!processedPlayers.has(batsman.name)) {
          profile.matchesPlayed += 1;
          processedPlayers.add(batsman.name);
        }

        // Batting stats
        profile.inningsBatted += 1;
        profile.totalRuns += batsman.runs;
        profile.ballsFaced += batsman.balls;
        profile.fours += batsman.fours;
        profile.sixes += batsman.sixes;
        if (!batsman.isOut) {
          profile.notOuts += 1;
        }
        if (batsman.runs > profile.highestScore) {
          profile.highestScore = batsman.runs;
        }
        // Update photo if it's missing or new
        if(batsman.photoUrl) profile.photoUrl = batsman.photoUrl;
      }
    });

    // Update bowling stats
    inning.bowlers.forEach(bowler => {
      if (bowler.balls > 0 || bowler.overs > 0) { // Only count players who bowled
        let profile = profiles.find(p => p.name === bowler.name);
        if (!profile) {
          profile = createEmptyProfile(bowler.name, bowler.photoUrl);
          profiles.push(profile);
        }
        
        // General stats (only once per match)
        if (!processedPlayers.has(bowler.name)) {
          profile.matchesPlayed += 1;
          processedPlayers.add(bowler.name);
        }

        // Bowling stats
        profile.ballsBowled += (bowler.overs * 6) + bowler.balls;
        profile.runsConceded += bowler.runsConceded;
        profile.wicketsTaken += bowler.wickets;

        // Update best bowling figures
        if (bowler.wickets > profile.bestBowlingWickets) {
          profile.bestBowlingWickets = bowler.wickets;
          profile.bestBowlingRuns = bowler.runsConceded;
        } else if (bowler.wickets === profile.bestBowlingWickets && bowler.runsConceded < profile.bestBowlingRuns) {
          profile.bestBowlingRuns = bowler.runsConceded;
        }
         // Update photo if it's missing or new
         if(bowler.photoUrl) profile.photoUrl = bowler.photoUrl;
      }
    });
  });

  await saveAllPlayerProfiles(profiles);
};