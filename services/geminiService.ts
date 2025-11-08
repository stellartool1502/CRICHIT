// Fix: Added full content for services/geminiService.ts
import { GoogleGenAI } from "@google/genai";
import { Match } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const formatMatchDataForSummary = (match: Match): string => {
    const { innings, teamA, teamB, overs, target } = match;
    const firstInning = innings[0];
    const secondInning = innings[1];

    let prompt = `Generate a brief, engaging summary for a cricket match.
    The match was between ${teamA} and ${teamB} for ${overs} overs.\n\n`;
    
    if (firstInning) {
        prompt += `**First Innings (${firstInning.battingTeam}):**\n`;
        prompt += `- Score: ${firstInning.score}/${firstInning.wickets} in ${firstInning.overs}.${firstInning.balls} overs.\n`;
        const topBatsman1 = [...firstInning.batsmen].sort((a, b) => b.runs - a.runs)[0];
        if (topBatsman1 && topBatsman1.runs > 0) {
            prompt += `- Top Batsman: ${topBatsman1.name} with ${topBatsman1.runs} runs off ${topBatsman1.balls} balls.\n`;
        }
        const topBowler1 = [...(secondInning?.bowlers || [])].sort((a,b) => b.wickets - a.wickets)[0];
        if (topBowler1 && topBowler1.wickets > 0) {
             prompt += `- Top Bowler from ${secondInning.bowlingTeam}: ${topBowler1.name} with ${topBowler1.wickets} wickets for ${topBowler1.runsConceded} runs.\n`;
        }
    }
    
    if (secondInning) {
        prompt += `\n**Second Innings (${secondInning.battingTeam}):**\n`;
        prompt += `- Chasing a target of ${target}, they scored ${secondInning.score}/${secondInning.wickets} in ${secondInning.overs}.${secondInning.balls} overs.\n`;
        const topBatsman2 = [...secondInning.batsmen].sort((a, b) => b.runs - a.runs)[0];
        if (topBatsman2 && topBatsman2.runs > 0) {
            prompt += `- Top Batsman: ${topBatsman2.name} with ${topBatsman2.runs} runs off ${topBatsman2.balls} balls.\n`;
        }
        const topBowler2 = [...firstInning.bowlers].sort((a,b) => b.wickets - a.wickets)[0];
         if (topBowler2 && topBowler2.wickets > 0) {
             prompt += `- Top Bowler from ${firstInning.bowlingTeam}: ${topBowler2.name} with ${topBowler2.wickets} wickets for ${topBowler2.runsConceded} runs.\n`;
        }
    }

    let winner;
    if (secondInning && secondInning.score >= target) {
      const wicketsLeft = 10 - secondInning.wickets;
      winner = `${secondInning.battingTeam} won by ${wicketsLeft} wickets.`;
    } else if (firstInning && secondInning && firstInning.score > secondInning.score) {
      const runDifference = firstInning.score - secondInning.score;
      winner = `${firstInning.battingTeam} won by ${runDifference} runs.`;
    } else {
      winner = "The match was tied.";
    }

    prompt += `\n**Result:** ${winner}\n\n`;
    prompt += `Please provide a narrative summary of the match highlighting key performances and turning points.`;

    return prompt;
};


export const generateMatchSummary = async (match: Match): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set");
    return "API key is not configured. Please set the API_KEY environment variable.";
  }

  const prompt = formatMatchDataForSummary(match);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert cricket analyst. Generate a professional and engaging summary of the provided cricket match data, as if for a sports news website. Focus on key performances and the story of the match.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating match summary:", error);
    throw new Error("Failed to generate summary from Gemini API.");
  }
};

