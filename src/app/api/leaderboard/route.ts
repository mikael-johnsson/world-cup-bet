import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Bet } from "@/models/Bet";
import { User } from "@/models/User";
import { extractAuthPayload } from "@/lib/authGuards";

/**
 * Leaderboard entry response shape
 * Represents a ranked bet with user info and score breakdown
 */
interface LeaderboardEntry {
  rank: number; // 1-indexed rank based on totalScore desc
  username: string; // Username from User document (or "Unknown" if not found)
  totalScore: number; // Combined group stage + knockout score
  groupStageScore: number; // Points from group stage predictions
  knockoutScore: number; // Points from knockout round predictions
}

/**
 * GET /api/leaderboard
 *
 * Query Parameters:
 *   - tournamentId (required): ObjectId of tournament to rank bets for
 *   - limit (optional): Max number of entries to return (default: 10)
 *
 * Response:
 *   - 200: { leaderboard: LeaderboardEntry[], group: string }
 *   - 400: Missing tournamentId
 *   - 500: Server error
 *
 * Notes:
 *   - Public endpoint (no auth required)
 *   - Returns only bets with persisted scores (from admin scoring)
 *   - Filters to authenticated user's group, or "default" for guests
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Step 2: Extract and validate tournamentId from query params
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");
    const limitParam = searchParams.get("limit");

    if (!tournamentId) {
      return NextResponse.json(
        { error: "tournamentId is required" },
        { status: 400 },
      );
    }

    // Parse and constrain limit (min 1, max 100)
    const limit = Math.min(Math.max(parseInt(limitParam || "10", 10), 1), 100);

    // Determine which group leaderboard should be shown.
    // Guests always see the default group.
    let targetGroup = "default";
    const authPayload = extractAuthPayload(request);

    if (authPayload) {
      const currentUser = await User.findById(authPayload.userId)
        .select("group")
        .lean();
      if (currentUser?.group) {
        targetGroup = currentUser.group;
      }
    }

    // Resolve users that belong to the target group.
    const groupUsers = await User.find({ group: targetGroup })
      .select("_id username")
      .lean();

    if (!groupUsers.length) {
      return NextResponse.json(
        { leaderboard: [], group: targetGroup },
        { status: 200 },
      );
    }

    const groupUserIds = groupUsers.map((user) => user._id.toString());

    // Step 3: Query top bets filtered by tournamentId and with userId
    // Step 6: Sort by totalScore descending, then submittedAt ascending for tie-breaking
    const bets = await Bet.find({
      tournamentId,
      userId: { $in: groupUserIds },
    })
      .sort({ "scoring.totalScore": -1, submittedAt: 1 })
      .limit(limit)
      .lean();

    if (!bets.length) {
      return NextResponse.json(
        { leaderboard: [], group: targetGroup },
        { status: 200 },
      );
    }

    // Build userId -> username map for quick lookup
    const userMap = new Map(
      groupUsers.map((user) => [user._id.toString(), user.username]),
    );

    // Step 5: Transform bets into LeaderboardEntry array with 1-indexed ranks
    const leaderboard: LeaderboardEntry[] = bets.map((bet, index) => ({
      rank: index + 1,
      username: userMap.get(bet.userId as string) || "Unknown",
      totalScore: bet.scoring.totalScore,
      groupStageScore: bet.scoring.groupStageScore,
      knockoutScore: bet.scoring.knockoutScore,
    }));

    return NextResponse.json(
      { leaderboard, group: targetGroup },
      { status: 200 },
    );
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}
