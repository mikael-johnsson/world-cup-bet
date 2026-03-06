/**
 * ResultComparison Component
 * Displays actual match results from the solution alongside user predictions
 */

interface ResultComparisonProps {
  matchId?: string;
  solution?: any;
  groupName?: string; // For group stage matches
  roundName?: string; // e.g., "roundOf16", "champion", "bronze"
}

export default function ResultComparison({
  matchId,
  solution,
  groupName,
  roundName,
}: ResultComparisonProps) {
  if (!solution?.predictions) {
    return null;
  }

  // Group stage match result
  if (groupName && matchId) {
    const groupData = solution.predictions.groupStage?.find(
      (g: any) => g.groupName === groupName,
    );

    if (!groupData?.matches) {
      return null;
    }

    const matchResult = groupData.matches.find(
      (m: any) => m.matchId === matchId,
    );

    if (!matchResult) {
      return null;
    }

    return (
      <div className="flex items-center gap-2 text-sm mr-3">
        <span className="text-gray-600 font-medium">Resultat:</span>
        <div className="flex items-center gap-2 bg-green-100 px-2 py-1 rounded">
          <span className="font-semibold text-green-500">
            {matchResult.predictedHomeGoals}
          </span>
          <span className="text-green-500">-</span>
          <span className="font-semibold text-green-500">
            {matchResult.predictedAwayGoals}
          </span>
        </div>
      </div>
    );
  }

  // Knockout stage result - show which teams advanced to a round
  if (roundName && solution.predictions.knockout?.[roundName]) {
    const roundResult = solution.predictions.knockout[roundName];

    // For single team fields (champion, bronze)
    if (typeof roundResult === "string") {
      return (
        <div className="text-sm mt-2">
          <span className="text-gray-600 font-medium">Resultat: </span>
          <span className="bg-green-100 text-green-500 px-2 py-1 rounded font-semibold">
            {roundResult}
          </span>
        </div>
      );
    }

    // For array fields (roundOf16, quarterfinals, etc.) - don't display here
    // Background colors are applied directly to team selection boxes instead
  }

  return null;
}
