import { Group, TeamStanding, ThirdPlaceStanding } from "@/types";

interface GroupPredictionMatch {
  predictedHomeGoals?: number;
  predictedAwayGoals?: number;
}

interface GroupPrediction {
  matches: GroupPredictionMatch[];
}

/**
 *
 * @param a team A
 * @param b team B
 * @returns in which order the teams should be ordered in the standings table
 */
const standingsSort = (a: TeamStanding, b: TeamStanding): number => {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference)
    return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.teamName.localeCompare(b.teamName);
};

/**
 *
 * @param group a group object containing teams and fixtures
 * @param prediction the user's predictions for the group stage matches
 * @returns an array of team standings for the given group, sorted in descending order of points
 */
export function calculateGroupStandings(
  group: Group,
  prediction?: GroupPrediction,
): TeamStanding[] {
  const standingsMap = new Map<string, TeamStanding>();

  for (const team of group.teams) {
    standingsMap.set(team.code, {
      teamCode: team.code,
      teamName: team.name,
      played: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  group.fixtures.forEach((fixture, index) => {
    const home = standingsMap.get(fixture.homeTeam.code);
    const away = standingsMap.get(fixture.awayTeam.code);

    if (!home || !away) return;

    const predictedHomeGoals =
      prediction?.matches[index]?.predictedHomeGoals ?? 0;
    const predictedAwayGoals =
      prediction?.matches[index]?.predictedAwayGoals ?? 0;

    home.played += 1;
    away.played += 1;

    home.goalsFor += predictedHomeGoals;
    home.goalsAgainst += predictedAwayGoals;

    away.goalsFor += predictedAwayGoals;
    away.goalsAgainst += predictedHomeGoals;

    if (predictedHomeGoals > predictedAwayGoals) {
      home.points += 3;
    } else if (predictedHomeGoals < predictedAwayGoals) {
      away.points += 3;
    } else {
      home.points += 1;
      away.points += 1;
    }
  });

  const standings = Array.from(standingsMap.values()).map((team) => ({
    ...team,
    goalDifference: team.goalsFor - team.goalsAgainst,
  }));

  return standings.sort(standingsSort);
}

/**
 *
 * @param groups an array of groups with teams and fixtures
 * @param predictions an array of predictions from the user
 * @returns an array of third place team standings for all groups, sorted in descending order of points
 */
export function calculateThirdPlaceStandings(
  groups: Group[],
  predictions: GroupPrediction[] = [],
): ThirdPlaceStanding[] {
  const thirdPlacedTeams: ThirdPlaceStanding[] = [];

  groups.forEach((group, index) => {
    const groupStandings = calculateGroupStandings(group, predictions[index]);
    const thirdPlace = groupStandings[2];

    if (!thirdPlace) return;

    thirdPlacedTeams.push({
      ...thirdPlace,
      groupName: group.name,
    });
  });

  return thirdPlacedTeams.sort(standingsSort);
}
