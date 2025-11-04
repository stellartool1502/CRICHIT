import React, { useState, useEffect } from 'react';
import { Tournament } from '../types';
import { getTournaments, deleteTournament } from '../services/tournamentService';

interface TournamentsProps {
  onBack: () => void;
  onCreate: () => void;
  onEdit: (tournament: Tournament) => void;
}

const Tournaments: React.FC<TournamentsProps> = ({ onBack, onCreate, onEdit }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await loadTournaments();
    }
    load();
  }, []);

  const loadTournaments = async () => {
    setLoading(true);
    const storedTournaments = await getTournaments();
    setTournaments(storedTournaments);
    setLoading(false);
  };

  const handleDelete = async (tournamentId: string) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      await deleteTournament(tournamentId);
      await loadTournaments();
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Ongoing Tournaments</h1>
          </div>
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 transition-colors shadow-sm"
          >
            Create New Tournament
          </button>
        </div>
        <div className="space-y-4">
          {loading && <p>Loading tournaments...</p>}
          {!loading && tournaments.length === 0 && (
            <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md border border-gray-200">
                <p className="text-gray-500">No tournaments found. Create one to get started!</p>
            </div>
          )}
          {!loading && tournaments.map(tournament => (
            <div key={tournament.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-teal-700">{tournament.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{tournament.description}</p>
                </div>
                <span className="flex-shrink-0 ml-4 px-3 py-1 text-xs font-semibold text-gray-800 bg-yellow-400 rounded-full">{tournament.stage}</span>
              </div>
              <div className="flex justify-end items-center gap-2 mt-4">
                <button 
                  onClick={() => onEdit(tournament)}
                  className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tournament.id)}
                  className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tournaments;