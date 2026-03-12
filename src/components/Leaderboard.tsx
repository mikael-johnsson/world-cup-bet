"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface LeaderboardEntry {
  rank: number;
  username: string;
  totalScore: number;
  groupStageScore: number;
  knockoutScore: number;
}

interface LeaderboardProps {
  tournamentId: string;
  limit?: number;
}

export default function Leaderboard({
  tournamentId,
  limit = 10,
}: LeaderboardProps) {
  const { authUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentGroup, setCurrentGroup] = useState("default");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [tournamentId, limit, authUser?.userId]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/leaderboard?tournamentId=${tournamentId}&limit=${limit}`,
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch leaderboard");
      }

      const data = await response.json();
      setLeaderboard(data.leaderboard);
      setCurrentGroup(typeof data.group === "string" ? data.group : "default");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Leaderboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const leaderboardHeading =
    currentGroup === "default"
      ? "Highscore"
      : `Highscore - Grupp: ${currentGroup}`;

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          {leaderboardHeading}
        </h2>
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          {leaderboardHeading}
        </h2>
        <div className="flex items-center gap-3 text-red-700">
          <span className="text-lg">⚠️</span>
          <p>{error}</p>
        </div>
        <button
          onClick={fetchLeaderboard}
          className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Försök igen
        </button>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          {leaderboardHeading}
        </h2>
        <p className="text-center text-gray-500">Inga tips med poäng än.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 ">
      <h2 className="mb-4 text-xl font-bold text-gray-900">
        {leaderboardHeading}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Plats
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Namn
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                Poäng
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr
                key={`${entry.rank}-${entry.username}`}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-gray-900">
                  <span className="inline-block w-8 rounded-full bg-green-100 text-center font-bold text-green-500">
                    {entry.rank}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {entry.username}
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">
                  {entry.totalScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={fetchLeaderboard}
        className="mt-4 rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
      >
        Uppdatera
      </button>
    </div>
  );
}
