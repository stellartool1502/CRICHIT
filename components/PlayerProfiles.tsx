import React, { useState, useEffect, useMemo } from 'react';
import { PlayerProfile } from '../types';
import { getAllPlayerProfiles } from '../services/playerStatsService';

const defaultAvatar = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2E1YjRjYyI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTguNjg1IDE5LjA5N0E5LjcyMyA5LjcyMyAwIDAgMCAyMS43NSAxMmMwLTUuMzg1LTQuMzY1LTkuNzUtOS43NS05Ljc1UzIuMjUgNi42MTUgMi4yNSAxMmE5LjcyMyA5LjcyMyAwIDAgMCAzLjA2NSA3LjA5N0E5LjcxNiA5LjcxNiAwIDAgMCAxMiAyMS43NWE5LjcxNiA5LjcxNiAwIDAgMCA2LjY4NS0yLjY1M1ptLTEyLjU0LTEuMjg1QTcuNDg2IDcuNDg2IDAgMCAxIDEyIDE1YTcuNDg2IDcuNDg2IDAgMCAxIDUuODU1IDIuODEyQTguMjI0IDguMjI0IDAgMCAxIDEyIDIwLjI1YTguMjI0IDguMjI0IDAgMCAxLTUuODU1LTIuNDM4Wk0xNS43NSA5YTMuNzUgMy43NSAwIDEgMS03LjUgMCAzLjc1IDMuNzUgMCAwIDEgNy41IDBaIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIC8+Cjwvc3ZnPgo=`;

const calculatePlayerTitle = (profile: PlayerProfile): string | null => {
  const battingAvg = profile.inningsBatted > profile.notOuts ? (profile.totalRuns / (profile.inningsBatted - profile.notOuts)) : 0;
  const strikeRate = profile.ballsFaced > 0 ? ((profile.totalRuns / profile.ballsFaced) * 100) : 0;
  const economy = profile.ballsBowled > 0 ? ((profile.runsConceded / profile.ballsBowled) * 6) : 0;

  // Elite Titles (High requirements)
  if (battingAvg > 40 && strikeRate > 140 && profile.totalRuns > 500 && profile.wicketsTaken > 15 && profile.matchesPlayed > 5) {
      return "MVP";
  }
  if (strikeRate > 175 && profile.sixes > 25 && profile.totalRuns > 300 && profile.matchesPlayed > 3) {
      return "Master Blaster";
  }
  if (profile.wicketsTaken > 20 && economy < 6.0 && economy > 0 && profile.matchesPlayed > 5) {
      return "Strike Bowler";
  }

  // Good Performance Titles
  if (battingAvg > 50 && profile.totalRuns > 200 && profile.matchesPlayed > 3) {
      return "The Wall";
  }
  if (strikeRate > 150 && profile.totalRuns > 150 && profile.matchesPlayed > 2) {
      return "Aggressor";
  }
  if (profile.wicketsTaken > 15 && profile.matchesPlayed > 3) {
      return "Wicket Taker";
  }
  if (economy < 5.0 && economy > 0 && profile.ballsBowled > 120 && profile.matchesPlayed > 3) {
      return "The Anchor";
  }
  if (profile.highestScore >= 100) {
      return "Centurion";
  }
  if (profile.highestScore >= 50 && profile.matchesPlayed > 1) {
      return "Consistent Scorer";
  }

  return null; // No title yet
};


const StatRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-200">
    <span className="text-gray-600">{label}</span>
    <span className="font-bold text-gray-800">{value}</span>
  </div>
);

const PlayerDetailsModal: React.FC<{ profile: PlayerProfile & { title: string | null }; onClose: () => void }> = ({ profile, onClose }) => {
  const battingAvg = profile.inningsBatted > profile.notOuts ? (profile.totalRuns / (profile.inningsBatted - profile.notOuts)).toFixed(2) : '∞';
  const strikeRate = profile.ballsFaced > 0 ? ((profile.totalRuns / profile.ballsFaced) * 100).toFixed(2) : '0.00';
  
  const oversBowledDecimal = Math.floor(profile.ballsBowled / 6) + (profile.ballsBowled % 6) / 10;
  const economy = profile.ballsBowled > 0 ? ((profile.runsConceded / profile.ballsBowled) * 6).toFixed(2) : '0.00';
  const bowlingAvg = profile.wicketsTaken > 0 ? (profile.runsConceded / profile.wicketsTaken).toFixed(2) : '0.00';
  const bestBowling = profile.bestBowlingWickets > 0 ? `${profile.bestBowlingWickets}/${profile.bestBowlingRuns}` : '-';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src={profile.photoUrl || defaultAvatar} alt={profile.name} className="w-16 h-16 rounded-full object-cover bg-gray-200" />
            <div>
              <h2 className="text-2xl font-bold text-teal-600">{profile.name}</h2>
              {profile.title && <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wider">{profile.title}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-3xl text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Batting Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wider mb-2">Batting Career</h3>
            <div className="text-sm">
              <StatRow label="Matches" value={profile.matchesPlayed} />
              <StatRow label="Innings" value={profile.inningsBatted} />
              <StatRow label="Runs" value={profile.totalRuns} />
              <StatRow label="Balls Faced" value={profile.ballsFaced} />
              <StatRow label="Highest Score" value={`${profile.highestScore}${profile.notOuts > 0 && profile.highestScore > 0 ? '*' : ''}`} />
              <StatRow label="Average" value={battingAvg} />
              <StatRow label="Strike Rate" value={strikeRate} />
              <StatRow label="Not Outs" value={profile.notOuts} />
              <StatRow label="Fours" value={profile.fours} />
              <StatRow label="Sixes" value={profile.sixes} />
            </div>
          </div>
          {/* Bowling Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wider mb-2">Bowling Career</h3>
            <div className="text-sm">
              <StatRow label="Matches" value={profile.matchesPlayed} />
              <StatRow label="Overs" value={oversBowledDecimal.toFixed(1)} />
              <StatRow label="Wickets" value={profile.wicketsTaken} />
              <StatRow label="Runs Conceded" value={profile.runsConceded} />
              <StatRow label="Average" value={bowlingAvg} />
              <StatRow label="Economy" value={economy} />
              <StatRow label="Best Bowling" value={bestBowling} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


interface PlayerProfilesProps {
  onBack: () => void;
}

const PlayerProfiles: React.FC<PlayerProfilesProps> = ({ onBack }) => {
  const [profiles, setProfiles] = useState<(PlayerProfile & { title: string | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<(PlayerProfile & { title: string | null }) | null>(null);

  useEffect(() => {
    const loadProfiles = async () => {
        setLoading(true);
        const storedProfiles = await getAllPlayerProfiles();
        const profilesWithTitles = storedProfiles
          .map(p => ({ ...p, title: calculatePlayerTitle(p) }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setProfiles(profilesWithTitles);
        setLoading(false);
    };
    loadProfiles();
  }, []);

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [profiles, searchTerm]);

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Player Profiles</h1>
        </div>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search for a player..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {loading && <p>Loading profiles...</p>}
        {!loading && filteredProfiles.length === 0 && (
          <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md border border-gray-200">
            <p className="text-gray-500">{searchTerm ? 'No players match your search.' : 'No player profiles found. Complete a match to save player stats.'}</p>
          </div>
        )}
        {!loading && filteredProfiles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProfiles.map(profile => (
              <button key={profile.name} onClick={() => setSelectedProfile(profile)} className="bg-white rounded-lg shadow-md p-4 border border-gray-200 text-center hover:shadow-lg hover:border-teal-500 transition-all flex flex-col items-center justify-between">
                <div>
                  <img src={profile.photoUrl || defaultAvatar} alt={profile.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover bg-gray-200" />
                  <h3 className="font-bold text-gray-800">{profile.name}</h3>
                  <p className="text-sm text-gray-500">Matches: {profile.matchesPlayed}</p>
                </div>
                {profile.title && <span className="text-xs font-bold text-white bg-teal-600 px-2 py-0.5 rounded-full mt-2 inline-block">{profile.title}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedProfile && <PlayerDetailsModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />}
    </div>
  );
};

export default PlayerProfiles;