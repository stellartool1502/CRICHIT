import React, { useState, useEffect, useRef } from 'react';
import { Match, Player, Bowler, Inning, GameState, ChatMessage, LastEvent } from '../types';
import Scoreboard from './Scoreboard';
import FullScorecard from './FullScorecard';
import { getPlayerStatsFromAI, generateLiveCommentary } from '../services/geminiService';
import { saveLiveMatch, removeLiveMatch } from '../services/liveMatchService';

interface ScoringProps {
  match: Match;
  setMatch: React.Dispatch<React.SetStateAction<Match | null>>;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  createInitialInning: (
    battingTeam: string, 
    bowlingTeam: string, 
    batsmenNames: string[], 
    bowlerNames: string[],
    batsmenPhotos: (string | null)[],
    bowlerPhotos: (string | null)[],
    teamPlayers: { name: string }[] // Simplified for inning creation
  ) => Inning;
  onAbandonMatch: () => void;
  onMatchEnd: (finalMatch: Match) => void;
}

const defaultAvatar = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2E1YjRjYyI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTguNjg1IDE5LjA5N0E5LjcyMyA5LjcyMyAwIDAgMCAyMS43NSAxMmMwLTUuMzg1LTQuMzY1LTkuNzUtOS43NS05Ljc1UzIuMjUgNi42MTUgMi4yNSAxMmE5LjcyMyA5LjcyMyAwIDAgMCAzLjA2NSA3LjA5N0E5LjcxNiA5LjcxNiAwIDAgMCAxMiAyMS43NWE5LjcxNiA5LjcxNiAwIDAgMCA2LjY4NS0yLjY1M1ptLTEyLjU0LTEuMjg1QTcuNDg2IDcuNDg2IDAgMCAxIDEyIDE1YTcuNDg2IDcuNDg2IDAgMCAxIDUuODU1IDIuODEyQTguMjI0IDguMjI0IDAgMCAxIDEyIDIwLjI1YTguMjI0IDguMjI0IDAgMCAxLTUuODU1LTIuNDM4Wk0xNS43NSA5YTMuNzUgMy43NSAwIDEgMS03LjUgMCAzLjc1IDMuNzUgMCAwIDEgNy41IDBaIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIC8+Cjwvc3ZnPgo=`;

const WicketIcon: React.FC<{ method: string }> = ({ method }) => {
  const iconClass = "w-20 h-20 text-white mb-2";
  switch (method.toLowerCase()) {
    case 'bowled':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 6L8 8M10 6L16 8"/>
            <line x1="6" y1="20" x2="6" y2="8"></line>
            <line x1="12" y1="20" x2="12" y2="8"></line>
            <line x1="18" y1="20" x2="18" y2="8"></line>
            <line x1="4" y1="8" x2="20" y2="8"></line>
        </svg>
      );
    case 'caught':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V15" />
        </svg>
      );
    case 'run out':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="4" r="2" />
                <path d="M15 22V13l-3-1-3 1v9" />
                <path d="M3 22V13l3-1 3.5 1.5" />
                <path d="M12 11.5l1.5 1.5" />
                <line x1="20" y1="13" x2="20" y2="19"></line>
                <line x1="18" y1="13" x2="22" y2="13"></line>
                <line x1="19" y1="19" x2="22" y2="16"></line>
            </svg>
        );
    case 'lbw':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 14v6" />
            <path d="M21 14v6" />
            <path d="M15 20h8" />
            <path d="M3 18.5a4.5 4.5 0 014.5-4.5H12V9" />
            <path d="M12 14h-1.5a4.5 4.5 0 00-4.5 4.5V22H12" />
        </svg>
      );
    case 'stumped':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5.12 12.54a1.5 1.5 0 0 0-1.55 2.12l1.63 4.89A4.08 4.08 0 0 0 9 22h6a4.08 4.08 0 0 0 3.8-2.45l1.63-4.89a1.5 1.5 0 0 0-1.55-2.12" />
                <line x1="6" y1="10" x2="6" y2="6"></line>
                <line x1="12" y1="10" x2="12" y2="6"></line>
                <line x1="18" y1="10" x2="18" y2="6"></line>
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="15" y1="6" x2="19" y2="2"></line>
            </svg>
        );
    case 'hit wicket':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.5 12l8-4" />
                <path d="M12.5 12L15 22" />
                <line x1="6" y1="20" x2="6" y2="8"></line>
                <line x1="12" y1="20" x2="12" y2="8"></line>
                <line x1="18" y1="20" x2="18" y2="8"></line>
                <line x1="4" y1="8" x2="20" y2="8"></line>
            </svg>
        );
    default:
      return null;
  }
};


const Scoring: React.FC<ScoringProps> = ({ match, setMatch, setGameState, createInitialInning, onAbandonMatch, onMatchEnd }) => {
  const [showFullScorecard, setShowFullScorecard] = useState(false);
  const [wicketModalState, setWicketModalState] = useState<{ isOpen: boolean, step: 1 | 2 | 3, method?: string, fielder?: Player | Bowler, runs?: number }>({ isOpen: false, step: 1 });
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);

  const [boundaryAnimation, setBoundaryAnimation] = useState<'4' | '6' | null>(null);
  const [wicketAnimation, setWicketAnimation] = useState<{ type: string, method: string } | null>(null);
  
  const [isChatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const [commentaryFeed, setCommentaryFeed] = useState<string[]>([]);
  const [isCommentaryLoading, setIsCommentaryLoading] = useState(false);
  
  // Effect to save live match data to the database
  useEffect(() => {
    const saveMatch = async () => {
        if (match) {
            await saveLiveMatch(match);
        }
    };
    saveMatch();
  }, [match]);

    // Effect for AI Commentary
  useEffect(() => {
    const fetchCommentary = async () => {
        if (match?.lastEvent) {
            setIsCommentaryLoading(true);
            try {
                const newCommentary = await generateLiveCommentary(match);
                if (newCommentary) {
                    setCommentaryFeed(prev => [newCommentary, ...prev].slice(0, 5)); // Keep last 5 comments
                }
            } catch (error) {
                console.error("Failed to generate commentary:", error);
            } finally {
                setIsCommentaryLoading(false);
            }
        }
    };
    fetchCommentary();
  }, [match?.lastEvent]);


  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatMessages]);

  useEffect(() => {
    if (boundaryAnimation) {
      const timer = setTimeout(() => setBoundaryAnimation(null), 2000);
      return () => clearTimeout(timer);
    }
    if (wicketAnimation) {
        const timer = setTimeout(() => setWicketAnimation(null), 2500);
        return () => clearTimeout(timer);
    }
  }, [boundaryAnimation, wicketAnimation]);

  const handleAbandonMatch = async () => {
    if (match) {
        await removeLiveMatch(match.id);
    }
    onAbandonMatch();
  };

  const currentInningIndex = match.currentInning;
  const currentInning = match.innings[currentInningIndex];
  const { striker, nonStriker, bowler } = match;

  const handleBall = (runs: number, extra: {type: 'wd' | 'nb' | 'bye' | 'lb', runs: number} | null = null, wicket: { method: string, fielderName?: string } | null = null) => {
    
    if (!extra && runs === 4) setBoundaryAnimation('4');
    if (!extra && runs === 6) setBoundaryAnimation('6');
    if (wicket) setWicketAnimation({ type: 'OUT!', method: wicket.method.toUpperCase() });

    setMatch(prevMatch => {
        if (!prevMatch || !prevMatch.striker || !prevMatch.nonStriker || !prevMatch.bowler) return prevMatch;
        
        let newMatch = JSON.parse(JSON.stringify(prevMatch)) as Match;
        let inning = newMatch.innings[newMatch.currentInning];
        let striker = inning.batsmen.find(p => p.id === newMatch.striker!.id)!;
        let nonStriker = inning.batsmen.find(p => p.id === newMatch.nonStriker!.id)!;
        let bowler = inning.bowlers.find(b => b.id === newMatch.bowler!.id)!;

        // Free Hit Logic
        const wasFreeHit = newMatch.isFreeHit;
        if (newMatch.isFreeHit && !extra) newMatch.isFreeHit = false;
        if (extra?.type === 'nb') newMatch.isFreeHit = true;

        let totalRunsThisBall = runs + (extra?.runs || 0);
        
        inning.score += totalRunsThisBall;
        if (extra?.type !== 'bye' && extra?.type !== 'lb') bowler.runsConceded += runs;
        if (extra?.type === 'wd' || extra?.type === 'nb') bowler.runsConceded += extra.runs;
        
        if (!extra) {
            striker.runs += runs;
            striker.balls++;
            inning.balls++;
            bowler.balls++;
        } else {
            if (extra.type === 'wd') inning.extras.wides += extra.runs;
            if (extra.type === 'nb') { inning.extras.noBalls += 1; striker.runs += runs; striker.balls++; }
            if (extra.type === 'bye') { inning.extras.byes += extra.runs; striker.balls++; inning.balls++; bowler.balls++; }
            if (extra.type === 'lb') { inning.extras.legByes += extra.runs; striker.balls++; inning.balls++; bowler.balls++; }
        }
        
        if (runs === 4 && !extra) striker.fours++;
        if (runs === 6 && !extra) striker.sixes++;

        if (wicket) {
            if (!wasFreeHit || (wasFreeHit && wicket.method.toLowerCase().includes('run out'))) {
                inning.wickets++;
                bowler.wickets++;
                striker.isOut = true;
                let dismissal = wicket.method;
                if (wicket.fielderName) {
                    if (wicket.method.toLowerCase() === 'caught') dismissal = `c ${wicket.fielderName} b ${bowler.name}`;
                    if (wicket.method.toLowerCase() === 'stumped') dismissal = `st ${wicket.fielderName} b ${bowler.name}`;
                    if (wicket.method.toLowerCase().includes('run out')) dismissal = `run out (${wicket.fielderName})`;
                } else {
                    dismissal = `${wicket.method} b ${bowler.name}`;
                }
                striker.outBy = dismissal;

                inning.fallOfWickets.push({
                    score: inning.score,
                    wicket: inning.wickets,
                    batsmanName: striker.name,
                    over: `${inning.overs}.${inning.balls}`,
                    bowlerName: bowler.name,
                    dismissalType: wicket.method,
                    fielderName: wicket.fielderName
                });
                const nextBatsman = inning.batsmen.find(p => !p.isOut && p.id !== nonStriker.id && p.id !== striker.id);
                newMatch.striker = nextBatsman || null;
            }
        }

        const runsForStrikeChange = (extra?.type === 'bye' || extra?.type === 'lb') ? extra.runs : runs;
        if (runsForStrikeChange % 2 !== 0 && !wicket) {
             [newMatch.striker, newMatch.nonStriker] = [newMatch.nonStriker, newMatch.striker];
        }

        if (inning.balls === 6) {
            inning.balls = 0;
            inning.overs++;
            bowler.overs++;
            if (!wicket) {
                [newMatch.striker, newMatch.nonStriker] = [newMatch.nonStriker, newMatch.striker];
            }
            newMatch.bowler = null; 
        }

        const eventType = wicket ? 'wicket' : (runs === 4 || runs === 6) ? 'boundary' : runs > 0 ? 'run' : extra ? 'extra' : 'dot';
        newMatch.lastEvent = { id: Date.now(), type: eventType, runs: runs, wicketMethod: wicket?.method, batsmanName: striker.name, bowlerName: bowler.name };

        const isAllOut = inning.wickets === 10;
        const isOversFinished = inning.overs === newMatch.overs;
        const isTargetChased = newMatch.currentInning === 1 && inning.score >= newMatch.target;

        if (newMatch.currentInning === 0 && (isAllOut || isOversFinished)) {
            newMatch.target = inning.score + 1;
            // Simplified inning creation for 2nd innings
            const nextBattingTeam = newMatch.teamA === inning.battingTeam ? newMatch.teamB : newMatch.teamA;
            const nextBowlingTeam = inning.battingTeam;
            const secondInning = createInitialInning(nextBattingTeam, nextBowlingTeam, [], [], [], [], []);
            newMatch.innings.push(secondInning);
            newMatch.currentInning = 1;
            newMatch.striker = null;
            newMatch.nonStriker = null;
            newMatch.bowler = null;
            setGameState(GameState.INNINGS_BREAK);
        } else if (newMatch.currentInning === 1 && (isAllOut || isOversFinished || isTargetChased)) {
             onMatchEnd(newMatch);
        }

        return newMatch;
    });
    setWicketModalState({ isOpen: false, step: 1 });
  };
  
  const selectPlayer = (type: 'striker' | 'nonStriker' | 'bowler', player: Player | Bowler) => {
      setMatch(prev => {
          if (!prev) return null;
          return { ...prev, [type]: player };
      })
  }

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = chatInput.trim();
    if (!query || isAiThinking) return;

    const newUserMessage: ChatMessage = { sender: 'user', text: query };
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatInput('');
    setIsAiThinking(true);

    try {
        const aiResponse = await getPlayerStatsFromAI(query, match);
        const newAiMessage: ChatMessage = { sender: 'ai', text: aiResponse };
        setChatMessages(prev => [...prev, newUserMessage, newAiMessage]);
    } catch (error) {
        console.error(error);
        const errorMessage: ChatMessage = { sender: 'ai', text: 'Sorry, I had trouble finding that information. Please try again.' };
        setChatMessages(prev => [...prev, newUserMessage, errorMessage]);
    } finally {
        setIsAiThinking(false);
    }
  };
  
  if (showFullScorecard) {
      return <FullScorecard match={match} onClose={() => setShowFullScorecard(false)} />;
  }
  
  if (!striker || !nonStriker || !bowler) {
      const availableBatsmen = currentInning.batsmen.filter(p => !p.isOut);
      const availableBowlers = currentInning.bowlers;
      
      let title = '';
      let selectionList: React.ReactNode | null = null;
      
      const PlayerButton = ({ player, onClick }: { player: Player | Bowler, onClick: () => void }) => (
         <button 
            onClick={onClick} 
            className="flex items-center w-full text-left p-2 rounded-lg bg-gray-100 hover:bg-teal-500 hover:text-white transition-colors border border-gray-300"
         >
            <img src={player.photoUrl || defaultAvatar} alt={player.name} className="w-10 h-10 rounded-full object-cover mr-3 bg-gray-300" />
            <span className="font-semibold">{player.name}</span>
        </button>
      );

      if (!striker) {
          title = 'Select Opening Striker';
          selectionList = availableBatsmen.map(p => <PlayerButton key={p.id} player={p} onClick={() => selectPlayer('striker', p)} />);
      } else if (!nonStriker) {
          title = 'Select Non-Striker';
          selectionList = availableBatsmen.filter(p => p.id !== striker.id).map(p => <PlayerButton key={p.id} player={p} onClick={() => selectPlayer('nonStriker', p)} />);
      } else if (!bowler) {
          title = 'Select Bowler for New Over';
          selectionList = availableBowlers.map(b => <PlayerButton key={b.id} player={b} onClick={() => selectPlayer('bowler', b)} />);
      }

      return (
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
              <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border border-gray-200">
                  <h2 className="text-2xl font-bold text-teal-600 mb-6 text-center">{title}</h2>
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                      {selectionList}
                  </div>
              </div>
          </div>
      )
  }
  
  const FielderSelection = () => {
      const fielders = currentInning.bowlers;
      const { method } = wicketModalState;
      const wicketKeeper = fielders.find(f => f.isWicketKeeper);

      return (
        <div>
            <h2 className="text-xl font-bold mb-4 text-center">Who was the fielder for <span className="text-teal-600">{method}</span>?</h2>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                {fielders.map(fielder => (
                    <button key={fielder.id} onClick={() => setWicketModalState(s => ({...s, step: 3, fielder }))} className="flex items-center w-full text-left p-2 rounded-lg bg-gray-100 hover:bg-teal-500 hover:text-white transition-colors border border-gray-300">
                        <img src={fielder.photoUrl || defaultAvatar} alt={fielder.name} className="w-10 h-10 rounded-full object-cover mr-3 bg-gray-300" />
                        <span className="font-semibold">{fielder.name} {fielder.isWicketKeeper && '(WK)'}</span>
                    </button>
                ))}
            </div>
             {method?.toLowerCase() === 'stumped' && wicketKeeper && (
                <button onClick={() => setWicketModalState(s => ({...s, step: 3, fielder: wicketKeeper }))} className="mt-4 w-full py-2 bg-teal-100 text-teal-800 font-bold rounded hover:bg-teal-200">Select WK ({wicketKeeper.name})</button>
             )}
        </div>
      );
  };

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto relative">
       <style>{`
        @keyframes flash-zoom { 0% { transform: scale(0.5) rotate(-5deg); opacity: 0; } 50% { transform: scale(1.2) rotate(5deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 0; } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-flash-zoom { animation: flash-zoom 2s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.5s 0.2s ease-out backwards; }
       `}</style>

    {boundaryAnimation && ( <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-none"> <div className="text-8xl md:text-9xl font-black text-yellow-400 animate-flash-zoom" style={{ WebkitTextStroke: '2px black', textShadow: '0 0 20px #facc15' }}> {boundaryAnimation === '4' ? 'FOUR!' : 'SIX!'} </div> </div> )}
    {wicketAnimation && ( <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50 pointer-events-none"> <div className="text-8xl md:text-9xl font-black text-red-500 animate-flash-zoom" style={{ WebkitTextStroke: '2px black', textShadow: '0 0 20px #ef4444' }}> {wicketAnimation.type} </div> <div className="flex flex-col items-center -mt-8 animate-fade-in-up"> <WicketIcon method={wicketAnimation.method} /> <div className="text-4xl md:text-5xl font-bold text-white" style={{ textShadow: '0 0 10px #000' }}> {wicketAnimation.method} </div> </div> </div> )}
    {match.isFreeHit && ( <div className="absolute top-2 right-2 z-10"> <span className="px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-lg shadow-lg animate-pulse"> FREE HIT </span> </div> )}

      <Scoreboard match={match} />

      <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <h3 className="text-lg font-bold text-teal-700 mb-3 text-center">Live AI Commentary</h3>
        {isCommentaryLoading && commentaryFeed.length === 0 && <p className="text-center text-gray-500 text-sm">AI is warming up...</p>}
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {isCommentaryLoading && ( <div className="flex items-center space-x-2 text-sm text-gray-500 opacity-75"> <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div> <span>AI is thinking...</span> </div> )}
            {commentaryFeed.map((comment, index) => ( <p key={index} className={`text-sm ${index === 0 ? 'text-gray-800 font-semibold' : 'text-gray-600'}`}> {comment} </p> ))}
        </div>
      </div>
      
      <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="pt-2">
              <p className="text-center font-semibold text-gray-700 mb-4">Record Ball</p>
              <div className="flex justify-center flex-wrap gap-3">
                  {[0, 1, 2, 3, 4, 6].map(runs => ( <button key={runs} onClick={() => handleBall(runs)} className="w-16 h-16 rounded-full bg-green-600 text-white font-bold text-xl hover:bg-green-500 transition-colors shadow-sm">{runs}</button> ))}
                  <button onClick={() => setWicketModalState({ isOpen: true, step: 1 })} className="w-16 h-16 rounded-full bg-red-600 text-white font-bold hover:bg-red-500 transition-colors shadow-sm">Wicket</button>
              </div>
              <div className="flex justify-center flex-wrap gap-3 mt-4">
                  <button onClick={() => handleBall(0, {type: 'wd', runs: 1})} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 shadow-sm">Wide</button>
                   <button onClick={() => handleBall(0, {type: 'nb', runs: 1})} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 shadow-sm">No Ball</button>
                   <button onClick={() => handleBall(0, {type: 'bye', runs: 1})} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 shadow-sm">Bye</button>
                   <button onClick={() => handleBall(0, {type: 'lb', runs: 1})} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 shadow-sm">Leg Bye</button>
              </div>
          </div>
      </div>
      
      <div className="mt-6 text-center flex justify-center items-center gap-4">
          <button onClick={() => setShowFullScorecard(true)} className="px-6 py-2 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400">View Full Scorecard</button>
          <button onClick={() => setCancelModalOpen(true)} className="px-6 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600">Abandon Match</button>
      </div>

       {wicketModalState.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            {wicketModalState.step === 1 && (
                <>
                    <h2 className="text-xl font-bold mb-4 text-center text-teal-600">Select Dismissal Type</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {['Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket'].map(method => (
                            <button key={method} onClick={() => {
                                const needsFielder = ['Caught', 'Run Out', 'Stumped'].includes(method);
                                if (needsFielder) setWicketModalState(s => ({ ...s, step: 2, method }));
                                else setWicketModalState(s => ({ ...s, step: 3, method }));
                            }} className="w-full py-3 px-2 rounded-lg bg-red-700 text-white font-semibold hover:bg-red-600 transition-colors">
                                {method}
                            </button>
                        ))}
                    </div>
                </>
            )}
            {wicketModalState.step === 2 && <FielderSelection />}
            {wicketModalState.step === 3 && (
                <>
                    <h2 className="text-xl font-bold mb-4 text-center">Runs on <span className="text-teal-600">{wicketModalState.method}</span> ball?</h2>
                    <p className="text-sm text-center text-gray-500 mb-4">(Excluding extras)</p>
                     <div className="flex justify-center flex-wrap gap-3">
                        {[0, 1, 2, 3, 4, 6].map(runs => (
                            <button key={runs} onClick={() => handleBall(runs, null, { method: wicketModalState.method!, fielderName: wicketModalState.fielder?.name })} className="w-14 h-14 rounded-full bg-red-700 text-white font-bold text-lg hover:bg-red-600 transition-colors">
                                {runs}
                            </button>
                        ))}
                    </div>
                </>
            )}
            <button onClick={() => setWicketModalState({ isOpen: false, step: 1 })} className="mt-6 w-full py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isCancelModalOpen && ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"> <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md text-center"> <h2 className="text-xl font-bold mb-4 text-teal-600">Abandon Match?</h2> <p className="text-gray-600 mb-6">Are you sure you want to cancel this match? All progress will be lost.</p> <div className="flex justify-center gap-4"> <button onClick={handleAbandonMatch} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500">Yes, Abandon</button> <button onClick={() => setCancelModalOpen(false)} className="px-6 py-2 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400">No, Continue</button> </div> </div> </div> )}

      <button onClick={() => setChatOpen(true)} className="fixed bottom-6 right-6 bg-teal-600 hover:bg-teal-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg z-40 transition-transform transform hover:scale-110" aria-label="Open AI Stats Assistant">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor"> <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.15l-2.11 3.165a.75.75 0 01-1.28 0L8.43 17.24a.39.39 0 00-.297-.15 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" /> </svg>
      </button>

      {isChatOpen && ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"> <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-[80vh] flex flex-col"> <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0"> <h2 className="text-xl font-bold text-teal-600">AI Stats Assistant</h2> <button onClick={() => setChatOpen(false)} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button> </div> <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50"> {chatMessages.map((msg, index) => ( <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}> <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-800'}`}> <p className="text-sm whitespace-pre-wrap">{msg.text}</p> </div> </div> ))} {isAiThinking && ( <div className="flex justify-start"> <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-200"> <div className="flex items-center space-x-2"> <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div> <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse [animation-delay:0.2s]"></div> <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse [animation-delay:0.4s]"></div> </div> </div> </div> )} <div ref={chatMessagesEndRef} /> </div> <form onSubmit={handleSendChatMessage} className="p-4 border-t border-gray-200 flex items-center space-x-2 flex-shrink-0"> <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-gray-50 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Ask about stats..." disabled={isAiThinking} /> <button type="submit" disabled={isAiThinking || !chatInput} className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed"> Send </button> </form> </div> </div> )}
    </div>
  );
};

export default Scoring;