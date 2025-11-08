import { Match, Player, Bowler, PlayerPerformance, PlayerSpecialty } from '../types';

export const autoSelectManOfTheMatch = (match: Match): (PlayerPerformance & { allCandidates: PlayerPerformance[] }) => {
    const performanceList: PlayerPerformance[] = [];

    const firstInning = match.innings[0];
    const secondInning = match.innings[1];
    
    let winningTeam = '';
    if (secondInning && secondInning.score >= match.target) {
        winningTeam = secondInning.battingTeam;
    } else if (firstInning && secondInning && firstInning.score > secondInning.score) {
        winningTeam = firstInning.battingTeam;
    }

    const consolidatePlayer = (playerData: PlayerPerformance) => {
        const existing = performanceList.find(p => p.name === playerData.name);
        if (existing) {
            existing.points += playerData.points;
            if (playerData.performanceSummary) {
                // Combine summaries without duplicating, e.g., "50 (25)" & "2/15"
                const existingParts = existing.performanceSummary.split(' & ');
                const newPart = playerData.performanceSummary;
                if (!existingParts.includes(newPart)) {
                    existing.performanceSummary = [existing.performanceSummary, newPart].filter(Boolean).join(' & ');
                }
            }
        } else {
            performanceList.push(playerData);
        }
    }

    match.innings.forEach((inning, inningIndex) => {
        // Batting
        inning.batsmen.forEach(batsman => {
            if (batsman.balls > 0 || batsman.isOut) {
                let points = 0;
                let summaryParts: string[] = [];

                points += batsman.runs;
                summaryParts.push(`${batsman.runs} (${batsman.balls})`);

                if (batsman.runs >= 100) points += 30;
                else if (batsman.runs >= 50) points += 15;

                const strikeRate = batsman.balls > 0 ? (batsman.runs / batsman.balls) * 100 : 0;
                if (batsman.runs >= 20) {
                    if (strikeRate >= 200) points += 20;
                    else if (strikeRate >= 150) points += 10;
                    else if (strikeRate >= 120) points += 5;
                }

                if (!batsman.isOut && winningTeam === inning.battingTeam && inningIndex === 1) {
                    points += 15; // Not out in successful chase bonus
                }
                
                consolidatePlayer({
                    name: batsman.name,
                    photoUrl: batsman.photoUrl,
                    teamName: inning.battingTeam,
                    points: points,
                    performanceSummary: summaryParts.join(''),
                    isCaptain: batsman.isCaptain,
                    isViceCaptain: batsman.isViceCaptain,
                    isWicketKeeper: batsman.isWicketKeeper,
                    specialty: batsman.specialty,
                });
            }
        });

        // Bowling
        inning.bowlers.forEach(bowler => {
            if (bowler.overs > 0 || bowler.balls > 0) {
                let points = 0;
                let summaryParts: string[] = [];

                points += bowler.wickets * 20;
                if(bowler.wickets > 0 || bowler.runsConceded > 0) {
                    summaryParts.push(`${bowler.wickets}/${bowler.runsConceded}`);
                }
            
                if (bowler.wickets >= 5) points += 25;
                else if (bowler.wickets >= 3) points += 10;
            
                points += bowler.maidens * 10;
            
                const totalBallsBowled = bowler.overs * 6 + bowler.balls;
                if (totalBallsBowled >= 12) { // At least 2 overs
                    const economy = totalBallsBowled > 0 ? (bowler.runsConceded / totalBallsBowled) * 6 : 0;
                    if (economy <= 4.0) points += 15;
                    else if (economy <= 6.0) points += 5;
                }

                consolidatePlayer({
                    name: bowler.name,
                    photoUrl: bowler.photoUrl,
                    teamName: inning.bowlingTeam,
                    points: points,
                    performanceSummary: summaryParts.join(''),
                    isCaptain: bowler.isCaptain,
                    isViceCaptain: bowler.isViceCaptain,
                    isWicketKeeper: bowler.isWicketKeeper,
                    specialty: bowler.specialty,
                });
            }
        });
    });

    // Apply winning bonus
    performanceList.forEach(p => {
        if (p.teamName === winningTeam) {
            p.points *= 1.2;
        }
        p.points = Math.round(p.points);
    });

    const sortedCandidates = performanceList.sort((a, b) => b.points - a.points);
    
    if (sortedCandidates.length === 0) {
        const fallbackPlayer = match.innings[0]?.batsmen[0] || { name: 'N/A', photoUrl: null};
        const fallbackTeam = match.innings[0]?.battingTeam || 'N/A';
        const fallbackPerformance: PlayerPerformance = { 
            name: fallbackPlayer.name,
            photoUrl: fallbackPlayer.photoUrl,
            teamName: fallbackTeam,
            points: 0,
            performanceSummary: 'N/A',
        };
        return { ...fallbackPerformance, allCandidates: [fallbackPerformance] };
    }

    const bestPlayer = sortedCandidates[0];
    const topCandidates = sortedCandidates.filter(p => p.points > 0);

    return { ...bestPlayer, allCandidates: topCandidates.length > 0 ? topCandidates : [bestPlayer] };
};