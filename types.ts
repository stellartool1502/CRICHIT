export enum GameState {
  HOME,
  SETUP,
  TOSS,
  SCORING,
  INNINGS_BREAK,
  RESULT,
  MATCHES_NEAR_ME,
  TOURNAMENTS,
  CREATE_TOURNAMENT,
  EDIT_TOURNAMENT,
  PLAYER_PROFILES,
  SELECT_MOTM,
  COMPLETED_MATCHES,
}

export enum PlayerSpecialty {
  BATSMAN = 'BAT',
  BOWLER = 'BWL',
  ALL_ROUNDER = 'AR',
}

export interface PlayerRoleInfo {
  name: string;
  photoUrl: string | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isWicketKeeper: boolean;
  specialty: PlayerSpecialty;
}

export interface Player {
  id: number;
  name: string;
  photoUrl: string | null;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  outBy?: string;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isWicketKeeper?: boolean;
  specialty?: PlayerSpecialty;
}

export interface Bowler {
  id: number;
  name: string;
  photoUrl: string | null;
  overs: number;
  balls: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  isWicketKeeper?: boolean; // For display on bowler lists
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  specialty?: PlayerSpecialty;
}

export interface FallOfWicket {
  score: number;
  wicket: number;
  batsmanName: string;
  over: string;
  bowlerName: string;
  dismissalType: string;
  fielderName?: string;
}

export interface Extras {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
}

export interface Inning {
  battingTeam: string;
  bowlingTeam: string;
  score: number;
  wickets: number;
  overs: number;
  balls: number;
  batsmen: Player[];
  bowlers: Bowler[];
  fallOfWickets: FallOfWicket[];
  extras: Extras;
}

export interface Toss {
  winner: string;
  decision: 'bat' | 'bowl';
}

export interface LastEvent {
  // A unique identifier for the event, like a timestamp, to ensure useEffect triggers correctly.
  id: number; 
  type: 'run' | 'boundary' | 'wicket' | 'extra' | 'dot';
  runs: number;
  wicketMethod?: string;
  batsmanName: string;
  bowlerName: string;
}

export interface Match {
  id: string; // Unique ID for each match
  teamA: string;
  teamB: string;
  teamALogo: string | null;
  teamBLogo: string | null;
  overs: number;
  playersPerTeam: number;
  teamAPlayers: PlayerRoleInfo[];
  teamBPlayers: PlayerRoleInfo[];
  toss: Toss;
  innings: Inning[];
  currentInning: number;
  striker: Player | null;
  nonStriker: Player | null;
  bowler: Bowler | null;
  target: number;
  lastEvent: LastEvent | null;
  isFreeHit: boolean;
  manOfTheMatch?: { name: string; photoUrl: string | null; teamName: string; };
  tournamentId?: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface LiveMatch {
  id: string;
  tournament: string;
  details: string;
  teamA: string;
  teamB: string;
  teamALogo: string | null;
  teamBLogo: string | null;
  scoreA: string;
  overs: string;
  scoreB: string;
  status: string;
  distance: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  stage: string;
}

export interface PlayerProfile {
  name: string;
  photoUrl: string | null;
  // Batting Stats
  matchesPlayed: number;
  inningsBatted: number;
  totalRuns: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  notOuts: number;
  highestScore: number;
  // Bowling Stats
  ballsBowled: number;
  runsConceded: number;
  wicketsTaken: number;
  bestBowlingWickets: number;
  bestBowlingRuns: number;
}

export interface PlayerPerformance {
  name: string;
  photoUrl: string | null;
  teamName: string;
  points: number;
  performanceSummary: string;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isWicketKeeper?: boolean;
  specialty?: PlayerSpecialty;
}