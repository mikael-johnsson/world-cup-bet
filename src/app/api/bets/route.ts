import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Bet } from "@/models/Bet";
import { Tournament } from "@/models/Tournament";
import { betSchema } from "@/lib/validationSchemas";
import { requireUser } from "@/lib/authGuards";
import { isAfterBettingDeadline } from "@/lib/deadlineUtils";

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const auth = requireUser(request);
    if (!auth.isAuthenticated) {
      return auth.response;
    }

    const userId = auth.payload!.userId;

    await connectDB();

    const payload = await request.json();

    // Validate input
    const validatedData = betSchema.parse(payload);

    // Check if tournament exists
    const tournament = await Tournament.findById(validatedData.tournamentId);
    if (!tournament) {
      return NextResponse.json(
        { error: "Hittade inte turneringen" },
        { status: 404 },
      );
    }

    // Check if betting deadline has passed
    if (isAfterBettingDeadline()) {
      return NextResponse.json(
        { error: "Deadline för att lämna in tips har passerat." },
        { status: 400 },
      );
    }

    // Check if a bet already exists for this user and tournament (for update)
    let bet = await Bet.findOne({
      userId,
      tournamentId: validatedData.tournamentId,
    });

    if (bet) {
      // Update existing bet
      bet.predictions = validatedData.predictions;
      bet.submittedAt = new Date();
      await bet.save();
      return NextResponse.json({
        success: true,
        betId: bet._id,
        message: "Ditt tips har uppdaterats!",
      });
    } else {
      // Create new bet
      bet = await Bet.create({
        userId,
        tournamentId: validatedData.tournamentId,
        predictions: validatedData.predictions,
        submittedAt: new Date(),
        scoring: {
          groupStageScore: 0,
          knockoutScore: 0,
          totalScore: 0,
        },
      });

      return NextResponse.json(
        {
          success: true,
          betId: bet._id,
          message: "Ditt tips har skickats in!",
        },
        { status: 201 },
      );
    }
  } catch (error: any) {
    console.error("Error in POST /api/bets:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Valideringsfel", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const auth = requireUser(request);
    if (!auth.isAuthenticated) {
      return auth.response;
    }

    const userId = auth.payload!.userId;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");

    if (!tournamentId) {
      return NextResponse.json(
        { error: "tournamentId is required" },
        { status: 400 },
      );
    }

    // Get the bet for this user and tournament
    const bet = await Bet.findOne({ userId, tournamentId });

    if (!bet) {
      return NextResponse.json(
        { error: "Ditt tips hittades inte" },
        { status: 404 },
      );
    }

    return NextResponse.json(bet);
  } catch (error: any) {
    console.error("Error in GET /api/bets:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
