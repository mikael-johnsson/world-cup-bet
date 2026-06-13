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

/**
 * Calculate the points for one match.
 * 4 points = exact score
 * 3 points = correct outcome
 * 0 points = wrong outcome
 */
export function calculateMatchPoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
): number {
  const { resultMatch, scoreMatch } = compareMatchResults(
    predictedHome,
    predictedAway,
    actualHome,
    actualAway,
  );

  if (scoreMatch) {
    return 4;
  }

  if (resultMatch) {
    return 3;
  }

  return 0;
}

export function compareWinner(
  predictedWinnerCode: string,
  actualWinnerCode: string,
): boolean {
  return predictedWinnerCode === actualWinnerCode;
}
