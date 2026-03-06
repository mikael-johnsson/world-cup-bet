import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Solution } from "@/models/Solution";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");

    if (!tournamentId) {
      return NextResponse.json(
        { error: "tournamentId is required" },
        { status: 400 },
      );
    }

    const solution = await Solution.findOne({ tournamentId });

    if (!solution) {
      return NextResponse.json(
        { error: "Solution not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      solution: {
        _id: solution._id,
        tournamentId: solution.tournamentId,
        predictions: solution.predictions,
        createdAt: solution.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/solutions:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
