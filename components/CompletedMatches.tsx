import React, { useState, useEffect } from 'react';
import { Match, LiveMatch } from '../types';
import { getCompletedMatches } from '../services/completedMatchService';
import { getLiveMatches } from '../services/liveMatchService';
import MatchCard from './MatchCard';

interface CompletedMatchesProps {
  onBack: () => void;
}

const defaultTeamLogo = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0idy02IGgtNiI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMi4yNUE5Ljc1IDkuNzUgMCAxMCAyMS43NSAxMmE5Ljc1IDkuNzUgMCAwMC05Ljc1LTkuNzVabTAgMS41YTguMjUgOC4yNSAwIDEwMCAxNi41IDguMjUgOC4yNSAwIDAwMC0xNi41Wm0zLjM3MiAxMS40MjNhLjc1Ljc1IDAgMDAtMS4wNjEtMS4wNkwxMiAxMy4wNmw LTIuMzEyLTIuMzEyYS43NS43NSAwIDAwLTEuMDYgMS4wNkwxMC45NCAxMmwzLjQzMiAzLjQzM1oiIGNsaXAtcnVsZT0iZXZlbm9kZCIgLz4KPC9zdmc+Cg==`;

const CompletedMatchCard: React.FC<{ match: Match }> = ({ match }) => {
    const firstInning = match.innings[0];
    const secondInning = match.innings[1];
    
    let winner = 'Match Tied';
    if (secondInning && secondInning.score >= match.target) {
      const wicketsLeft = match.playersPerTeam - 1 - secondInning.wickets;
      winner = `${secondInning.battingTeam} won by ${wicketsLeft} ${wicketsLeft === 1 ? 'wicket' : 'wickets'}`;
    } else if (firstInning && secondInning && firstInning.score > secondInning.score) {
      const runDifference = firstInning.score - secondInning.score;
      winner = `${firstInning.battingTeam} won by ${runDifference} ${runDifference === 1 ? 'run' : 'runs'}`;
    }

    const teamAScore = firstInning.battingTeam === match.teamA ? `${firstInning.score}/${firstInning.wickets}` : (secondInning && secondInning.battingTeam === match.teamA ? `${secondInning.score}/${secondInning.wickets}` : '-');
    const teamBScore = firstInning.battingTeam === match.teamB ? `${firstInning.score}/${firstInning.wickets}` : (secondInning && secondInning.battingTeam === match.teamB ? `${secondInning.score}/${secondInning.wickets}` : '-');


    return (
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
                <p className="text-xs text-gray-500">{new Date(parseInt(match.id.split('_')[1])).toLocaleDateString()}</p>
                <p className="text-xs font-bold text-white bg-teal-600 px-2 py-0.5 rounded-full">COMPLETED</p>
            </div>
            <div className="text-center mb-3">
                <p className="font-bold text-teal-600">{winner}</p>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex flex-col items-center text-center">
                    <img src={match.teamALogo || defaultTeamLogo} alt={match.teamA} className="w-12 h-12 rounded-full object-contain p-1 bg-gray-100 mb-1" />
                    <p className="font-semibold text-sm">{match.teamA}</p>
                    <p className="text-xs text-gray-600">{teamAScore}</p>
                </div>
                <p className="text-2xl font-bold text-gray-400">VS</p>
                <div className="flex flex-col items-center text-center">
                     <img src={match.teamBLogo || defaultTeamLogo} alt={match.teamB} className="w-12 h-12 rounded-full object-contain p-1 bg-gray-100 mb-1" />
                    <p className="font-semibold text-sm">{match.teamB}</p>
                     <p className="text-xs text-gray-600">{teamBScore}</p>
                </div>
            </div>
            {match.manOfTheMatch && (
                <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                    <p className="text-xs text-yellow-700 font-bold">MAN OF THE MATCH</p>
                    <p className="text-sm font-semibold text-gray-800">{match.manOfTheMatch.name}</p>
                </div>
            )}
        </div>
    );
};

const transformMatchToLiveMatch = (match: Match): LiveMatch => {
    const firstInning = match.innings[0];
    const secondInning = match.innings[1];
    
    let teamA = match.teamA;
    let teamB = match.teamB;
    let scoreA = "Yet to bat";
    let overs = "0.0";
    let scoreB = "Yet to bat";
    let status = `${match.toss.winner} won the toss and elected to ${match.toss.decision}`;

    if (firstInning) {
        if (firstInning.battingTeam === teamA) {
            scoreA = `${firstInning.score}/${firstInning.wickets}`;
            overs = `${firstInning.overs}.${firstInning.balls}`;
        } else {
            scoreB = `${firstInning.score}/${firstInning.wickets}`;
            overs = `${firstInning.overs}.${firstInning.balls}`;
        }
        status = `${firstInning.battingTeam} are ${firstInning.score}/${firstInning.wickets}`;
    }
    
    if(secondInning) {
         if (secondInning.battingTeam === teamA) {
            scoreA = `${secondInning.score}/${secondInning.wickets}`;
            overs = `${secondInning.overs}.${secondInning.balls}`;
        } else {
            scoreB = `${secondInning.score}/${secondInning.wickets}`;
            overs = `${secondInning.overs}.${secondInning.balls}`;
        }
        const remainingRuns = match.target - secondInning.score;
        const totalBalls = match.overs * 6;
        const ballsBowled = secondInning.overs * 6 + secondInning.balls;
        const remainingBalls = totalBalls - ballsBowled;
        if(remainingRuns > 0 && remainingBalls > 0) {
            status = `${secondInning.battingTeam} need ${remainingRuns} runs in ${remainingBalls} balls.`;
        }
    }

    return {
        id: match.id,
        tournament: match.tournamentId ? 'Tournament' : 'Local Match',
        details: `${match.overs} Over Match`,
        teamA: teamA,
        teamB: teamB,
        teamALogo: match.teamALogo,
        teamBLogo: match.teamBLogo,
        scoreA: scoreA,
        overs: overs,
        scoreB: scoreB,
        status: status,
        distance: '',
    };
};


const CompletedMatches: React.FC<CompletedMatchesProps> = ({ onBack }) => {
  const [completedMatches, setCompletedMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      try {
        const [completed, live] = await Promise.all([
            getCompletedMatches(),
            getLiveMatches()
        ]);
        setCompletedMatches(completed.sort((a, b) => parseInt(b.id.split('_')[1]) - parseInt(a.id.split('_')[1])));
        setLiveMatches(live.map(transformMatchToLiveMatch));
      } catch(error) {
        console.error("Failed to load match history:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, []);

  const renderOngoingMatches = () => {
    if (liveMatches.length === 0) {
      return (
        <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md border border-gray-200">
          <p className="text-gray-500">No ongoing matches found. Start a new match to see it here.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {liveMatches.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    );
  };
  
  const renderCompletedMatches = () => {
     if (completedMatches.length === 0) {
      return (
        <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md border border-gray-200">
          <p className="text-gray-500">No completed matches found. Finish a match to see its result here.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {completedMatches.map(match => (
          <CompletedMatchCard key={match.id} match={match} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Match History</h1>
        </div>
        
        {loading ? (
            <p className="text-center text-gray-500 mt-8">Loading match history...</p>
        ) : (
            <div className="space-y-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b-2 border-teal-500">Ongoing Matches ({liveMatches.length})</h2>
                    {renderOngoingMatches()}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b-2 border-gray-300">Completed Matches ({completedMatches.length})</h2>
                    {renderCompletedMatches()}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default CompletedMatches;
