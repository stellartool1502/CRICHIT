import React, { useState, useEffect } from 'react';
import { Tournament, PlayerRoleInfo, PlayerSpecialty } from '../types';
import { getTournaments } from '../services/tournamentService';

interface MatchSetupProps {
  onSetup: (setupData: {
    teamA: string; teamB: string; overs: number; playersPerTeam: number;
    teamAPlayers: PlayerRoleInfo[]; teamBPlayers: PlayerRoleInfo[];
    teamALogo: string | null; teamBLogo: string | null; tournamentId?: string;
  }) => void;
  onBack: () => void;
}

const defaultAvatar = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2E1YjRjYyI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTguNjg1IDE5LjA5N0E5LjcyMyA5LjcyMyAwIDAgMCAyMS43NSAxMmMwLTUuMzg1LTQuMzY1LTkuNzUtOS43NS05Ljc1UzIuMjUgNi42MTUgMi4yNSAxMmE5LjcyMyA5LjcyMyAwIDAgMCAzLjA2NSA3LjA5N0E5LjcxNiA5LjcxNiAwIDAgMCAxMiAyMS43NWE5LjcxNiA5LjcxNiAwIDAgMCA2LjY4NS0yLjY1M1ptLTEyLjU0LTEuMjg1QTcuNDg2IDcuNDg2IDAgMCAxIDEyIDE1YTcuNDg2IDcuNDg2IDAgMCAxIDUuODU1IDIuODEyQTguMjI0IDguMjI0IDAgMCAxIDEyIDIwLjI1YTguMjI0IDguMjI0IDAgMCAxLTUuODU1LTIuNDM4Wk0xNS43NSA5YTMuNzUgMy43NSAwIDEgMS03LjUgMCAzLjc1IDMuNzUgMCAwIDEgNy4yNSAwBaIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIC8+Cjwvc3ZnPgo=`;
const defaultTeamLogo = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0idy02IGgtNiI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMi4yNUE5LjcyMyA5LjcyMyAwIDEwMCAyMS43NWE5LjcxNiA5LjcxNiAwIDAgMCA2LjY4NS0yLjY1M1ptLTEyLjU0LTEuMjg1QTcuNDg2IDcuNDg2IDAgMCAxIDEyIDE1YTcuNDg2IDcuNDg2IDAgMCAxIDUuODU1IDIuODEyQTguMjI0IDguMjI0IDAgMCAxIDEyIDIwLjI1YTguMjI0IDguMjI0IDAgMCAxLTUuODU1LTIuNDM4Wk0xNS43NSA5YTMuNzUgMy43NSAwIDEgMS03LjUgMCAzLjc1IDMuNzUgMCAwIDEgNy41IDBaIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIC8+Cjwvc3ZnPgo=`;

