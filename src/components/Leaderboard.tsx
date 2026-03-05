"use client";

import { useEffect, useState } from "react";

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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [tournamentId, limit]);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Leaderboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Leaderboard</h2>
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Leaderboard</h2>
        <div className="flex items-center gap-3 text-red-700">
          <span className="text-lg">⚠️</span>
          <p>{error}</p>
        </div>
        <button
          onClick={fetchLeaderboard}
          className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Leaderboard</h2>
        <p className="text-center text-gray-500">
          No bets with scores yet. Check back after scoring is calculated.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-bold text-gray-900">Leaderboard</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Rank
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Username
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                Group Stage
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                Knockout
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                Total
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
                  <span className="inline-block w-8 rounded-full bg-blue-100 text-center font-bold text-blue-700">
                    {entry.rank}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {entry.username}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {entry.groupStageScore}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {entry.knockoutScore}
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
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
      >
        Refresh
      </button>
    </div>
  );
}
