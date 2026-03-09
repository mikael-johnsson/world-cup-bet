import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/User";

/**
 * GET /api/groups
 *
 * Returns all unique group names currently used by users.
 */
export async function GET() {
  try {
    await connectDB();

    const groups = await User.distinct("group");
    const sortedGroups = (groups as string[]).sort((a, b) =>
      a.localeCompare(b),
    );

    return NextResponse.json({ groups: sortedGroups }, { status: 200 });
  } catch (error) {
    console.error("Groups error:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 },
    );
  }
}
