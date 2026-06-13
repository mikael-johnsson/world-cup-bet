"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { BetInput } from "@/lib/validationSchemas";
import { calculateMatchPoints } from "@/lib/scoring/comparePredictions";

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
  const { control } = useFormContext<BetInput>();
  const watchedGroupPredictions = useWatch({
    control,
    name: "predictions.groupStage",
  });

  const hasNonEmptyTeamArray = (value: unknown): value is string[] => {
    return (
      Array.isArray(value) &&
      value.length > 0 &&
      value.every((team) => typeof team === "string")
    );
  };

  const hasNonEmptyTeamCode = (value: unknown): value is string => {
    return typeof value === "string" && value.trim().length > 0;
  };

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

    const predictedMatch = watchedGroupPredictions
      ?.find((groupPrediction) => groupPrediction?.groupName === groupName)
      ?.matches?.find(
        (matchPrediction) => matchPrediction?.matchId === matchId,
      );

    const hasPredictedScores =
      typeof predictedMatch?.predictedHomeGoals === "number" &&
      typeof predictedMatch?.predictedAwayGoals === "number";

    const matchPoints = hasPredictedScores
      ? calculateMatchPoints(
          predictedMatch.predictedHomeGoals,
          predictedMatch.predictedAwayGoals,
          matchResult.predictedHomeGoals,
          matchResult.predictedAwayGoals,
        )
      : 0;

    return (
      <div className="flex items-center gap-3 text-sm mr-3">
        <span className="text-gray-600 font-medium">Resultat:</span>
        <div className="flex items-center gap-2 px-2 py-1 rounded bg-green-50">
          <span className="font-semibold text-green-500">
            {matchResult.predictedHomeGoals}
          </span>
          <span className="text-green-500">-</span>
          <span className="font-semibold text-green-500">
            {matchResult.predictedAwayGoals}
          </span>
        </div>
        <div
          className={`rounded bg-gray-100 px-2 py-1 font-medium text-gray-700 ${matchPoints === 3 ? "bg-green-400" : matchPoints === 4 ? "bg-green-600" : ""}`}
        >
          {matchPoints}p
        </div>
      </div>
    );
  }

  // Knockout stage result - show which teams advanced to a round
  if (roundName) {
    const roundResult = solution.predictions.knockout[roundName];

    // For single team fields (champion, bronze)
    if (hasNonEmptyTeamCode(roundResult)) {
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
    if (hasNonEmptyTeamArray(roundResult)) {
      return null;
    }
  }

  return null;
}
