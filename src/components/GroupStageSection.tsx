"use client";

import { useMemo } from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { BetInput } from "@/lib/validationSchemas";
import {
  calculateGroupStandings,
  calculateThirdPlaceStandings,
} from "@/lib/standings/calculateGroupStandings";
import {
  Group,
  GroupFixture,
  Solution,
  TeamStanding,
  ThirdPlaceStanding,
} from "@/types";
import ResultComparison from "./ResultComparison";

interface GroupStageSectionProps {
  groups: Group[];
  solution?: Solution | null;
  isDeadlinePassed?: boolean;
}

type StandingsTableType = "group" | "thirdPlace";

/**
 * Decides whether a team should be marked as qualified in standings tables.
 * A row is qualified only when both are true:
 * 1) It is in a qualification position for that table type.
 * 2) The team code exists in published solution roundOf32.
 */
function isQualifiedForDisplay(
  teamCode: string,
  qualifiedRoundOf32TeamCodes: Set<string>,
): boolean {
  return qualifiedRoundOf32TeamCodes.has(teamCode);
}
/**
 *
 * @param groups - Array of group objects, each containing teams and fixtures
 * @param solution - Optional solution object containing actual results
 * @param isDeadlinePassed - Whether betting deadline has passed (disables inputs)
 * @returns A full page with inputs for group stage predictions and dynamic
 * standings tables that update as the user enters predictions.
 */