const formatMatchDataForAIQuery = (match: Match): string => {
    let context = `Current Match State:\n`;
    context += `Teams: ${match.teamA} vs ${match.teamB}\n`;
    context += `Overs: ${match.overs}\n`;
    
    match.innings.forEach((inning, index) => {
        context += `\n--- Inning ${index + 1} (${inning.battingTeam}) ---\n`;
        context += `Score: ${inning.score}/${inning.wickets} in ${inning.overs}.${inning.balls} overs.\n`;
        
        context += `Batting:\n`;
        inning.batsmen.filter(b => b.balls > 0 || b.isOut).forEach(b => {
            context += `- ${b.name}: ${b.runs} runs (${b.balls} balls), 4s: ${b.fours}, 6s: ${b.sixes}. ${b.isOut ? `Status: Out (${b.outBy})` : 'Status: Not Out'}\n`;
        });

        context += `\nBowling (${inning.bowlingTeam}):\n`;
        inning.bowlers.filter(b => b.overs > 0 || b.balls > 0).forEach(b => {
            context += `- ${b.name}: ${b.wickets} wickets for ${b.runsConceded} runs in ${b.overs}.${b.balls} overs.\n`;
        });
    });

    if (match.currentInning === 1 && match.target) {
        context += `\nTarget to win for ${match.innings[1].battingTeam}: ${match.target} runs.\n`;
    }
    
    return context;
}

export const getPlayerStatsFromAI = async (query: string, match: Match): Promise<string> => {
    if (!process.env.API_KEY) {
        return "API key is not configured.";
    }

    const matchContext = formatMatchDataForAIQuery(match);
    const prompt = `
    You are a cricket stats assistant. Based ONLY on the following match data, answer the user's question. Be concise and helpful. If the data is not available or the question is irrelevant to the data, say so.

    MATCH DATA:
    ${matchContext}

    USER QUESTION:
    ${query}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting player stats from AI:", error);
        throw new Error("Failed to get stats from AI.");
    }
};

const formatMatchDataForCommentary = (match: Match): string => {
    if (!match.lastEvent) return '';
    const { lastEvent, innings, currentInning, target } = match;
    const inning = innings[currentInning];

    const overAndBall = `${inning.overs}.${inning.balls === 6 ? 5 : inning.balls}`; // Adjust for end of over

    let situation = `${inning.battingTeam} are currently ${inning.score}/${inning.wickets}.`;
    if (currentInning === 1) {
        const runsNeeded = target - inning.score;
        const ballsRemaining = (match.overs * 6) - (inning.overs * 6 + inning.balls);
        if (runsNeeded > 0 && ballsRemaining > 0) {
            situation += ` They need ${runsNeeded} runs from ${ballsRemaining} balls to win.`;
        }
    }

    let eventDescription = '';
    switch (lastEvent.type) {
        case 'boundary':
            eventDescription = `${lastEvent.batsmanName} hit a boundary for ${lastEvent.runs} runs off the bowling of ${lastEvent.bowlerName}.`;
            break;
        case 'wicket':
            eventDescription = `WICKET! ${lastEvent.batsmanName} is out ${lastEvent.wicketMethod}, bowled by ${lastEvent.bowlerName}.`;
            break;
        case 'run':
            eventDescription = `${lastEvent.batsmanName} scored ${lastEvent.runs} run(s) off ${lastEvent.bowlerName}.`;
            break;
        case 'dot':
             eventDescription = `A dot ball from ${lastEvent.bowlerName} to ${lastEvent.batsmanName}.`;
            break;
        case 'extra':
             eventDescription = `An extra run was conceded by ${lastEvent.bowlerName}.`;
            break;
    }
    
    const prompt = `
    You are an energetic, professional cricket commentator.
    Based on the following match context, provide one single, exciting, and concise sentence of commentary for the last ball.

    **Match Context:**
    - Match Situation: ${situation}
    - Batsman on strike: ${lastEvent.batsmanName}
    - Bowler: ${lastEvent.bowlerName}

    **Last Ball Event (at ${overAndBall} overs):**
    - ${eventDescription}

    **Your Commentary (one exciting sentence, including the over number like '${overAndBall}'):**
    `;

    return prompt;
};

export const generateLiveCommentary = async (match: Match): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set");
    return "";
  }
  
  const prompt = formatMatchDataForCommentary(match);
  if (!prompt) return "";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating live commentary:", error);
    return "The commentator seems to be taking a short break...";
  }
};