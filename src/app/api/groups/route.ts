import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Group } from "@/models/Group";

/**
 * GET /api/groups
 *
 * Returns available groups sorted by name.
 *
 * During migration we return:
 * - groups: string[] (legacy frontend compatibility)
 * - groupSummaries: { id, name }[] (new contract)
 */
export async function GET() {
  try {
    await connectDB();

    const groupDocs = await Group.find({})
      .select("_id name")
      .sort({ name: 1 })
      .lean();

    const groupSummaries = groupDocs.map((group) => ({
      id: group._id.toString(),
      name: group.name,
    }));

    const groups = groupSummaries.map((group) => group.name);

    return NextResponse.json({ groups, groupSummaries }, { status: 200 });
  } catch (error) {
    console.error("Groups error:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 },
    );
  }
}
