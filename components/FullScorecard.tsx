import React, { useMemo } from 'react';
import { Match, Inning, Player, Bowler, PlayerSpecialty } from '../types';

interface FullScorecardProps {
  match: Match;
  onClose: () => void;
}

const defaultAvatar = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2E1YjRjYyI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTguNjg1IDE5LjA5N0E5LjcyMyA5LjcyMyAwIDAgMCAyMS43NSAxMmMwLTUuMzg1LTQuMzY1LTkuNzUtOS43NS05Ljc1UzIuMjUgNi42MTUgMi4yNSAxMmE5LjcyMyA5LjcyMyAwIDAgMCAzLjA2NSA3LjA5N0E5LjcxNiA5LjcxNiAwIDAgMCAxMiAyMS43NWE5LjcxNiA5LjcxNiAwIDAgMCA2LjY4NS0yLjY1M1ptLTEyLjU0LTEuMjg1QTcuNDg2IDcuNDg2IDAgMCAxIDEyIDE1YTcuNDg2IDcuNDg2IDAgMCAxIDUuODU1IDIuODEyQTguMjI0IDguMjI0IDAgMCAxIDEyIDIwLjI1YTguMjI0IDguMjI0IDAgMCAxLTUuODU1LTIuNDM4Wk0xNS43NSA5YTMuNzUgMy43NSAwIDEgMS03LjUgMCAzLjc1IDMuNzUgMCAwIDEgNy41IDBaIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIC8+Cjwvc3ZnPgo=`;
const defaultTeamLogo = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0idy02IGgtNiI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMi4yNUE5Ljc1IDkuNzUgMCAxMCAyMS43NSAxMmE5Ljc1IDkuNzUgMCAwMC05Ljc1LTkuNzVabTAgMS41YTguMjUgOC4yNSAwIDEwMCAxNi41IDguMjUgOC4yNSAwIDAwMC0xNi41Wm0zLjM3MiAxMS40MjNhLjc1Ljc1IDAgMDAtMS4wNjEtMS4wNkwxMiAxMy4wNmw LTIuMzEyLTIuMzEyYS43NS43NSAwIDAwLTEuMDYgMS4wNkwxMC45NCAxMmwzLjQzMiAzLjQzM1oiIGNsaXAtcnVsZT0iZXZlbm9kZCIgLz4KPC9zdmc+Cg==`;

const PlayerNameCell: React.FC<{ player: Player | Bowler }> = ({ player }) => {
    const roles: string[] = [];
    if (player.isCaptain) roles.push('C');
    if (player.isViceCaptain) roles.push('VC');
    if (player.isWicketKeeper) roles.push('WK');
    if (player.specialty) {
        roles.push(player.specialty);
    }
    
    return (
        <>
            <span>{player.name}</span>
            {roles.length > 0 && <span className="ml-2 text-xs font-bold text-gray-500">({roles.join(', ')})</span>}
        </>
    );
};

const StarIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 ml-1 inline-block" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


