import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Solution } from "@/models/Solution";
import { Tournament } from "@/models/Tournament";
import { Bet } from "@/models/Bet";
import { solutionPredictionsSchema } from "@/lib/validationSchemas";
import { requireAdmin } from "@/lib/authGuards";
import { calculateBetScore } from "@/lib/scoring/calculateScore";

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const auth = requireAdmin(request);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    await connectDB();

    const payload = await request.json();

    // Validate input
    const { tournamentId, predictions } = payload;

    if (!tournamentId) {
      return NextResponse.json(
        { error: "tournamentId is required" },
        { status: 400 },
      );
    }

    const validatedPredictions = solutionPredictionsSchema.parse(predictions);

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    // Check if solution already exists
    let solution = await Solution.findOne({ tournamentId });
    let isNewSolution = false;

    if (solution) {
      // Update existing solution (complete overwrite)
      solution.predictions = validatedPredictions;
      await solution.save();
    } else {
      // Create new solution
      solution = await Solution.create({
        tournamentId,
        predictions: validatedPredictions,
      });
      isNewSolution = true;
    }

    // Auto-recalculate scores for all bets
    const bets = await Bet.find({ tournamentId });
    let scoredCount = 0;

    if (bets.length > 0) {
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
      scoredCount = bets.length;
    }

    return NextResponse.json(
      {
        success: true,
        solutionId: solution._id,
        message: isNewSolution
          ? "Solution created successfully"
          : "Solution updated successfully",
        scoredCount,
      },
      { status: isNewSolution ? 201 : 200 },
    );
  } catch (error: any) {
    console.error("Error in POST /api/admin/solution:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
