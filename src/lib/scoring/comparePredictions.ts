/**
 * Utility to compare user predictions against actual results
 */

export function determineMatchResult(
  homeGoals: number,
  awayGoals: number,
): "H" | "D" | "A" {
  if (homeGoals > awayGoals) return "H";
  if (homeGoals < awayGoals) return "A";
  return "D";
}

export function compareMatchResults(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
): {
  resultMatch: boolean;
  scoreMatch: boolean;
} {
  const predictedResult = determineMatchResult(predictedHome, predictedAway);
  const actualResult = determineMatchResult(actualHome, actualAway);

  return {
    resultMatch: predictedResult === actualResult,
    scoreMatch: predictedHome === actualHome && predictedAway === actualAway,
  };
}

export function compareWinner(
  predictedWinnerCode: string,
  actualWinnerCode: string,
): boolean {
  return predictedWinnerCode === actualWinnerCode;
}