export default function GroupStageSection({
  groups,
  solution,
  isDeadlinePassed,
}: GroupStageSectionProps) {
  const { control } = useFormContext<BetInput>();
  const { fields: groupFields } = useFieldArray({
    control,
    name: "predictions.groupStage",
  });

  const watchedGroupPredictions = useWatch({
    control,
    name: "predictions.groupStage",
  });

  const groupStandings = useMemo(
    () =>
      groups.map((group, groupIdx) =>
        calculateGroupStandings(group, watchedGroupPredictions?.[groupIdx]),
      ),
    [groups, watchedGroupPredictions],
  );

  const thirdPlaceStandings = useMemo(
    () => calculateThirdPlaceStandings(groups, watchedGroupPredictions),
    [groups, watchedGroupPredictions],
  );

  const qualifiedRoundOf32TeamCodes = useMemo(() => {
    const publishedRoundOf32 = solution?.predictions?.knockout?.roundOf32;

    if (!Array.isArray(publishedRoundOf32)) {
      return new Set<string>();
    }

    return new Set(
      publishedRoundOf32.filter(
        (teamCode: unknown): teamCode is string =>
          typeof teamCode === "string" && teamCode.length > 0,
      ),
    );
  }, [solution]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Gruppspel</h2>
        <p className="text-gray-600 mb-4 w-full lg:w-3/4">
          Fyll i slutresultatet för varje match i gruppspelet. Ställningen i
          varje grupp och de bästa tredjeplacerade lagen uppdateras dynamiskt.
          Deadline är innan första matchen startar, så du kan ändra ditt tips
          fram till dess.
        </p>
      </div>

      {groupFields.map((groupField, groupIdx) => {
        const group = groups[groupIdx];
        const standings = groupStandings[groupIdx] || [];

        // Returns fixture inputs and standings table for a single group
        return (
          <div
            key={groupField.id}
            className="bg-white p-6 rounded-lg border border-gray-200"
          >
            <h3 className="text-xl font-semibold mb-4">{group.name}</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                {group.fixtures.map(
                  (fixture: GroupFixture, fixtureIdx: number) => (
                    <MatchInput
                      key={fixture.matchId}
                      groupIdx={groupIdx}
                      fixtureIdx={fixtureIdx}
                      fixture={fixture}
                      solution={solution}
                      groupName={group.name}
                      isDeadlinePassed={isDeadlinePassed}
                    />
                  ),
                )}
              </div>

              <StandingsTable
                standings={standings}
                qualifiedRoundOf32TeamCodes={qualifiedRoundOf32TeamCodes}
              />
            </div>
          </div>
        );
      })}

      {/* The third place table */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Bästa treor</h3>
        <ThirdPlaceTable
          standings={thirdPlaceStandings}
          qualifiedRoundOf32TeamCodes={qualifiedRoundOf32TeamCodes}
        />
      </div>
    </div>
  );
}

/**
 *
 * @param standings - Array of team standings to display in the table
 * @returns A styled table showing team standings with points, goal difference, etc.
 * The top 2 teams are highlighted to indicate qualification for knockout stage.
 */
function StandingsTable({
  standings,
  qualifiedRoundOf32TeamCodes,
}: {
  standings: TeamStanding[];
  qualifiedRoundOf32TeamCodes: Set<string>;
}) {
  const hasPublishedRoundOf32 = qualifiedRoundOf32TeamCodes.size > 0;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <caption className="sr-only">
          {hasPublishedRoundOf32
            ? "Qualified round of 32 teams are available in solution data"
            : "No published round of 32 teams in solution data yet"}
        </caption>
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-2 text-left">Pos</th>
            <th className="px-2 py-2 text-left">Team</th>
            <th className="px-2 py-2 text-right">S</th>
            <th className="px-2 py-2 text-right">GM</th>
            <th className="px-2 py-2 text-right">IM</th>
            <th className="px-2 py-2 text-right">MS</th>
            <th className="px-2 py-2 text-right">P</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, index) => (
            <tr
              key={team.teamCode}
              className={`border-t border-gray-100 ${
                index < 2 ? "bg-green-100" : index === 2 ? "bg-yellow-100" : ""
              }`}
            >
              <td className="px-2 py-2">
                {isQualifiedForDisplay(
                  team.teamCode,
                  qualifiedRoundOf32TeamCodes,
                )
                  ? `${index + 1} - Q`
                  : index + 1}
              </td>
              <td className="px-2 py-2 font-medium">{team.teamCode}</td>
              <td className="px-2 py-2 text-right">{team.played}</td>
              <td className="px-2 py-2 text-right">{team.goalsFor}</td>
              <td className="px-2 py-2 text-right">{team.goalsAgainst}</td>
              <td className="px-2 py-2 text-right">{team.goalDifference}</td>
              <td className="px-2 py-2 text-right font-semibold">
                {team.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 *
 * @param standings - Array of third place team standings to display in the table
 * @returns A styled table showing third place team standings with points, goal difference, etc.
 */
function ThirdPlaceTable({
  standings,
  qualifiedRoundOf32TeamCodes,
}: {
  standings: ThirdPlaceStanding[];
  qualifiedRoundOf32TeamCodes: Set<string>;
}) {
  const hasPublishedRoundOf32 = qualifiedRoundOf32TeamCodes.size > 0;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <caption className="sr-only">
          {hasPublishedRoundOf32
            ? "Qualified round of 32 teams are available in solution data"
            : "No published round of 32 teams in solution data yet"}
        </caption>
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-2 text-left">Pos</th>
            <th className="px-2 py-2 text-left">Team</th>
            <th className="px-2 py-2 text-left">Grupp</th>
            <th className="px-2 py-2 text-right">S</th>
            <th className="px-2 py-2 text-right">GM</th>
            <th className="px-2 py-2 text-right">IM</th>
            <th className="px-2 py-2 text-right">MS</th>
            <th className="px-2 py-2 text-right">P</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, index) => (
            <tr
              key={`${team.groupName}-${team.teamCode}`}
              className={`border-t border-gray-100 ${
                index < 8 ? "bg-green-100" : ""
              }`}
            >
              <td className="px-2 py-2">
                {isQualifiedForDisplay(
                  team.teamCode,
                  qualifiedRoundOf32TeamCodes,
                )
                  ? `${index + 1} - Q`
                  : index + 1}
              </td>
              <td className="px-2 py-2 font-medium">{team.teamCode}</td>
              <td className="px-2 py-2">{team.groupName}</td>
              <td className="px-2 py-2 text-right">{team.played}</td>
              <td className="px-2 py-2 text-right">{team.goalsFor}</td>
              <td className="px-2 py-2 text-right">{team.goalsAgainst}</td>
              <td className="px-2 py-2 text-right">{team.goalDifference}</td>
              <td className="px-2 py-2 text-right font-semibold">
                {team.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface MatchInputProps {
  groupIdx: number;
  fixtureIdx: number;
  fixture: GroupFixture;
  solution?: Solution | null;
  groupName: string;
  isDeadlinePassed?: boolean;
}

/**
 *
 * @param groupIdx - Index of the group in the groups array
 * @param fixtureIdx - Index of the fixture within the group's fixtures array
 * @param fixture - The fixture object containing home and away team info and match date
 * @param solution - Optional solution object containing actual results
 * @param groupName - Name of the group (e.g., "Group A")
 * @param isDeadlinePassed - Whether betting deadline has passed (disables inputs)
 * @returns A styled input component for predicting match results with actual results displayed when available
 */
function MatchInput({
  groupIdx,
  fixtureIdx,
  fixture,
  solution,
  groupName,
  isDeadlinePassed,
}: MatchInputProps) {
  const { register } = useFormContext<BetInput>();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded">
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {fixture.homeTeam.name} - {fixture.awayTeam.name}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(fixture.matchDate).toLocaleString("sv-SE", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "Europe/Stockholm",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="10"
            disabled={isDeadlinePassed}
            {...register(
              `predictions.groupStage.${groupIdx}.matches.${fixtureIdx}.predictedHomeGoals`,
              {
                valueAsNumber: true,
              },
            )}
            className="w-12 px-2 py-1 border border-gray-300 rounded text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200"
            placeholder="0"
          />
          <span className="font-bold text-gray-500">-</span>
          <input
            type="number"
            min="0"
            max="99"
            disabled={isDeadlinePassed}
            {...register(
              `predictions.groupStage.${groupIdx}.matches.${fixtureIdx}.predictedAwayGoals`,
              {
                valueAsNumber: true,
              },
            )}
            className="w-12 px-2 py-1 border border-gray-300 rounded text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200"
            placeholder="0"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <ResultComparison
          matchId={fixture.matchId}
          solution={solution}
          groupName={groupName}
        />
      </div>
    </div>
  );
}
