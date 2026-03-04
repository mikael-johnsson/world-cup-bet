import { GroupStagePrediction } from "@/types";

/**
 * Calculates which teams advance from the group stage based on predicted goals.
 * In each group of 4 teams, the top 2 teams advance automatically.
 * Additionally, the 8 best 3rd place teams advance (ranking by goals, then goal difference).
 * Total: 24 (group winners) + 8 (best 3rd place) = 32 teams.
 *
 * Ranking criteria (in order):
 * 1. Goal difference (goals scored - goals conceded)
 * 2. Goals scored overall
 *
 * @param groups - Array of group stage predictions with match predictions
 * @param tournamentGroups - Original tournament groups with team info
 * @returns Array of 32 team codes that advance to knockout
 */
export function deriveAdvancingTeams(
  groups: GroupStagePrediction[],
  tournamentGroups: any[],
): string[] {
  const advancingTeams: string[] = [];
  const thirdPlaceTeams: Array<{
    code: string;
    goalDifference: number;
    scored: number;
  }> = [];

  // Process each group
  groups.forEach((groupPrediction, groupIdx) => {
    const tournamentGroup = tournamentGroups[groupIdx];

    if (!tournamentGroup || !tournamentGroup.teams) {
      return;
    }

    // Calculate stats for each team in the group
    const teamStats = new Map<string, { scored: number; conceded: number }>();

    // Initialize stats for each team in the group
    tournamentGroup.teams.forEach((team: any) => {
      teamStats.set(team.code, { scored: 0, conceded: 0 });
    });

    // Calculate goals for each team from match predictions
    groupPrediction.matches.forEach((match, matchIdx) => {
      const fixture = tournamentGroup.fixtures[matchIdx];

      if (!fixture) {
        return;
      }

      const homeTeamCode = fixture.homeTeam.code;
      const awayTeamCode = fixture.awayTeam.code;
      const homeGoals = match.predictedHomeGoals;
      const awayGoals = match.predictedAwayGoals;

      // Update home team stats
      const homeStats = teamStats.get(homeTeamCode);
      if (homeStats) {
        homeStats.scored += homeGoals;
        homeStats.conceded += awayGoals;
      }

      // Update away team stats
      const awayStats = teamStats.get(awayTeamCode);
      if (awayStats) {
        awayStats.scored += awayGoals;
        awayStats.conceded += homeGoals;
      }
    });

    // Sort teams by goal difference, then by goals scored
    const sortedTeams = Array.from(teamStats.entries())
      .map(([code, stats]) => ({
        code,
        ...stats,
        goalDifference: stats.scored - stats.conceded,
      }))
      .sort((a, b) => {
        // Primary: goal difference
        if (a.goalDifference !== b.goalDifference) {
          return b.goalDifference - a.goalDifference;
        }
        // Secondary: goals scored
        return b.scored - a.scored;
      });

    // Top 2 teams advance automatically
    advancingTeams.push(sortedTeams[0].code);
    advancingTeams.push(sortedTeams[1].code);

    // Store 3rd place team for later ranking
    if (sortedTeams[2]) {
      thirdPlaceTeams.push({
        code: sortedTeams[2].code,
        goalDifference: sortedTeams[2].goalDifference,
        scored: sortedTeams[2].scored,
      });
    }
  });

  // Rank 3rd place teams and take the best 8
  const best8ThirdPlace = thirdPlaceTeams
    .sort((a, b) => {
      // Primary: goal difference
      if (a.goalDifference !== b.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      // Secondary: goals scored
      return b.scored - a.scored;
    })
    .slice(0, 8)
    .map((t) => t.code);

  // Combine: top 2 from each group + best 8 third place teams
  return [...advancingTeams, ...best8ThirdPlace];
}
