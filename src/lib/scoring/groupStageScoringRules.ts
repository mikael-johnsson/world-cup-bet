import { compareMatchResults } from "./comparePredictions";

export interface GroupStageMatchPrediction {
  matchId: string;
  predictedHomeGoals: number;
  predictedAwayGoals: number;
}

export interface GroupStageMatchActual {
  matchId: string;
  homeGoals: number;
  awayGoals: number;
}

/**
 * Calculate score for a single group stage match
 * - 3 points for correct match result (W/D/L)
 * - +1 bonus for exact score
 */
export function scoreGroupStageBet(
  prediction: GroupStageMatchPrediction,
  actual: GroupStageMatchActual,
): number {
  const { resultMatch, scoreMatch } = compareMatchResults(
    prediction.predictedHomeGoals,
    prediction.predictedAwayGoals,
    actual.homeGoals,
    actual.awayGoals,
  );

  let score = 0;

  if (resultMatch) {
    score += 3;
  }

  if (scoreMatch) {
    score += 1;
  }

  return score;
}

/**
 * Calculate total score for all group stage matches
 */
export function calculateGroupStageScore(
  predictions: GroupStageMatchPrediction[],
  actuals: GroupStageMatchActual[],
): number {
  let totalScore = 0;

  predictions.forEach((prediction) => {
    const actual = actuals.find((a) => a.matchId === prediction.matchId);
    if (actual) {
      totalScore += scoreGroupStageBet(prediction, actual);
    }
  });

  return totalScore;
}
