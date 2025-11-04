import React, { useState, useEffect } from 'react';
import { Tournament } from '../types';

interface TournamentFormProps {
  onSave: (tournament: Tournament) => void;
  onCancel: () => void;
  tournamentToEdit?: Tournament | null;
}

const TournamentForm: React.FC<TournamentFormProps> = ({ onSave, onCancel, tournamentToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState('Registrations Open');

  useEffect(() => {
    if (tournamentToEdit) {
      setName(tournamentToEdit.name);
      setDescription(tournamentToEdit.description);
      setStage(tournamentToEdit.stage);
    }
  }, [tournamentToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      const tournamentData: Tournament = {
        id: tournamentToEdit ? tournamentToEdit.id : `tourn_${Date.now()}`,
        name,
        description,
        stage,
      };
      onSave(tournamentData);
    }
  };
  
  const STAGES = ['Registrations Open', 'Group Stage', 'Knockouts', 'Quarter Finals', 'Semi Finals', 'Finals', 'Completed'];

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-3xl font-black text-center text-teal-600 uppercase tracking-wider mb-8">
          {tournamentToEdit ? 'Edit Tournament' : 'Create Tournament'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">Tournament Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g. Summer Champions League"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-600">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g. Annual T20 league for local clubs."
              rows={3}
            />
          </div>
          <div>
             <label htmlFor="stage" className="block text-sm font-medium text-gray-600">Stage</label>
             <select
                id="stage"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
             >
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
            >
                Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 transition-colors"
            >
              Save Tournament
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentForm;
