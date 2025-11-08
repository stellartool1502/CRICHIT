import React, { useState, useEffect } from 'react';
import { LiveMatch, Match } from '../types';
import MatchCard from './MatchCard';
import { getLiveMatches } from '../services/liveMatchService';

interface MatchesNearMeProps {
  onBack: () => void;
}

const transformMatchToLiveMatch = (match: Match): LiveMatch => {
    const firstInning = match.innings[0];
    const secondInning = match.innings[1];
    
    let teamA = match.teamA;
    let teamB = match.teamB;
    let scoreA = "Yet to bat";
    let overs = "0.0";
    let scoreB = "Yet to bat";
    let status = `${match.toss.winner} won the toss and elected to ${match.toss.decision}`;

    if (firstInning) {
        if (firstInning.battingTeam === teamA) {
            scoreA = `${firstInning.score}/${firstInning.wickets}`;
            overs = `${firstInning.overs}.${firstInning.balls}`;
        } else {
            scoreB = `${firstInning.score}/${firstInning.wickets}`;
            overs = `${firstInning.overs}.${firstInning.balls}`;
        }
    }
    
    if(secondInning) {
         if (secondInning.battingTeam === teamA) {
            scoreA = `${secondInning.score}/${secondInning.wickets}`;
            overs = `${secondInning.overs}.${secondInning.balls}`;
        } else {
            scoreB = `${secondInning.score}/${secondInning.wickets}`;
            overs = `${secondInning.overs}.${secondInning.balls}`;
        }
        const remainingRuns = match.target - secondInning.score;
        const totalBalls = match.overs * 6;
        const ballsBowled = secondInning.overs * 6 + secondInning.balls;
        const remainingBalls = totalBalls - ballsBowled;
        if(remainingRuns > 0 && remainingBalls > 0) {
            status = `${secondInning.battingTeam} need ${remainingRuns} runs in ${remainingBalls} balls.`;
        }
    }


    return {
        id: match.id,
        tournament: 'Local Match',
        details: `${match.overs} Over Match`,
        teamA: teamA,
        teamB: teamB,
        teamALogo: match.teamALogo,
        teamBLogo: match.teamBLogo,
        scoreA: scoreA,
        overs: overs,
        scoreB: scoreB,
        status: status,
        distance: '', // Geolocation distance can be complex, omitting for now
    };
};

const MatchesNearMe: React.FC<MatchesNearMeProps> = ({ onBack }) => {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matchesFromDb = await getLiveMatches();
        const formattedMatches = matchesFromDb.map(transformMatchToLiveMatch);
        setLiveMatches(formattedMatches);
      } catch (e) {
        console.error("Failed to load live matches:", e);
      } finally {
        if(loading) setLoading(false);
      }
    };

    fetchMatches(); // Initial fetch
    const intervalId = setInterval(fetchMatches, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-500">Finding matches near you...</p>;
    }
    if (liveMatches.length === 0) {
      return <p className="text-center text-gray-500">No live matches found nearby. Start a new match to see it here!</p>;
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveMatches.map(match => (
                <MatchCard key={match.id} match={match} />
            ))}
        </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
            <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Live Cricket Matches (<span className="text-red-600">Near Me</span>)</h1>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default MatchesNearMe;