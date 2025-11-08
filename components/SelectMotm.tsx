import React, { useState, useMemo, useEffect } from 'react';
import { Match, PlayerPerformance, PlayerSpecialty } from '../types';
import { autoSelectManOfTheMatch } from '../services/motmService';

interface SelectMotmProps {
  match: Match;
  onSelect: (motm: { name: string; photoUrl: string | null; teamName: string; }) => void;
  onBack: () => void;
}

const defaultAvatar = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2E1YjRjYyI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTguNjg1IDE5LjA5N0E5LjcyMyA5LjcyMyAwIDAgMCAyMS43NSAxMmMwLTUuMzg1LTQuMzY1LTkuNzUtOS43NS05Ljc1UzIuMjUgNi42MTUgMi4yNSAxMmE5LjcyMyA5LjcyMyAwIDAgMCAzLjA2NSA3LjA5N0E5LjcxNiA5LjcxNiAwIDAgMCAxMiAyMS43NWE5LjcxNiA5LjcxNiAwIDAgMCA2LjY4NS0yLjY1M1ptLTEyLjU0LTEuMjg1QTcuNDg2IDcuNDg2IDAgMCAxIDEyIDE1YTcuNDg2IDcuNDg2IDAgMCAxIDUuODU1IDIuODEyQTguMjI0IDguMjI0IDAgMCAxIDEyIDIwLjI1YTguMjI0IDguMjI0IDAgMCAxLTUuODU1LTIuNDM4Wk0xNS43NSA5YTMuNzUgMy43NSAwIDEgMS03LjUgMCAzLjc1IDMuNzUgMCAwIDEgNy41IDBaIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIC8+Cjwvc3ZnPgo=`;

const PlayerCard: React.FC<{ player: PlayerPerformance; isSelected: boolean; onSelect: () => void; }> = ({ player, isSelected, onSelect }) => {
  const roles: string[] = [];
  if (player.isCaptain) roles.push('C');
  if (player.isViceCaptain) roles.push('VC');
  if (player.isWicketKeeper) roles.push('WK');
  if (player.specialty) {
      roles.push(player.specialty);
  }

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${isSelected ? 'bg-teal-50 border-teal-500 shadow-md' : 'bg-white border-gray-200 hover:border-teal-400'}`}
    >
      <div className="flex items-center space-x-4">
        <img src={player.photoUrl || defaultAvatar} alt={player.name} className="w-12 h-12 rounded-full object-cover bg-gray-200 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-gray-800 flex items-center">
            {player.name}
            {roles.length > 0 && <span className="ml-1 text-xs font-bold text-gray-500">({roles.join(', ')})</span>}
          </p>
          <p className="text-xs text-gray-500">{player.teamName}</p>
        </div>
        <div className="text-right text-sm">
          {player.performanceSummary && <p className="font-semibold">{player.performanceSummary}</p>}
        </div>
      </div>
    </button>
  );
};

const SelectMotm: React.FC<SelectMotmProps> = ({ match, onSelect, onBack }) => {
  const [isManualOverride, setManualOverride] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{ name: string; photoUrl: string | null; teamName: string; } | null>(null);

  const motmResult = useMemo(() => autoSelectManOfTheMatch(match), [match]);
  const autoSelectedPlayer = motmResult;
  const manualSelectionCandidates = motmResult.allCandidates;

  // Auto-select the top player by default
  useEffect(() => {
    if (autoSelectedPlayer && !isManualOverride) {
      setSelectedPlayer({
        name: autoSelectedPlayer.name,
        photoUrl: autoSelectedPlayer.photoUrl,
        teamName: autoSelectedPlayer.teamName,
      });
    }
  }, [autoSelectedPlayer, isManualOverride]);

  const handleConfirm = () => {
    if (selectedPlayer) {
      onSelect(selectedPlayer);
    }
  };

  if (isManualOverride) {
    // Render manual selection UI
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h1 className="text-3xl font-black text-center text-teal-600 uppercase tracking-wider mb-2">Select Man of the Match</h1>
                <p className="text-center text-gray-600 mb-6">Choose the player with the most impactful performance.</p>
        
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto p-2 bg-gray-50 rounded-lg">
                {manualSelectionCandidates.map((player, index) => (
                    <PlayerCard
                    key={`${player.name}-${index}`}
                    player={player}
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
                <button onClick={() => setManualOverride(false)} className="mt-4 text-gray-500 hover:text-gray-800 text-sm w-full text-center">
                    &larr; Back to Auto-Select
                </button>
            </div>
        </div>
    );
  }

  // Render auto-selection UI
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
        <h1 className="text-3xl font-black text-teal-600 uppercase tracking-wider mb-2">Man of the Match</h1>
        <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wider mb-6">Performance Pick</p>

        {autoSelectedPlayer && (
          <div className="flex flex-col items-center">
            <img src={autoSelectedPlayer.photoUrl || defaultAvatar} alt={autoSelectedPlayer.name} className="w-24 h-24 rounded-full object-cover bg-gray-200 ring-4 ring-teal-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">{autoSelectedPlayer.name}</h2>
            <p className="text-md text-gray-500">{autoSelectedPlayer.teamName}</p>
            <p className="mt-2 text-lg font-semibold text-teal-600">{autoSelectedPlayer.performanceSummary}</p>
          </div>
        )}

        <button
          onClick={handleConfirm}
          className="w-full mt-8 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
        >
          Confirm & Finish Match
        </button>
        <div className="mt-4 flex items-center justify-center space-x-4">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-sm">
                &larr; Back to Scoring
            </button>
            <div className="h-4 w-px bg-gray-300"></div>
            <button onClick={() => setManualOverride(true)} className="text-sm font-semibold text-blue-600 hover:text-blue-500">
                Override & Select Manually
            </button>
        </div>
      </div>
    </div>
  );
};

export default SelectMotm;