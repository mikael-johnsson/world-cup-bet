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
  const solutionGroupStage = solution.predictions?.groupStage ?? [];
  const solutionKnockout = solution.predictions?.knockout;

  // Calculate group stage score
  bet.predictions.groupStage.forEach((groupPrediction) => {
    const solutionGroupPrediction = solutionGroupStage.find(
      (g) => g.groupName === groupPrediction.groupName,
    );

    if (solutionGroupPrediction?.matches) {
      // Convert solution matches to scoring format
      const solutionMatches = solutionGroupPrediction.matches
        .filter(
          (m) =>
            typeof m.matchId === "string" &&
            typeof m.predictedHomeGoals === "number" &&
            typeof m.predictedAwayGoals === "number",
        )
        .map((m) => ({
          matchId: m.matchId as string,
          homeGoals: m.predictedHomeGoals as number,
          awayGoals: m.predictedAwayGoals as number,
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
    solutionKnockout,
  );

  const totalScore = groupStageScore + knockoutScore;

  return {
    groupStageScore,
    knockoutScore,
    totalScore,
  };
}
