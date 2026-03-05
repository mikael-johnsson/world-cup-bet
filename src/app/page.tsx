import connectDB from "@/lib/db";
import { seedTournament } from "@/lib/seedTournament";
import BetForm from "@/components/BetForm";
import Leaderboard from "@/components/Leaderboard";

export default async function Home() {
  try {
    // Connect to database
    await connectDB();

    // Seed tournament if it doesn't exist
    const tournament = await seedTournament();

    if (!tournament) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="text-gray-600">Could not load tournament data</p>
          </div>
        </div>
      );
    }

    // Convert to plain object for client component
    const tournamentData = JSON.parse(JSON.stringify(tournament));

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">
              2026 FIFA World Cup Betting
            </h1>
            <p className="text-gray-600">
              Make your predictions for the tournament
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Leaderboard */}
            <div className="lg:col-span-1">
              <Leaderboard tournamentId={tournamentData._id} limit={10} />
            </div>

            {/* Right column: BetForm */}
            <div className="lg:col-span-2">
              <BetForm
                tournamentId={tournamentData._id}
                tournamentData={tournamentData}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    console.error("Error loading page:", error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">
            {error.message || "An error occurred loading the page"}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Make sure MongoDB is running and configured correctly in .env.local
          </p>
        </div>
      </div>
    );
  }
}
