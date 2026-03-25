import connectDB from "@/lib/db";
import { seedTournament } from "@/lib/seedTournament";
import BetForm from "@/components/BetForm";
import Leaderboard from "@/components/Leaderboard";
import GroupManagement from "@/components/GroupManagement";
import Heading from "@/components/Heading";
import ChatPanel from "@/components/ChatPanel";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-12">
        <div className="max-w-8xl mx-auto">
          <div className="mb-8 text-center">
            <Heading />
            <p className="text-green-500">
              Betta på VM 2026! Deadline är innan första matchen startar. Lycka
              till!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Leaderboard */}
            {/* STICKY LEFT SIDE <div className="lg:col-span-1 lg:sticky lg:top-2 lg:self-start"> */}

            <div className="lg:col-span-1">
              {/* remove div when real tournament data is loaded */}
              <div className="rounded-lg border border-gray-200 bg-red-400 text-green-500 p-6 my-5">
                <p>
                  OBS! Den här sidan är än så länge laddad med testdata. Riktiga
                  lag, matcher och tider blir tillgängliga när alla lag är
                  kvalificerade och matcher bestämda.
                </p>
              </div>
              <Leaderboard tournamentId={tournamentData._id} limit={10} />
              <GroupManagement />
              <div className="mt-6">
                <ChatPanel />
              </div>
            </div>

            {/* Right column: BetForm */}
            <div className="lg:col-span-2">
              <p>
                Fyll i resultaten på alla gruppspelsmatcher, när du är klar
                väljer du vilka lag som går vidare till åttondelsfinalen. Sen
                väljer du de lag som går vidare till kvartsfinal, semifinal och
                till slut vilka som vinner, och vilka som tar bronset.
              </p>
              <br />
              <p>
                Vill du ändra ditt tips? Nästa gång du loggar in finns det kvar
                här och väntar på dig. Fram tills turneringen startar kan du
                ändra ditt tips.
              </p>
              <br />
              <p>
                Du har väl heller inte glömt att gå med i en grupp här till
                vänster?
              </p>
              <br />
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
