import React from 'react';
import { Match, Player, Bowler } from '../types';

interface ScoreboardProps {
  match: Match;
}

const defaultAvatar = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2E1YjRjYyI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTguNjg1IDE5LjA5N0E5LjcyMyA5LjcyMyAwIDAgMCAyMS43NSAxMmMwLTUuMzg1LTQuMzY1LTkuNzUtOS43NS05Ljc1UzIuMjUgNi42MTUgMi4yNSAxMmE5LjcyMyA5LjcyMyAwIDAgMCAzLjA2NSA3LjA5N0E5LjcxNiA5LjcxNiAwIDAgMCAxMiAyMS43NWE5LjcxNiA5LjcxNiAwIDAgMCA2LjY4NS0yLjY1M1ptLTEyLjU0LTEuMjg1QTcuNDg2IDcuNDg2IDAgMCAxIDEyIDE1YTcuNDg2IDcuNDg2IDAgMCAxIDUuODU1IDIuODEyQTguMjI0IDguMjI0IDAgMCAxIDEyIDIwLjI1YTguMjI0IDguMjI0IDAgMCAxLTUuODU1LTIuNDM4Wk0xNS43NSA5YTMuNzUgMy43NSAwIDEgMS03LjUgMCAzLjc1IDMuNzUgMCAwIDEgNy41IDBaIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIC8+Cjwvc3ZnPgo=`;
const defaultTeamLogo = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0idy02IGgtNiI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMi4yNUE5Ljc1IDkuNzUgMCAxMCAyMS43NSAxMmE5Ljc1IDkuNzUgMCAwMC05Ljc1LTkuNzVabTAgMS41YTguMjUgOC4yNSAwIDEwMCAxNi41IDguMjUgOC4yNSAwIDAwMC0xNi41Wm0zLjM3MiAxMS40MjNhLjc1Ljc1IDAgMDAtMS4wNjEtMS4wNkwxMiAxMy4wNmw LTIuMzEyLTIuMzEyYS43NS43NSAwIDAwLTEuMDYgMS4wNkwxMC45NCAxMmwzLjQzMiAzLjQzM1oiIGNsaXAtcnVsZT0iZXZlbm9kZCIgLz4KPC9zdmc+Cg==`;

const Scoreboard: React.FC<ScoreboardProps> = ({ match }) => {
  if (!match) return null;
  const currentInning = match.innings[match.currentInning];
  if (!currentInning) return null;

  const totalBalls = currentInning.overs * 6 + currentInning.balls;
  const crr = totalBalls > 0 ? ((currentInning.score / totalBalls) * 6).toFixed(2) : '0.00';
  
  let rrr = 'N/A';
  if(match.currentInning === 1 && match.target > 0) {
      const remainingRuns = match.target - currentInning.score;
      const remainingBalls = (match.overs * 6) - totalBalls;
      rrr = remainingBalls > 0 && remainingRuns > 0 ? ((remainingRuns / remainingBalls) * 6).toFixed(2) : '0.00';
  }

  const topBatsmen = currentInning.batsmen
    .filter(p => p.runs > 0 || p.balls > 0)
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 3);

  const topBowlers = currentInning.bowlers
    .filter(b => b.overs > 0 || b.balls > 0)
    .sort((a, b) => {
        if (b.wickets !== a.wickets) return b.wickets - a.wickets;
        return a.runsConceded - b.runsConceded;
    })
    .slice(0, 3);
  
  const battingTeamLogo = currentInning.battingTeam === match.teamA ? match.teamALogo : match.teamBLogo;

  return (
    <header className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      {/* Main Score Display */}
      <div className="flex justify-between items-center">
        <div className="flex-1 text-center">
            <div className="flex items-center justify-center space-x-3 mb-1">
                <img src={battingTeamLogo || defaultTeamLogo} alt={`${currentInning.battingTeam} logo`} className="w-10 h-10 rounded-full object-contain p-1 bg-gray-200 text-gray-400"/>
                <p className="text-sm text-gray-500">{currentInning.battingTeam} Batting</p>
            </div>
            <p className="text-4xl md:text-5xl font-black tracking-tighter text-gray-800">
                {currentInning.score}
                <span className="text-3xl font-bold text-gray-600">/{currentInning.wickets}</span>
            </p>
            <p className="text-lg font-semibold text-gray-700">{currentInning.overs}.{currentInning.balls} Overs</p>
        </div>
        <div className="w-px bg-gray-200 h-20 mx-4"></div>
        <div className="flex-1 text-center space-y-1">
             <p className="text-md"><span className="font-semibold text-gray-500">CRR:</span> <span className="text-xl font-bold text-teal-600">{crr}</span></p>
            {match.currentInning === 1 && (
                <>
                 <p className="text-md"><span className="font-semibold text-gray-500">Target:</span> <span className="text-xl font-bold text-gray-800">{match.target}</span></p>
                 <p className="text-md"><span className="font-semibold text-gray-500">RRR:</span> <span className="text-xl font-bold text-red-600">{rrr}</span></p>
                </>
            )}
        </div>
      </div>

      {/* Top Performers Display */}
      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <h4 className="text-md font-bold text-teal-700 mb-2 text-center md:text-left">Top Batsmen</h4>
            <div className="space-y-3 text-sm text-center md:text-left">
                {topBatsmen.length > 0 ? topBatsmen.map(p => {
                    const strikeRate = p.balls > 0 ? ((p.runs / p.balls) * 100).toFixed(1) : '0.0';
                    return (
                        <div key={p.id} className="flex items-center space-x-3 justify-center md:justify-start">
                            <img src={p.photoUrl || defaultAvatar} alt={p.name} className="w-10 h-10 rounded-full object-cover bg-gray-200 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-800">{p.name}</p>
                                <p className="text-gray-600 text-xs">
                                    <span className="font-bold text-base text-gray-900">{p.runs}</span> ({p.balls})
                                    <span className="mx-2 text-gray-400">|</span>
                                    4s: <span className="font-semibold">{p.fours}</span>, 6s: <span className="font-semibold">{p.sixes}</span>
                                    <span className="mx-2 text-gray-400">|</span>
                                    SR: <span className="font-semibold">{strikeRate}</span>
                                </p>
                            </div>
                        </div>
                    )
                }) : <p className="text-gray-500">No batsmen yet.</p>}
            </div>
        </div>
        <div>
            <h4 className="text-md font-bold text-teal-700 mb-2 text-center md:text-left">Top Bowlers</h4>
            <div className="space-y-3 text-sm text-center md:text-left">
                 {topBowlers.length > 0 ? topBowlers.map(b => {
                    const totalBallsBowled = b.overs * 6 + b.balls;
                    const economy = totalBallsBowled > 0 ? ((b.runsConceded / totalBallsBowled) * 6).toFixed(2) : '0.00';
                    return (
                        <div key={b.id} className="flex items-center space-x-3 justify-center md:justify-start">
                            <img src={b.photoUrl || defaultAvatar} alt={b.name} className="w-10 h-10 rounded-full object-cover bg-gray-200 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-800">{b.name}</p>
                                <p className="text-gray-600 text-xs">
                                    <span className="font-bold text-base text-gray-900">{b.wickets}/{b.runsConceded}</span> ({b.overs}.{b.balls})
                                    <span className="mx-2 text-gray-400">|</span>
                                    Econ: <span className="font-semibold">{economy}</span>
                                </p>
                            </div>
                        </div>
                    )
                 }) : <p className="text-gray-500">No bowlers yet.</p>}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Scoreboard;