const MatchSetup: React.FC<MatchSetupProps> = ({ onSetup, onBack }) => {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [overs, setOvers] = useState(20);
  const [playersPerTeam, setPlayersPerTeam] = useState(11);
  const [teamAPlayers, setTeamAPlayers] = useState<PlayerRoleInfo[]>(Array.from({ length: 11 }, (_, i) => ({ name: `Player ${i + 1}`, photoUrl: null, isCaptain: false, isViceCaptain: false, isWicketKeeper: false, specialty: PlayerSpecialty.BATSMAN })));
  const [teamBPlayers, setTeamBPlayers] = useState<PlayerRoleInfo[]>(Array.from({ length: 11 }, (_, i) => ({ name: `Player ${i + 1}`, photoUrl: null, isCaptain: false, isViceCaptain: false, isWicketKeeper: false, specialty: PlayerSpecialty.BATSMAN })));
  const [teamALogo, setTeamALogo] = useState<string | null>(null);
  const [teamBLogo, setTeamBLogo] = useState<string | null>(null);
  const [showPlayerNames, setShowPlayerNames] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');

  useEffect(() => {
      const fetchTournaments = async () => {
          const data = await getTournaments();
          setTournaments(data);
      };
      fetchTournaments();
  }, []);
  
  useEffect(() => {
    const newSize = Math.max(2, playersPerTeam || 2);

    const updatePlayerArray = (prevPlayers: PlayerRoleInfo[]) => {
      const currentSize = prevPlayers.length;
      if (newSize > currentSize) {
        // Add players
        const playersToAdd = Array.from({ length: newSize - currentSize }, (_, i) => ({
          name: `Player ${currentSize + i + 1}`,
          photoUrl: null,
          isCaptain: false,
          isViceCaptain: false,
          isWicketKeeper: false,
          specialty: PlayerSpecialty.BATSMAN,
        }));
        return [...prevPlayers, ...playersToAdd];
      } else {
        // Remove players
        return prevPlayers.slice(0, newSize);
      }
    };
    setTeamAPlayers(updatePlayerArray);
    setTeamBPlayers(updatePlayerArray);
  }, [playersPerTeam]);

  const handlePlayerDetailChange = (team: 'A' | 'B', index: number, field: keyof PlayerRoleInfo, value: any) => {
    const players = team === 'A' ? teamAPlayers : teamBPlayers;
    const setPlayers = team === 'A' ? setTeamAPlayers : setTeamBPlayers;
    
    let newPlayers = players.map((p, i) => {
        if (i === index) {
            return { ...p, [field]: value };
        }
        // Ensure only one Captain, VC, or WK per team
        if (value === true) {
            if (field === 'isCaptain' || field === 'isViceCaptain' || field === 'isWicketKeeper') {
                if (p[field as keyof PlayerRoleInfo] === true) { // Unset for others
                  return { ...p, [field]: false };
                }
            }
        }
        return p;
    });
    // Ensure the clicked one is set correctly after clearing others
    newPlayers[index] = { ...newPlayers[index], [field]: value };

    setPlayers(newPlayers);
  };
  
  const handlePhotoChange = (team: 'A' | 'B', index: number, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result as string;
        handlePlayerDetailChange(team, index, 'photoUrl', base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoChange = (team: 'A' | 'B', file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result as string;
        if (team === 'A') setTeamALogo(base64String);
        else setTeamBLogo(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamA && teamB && overs > 0 && playersPerTeam >= 2) {
      onSetup({ teamA, teamB, overs, playersPerTeam, teamAPlayers, teamBPlayers, teamALogo, teamBLogo, tournamentId: selectedTournament || undefined });
    }
  };

  const RoleButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button type="button" onClick={onClick} className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${active ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>
        {children}
    </button>
  );

  const SpecialtyButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button type="button" onClick={onClick} className={`w-8 h-6 rounded text-xs font-bold flex items-center justify-center transition-colors ${active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>
        {children}
    </button>
  );

  const renderPlayerInputs = (team: 'A' | 'B') => {
    const players = team === 'A' ? teamAPlayers : teamBPlayers;
    const teamName = team === 'A' ? teamA : teamB;
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{teamName || `Team ${team}`}</h3>
        <div className="space-y-2">
          {players.map((player, index) => (
            <div key={index} className="flex items-center space-x-2">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(team, index, e.target.files ? e.target.files[0] : null)} />
                <img src={player.photoUrl || defaultAvatar} alt={`Player ${index + 1}`} className="w-10 h-10 rounded-full object-cover bg-gray-200 ring-2 ring-gray-300" />
              </label>
              <input type="text" value={player.name} onChange={(e) => handlePlayerDetailChange(team, index, 'name', e.target.value)} className="flex-1 w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder={`${teamName || `Team ${team}`} Player ${index + 1}`} />
              <div className="flex items-center space-x-1.5">
                <RoleButton active={player.isCaptain} onClick={() => handlePlayerDetailChange(team, index, 'isCaptain', !player.isCaptain)}>C</RoleButton>
                <RoleButton active={player.isViceCaptain} onClick={() => handlePlayerDetailChange(team, index, 'isViceCaptain', !player.isViceCaptain)}>VC</RoleButton>
                <RoleButton active={player.isWicketKeeper} onClick={() => handlePlayerDetailChange(team, index, 'isWicketKeeper', !player.isWicketKeeper)}>WK</RoleButton>
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <SpecialtyButton active={player.specialty === PlayerSpecialty.BATSMAN} onClick={() => handlePlayerDetailChange(team, index, 'specialty', PlayerSpecialty.BATSMAN)}>BAT</SpecialtyButton>
                <SpecialtyButton active={player.specialty === PlayerSpecialty.BOWLER} onClick={() => handlePlayerDetailChange(team, index, 'specialty', PlayerSpecialty.BOWLER)}>BWL</SpecialtyButton>
                <SpecialtyButton active={player.specialty === PlayerSpecialty.ALL_ROUNDER} onClick={() => handlePlayerDetailChange(team, index, 'specialty', PlayerSpecialty.ALL_ROUNDER)}>AR</SpecialtyButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className={`w-full ${showPlayerNames ? 'max-w-5xl' : 'max-w-md'} bg-white rounded-xl shadow-lg p-8 transition-all duration-300 border border-gray-200`}>
        <h1 className="text-3xl font-black text-center text-teal-600 uppercase tracking-wider mb-8">New Match</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="teamA" className="block text-sm font-medium text-gray-600">Team 1 Name</label>
              <div className="flex items-center space-x-3 mt-1">
                  <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoChange('A', e.target.files ? e.target.files[0] : null)} />
                      <img src={teamALogo || defaultTeamLogo} alt="Team A Logo" className="w-12 h-12 rounded-full object-contain p-1 bg-gray-200 ring-2 ring-gray-300 text-gray-400"/>
                  </label>
                  <input type="text" id="teamA" value={teamA} onChange={(e) => setTeamA(e.target.value)} className="block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="e.g. Titans" required />
              </div>
            </div>
            <div>
              <label htmlFor="teamB" className="block text-sm font-medium text-gray-600">Team 2 Name</label>
              <div className="flex items-center space-x-3 mt-1">
                  <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoChange('B', e.target.files ? e.target.files[0] : null)} />
                      <img src={teamBLogo || defaultTeamLogo} alt="Team B Logo" className="w-12 h-12 rounded-full object-contain p-1 bg-gray-200 ring-2 ring-gray-300 text-gray-400" />
                  </label>
                  <input type="text" id="teamB" value={teamB} onChange={(e) => setTeamB(e.target.value)} className="block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="e.g. Warriors" required />
              </div>
            </div>
            <div>
              <label htmlFor="overs" className="block text-sm font-medium text-gray-600">Overs</label>
              <input type="number" id="overs" value={overs} onChange={(e) => setOvers(parseInt(e.target.value, 10))} className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" min="1" required />
            </div>
            <div>
              <label htmlFor="playersPerTeam" className="block text-sm font-medium text-gray-600">Players per Team</label>
              <input type="number" id="playersPerTeam" value={playersPerTeam} onChange={(e) => setPlayersPerTeam(parseInt(e.target.value, 10))} className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" min="2" required />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="tournament" className="block text-sm font-medium text-gray-600">Tournament (Optional)</label>
                <select id="tournament" value={selectedTournament} onChange={(e) => setSelectedTournament(e.target.value)} className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500">
                    <option value="">Select a tournament</option>
                    {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <button type="button" onClick={() => setShowPlayerNames(!showPlayerNames)} className="text-teal-600 hover:text-teal-500 font-semibold w-full text-left">
              {showPlayerNames ? 'Hide Player Details' : 'Edit Players & Photos'}
            </button>
            {showPlayerNames && (
              <div className="mt-4 max-h-[50vh] overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {renderPlayerInputs('A')}
                {renderPlayerInputs('B')}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mt-6">
              <button type="button" onClick={onBack} className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors">
                  Back to Home
              </button>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors">
                  Start Match
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchSetup;