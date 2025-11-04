import React, { useState } from 'react';

interface TossProps {
  teamA: string;
  teamB: string;
  onTossResult: (winner: string, decision: 'bat' | 'bowl') => void;
  onBack: () => void;
}

const Toss: React.FC<TossProps> = ({ teamA, teamB, onTossResult, onBack }) => {
  const [tossWinner, setTossWinner] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <h1 className="text-3xl font-black text-center text-teal-600 uppercase tracking-wider mb-8">Coin Toss</h1>
        
        {!tossWinner ? (
          <div>
            <p className="text-lg text-gray-700 mb-6">Who won the toss?</p>
            <div className="space-y-4">
                <button
                onClick={() => setTossWinner(teamA)}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-bold text-gray-700 bg-white hover:bg-teal-500 hover:text-white transition-colors"
                >
                {teamA}
                </button>
                <button
                onClick={() => setTossWinner(teamB)}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-bold text-gray-700 bg-white hover:bg-teal-500 hover:text-white transition-colors"
                >
                {teamB}
                </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-2xl text-gray-800 mb-4">
              <span className="font-bold text-teal-600">{tossWinner}</span> won the toss!
            </p>
            <p className="text-lg text-gray-700 mb-6">What is the decision?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => onTossResult(tossWinner, 'bat')}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors"
              >
                Bat
              </button>
              <button
                onClick={() => onTossResult(tossWinner, 'bowl')}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors"
              >
                Bowl
              </button>
            </div>
          </div>
        )}

         <button onClick={onBack} className="mt-8 text-gray-500 hover:text-gray-800 text-sm transition-colors">
            &larr; Back to Setup
        </button>
      </div>
    </div>
  );
};

export default Toss;