import { KnockoutProgression } from "@/types";

/**
 * Calculate score for knockout progression
 *
 * Scoring system (1 point per correct team per round):
 * - Round of 32 → Round of 16: 1 point per correct team (max 16 points)
 * - Round of 16 → Quarterfinals: 1 point per correct team (max 8 points)
 * - Quarterfinals → Semifinals: 1 point per correct team (max 4 points)
 * - Semifinals → Final: 1 point per correct team (max 2 points)
 * - Champion: 1 point for correct winner (max 1 point)
 * - Bronze: 1 point for correct winner (max 1 point)
 *
 * Maximum possible knockout score: 32 points
 */
export function calculateKnockoutScore(
  prediction: KnockoutProgression,
  solution?: Partial<KnockoutProgression>,
): number {
  let score = 0;
  const solutionRoundOf16 = solution?.roundOf16 ?? [];
  const solutionQuarterfinals = solution?.quarterfinals ?? [];
  const solutionSemifinals = solution?.semifinals ?? [];
  const solutionFinal = solution?.final ?? [];
  const solutionChampion = solution?.champion;
  const solutionBronze = solution?.bronze;

  // Score Round of 16 (16 teams selected correctly)
  prediction.roundOf16.forEach((team) => {
    if (solutionRoundOf16.includes(team)) {
      score += 1;
    }
  });

  // Score Quarterfinals (8 teams)
  prediction.quarterfinals.forEach((team) => {
    if (solutionQuarterfinals.includes(team)) {
      score += 1;
    }
  });

  // Score Semifinals (4 teams)
  prediction.semifinals.forEach((team) => {
    if (solutionSemifinals.includes(team)) {
      score += 1;
    }
  });

  // Score Final (2 teams)
  prediction.final.forEach((team) => {
    if (solutionFinal.includes(team)) {
      score += 1;
    }
  });

  // Score Champion (1 point)
  if (solutionChampion && prediction.champion === solutionChampion) {
    score += 1;
  }

  // Score Bronze Medal (1 point for correct winner)
  if (solutionBronze && prediction.bronze === solutionBronze) {
    score += 1;
  }

  return score;
}
