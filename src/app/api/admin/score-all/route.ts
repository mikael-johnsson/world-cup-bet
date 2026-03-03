import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Bet } from "@/models/Bet";
import { Solution } from "@/models/Solution";
import { Tournament } from "@/models/Tournament";
import { calculateBetScore } from "@/lib/scoring/calculateScore";
import { requireAdmin } from "@/lib/authGuards";

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const auth = requireAdmin(request);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    await connectDB();

    const payload = await request.json();
    const { tournamentId } = payload;

    if (!tournamentId) {
      return NextResponse.json(
        { error: "tournamentId is required" },
        { status: 400 },
      );
    }

    // Get tournament
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    // Get solution
    const solution = await Solution.findOne({ tournamentId });
    if (!solution) {
      return NextResponse.json(
        { error: "Solution not found. Please set the solution first." },
        { status: 404 },
      );
    }

    // Get all bets
    const bets = await Bet.find({ tournamentId });

    if (bets.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No bets to score",
        scoredCount: 0,
      });
    }

    // Calculate scores for each bet
    const updatePromises = bets.map(async (bet) => {
      const scores = await calculateBetScore(bet, solution, tournament);

      bet.scoring = {
        groupStageScore: scores.groupStageScore,
        knockoutScore: scores.knockoutScore,
        totalScore: scores.totalScore,
        lastCalculated: new Date(),
      };

      await bet.save();
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Scored ${bets.length} bets successfully`,
      scoredCount: bets.length,
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/score-all:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