const InningDetails: React.FC<{ inning: Inning, inningNum: number, match: Match }> = ({ inning, inningNum, match }) => {
    const didNotBat = inning.batsmen.filter(p => p.balls === 0 && !p.isOut);
    const totalExtras = inning.extras.wides + inning.extras.noBalls + inning.extras.byes + inning.extras.legByes;
    const teamLogo = inning.battingTeam === match.teamA ? match.teamALogo : match.teamBLogo;

    const topBatsman = useMemo(() => {
        const battingPerformers = inning.batsmen.filter(p => p.balls > 0 || p.isOut);
        if (battingPerformers.length === 0) return null;
        return battingPerformers.reduce((prev, current) => (current.runs > prev.runs) ? current : prev);
    }, [inning.batsmen]);

    const topBowler = useMemo(() => {
        const bowlingPerformers = inning.bowlers.filter(b => b.overs > 0 || b.balls > 0);
        if (bowlingPerformers.length === 0) return null;
        return bowlingPerformers.reduce((prev, current) => {
            if (current.wickets > prev.wickets) return current;
            if (current.wickets === prev.wickets && current.runsConceded < prev.runsConceded) return current;
            return prev;
        });
    }, [inning.bowlers]);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center space-x-3">
                    <img src={teamLogo || defaultTeamLogo} alt={`${inning.battingTeam} logo`} className="w-12 h-12 rounded-full object-contain p-1 bg-gray-200 text-gray-400" />
                    <h2 className="text-2xl font-bold text-teal-600">{inning.battingTeam}</h2>
                </div>
                <p className="text-2xl font-black text-gray-800">{inning.score}/{inning.wickets} <span className="text-lg font-semibold text-gray-500">({inning.overs}.{inning.balls} Ov)</span></p>
            </div>

            {/* Batting Table */}
            <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-200 text-gray-600 uppercase tracking-wider text-xs">
                        <tr>
                            <th className="p-3">Batsman</th>
                            <th className="p-3">Dismissal</th>
                            <th className="p-3 text-center">R</th>
                            <th className="p-3 text-center">B</th>
                            <th className="p-3 text-center">4s</th>
                            <th className="p-3 text-center">6s</th>
                            <th className="p-3 text-right">SR</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {inning.batsmen.map(p => (
                            (p.balls > 0 || p.isOut) ? (
                            <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="p-2 font-semibold">
                                    <div className="flex items-center space-x-3">
                                        <img src={p.photoUrl || defaultAvatar} alt={p.name} className="w-8 h-8 rounded-full object-cover bg-gray-200" />
                                        <span className="flex items-center">
                                            <PlayerNameCell player={p} />
                                            {topBatsman && p.id === topBatsman.id && p.runs > 0 && <StarIcon />}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-2 text-gray-500 text-xs">{p.isOut ? p.outBy : 'not out'}</td>
                                <td className="p-2 text-center font-bold">{p.runs}</td>
                                <td className="p-2 text-center">{p.balls}</td>
                                <td className="p-2 text-center">{p.fours}</td>
                                <td className="p-2 text-center">{p.sixes}</td>
                                <td className="p-2 text-right">{(p.balls > 0 ? (p.runs / p.balls * 100) : 0).toFixed(2)}</td>
                            </tr>
                            ) : null
                        ))}
                    </tbody>
                </table>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">Extras: {totalExtras} (wd {inning.extras.wides}, nb {inning.extras.noBalls}, b {inning.extras.byes}, lb {inning.extras.legByes})</p>
            
            {didNotBat.length > 0 && (
                <p className="text-sm text-gray-600">Did Not Bat: {didNotBat.map(p => p.name).join(', ')}</p>
            )}

             {/* Fall of Wickets */}
            <div className="mt-4">
                <h4 className="font-semibold text-gray-600 mb-2 text-sm uppercase tracking-wider">Fall of Wickets</h4>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
                    {inning.fallOfWickets.map((fow, index) => (
                        <span key={index}>
                            <span className="font-bold">{fow.score}-{fow.wicket}</span>
                            <span className="text-gray-500"> ({fow.batsmanName}, {fow.over} ov)</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Bowling Table */}
            <div className="overflow-x-auto mt-6">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-gray-200 text-gray-600 uppercase tracking-wider text-xs">
                        <tr>
                            <th className="p-3">Bowler</th>
                            <th className="p-3 text-center">O</th>
                            <th className="p-3 text-center">M</th>
                            <th className="p-3 text-center">R</th>
                            <th className="p-3 text-center">W</th>
                            <th className="p-3 text-right">Econ</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {inning.bowlers.filter(b => b.overs > 0 || b.balls > 0).map(b => {
                            const totalBallsBowled = b.overs * 6 + b.balls;
                            const economy = totalBallsBowled > 0 ? (b.runsConceded / totalBallsBowled * 6).toFixed(2) : '0.00';
                            return (
                                <tr key={b.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="p-2 font-semibold">
                                        <div className="flex items-center space-x-3">
                                            <img src={b.photoUrl || defaultAvatar} alt={b.name} className="w-8 h-8 rounded-full object-cover bg-gray-200" />
                                             <span className="flex items-center">
                                                <PlayerNameCell player={b} />
                                                {topBowler && b.id === topBowler.id && b.wickets > 0 && <StarIcon />}
                                             </span>
                                        </div>
                                    </td>
                                    <td className="p-2 text-center">{b.overs}.{b.balls}</td>
                                    <td className="p-2 text-center">{b.maidens}</td>
                                    <td className="p-2 text-center">{b.runsConceded}</td>
                                    <td className="p-2 text-center font-bold">{b.wickets}</td>
                                    <td className="p-2 text-right">{economy}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

const FullScorecard: React.FC<FullScorecardProps> = ({ match, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-100 z-50 p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-100 py-4 z-10 border-b border-gray-200">
            <h1 className="text-3xl font-black text-teal-600">Full Scorecard</h1>
            <button onClick={onClose} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors">
                Back to Scoring
            </button>
        </div>
        
        {match.innings[0] && <InningDetails inning={match.innings[0]} inningNum={1} match={match} />}
        {match.innings[1] && <InningDetails inning={match.innings[1]} inningNum={2} match={match} />}

      </div>
    </div>
  );
};

export default FullScorecard;