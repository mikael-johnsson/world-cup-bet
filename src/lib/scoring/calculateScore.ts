import { BetDocument } from "@/models/Bet";
import { SolutionDocument } from "@/models/Solution";
import { TournamentDocument } from "@/models/Tournament";
import { calculateGroupStageScore } from "./groupStageScoringRules";
import { calculateKnockoutScore } from "./knockoutScoringRules";

/**
 * Main scoring function that compares a user bet against a solution
 */
export async function calculateBetScore(
  bet: BetDocument,
  solution: SolutionDocument,
  tournament: TournamentDocument,
) {
  let groupStageScore = 0;
  let knockoutScore = 0;

  // Calculate group stage score
  bet.predictions.groupStage.forEach((groupPrediction) => {
    const solutionGroupPrediction = solution.predictions.groupStage.find(
      (g) => g.groupName === groupPrediction.groupName,
    );

    if (solutionGroupPrediction) {
      // Convert solution matches to scoring format
      const solutionMatches = solutionGroupPrediction.matches.map((m) => ({
        matchId: m.matchId,
        homeGoals: m.predictedHomeGoals,
        awayGoals: m.predictedAwayGoals,
      }));

      groupStageScore += calculateGroupStageScore(
        groupPrediction.matches,
        solutionMatches,
      );
    }
  });

  // Calculate knockout score
  knockoutScore = calculateKnockoutScore(
    bet.predictions.knockout,
    solution.predictions.knockout,
  );

  const totalScore = groupStageScore + knockoutScore;

  return {
    groupStageScore,
    knockoutScore,
    totalScore,
  };
}
