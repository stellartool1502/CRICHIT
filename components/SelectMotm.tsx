import React, { useState } from 'react';
import { Match, Player } from '../types';

interface SelectMotmProps {
  match: Match;
  onSelect: (motm: { name: string; photoUrl: string | null; teamName: string; }) => void;
}

const defaultAvatar = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2E1YjRjYyI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTguNjg1IDE5LjA5N0E5LjcyMyA5LjcyMyAwIDAgMCAyMS43NSAxMmMwLTUuMzg1LTQuMzY1LTkuNzUtOS43NS05Ljc1UzIuMjUgNi42MTUgMi4yNSAxMmE5LjcyMyA5LjcyMyAwIDAgMCAzLjA2NSA3LjA5N0E5LjcxNiA5LjcxNiAwIDAgMCAxMiAyMS43NWE5LjcxNiA5LjcxNiAwIDAgMCA2LjY4NS0yLjY1M1ptLTEyLjU0LTEuMjg1QTcuNDg2IDcuNDg2IDAgMCAxIDEyIDE1YTcuNDg2IDcuNDg2IDAgMCAxIDUuODU1IDIuODEyQTguMjI0IDguMjI0IDAgMCAxIDEyIDIwLjI1YTguMjI0IDguMjI0IDAgMCAxLTUuODU1LTIuNDM4Wk0xNS43NSA5YTMuNzUgMy43NSAwIDEgMS03LjUgMCAzLjc1IDMuNzUgMCAwIDEgNy41IDBaIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIC8+Cjwvc3ZnPgo=`;

const PlayerCard: React.FC<{ player: Player | any; teamName: string; isSelected: boolean; onSelect: () => void; }> = ({ player, teamName, isSelected, onSelect }) => {
  const battingStats = player.runs !== undefined ? `${player.runs} (${player.balls})` : null;
  const bowlingStats = player.wickets !== undefined ? `${player.wickets}/${player.runsConceded}` : null;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${isSelected ? 'bg-teal-50 border-teal-500 shadow-md' : 'bg-white border-gray-200 hover:border-teal-400'}`}
    >
      <div className="flex items-center space-x-4">
        <img src={player.photoUrl || defaultAvatar} alt={player.name} className="w-12 h-12 rounded-full object-cover bg-gray-200 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-gray-800">{player.name}</p>
          <p className="text-xs text-gray-500">{teamName}</p>
        </div>
        <div className="text-right text-sm">
          {battingStats && <p className="font-semibold">{battingStats}</p>}
          {bowlingStats && <p className="font-semibold">{bowlingStats}</p>}
        </div>
      </div>
    </button>
  );
};

const SelectMotm: React.FC<SelectMotmProps> = ({ match, onSelect }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<{ name: string; photoUrl: string | null; teamName: string; } | null>(null);

  const allPlayers = [
    ...match.innings[0].batsmen.map(p => ({ ...p, teamName: match.innings[0].battingTeam })),
    ...match.innings[0].bowlers.map(b => ({ ...b, teamName: match.innings[0].bowlingTeam })),
    ...match.innings[1].batsmen.map(p => ({ ...p, teamName: match.innings[1].battingTeam })),
    ...match.innings[1].bowlers.map(b => ({ ...b, teamName: match.innings[1].bowlingTeam })),
  ];

  // Consolidate stats for players who both batted and bowled
  const consolidatedPlayers = allPlayers.reduce((acc, player) => {
    const existing = acc.find(p => p.name === player.name);
    if (existing) {
      Object.assign(existing, player);
    } else {
      acc.push(player);
    }
    return acc;
  }, [] as any[]);

  const handleConfirm = () => {
    if (selectedPlayer) {
      onSelect(selectedPlayer);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-3xl font-black text-center text-teal-600 uppercase tracking-wider mb-2">Select Man of the Match</h1>
        <p className="text-center text-gray-600 mb-6">Choose the player with the most impactful performance.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto p-2 bg-gray-50 rounded-lg">
          {consolidatedPlayers
            .filter(p => p.runs > 0 || p.wickets > 0)
            .sort((a,b) => (b.runs || 0) - (a.runs || 0))
            .map((player, index) => (
            <PlayerCard
              key={`${player.name}-${index}`}
              player={player}
              teamName={player.teamName}
              isSelected={selectedPlayer?.name === player.name}
              onSelect={() => setSelectedPlayer({ name: player.name, photoUrl: player.photoUrl, teamName: player.teamName })}
            />
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedPlayer}
          className="w-full mt-8 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Confirm Man of the Match
        </button>
      </div>
    </div>
  );
};

export default SelectMotm;