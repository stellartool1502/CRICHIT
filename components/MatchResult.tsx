

import React, { useState, useMemo } from 'react';
import { Match } from '../types';
import { generateMatchSummary } from '../services/geminiService';

interface MatchResultProps {
  match: Match;
  onNewMatch: () => void;
}
const defaultTeamLogo = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0idy02IGgtNiI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMi4yNUE5Ljc1IDkuNzUgMCAxMCAyMS43NSAxMmE5Ljc1IDkuNzUgMCAwMC05Ljc1LTkuNzVabTAgMS41YTguMjUgOC4yNSAwIDEwMCAxNi41IDguMjUgOC4yNSAwIDAwMC0xNi41Wm0zLjM3MiAxMS40MjNhLjc1Ljc1IDAgMDAtMS4wNjEtMS4wNkwxMiAxMy4wNmw LTIuMzEyLTIuMzEyYS43NS43NSAwIDAwLTEuMDYgMS4wNkwxMC45NCAxMmwzLjQzMiAzLjQzM1oiIGNsaXAtcnVsZT0iZXZlbm9kZCIgLz4KPC9zdmc+Cg==`;
const defaultAvatar = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2E1YjRjYyI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTguNjg1IDE5LjA5N0E5LjcyMyA5LjcyMyAwIDAgMCAyMS43NSAxMmMwLTUuMzg1LTQuMzY1LTkuNzUtOS43NS05Ljc1UzIuMjUgNi42MTUgMi4yNSAxMmE5LjcyMyA5LjcyMyAwIDAgMCAzLjA2NSA3LjA5N0E5LjcxNiA5LjcxNiAwIDAgMCAxMiAyMS43NWE5LjcxNiA5LjcxNiAwIDAgMCA2LjY4NS0yLjY1M1ptLTEyLjU0LTEuMjg1QTcuNDg2IDcuNDg2IDAgMCAxIDEyIDE1YTcuNDg2IDcuNDg2IDAgMCAxIDUuODU1IDIuODEyQTguMjI0IDguMjI0IDAgMCAxIDEyIDIwLjI1YTguMjI0IDguMjI0IDAgMCAxLTUuODU1LTIuNDM4Wk0xNS43NSA5YTMuNzUgMy43NSAwIDEgMS03LjUgMCAzLjc1IDMuNzUgMCAwIDEgNy41IDBaIiBjbGlwLXJ1bge9ImV2ZW5vZGQiIC8+Cjwvc3ZnPgo=`;

const MatchResult: React.FC<MatchResultProps> = ({ match, onNewMatch }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const winner = useMemo(() => {
    const firstInning = match.innings[0]!;
    const secondInning = match.innings[1];

    if (!secondInning) {
        return "Match Incomplete";
    }

    if (secondInning.score >= match.target) {
      const wicketsLeft = 10 - secondInning.wickets;
      return `${secondInning.battingTeam} won by ${wicketsLeft} wickets`;
    } else if (firstInning.score > secondInning.score) {
      const runDifference = firstInning.score - secondInning.score;
      return `${firstInning.battingTeam} won by ${runDifference} runs`;
    } else {
      return "Match Tied";
    }
  }, [match]);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await generateMatchSummary(match);
      setSummary(result);
    } catch (err) {
      setError('Failed to generate summary. Please try again.');
      console.error(err);
    }
    setIsLoading(false);
  };

  const renderScorecard = (inning: any, title: string) => {
    const teamLogo = inning.battingTeam === match.teamA ? match.teamALogo : match.teamBLogo;
    return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center space-x-3 mb-2">
            <img src={teamLogo || defaultTeamLogo} alt={`${inning.battingTeam} logo`} className="w-10 h-10 rounded-full object-contain p-1 bg-gray-200 text-gray-400"/>
            <h3 className="text-xl font-bold text-teal-600">{title} - {inning.battingTeam}</h3>
        </div>
        <p className="text-2xl font-bold text-gray-800 mb-4">{inning.score}/{inning.wickets} <span className="font-semibold text-gray-500">({inning.overs}.{inning.balls} Overs)</span></p>
        <div className="space-y-2 text-sm text-gray-700">
            <h4 className="font-semibold">Top Batsmen</h4>
            {inning.batsmen.sort((a: any, b: any) => b.runs - a.runs).slice(0, 2).map((p: any) => (
                <p key={p.id}>{p.name}: <span className="font-bold">{p.runs}</span> ({p.balls})</p>
            ))}
             <h4 className="font-semibold mt-4">Top Bowlers</h4>
            {inning.bowlers.filter((b: any) => b.overs > 0 || b.balls > 0).sort((a: any, b: any) => b.wickets - a.wickets).slice(0, 2).map((p: any) => (
                <p key={p.id}>{p.name}: <span className="font-bold">{p.wickets}/{p.runsConceded}</span></p>
            ))}
        </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-center text-gray-800 uppercase tracking-wider mb-4">Match Result</h1>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center mb-6">
            <p className="text-2xl md:text-3xl font-bold text-teal-600">{winner}</p>
        </div>
        
        {match.manOfTheMatch && (
            <div className="bg-yellow-50 rounded-xl shadow-lg border-2 border-yellow-400 p-6 text-center mb-8">
                <h2 className="text-lg font-bold text-yellow-800 uppercase tracking-wider">Man of the Match</h2>
                <div className="flex items-center justify-center space-x-4 mt-4">
                    <img src={match.manOfTheMatch.photoUrl || defaultAvatar} alt={match.manOfTheMatch.name} className="w-16 h-16 rounded-full object-cover bg-gray-200 ring-2 ring-yellow-500" />
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{match.manOfTheMatch.name}</p>
                        <p className="text-md text-gray-600">{match.manOfTheMatch.teamName}</p>
                    </div>
                </div>
            </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
            {match.innings[0] && renderScorecard(match.innings[0], '1st Innings')}
            {match.innings[1] && renderScorecard(match.innings[1], '2nd Innings')}
        </div>

        <div className="flex justify-center items-center gap-4">
            <button
                onClick={handleGenerateSummary}
                disabled={isLoading}
                className="px-8 py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 disabled:bg-gray-400 transition-colors"
            >
                {isLoading ? 'Generating...' : 'Generate AI Summary'}
            </button>
             <button
                onClick={onNewMatch}
                className="px-8 py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 transition-colors"
            >
                New Match
            </button>
        </div>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {summary && (
            <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-teal-600 mb-4">AI Summary</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default MatchResult;