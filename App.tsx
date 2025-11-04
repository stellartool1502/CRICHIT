import React, { useState, useMemo } from 'react';
import { GameState, Match, Player, Bowler, Inning, Tournament } from './types';
import Home from './components/Home';
import MatchSetup from './components/MatchSetup';
import Toss from './components/Toss';
import Scoring from './components/Scoring';
import MatchResult from './components/MatchResult';
import MatchesNearMe from './components/MatchesNearMe';
import TournamentsComponent from './components/Tournaments';
import TournamentForm from './components/TournamentForm';
import PlayerProfiles from './components/PlayerProfiles';
import SelectMotm from './components/SelectMotm';
import CompletedMatches from './components/CompletedMatches';
import Layout from './components/Layout';
import { saveTournament } from './services/tournamentService';
import { updatePlayerStatsFromMatch } from './services/playerStatsService';
import { saveCompletedMatch } from './services/completedMatchService';
import { removeLiveMatch } from './services/liveMatchService';


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.HOME);
  const [match, setMatch] = useState<Match | null>(null);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);

  const createInitialInning = (
    battingTeam: string, 
    bowlingTeam: string, 
    batsmenNames: string[], 
    bowlerNames: string[],
    batsmenPhotos: (string | null)[],
    bowlerPhotos: (string | null)[],
    teamPlayers: { name: string, isCaptain?: boolean, isViceCaptain?: boolean, isWicketKeeper?: boolean }[]
  ): Inning => {
    const batsmen: Player[] = Array.from({ length: 11 }, (_, i) => {
        const name = batsmenNames[i] || `${battingTeam} Player ${i + 1}`;
        const playerDetails = teamPlayers.find(p => p.name === name);
        return {
          id: i + 1,
          name: name,
          photoUrl: batsmenPhotos[i] || null,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          isOut: false,
          isCaptain: playerDetails?.isCaptain,
          isViceCaptain: playerDetails?.isViceCaptain,
          isWicketKeeper: playerDetails?.isWicketKeeper,
        }
    });
    const bowlers: Bowler[] = Array.from({ length: 11 }, (_, i) => {
        const name = bowlerNames[i] || `${bowlingTeam} Player ${i + 1}`;
        const playerDetails = teamPlayers.find(p => p.name === name);
        return {
          id: i + 1,
          name: name,
          photoUrl: bowlerPhotos[i] || null,
          overs: 0,
          balls: 0,
          maidens: 0,
          runsConceded: 0,
          wickets: 0,
          isWicketKeeper: playerDetails?.isWicketKeeper,
        }
    });
    return {
      battingTeam,
      bowlingTeam,
      score: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      batsmen,
      bowlers,
      fallOfWickets: [],
      extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
    };
  };

  const handleMatchSetup = (setupData: {
    teamA: string; teamB: string; overs: number; 
    teamAPlayers: { name: string, photoUrl: string | null, isCaptain: boolean, isViceCaptain: boolean, isWicketKeeper: boolean }[];
    teamBPlayers: { name: string, photoUrl: string | null, isCaptain: boolean, isViceCaptain: boolean, isWicketKeeper: boolean }[];
    teamALogo: string | null; teamBLogo: string | null; tournamentId?: string;
  }) => {
    setMatch({
      id: `match_${Date.now()}`,
      teamA: setupData.teamA,
      teamB: setupData.teamB,
      teamALogo: setupData.teamALogo,
      teamBLogo: setupData.teamBLogo,
      overs: setupData.overs,
      teamAPlayers: setupData.teamAPlayers.map(p => p.name),
      teamBPlayers: setupData.teamBPlayers.map(p => p.name),
      teamAPlayerPhotos: setupData.teamAPlayers.map(p => p.photoUrl),
      teamBPlayerPhotos: setupData.teamBPlayers.map(p => p.photoUrl),
      toss: { winner: '', decision: 'bat' },
      innings: [],
      currentInning: 0,
      striker: null,
      nonStriker: null,
      bowler: null,
      target: 0,
      lastEvent: null,
      isFreeHit: false,
      tournamentId: setupData.tournamentId,
    });
    setGameState(GameState.TOSS);
  };

  const handleTossResult = (winner: string, decision: 'bat' | 'bowl') => {
    setMatch(prev => {
      if (!prev) return null;
      const battingTeam = (decision === 'bat') ? winner : (winner === prev.teamA ? prev.teamB : prev.teamA);
      const bowlingTeam = (decision === 'bowl') ? winner : (winner === prev.teamA ? prev.teamB : prev.teamA);
      
      const batsmenDetails = battingTeam === prev.teamA ? prev.teamAPlayers : prev.teamBPlayers;
      const bowlerDetails = bowlingTeam === prev.teamA ? prev.teamAPlayers : prev.teamBPlayers;
      
      const batsmenPhotos = battingTeam === prev.teamA ? prev.teamAPlayerPhotos : prev.teamBPlayerPhotos;
      const bowlerPhotos = bowlingTeam === prev.teamA ? prev.teamAPlayerPhotos : prev.teamBPlayerPhotos;

      const firstInning = createInitialInning(battingTeam, bowlingTeam, batsmenDetails, bowlerDetails, batsmenPhotos, bowlerPhotos, []);
      
      return {
        ...prev,
        toss: { winner, decision },
        innings: [firstInning],
        striker: null,
        nonStriker: null,
        bowler: null,
      };
    });
    setGameState(GameState.SCORING);
  };
  
  const handleMatchEnd = (finalMatch: Match) => {
    setMatch(finalMatch);
    setGameState(GameState.SELECT_MOTM);
  };

  const handleSelectMotm = async (motm: { name: string; photoUrl: string | null; teamName: string; }) => {
    if (!match) return;
    const finalMatchWithMotm = { ...match, manOfTheMatch: motm };
    await updatePlayerStatsFromMatch(finalMatchWithMotm);
    await saveCompletedMatch(finalMatchWithMotm);
    await removeLiveMatch(finalMatchWithMotm.id);
    setMatch(finalMatchWithMotm);
    setGameState(GameState.RESULT);
  };
  
  const handleGoHome = () => {
    setMatch(null);
    setGameState(GameState.HOME);
  };
  
  const handleNewMatch = () => {
    setMatch(null);
    setGameState(GameState.SETUP);
  }

  const handleCreateTournament = () => {
    setEditingTournament(null);
    setGameState(GameState.CREATE_TOURNAMENT);
  };

  const handleEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setGameState(GameState.EDIT_TOURNAMENT);
  };

  const handleSaveTournament = async (tournament: Tournament) => {
    await saveTournament(tournament);
    setEditingTournament(null);
    setGameState(GameState.TOURNAMENTS);
  };

  const currentComponent = useMemo(() => {
    switch (gameState) {
      case GameState.HOME:
        return <Home setGameState={setGameState} />;
      case GameState.SETUP:
        return <MatchSetup onSetup={handleMatchSetup} />;
      case GameState.TOSS:
        if (!match) return <Home setGameState={setGameState} />;
        return <Toss teamA={match.teamA} teamB={match.teamB} onTossResult={handleTossResult} onBack={() => setGameState(GameState.SETUP)} />;
      case GameState.SCORING:
        if (!match) return <Home setGameState={setGameState} />;
        return <Scoring match={match} setMatch={setMatch} setGameState={setGameState} createInitialInning={createInitialInning} onAbandonMatch={handleGoHome} onMatchEnd={handleMatchEnd} />;
      case GameState.SELECT_MOTM:
        if (!match) return <Home setGameState={setGameState} />;
        return <SelectMotm match={match} onSelect={handleSelectMotm} />;
      case GameState.RESULT:
         if (!match) return <Home setGameState={setGameState} />;
        return <MatchResult match={match} onNewMatch={handleGoHome} />;
      case GameState.MATCHES_NEAR_ME:
        return <MatchesNearMe onBack={() => setGameState(GameState.HOME)} />;
      case GameState.COMPLETED_MATCHES:
        return <CompletedMatches onBack={() => setGameState(GameState.HOME)} />;
      case GameState.TOURNAMENTS:
        return <TournamentsComponent onBack={() => setGameState(GameState.HOME)} onCreate={handleCreateTournament} onEdit={handleEditTournament} />;
      case GameState.CREATE_TOURNAMENT:
        return <TournamentForm onSave={handleSaveTournament} onCancel={() => setGameState(GameState.TOURNAMENTS)} />;
      case GameState.EDIT_TOURNAMENT:
        return <TournamentForm onSave={handleSaveTournament} onCancel={() => setGameState(GameState.TOURNAMENTS)} tournamentToEdit={editingTournament} />;
      case GameState.PLAYER_PROFILES:
        return <PlayerProfiles onBack={() => setGameState(GameState.HOME)} />;
      case GameState.INNINGS_BREAK:
        if (!match) return <Home setGameState={setGameState} />;
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Innings Break</h1>
                    <p className="text-xl mb-2">Target for {match.innings[1]?.battingTeam} is <span className="font-bold text-teal-600">{match.target}</span> runs.</p>
                    <button 
                        onClick={() => setGameState(GameState.SCORING)}
                        className="mt-8 px-8 py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 transition-colors"
                    >
                        Start 2nd Innings
                    </button>
                </div>
            </div>
        );
      default:
        return <Home setGameState={setGameState} />;
    }
  }, [gameState, match, editingTournament]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Layout onHomeClick={handleGoHome}>
        {currentComponent}
      </Layout>
    </div>
  );
};

export default App;