import React from 'react';
import { LiveMatch } from '../types';

interface MatchCardProps {
    match: LiveMatch;
}

const defaultTeamLogo = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0idy02IGgtNiI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMi4yNUE5Ljc1IDkuNzUgMCAxMCAyMS43NSAxMmE5Ljc1IDkuNzUgMCAwMC05Ljc1LTkuNzVabTAgMS41YTguMjUgOC4yNSAwIDEwMCAxNi41IDguMjUgOC4yNSAwIDAwMC0xNi41Wm0zLjM3MiAxMS40MjNhLjc1Ljc1IDAgMDAtMS4wNjEtMS4wNkwxMiAxMy4wNmw LTIuMzEyLTIuMzEyYS43NS43NSAwIDAwLTEuMDYgMS4wNkwxMC45NCAxMmwzLjQzMiAzLjQzM1oiIGNsaXAtcnVsZT0iZXZlbm9kZCIgLz4KPC9zdmc+Cg==`;


const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span>{match.tournament}</span>
                    {match.distance && 
                        <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {match.distance}
                        </span>
                    }
                </div>
                <div className="text-xs text-gray-500 mb-3">{match.details}</div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <img src={match.teamALogo || defaultTeamLogo} alt={`${match.teamA} logo`} className="w-8 h-8 rounded-full object-contain p-0.5 bg-gray-200 text-gray-400" />
                            <span className="font-bold text-base text-teal-600">{match.teamA}</span>
                        </div>
                        {match.scoreA && 
                            <span className="font-bold text-base">
                                {match.scoreA} <span className="text-sm font-normal text-gray-500">({match.overs})</span>
                            </span>
                        }
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <img src={match.teamBLogo || defaultTeamLogo} alt={`${match.teamB} logo`} className="w-8 h-8 rounded-full object-contain p-0.5 bg-gray-200 text-gray-400" />
                            <span className="font-bold text-base text-gray-800">{match.teamB}</span>
                        </div>
                        <span className="text-sm text-gray-500">{match.scoreB}</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 mt-3 pt-3 text-sm text-gray-700">
                {match.status}
            </div>
        </div>
    );
};

export default MatchCard;