import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Solution } from "@/models/Solution";
import { Tournament } from "@/models/Tournament";
import { betPredictionsSchema } from "@/lib/validationSchemas";
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

    // Validate input
    const { tournamentId, predictions } = payload;

    if (!tournamentId) {
      return NextResponse.json(
        { error: "tournamentId is required" },
        { status: 400 },
      );
    }

    const validatedPredictions = betPredictionsSchema.parse(predictions);

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

    if (solution) {
      // Update existing solution
      solution.predictions = validatedPredictions;
      await solution.save();
      return NextResponse.json({
        success: true,
        solutionId: solution._id,
        message: "Solution updated successfully",
      });
    } else {
      // Create new solution
      solution = await Solution.create({
        tournamentId,
        predictions: validatedPredictions,
      });

      return NextResponse.json(
        {
          success: true,
          solutionId: solution._id,
          message: "Solution created successfully",
        },
        { status: 201 },
      );
    }
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
