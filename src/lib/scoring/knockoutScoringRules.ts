import { compareWinner } from "./comparePredictions";

export interface KnockoutMatchPrediction {
  matchId: string;
  predictedWinnerCode: string;
}

export interface KnockoutMatchActual {
  matchId: string;
  winner: string; // team code
}

/**
 * Calculate score for a single knockout match
 * - 5 points for correct winner
 */
export function scoreKnockoutBet(
  prediction: KnockoutMatchPrediction,
  actual: KnockoutMatchActual,
): number {
  if (compareWinner(prediction.predictedWinnerCode, actual.winner)) {
    return 5;
  }
  return 0;
}

/**
 * Calculate total score for all knockout matches
 */
export function calculateKnockoutScore(
  predictions: KnockoutMatchPrediction[],
  actuals: KnockoutMatchActual[],
): number {
  let totalScore = 0;

  predictions.forEach((prediction) => {
    const actual = actuals.find((a) => a.matchId === prediction.matchId);
    if (actual) {
      totalScore += scoreKnockoutBet(prediction, actual);
    }
  });

  return totalScore;
}
