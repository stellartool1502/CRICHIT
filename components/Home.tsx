import React from 'react';
import { GameState } from '../types';

interface HomeProps {
  setGameState: (state: GameState) => void;
}

const Home: React.FC<HomeProps> = ({ setGameState }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 pt-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-black text-gray-800 uppercase tracking-wider">
          Crichit
        </h1>
        <p className="text-lg text-gray-600 mt-2">Your Local Cricket Companion</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        <HomeCard
          title="New Match"
          description="Start scoring a new local match."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
          onClick={() => setGameState(GameState.SETUP)}
        />
        <HomeCard
          title="Matches Near Me"
          description="Find live cricket matches happening around you."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          onClick={() => setGameState(GameState.MATCHES_NEAR_ME)}
        />
        <HomeCard
          title="Tournaments"
          description="Check out ongoing local tournaments."
          icon={
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
          onClick={() => setGameState(GameState.TOURNAMENTS)}
        />
         <HomeCard
          title="Player Profiles"
          description="View career stats for all players."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          onClick={() => setGameState(GameState.PLAYER_PROFILES)}
        />
        <HomeCard
          title="Match History"
          description="Review results of completed matches."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          onClick={() => setGameState(GameState.COMPLETED_MATCHES)}
        />
      </div>
    </div>
  );
};

interface HomeCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const HomeCard: React.FC<HomeCardProps> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center flex flex-col items-center border border-gray-200"
    >
        <div className="text-teal-600 mb-4">{icon}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
    </button>
);


export default Home;
