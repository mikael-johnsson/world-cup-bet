"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { betSchema, BetInput } from "@/lib/validationSchemas";
import { deriveAdvancingTeams } from "@/lib/deriveAdvancingTeams";
import { useAuth } from "@/context/AuthContext";
import GroupStageSection from "./GroupStageSection";
import KnockoutSection from "./KnockoutSection";
import Link from "next/link";
import Heading from "./Heading";
import { Group, GroupFixture, Solution, Team, TournamentType } from "@/types";

interface BetFormProps {
  tournamentId: string;
  tournamentData: TournamentType; // Full tournament document
}

export default function BetForm({
  tournamentId,
  tournamentData,
}: BetFormProps) {
  const { authUser, isAuthLoading, refreshAuth } = useAuth();
  const [existingBet, setExistingBet] = useState<BetInput | null>(null);
  const [isLoadingBet, setIsLoadingBet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deadlineDate, setDeadlineDate] = useState<string | null>(null);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
  const [solution, setSolution] = useState<Solution | null>(null);

  const fetchDeadline = async () => {
    try {
      const response = await fetch("/api/config/betting-deadline");
      if (response.ok) {
        const data = await response.json();
        setDeadlineDate(data.deadline);
        setIsDeadlinePassed(data.isPassed);
      }
    } catch (error) {
      console.error("Error fetching deadline config:", error);
    }
  };

  const fetchSolution = async () => {
    try {
      const response = await fetch(
        `/api/solutions?tournamentId=${tournamentId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setSolution(data.solution);
      } else if (response.status === 404) {
        // No solution yet - this is expected early in tournament
        setSolution(null);
      }
    } catch (error) {
      console.error("Error fetching solution:", error);
    }
  };

  const fetchExistingBet = async () => {
    setIsLoadingBet(true);
    try {
      const response = await fetch(`/api/bets?tournamentId=${tournamentId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("this is existingBet: ", data);

        if (data.predictions) {
          setExistingBet(data as BetInput);
        }
      }
    } catch (error) {
      console.error("Error loading existing bet:", error);
    } finally {
      setIsLoadingBet(false);
    }
  };

  useEffect(() => {
    refreshAuth();
    fetchDeadline();
    fetchSolution();
  }, []);

  useEffect(() => {
    if (authUser && !isAuthLoading) {
      fetchExistingBet();
    }
  }, [authUser, isAuthLoading, tournamentId]);

  const methods = useForm<BetInput>({
    resolver: zodResolver(betSchema),
    defaultValues: existingBet || {
      tournamentId,
      predictions: {
        groupStage: tournamentData.groups.map((group: Group) => ({
          groupName: group.name,
          matches: group.fixtures.map((fixture: GroupFixture) => ({
            matchId: fixture.matchId,
            predictedHomeGoals: 0,
            predictedAwayGoals: 0,
          })),
        })),
        knockout: {
          roundOf16: [],
          quarterfinals: [],
          semifinals: [],
          final: [],
          champion: "",
          bronze: "",
        },
      },
    },
  });

  useEffect(() => {
    if (existingBet) {
      methods.reset(existingBet);
    }
  }, [existingBet, methods]);

  // Watch group stage to know when to show knockout
  const groupStageWatch = useWatch({
    control: methods.control,
    name: "predictions.groupStage",
  });

  // Check if all group stage predictions are filled
  const isGroupStageFilled =
    groupStageWatch &&
    groupStageWatch.every((group) =>
      group.matches.every(
        (match) =>
          match.predictedHomeGoals >= 0 && match.predictedAwayGoals >= 0,
      ),
    );

  // Calculate the 32 teams that advance from group stage
  const advancingTeams = useMemo(() => {
    if (!isGroupStageFilled || !groupStageWatch) {
      return [];
    }
    return deriveAdvancingTeams(groupStageWatch, tournamentData.groups);
  }, [isGroupStageFilled, groupStageWatch, tournamentData.groups]);

  // Create a Map of team code to team name for easy lookup
  const teamMap = useMemo(() => {
    const map = new Map<string, string>();

    // Add all teams from all groups
    tournamentData.groups.forEach((group: Group) => {
      group.teams.forEach((team: Team) => {
        map.set(team.code, team.name || team.code);
      });
    });

    return map;
  }, [tournamentData.groups]);

  // Format deadline for display
  const formatDeadlineDisplay = (isoString: string | null): string => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleString("sv-SE", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Stockholm",
      });
    } catch {
      return "";
    }
  };

  // Check if button is invalid
  const onInvalid = (errors: any) => {
    console.error("Validation blocked submit:", errors);
    setSubmitMessage({
      type: "error",
      text: "Tipset är inte korrekt ifyllt, se över slutspelsfasen.",
    });
  };

  const onSubmit = async (data: BetInput) => {
    console.log("Submitting bet:", data);
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error("" + result.error || "Misslyckades att skicka in tips");
      }

      setSubmitMessage({
        type: "success",
        text: `${result.message}`,
      });

      // Reset form on successful submission (optional)
      // methods.reset();
    } catch (error: any) {
      setSubmitMessage({
        type: "error",
        text: error.message || "Oväntat fel",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // If a Bet exists for this user, we should load it and populate the form (not implemented in this snippet)

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="p-4 bg-gray-100 text-gray-700 rounded-lg">
          Loading...
        </div>
      </div>
    );
  }

  // Show authentication prompt if not logged in
  if (!authUser) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-900 mb-4">
            Du måste vara inloggad för att kunna lämna in ditt tips.
          </p>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Logga in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium"
            >
              Registrera
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit, onInvalid)}
        className="space-y-8 max-w-6xl mx-auto"
      >
        {/* Deadline Display */}
        {deadlineDate && (
          <div
            className={`mb-6 p-3 rounded-lg ${
              isDeadlinePassed
                ? "bg-red-50 border border-red-200"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                isDeadlinePassed ? "text-red-700" : "text-green-500"
              }`}
            >
              Deadline: {formatDeadlineDisplay(deadlineDate)}
            </p>
          </div>
        )}

        {/* Group Stage Section */}
        <GroupStageSection
          groups={tournamentData.groups}
          solution={solution}
          isDeadlinePassed={isDeadlinePassed}
        />

        {/* Knockout Section - only show if group stage is filled */}
        {isGroupStageFilled && advancingTeams.length === 32 && (
          <KnockoutSection
            advancingTeams={advancingTeams}
            allTeams={teamMap}
            solution={solution ? solution : undefined}
            isDeadlinePassed={isDeadlinePassed}
          />
        )}

        {/* Submit Button */}
        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || !isGroupStageFilled || isDeadlinePassed}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {isSubmitting ? "Skickar..." : "Skicka in tips"}
          </button>
        </div>

        {/* Deadline Passed Message */}
        {isDeadlinePassed && (
          <div className="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
            <p className="font-semibold">
              Deadline för att lämna in tips har passerat.
            </p>
            <p className="text-sm mt-1">Inga nya tips kan tas emot.</p>
          </div>
        )}

        {/* Messages */}
        {submitMessage && (
          <div
            className={`p-4 rounded-lg ${
              submitMessage.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {submitMessage.text}
          </div>
        )}
      </form>
    </FormProvider>
  );
}
