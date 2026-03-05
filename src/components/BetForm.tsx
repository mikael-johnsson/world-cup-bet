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

interface BetFormProps {
  tournamentId: string;
  tournamentData: any; // Full tournament document, this should be changed
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

  useEffect(() => {
    refreshAuth();
  }, []);

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
    if (authUser && !isAuthLoading) {
      fetchExistingBet();
    }
  }, [authUser, isAuthLoading, tournamentId]);

  const methods = useForm<BetInput>({
    resolver: zodResolver(betSchema),
    defaultValues: existingBet || {
      tournamentId,
      predictions: {
        groupStage: tournamentData.groups.map((group: any) => ({
          groupName: group.name,
          matches: group.fixtures.map((fixture: any) => ({
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
    tournamentData.groups.forEach((group: any) => {
      group.teams.forEach((team: any) => {
        map.set(team.code, team.name || team.code);
      });
    });

    return map;
  }, [tournamentData.groups]);

  // Check if button is invalid
  const onInvalid = (errors: any) => {
    console.error("Validation blocked submit:", errors);
    setSubmitMessage({
      type: "error",
      text: "Form is invalid. Check knockout selections.",
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
        throw new Error(result.error || "Failed to submit bet");
      }

      setSubmitMessage({
        type: "success",
        text: `${result.message} (ID: ${result.betId})`,
      });

      // Reset form on successful submission (optional)
      // methods.reset();
    } catch (error: any) {
      setSubmitMessage({
        type: "error",
        text: error.message || "An error occurred",
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
        <h1 className="text-3xl font-bold mb-8">World Cup Bet Form</h1>
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
        <h1 className="text-3xl font-bold mb-8">World Cup Bet Form</h1>
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-900 mb-4">
            You need to be logged in to submit bets.
          </p>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium"
            >
              Sign Up
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
        <h1 className="text-3xl font-bold mb-8">World Cup Bet Form</h1>

        {/* Group Stage Section */}
        <GroupStageSection groups={tournamentData.groups} />

        {/* Knockout Section - only show if group stage is filled */}
        {isGroupStageFilled && advancingTeams.length === 32 && (
          <KnockoutSection advancingTeams={advancingTeams} allTeams={teamMap} />
        )}

        {/* Submit Button */}
        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || !isGroupStageFilled}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {isSubmitting ? "Submitting..." : "Submit Bet"}
          </button>
        </div>

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
