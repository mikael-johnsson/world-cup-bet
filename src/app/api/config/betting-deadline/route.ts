import { NextResponse } from "next/server";
import { getDeadlineStatus } from "@/lib/deadlineUtils";

/**
 * GET /api/config/betting-deadline
 *
 * Public endpoint to retrieve betting deadline and status.
 * Used by frontend to determine whether betting is still open.
 *
 * Response:
 *   - 200: { deadline: ISO string, isPassed: boolean }
 *
 * Example Response:
 *   {
 *     "deadline": "2026-06-11T21:00:00.000Z",
 *     "isPassed": false
 *   }
 */
export async function GET() {
  try {
    const status = getDeadlineStatus();
    return NextResponse.json(status, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching deadline config:", error);
    return NextResponse.json(
      { error: "Failed to retrieve deadline configuration" },
      { status: 500 },
    );
  }
}
