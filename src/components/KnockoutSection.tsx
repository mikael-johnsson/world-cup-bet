"use client";

import { useFormContext, useWatch, useFieldArray } from "react-hook-form";
import { BetInput } from "@/lib/validationSchemas";

interface KnockoutSectionProps {
  advancingTeams: string[]; // 32 teams that advanced from groups
  allTeams: Map<string, string>; // team code -> team name mapping
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
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">
          Knockout Stage Predictions
        </h2>
        <p className="text-gray-600 mb-4">
          Select your predicted advancing teams round by round. Each round shows
          the eligible teams from the previous round.
        </p>
      </div>

      {/* Round of 32 - Starting point with 32 advancing teams */}
      <RoundOf32Section
        advancingTeams={advancingTeams}
        allTeams={allTeams}
        selectedTeams={knockoutPredictions?.roundOf16 || []}
      />

      {/* Round of 16 - if 16 teams selected in R32 */}
      {knockoutPredictions?.roundOf16?.length === 16 && (
        <ProgressionRound
          roundName="Round of 16"
          nextRoundFieldName="predictions.knockout.quarterfinals"
          eligibleTeams={knockoutPredictions.roundOf16}
          selectedTeams={knockoutPredictions.quarterfinals || []}
          selectCount={8}
          allTeams={allTeams}
        />
      )}

      {/* Quarterfinals - if 8 teams selected in R16 */}
      {knockoutPredictions?.quarterfinals?.length === 8 && (
        <ProgressionRound
          roundName="Quarterfinals"
          nextRoundFieldName="predictions.knockout.semifinals"
          eligibleTeams={knockoutPredictions.quarterfinals}
          selectedTeams={knockoutPredictions.semifinals || []}
          selectCount={4}
          allTeams={allTeams}
        />
      )}

      {/* Semifinals - if 4 teams selected in QF */}
      {knockoutPredictions?.semifinals?.length === 4 && (
        <ProgressionRound
          roundName="Semifinals"
          nextRoundFieldName="predictions.knockout.final"
          eligibleTeams={knockoutPredictions.semifinals}
          selectedTeams={knockoutPredictions.final || []}
          selectCount={2}
          allTeams={allTeams}
        />
      )}

      {/* Final & Bronze - if 2 teams selected in SF */}
      {knockoutPredictions?.final?.length === 2 && (
        <>
          <FinalSection
            finalists={knockoutPredictions.final}
            allTeams={allTeams}
            selectedChampion={knockoutPredictions.champion}
          />
          <BronzeSection
            semifinalLosers={knockoutPredictions.semifinals}
            selectedBronzeFinalists={knockoutPredictions.bronze}
            allTeams={allTeams}
            knockoutPredictions={knockoutPredictions}
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
}

function RoundOf32Section({
  advancingTeams,
  allTeams,
  selectedTeams,
}: RoundOf32SectionProps) {
  const { register } = useFormContext<BetInput>();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">
        Round of 32 — Select 16 Teams to Advance
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        These 32 teams qualified from the group stage. Select 16 to advance to
        the Round of 16.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {advancingTeams.map((teamCode) => (
          <label
            key={teamCode}
            className="flex items-center gap-2 p-3 border border-gray-300 rounded hover:bg-blue-50 cursor-pointer"
          >
            <input
              type="checkbox"
              value={teamCode}
              {...register("predictions.knockout.roundOf16")}
              className="w-4 h-4 rounded"
            />
            <span className="font-semibold">
              {allTeams.get(teamCode) || teamCode}
            </span>
          </label>
        ))}
      </div>

      <p className="text-sm text-gray-600 mt-4">
        Selected: {selectedTeams.length} / 16 teams
      </p>
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
}

function ProgressionRound({
  roundName,
  nextRoundFieldName,
  eligibleTeams,
  selectedTeams,
  selectCount,
  allTeams,
}: ProgressionRoundProps) {
  const { register } = useFormContext<BetInput>();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">
        {roundName} — Select {selectCount} Teams to Advance
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {eligibleTeams.map((teamCode) => (
          <label
            key={teamCode}
            className="flex items-center gap-2 p-3 border border-gray-300 rounded hover:bg-blue-50 cursor-pointer"
          >
            <input
              type="checkbox"
              value={teamCode}
              {...register(nextRoundFieldName)}
              className="w-4 h-4 rounded"
            />
            <span className="font-semibold">
              {allTeams.get(teamCode) || teamCode}
            </span>
          </label>
        ))}
      </div>

      <p className="text-sm text-gray-600 mt-4">
        Selected: {selectedTeams.length} / {selectCount} teams
      </p>
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
}

function FinalSection({
  finalists,
  allTeams,
  selectedChampion,
}: FinalSectionProps) {
  const { register } = useFormContext<BetInput>();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">Final — Select Champion</h3>

      <div className="space-y-3">
        {finalists.map((teamCode) => (
          <label
            key={teamCode}
            className="flex items-center gap-3 p-4 border border-gray-300 rounded hover:bg-blue-50 cursor-pointer"
          >
            <input
              type="radio"
              value={teamCode}
              {...register("predictions.knockout.champion")}
              className="w-4 h-4"
            />
            <span className="font-semibold text-lg">
              {allTeams.get(teamCode) || teamCode}
            </span>
          </label>
        ))}
      </div>

      <p className="text-sm text-gray-600 mt-4">
        Champion:{" "}
        {selectedChampion ? allTeams.get(selectedChampion) : "Not selected"}
      </p>
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
}

function BronzeSection({
  semifinalLosers,
  selectedBronzeFinalists,
  allTeams,
  knockoutPredictions,
}: BronzeSectionProps) {
  const { register } = useFormContext<BetInput>();

  // Get the two semifinal losers (not in final)
  const finalists = knockoutPredictions.final || [];
  const bronzeligibleTeams = semifinalLosers.filter(
    (team: string) => !finalists.includes(team),
  );

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">Bronze Medal — Third Place</h3>
      <p className="text-sm text-gray-600 mb-4">
        The two semifinal losers compete for the bronze medal.
      </p>

      {/* Bronze winner selection */}
      {bronzeligibleTeams.length === 2 && (
        <div>
          <p className="font-semibold mb-3">Select Bronze Medal Winner:</p>
          <div className="space-y-3">
            {bronzeligibleTeams.map((teamCode: string) => (
              <label
                key={teamCode}
                className="flex items-center gap-3 p-4 border border-gray-300 rounded hover:bg-orange-50 cursor-pointer"
              >
                <input
                  type="radio"
                  value={teamCode}
                  {...register("predictions.knockout.bronze")}
                  className="w-4 h-4"
                />
                <span className="font-semibold text-lg">
                  {allTeams.get(teamCode) || teamCode}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
