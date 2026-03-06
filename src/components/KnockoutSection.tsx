"use client";

import { useFormContext, useWatch, useFieldArray } from "react-hook-form";
import { BetInput } from "@/lib/validationSchemas";
import ResultComparison from "./ResultComparison";

interface KnockoutSectionProps {
  advancingTeams: string[]; // 32 teams that advanced from groups
  allTeams: Map<string, string>; // team code -> team name mapping
  solution?: any; // Optional solution data to display actual results
  isDeadlinePassed?: boolean; // Whether betting deadline has passed (disables inputs)
}

/**
 * Knockout Section Component
 * Displays progression-based knockout predictions:
 * - Round of 32 (starting point: 32 advancing teams)
 * - Round of 16 (16 winners from R32)
 * - Quarterfinals (8 winners from R16)
 * - Semifinals (4 winners from QF)
 * - Final (2 winners from SF)
 * - Bronze medal (semifinal losers + bronze winner)
 */
export default function KnockoutSection({
  advancingTeams,
  allTeams,
  solution,
  isDeadlinePassed,
}: KnockoutSectionProps) {
  const { control } = useFormContext<BetInput>();

  // Watch the knockout predictions to derive eligible teams for each round
  const knockoutPredictions = useWatch({
    control,
    name: "predictions.knockout",
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Slutspel</h2>
        <p className="text-gray-600 mb-4">
          Välj vilka lag du tror går vidare till nästa runda i slutspelet. Börja
          med att välja de 16 lag som går vidare från gruppspelet till
          åttondelsfinalen. När du har valt de 16 lagen kommer du att kunna
          välja vilka som går vidare till kvartsfinal, semifinal, final och vem
          som vinner bronsmatchen.
        </p>
      </div>

      {/* Round of 32 - Starting point with 32 advancing teams */}
      <RoundOf32Section
        advancingTeams={advancingTeams}
        allTeams={allTeams}
        selectedTeams={knockoutPredictions?.roundOf16 || []}
        solution={solution}
        isDeadlinePassed={isDeadlinePassed}
      />

      {/* Round of 16 - if 16 teams selected in R32 */}
      {knockoutPredictions?.roundOf16?.length === 16 && (
        <ProgressionRound
          roundName="Åttondelsfinaler"
          nextRoundFieldName="predictions.knockout.quarterfinals"
          eligibleTeams={knockoutPredictions.roundOf16}
          selectedTeams={knockoutPredictions.quarterfinals || []}
          selectCount={8}
          allTeams={allTeams}
          solution={solution}
          solutionRoundName="quarterfinals"
          isDeadlinePassed={isDeadlinePassed}
        />
      )}

      {/* Quarterfinals - if 8 teams selected in R16 */}
      {knockoutPredictions?.quarterfinals?.length === 8 && (
        <ProgressionRound
          roundName="Kvartsfinaler"
          nextRoundFieldName="predictions.knockout.semifinals"
          eligibleTeams={knockoutPredictions.quarterfinals}
          selectedTeams={knockoutPredictions.semifinals || []}
          selectCount={4}
          allTeams={allTeams}
          solution={solution}
          solutionRoundName="semifinals"
          isDeadlinePassed={isDeadlinePassed}
        />
      )}

      {/* Semifinals - if 4 teams selected in QF */}
      {knockoutPredictions?.semifinals?.length === 4 && (
        <ProgressionRound
          roundName="Semifinaler"
          nextRoundFieldName="predictions.knockout.final"
          eligibleTeams={knockoutPredictions.semifinals}
          selectedTeams={knockoutPredictions.final || []}
          selectCount={2}
          allTeams={allTeams}
          solution={solution}
          solutionRoundName="final"
          isDeadlinePassed={isDeadlinePassed}
        />
      )}

      {/* Final & Bronze - if 2 teams selected in SF */}
      {knockoutPredictions?.final?.length === 2 && (
        <>
          <FinalSection
            finalists={knockoutPredictions.final}
            allTeams={allTeams}
            selectedChampion={knockoutPredictions.champion}
            isDeadlinePassed={isDeadlinePassed}
            solution={solution}
          />
          <BronzeSection
            semifinalLosers={knockoutPredictions.semifinals}
            selectedBronzeFinalists={knockoutPredictions.bronze}
            allTeams={allTeams}
            knockoutPredictions={knockoutPredictions}
            isDeadlinePassed={isDeadlinePassed}
            solution={solution}
          />
        </>
      )}
    </div>
  );
}

/**
 * Round of 32 component - shows 32 advancing teams grouped by group
 * User selects 16 teams to advance to Round of 16
 */
interface RoundOf32SectionProps {
  advancingTeams: string[];
  allTeams: Map<string, string>;
  selectedTeams: string[];
  solution?: any;
  isDeadlinePassed?: boolean;
}

function RoundOf32Section({
  advancingTeams,
  allTeams,
  selectedTeams,
  solution,
  isDeadlinePassed,
}: RoundOf32SectionProps) {
  const { register } = useFormContext<BetInput>();

  // Get actual teams that advanced from solution
  const actualAdvancedTeams = solution?.predictions?.knockout?.roundOf16 || [];

  // Helper to determine background color for each team
  const getTeamBgColor = (teamCode: string) => {
    const actuallyAdvanced = actualAdvancedTeams.includes(teamCode);
    const userSelected = selectedTeams.includes(teamCode);

    if (actuallyAdvanced) {
      return "bg-green-100 border-green-300";
    } else if (userSelected) {
      return "bg-red-100 border-red-300";
    }
    return "bg-white hover:bg-blue-50";
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">Sextondelsfinal</h3>
      <p className="text-sm text-gray-600 mb-4">
        De här 32 lagen kvalificerade sig från gruppspelet. Välj de 16 lag du
        tror går vidare till åttondelsfinalen.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {advancingTeams.map((teamCode) => (
          <label
            key={teamCode}
            className={`flex items-center gap-2 p-3 border rounded cursor-pointer ${getTeamBgColor(teamCode)} ${isDeadlinePassed ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              type="checkbox"
              value={teamCode}
              disabled={isDeadlinePassed}
              {...register("predictions.knockout.roundOf16")}
              className="w-4 h-4 rounded disabled:cursor-not-allowed"
            />
            <span className="font-semibold">
              {allTeams.get(teamCode) || teamCode}
            </span>
          </label>
        ))}
      </div>

      <p className="text-sm text-gray-600 mt-4">
        Valda: {selectedTeams.length} / 16 lag
      </p>
      <ResultComparison solution={solution} roundName="roundOf16" />
    </div>
  );
}

/**
 * Generic progression round component
 * Used for R16, QF, SF - shows eligible teams and lets user select the next round
 */
interface ProgressionRoundProps {
  roundName: string;
  nextRoundFieldName:
    | "predictions.knockout.quarterfinals"
    | "predictions.knockout.semifinals"
    | "predictions.knockout.final";
  eligibleTeams: string[]; // Teams eligible for this round (from previous round)
  selectedTeams: string[]; // Teams user selected for next round
  selectCount: number; // How many teams should be selected (8, 4, or 2)
  allTeams: Map<string, string>;
  solution?: any;
  solutionRoundName?: string;
  isDeadlinePassed?: boolean;
}

function ProgressionRound({
  roundName,
  nextRoundFieldName,
  eligibleTeams,
  selectedTeams,
  selectCount,
  allTeams,
  solution,
  solutionRoundName,
  isDeadlinePassed,
}: ProgressionRoundProps) {
  const { register } = useFormContext<BetInput>();

  // Get actual teams that advanced from solution
  const actualAdvancedTeams =
    solutionRoundName && solution?.predictions?.knockout?.[solutionRoundName]
      ? solution.predictions.knockout[solutionRoundName]
      : [];

  // Helper to determine background color for each team
  const getTeamBgColor = (teamCode: string) => {
    const actuallyAdvanced = actualAdvancedTeams.includes(teamCode);
    const userSelected = selectedTeams.includes(teamCode);

    if (actuallyAdvanced) {
      return "bg-green-100 border-green-300";
    } else if (userSelected) {
      return "bg-red-100 border-red-300";
    }
    return "bg-white hover:bg-blue-50";
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">
        {roundName} — välj {selectCount} lag att gå vidare
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {eligibleTeams.map((teamCode) => (
          <label
            key={teamCode}
            className={`flex items-center gap-2 p-3 border rounded cursor-pointer ${getTeamBgColor(teamCode)} ${isDeadlinePassed ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              type="checkbox"
              value={teamCode}
              disabled={isDeadlinePassed}
              {...register(nextRoundFieldName)}
              className="w-4 h-4 rounded disabled:cursor-not-allowed"
            />
            <span className="font-semibold">
              {allTeams.get(teamCode) || teamCode}
            </span>
          </label>
        ))}
      </div>

      <p className="text-sm text-gray-600 mt-4">
        Valda: {selectedTeams.length} / {selectCount} lag
      </p>
      {solutionRoundName && (
        <ResultComparison solution={solution} roundName={solutionRoundName} />
      )}
    </div>
  );
}

/**
 * Final section - user selects champion
 */
interface FinalSectionProps {
  finalists: string[];
  allTeams: Map<string, string>;
  selectedChampion: string;
  solution?: any;
  isDeadlinePassed?: boolean;
}

function FinalSection({
  finalists,
  allTeams,
  selectedChampion,
  solution,
  isDeadlinePassed,
}: FinalSectionProps) {
  const { register } = useFormContext<BetInput>();

  // Get actual champion from solution
  const actualChampion = solution?.predictions?.knockout?.champion || null;

  // Helper to determine background color for each team
  const getTeamBgColor = (teamCode: string) => {
    const isActualChampion = actualChampion === teamCode;
    const isUserSelected = selectedChampion === teamCode;

    if (isActualChampion) {
      return "bg-green-100 border-green-300";
    } else if (isUserSelected) {
      return "bg-red-100 border-red-300";
    }
    return "bg-white hover:bg-blue-50";
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">Final — välj mästare</h3>

      <div className="space-y-3">
        {finalists.map((teamCode) => (
          <label
            key={teamCode}
            className={`flex items-center gap-3 p-4 border rounded cursor-pointer ${getTeamBgColor(teamCode)} ${isDeadlinePassed ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              type="radio"
              value={teamCode}
              disabled={isDeadlinePassed}
              {...register("predictions.knockout.champion")}
              className="w-4 h-4 disabled:cursor-not-allowed"
            />
            <span className="font-semibold text-lg">
              {allTeams.get(teamCode) || teamCode}
            </span>
          </label>
        ))}
      </div>

      <p className="text-sm text-gray-600 mt-4">
        Vald mästare:{" "}
        {selectedChampion ? allTeams.get(selectedChampion) : "Inte valt"}
      </p>
      <ResultComparison solution={solution} roundName="champion" />
    </div>
  );
}

/**
 * Bronze medal section - user selects semifinal losers and bronze winner
 */
interface BronzeSectionProps {
  semifinalLosers: string[];
  selectedBronzeFinalists: any;
  allTeams: Map<string, string>;
  knockoutPredictions: any;
  solution?: any;
  isDeadlinePassed?: boolean;
}

function BronzeSection({
  semifinalLosers,
  selectedBronzeFinalists,
  allTeams,
  knockoutPredictions,
  solution,
  isDeadlinePassed,
}: BronzeSectionProps) {
  const { register } = useFormContext<BetInput>();

  // Get the two semifinal losers (not in final)
  const finalists = knockoutPredictions.final || [];
  const bronzeligibleTeams = semifinalLosers.filter(
    (team: string) => !finalists.includes(team),
  );

  // Get actual bronze winner from solution
  const actualBronzeWinner = solution?.predictions?.knockout?.bronze || null;

  // Helper to determine background color for each team
  const getTeamBgColor = (teamCode: string) => {
    const isActualBronzeWinner = actualBronzeWinner === teamCode;
    const isUserSelected = selectedBronzeFinalists === teamCode;

    if (isActualBronzeWinner) {
      return "bg-green-100 border-green-300";
    } else if (isUserSelected) {
      return "bg-red-100 border-red-300";
    }
    return "bg-white hover:bg-orange-50";
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">Bronsmedalj — Tredje Plats</h3>
      <p className="text-sm text-gray-600 mb-4">
        De två semifinalförlorarna tävlar om bronsmedaljen.
      </p>

      {/* Bronze winner selection */}
      {bronzeligibleTeams.length === 2 && (
        <div>
          <p className="font-semibold mb-3">Välj bronsmedaljör:</p>
          <div className="space-y-3">
            {bronzeligibleTeams.map((teamCode: string) => (
              <label
                key={teamCode}
                className={`flex items-center gap-3 p-4 border rounded cursor-pointer ${getTeamBgColor(teamCode)} ${isDeadlinePassed ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  value={teamCode}
                  disabled={isDeadlinePassed}
                  {...register("predictions.knockout.bronze")}
                  className="w-4 h-4 disabled:cursor-not-allowed"
                />
                <span className="font-semibold text-lg">
                  {allTeams.get(teamCode) || teamCode}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
      <ResultComparison solution={solution} roundName="bronze" />
    </div>
  );
}
