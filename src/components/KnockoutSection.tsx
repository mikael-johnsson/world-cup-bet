"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { BetInput } from "@/lib/validationSchemas";

interface KnockoutSectionProps {
  matches: any[];
}

export default function KnockoutSection({ matches }: KnockoutSectionProps) {
  const { control } = useFormContext<BetInput>();
  const { fields: roundFields } = useFieldArray({
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
          Select your predicted winner for each knockout match.
        </p>
      </div>

      {roundFields.map((roundField, roundIdx) => (
        <KnockoutRound
          key={roundField.id}
          roundIdx={roundIdx}
          roundName={roundField.round}
          matches={matches}
        />
      ))}
    </div>
  );
}

interface KnockoutRoundProps {
  roundIdx: number;
  roundName: string;
  matches: any[];
}

function KnockoutRound({ roundIdx, roundName, matches }: KnockoutRoundProps) {
  const { control } = useFormContext<BetInput>();
  const { fields: matchFields } = useFieldArray({
    control,
    name: `predictions.knockout.${roundIdx}.matches`,
  });

  // Get round display name
  const roundNames: Record<string, string> = {
    roundOf32: "Round of 32",
    roundOf16: "Round of 16",
    quarterfinals: "Quarterfinals",
    semifinals: "Semifinals",
    final: "Final",
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">{roundNames[roundName]}</h3>

      <div className="space-y-4">
        {matchFields.map((matchField, matchIdx) => (
          <KnockoutMatchInput
            key={matchField.id}
            roundIdx={roundIdx}
            matchIdx={matchIdx}
            match={matches[matchIdx]}
          />
        ))}
      </div>
    </div>
  );
}

interface KnockoutMatchInputProps {
  roundIdx: number;
  matchIdx: number;
  match: any;
}

function KnockoutMatchInput({
  roundIdx,
  matchIdx,
  match,
}: KnockoutMatchInputProps) {
  const { register } = useFormContext<BetInput>();

  if (!match) return null;

  const teamAName =
    match.teamA.name || `Group ${match.teamA.code.split("")[0]}`;
  const teamBName =
    match.teamB.name || `Group ${match.teamB.code.split("")[0]}`;

  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">
          {teamAName} vs {teamBName}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <select
          {...register(
            `predictions.knockout.${roundIdx}.matches.${matchIdx}.predictedWinnerCode`,
          )}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="">Select winner</option>
          <option value={match.teamA.code}>{teamAName}</option>
          <option value={match.teamB.code}>{teamBName}</option>
        </select>
      </div>
    </div>
  );
}
