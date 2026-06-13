import { calculateMatchPoints } from "./comparePredictions";

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
 * - 4 points for exact score
 * - 3 points for correct match result (W/D/L)
 * - 0 points otherwise
 */
export function scoreGroupStageBet(
  prediction: GroupStageMatchPrediction,
  actual: GroupStageMatchActual,
): number {
  return calculateMatchPoints(
    prediction.predictedHomeGoals,
    prediction.predictedAwayGoals,
    actual.homeGoals,
    actual.awayGoals,
  );
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
