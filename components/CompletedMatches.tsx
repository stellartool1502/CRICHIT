import React, { useState, useEffect } from 'react';
import { Match } from '../types';
import { getCompletedMatches } from '../services/completedMatchService';

interface CompletedMatchesProps {
  onBack: () => void;
}

const defaultTeamLogo = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0idy02IGgtNiI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMi4yNUE5Ljc1IDkuNzUgMCAxMCAyMS43NSAxMmE5Ljc1IDkuNzUgMCAwMC05Ljc1LTkuNzVabTAgMS41YTguMjUgOC4yNSAwIDEwMCAxNi41IDguMjUgOC4yNSAwIDAwMC0xNi41Wm0zLjM3MiAxMS40MjNhLjc1Ljc1IDAgMDAtMS4wNjEtMS4wNkwxMiAxMy4wNmw LTIuMzEyLTIuMzEyYS43NS43NSAwIDAwLTEuMDYgMS4wNkwxMC55NCAxMmwzLjQzMiAzLjQzM1oiIGNsaXAtcnVsZT0iZXZlbm9kZCIgLz4KPC9zdmc+Cg==`;

const CompletedMatchCard: React.FC<{ match: Match }> = ({ match }) => {
    const firstInning = match.innings[0];
    const secondInning = match.innings[1];
    
    let winner = 'Match Tied';
    if (secondInning.score >= match.target) {
      const wicketsLeft = 10 - secondInning.wickets;
      winner = `${secondInning.battingTeam} won by ${wicketsLeft} wickets`;
    } else if (firstInning.score > secondInning.score) {
      const runDifference = firstInning.score - secondInning.score;
      winner = `${firstInning.battingTeam} won by ${runDifference} runs`;
    }

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
                    <p className="text-xs text-gray-600">
                        {firstInning.battingTeam === match.teamA ? `${firstInning.score}/${firstInning.wickets}` : `${secondInning.score}/${secondInning.wickets}`}
                    </p>
                </div>
                <p className="text-2xl font-bold text-gray-400">VS</p>
                <div className="flex flex-col items-center text-center">
                     <img src={match.teamBLogo || defaultTeamLogo} alt={match.teamB} className="w-12 h-12 rounded-full object-contain p-1 bg-gray-100 mb-1" />
                    <p className="font-semibold text-sm">{match.teamB}</p>
                     <p className="text-xs text-gray-600">
                        {firstInning.battingTeam === match.teamB ? `${firstInning.score}/${firstInning.wickets}` : `${secondInning.score}/${secondInning.wickets}`}
                    </p>
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

const CompletedMatches: React.FC<CompletedMatchesProps> = ({ onBack }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      const completedMatches = await getCompletedMatches();
      setMatches(completedMatches.sort((a, b) => parseInt(b.id.split('_')[1]) - parseInt(a.id.split('_')[1])));
      setLoading(false);
    };
    loadMatches();
  }, []);

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
        <div className="space-y-4">
          {loading && <p>Loading match history...</p>}
          {!loading && matches.length === 0 && (
            <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md border border-gray-200">
              <p className="text-gray-500">No completed matches found. Finish a match to see it here!</p>
            </div>
          )}
          {!loading && (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {matches.map(match => (
                  <CompletedMatchCard key={match.id} match={match} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletedMatches;