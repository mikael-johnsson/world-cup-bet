import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/auth";
import connectDB from "@/lib/db";
import { requireUser } from "@/lib/authGuards";
import { createGroupSchema } from "@/lib/validationSchemas";
import { Group } from "@/models/Group";
import { User } from "@/models/User";

/**
 * GET /api/user/group
 *
 * Returns the authenticated user's current group.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = requireUser(request);
    if (!auth.isAuthenticated) {
      return auth.response;
    }

    await connectDB();

    const user = await User.findById(auth.payload!.userId)
      .select("groupId")
      .lean<{
        groupId?: string;
      }>();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // User must have a groupId reference (set during migration).
    if (!user.groupId) {
      return NextResponse.json(
        { error: "User has no group assigned" },
        { status: 400 },
      );
    }

    const group = await Group.findById(user.groupId).select("_id name").lean();

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        group: { id: group._id.toString(), name: group.name },
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/user/group
 *
 * Updates the authenticated user's group.
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = requireUser(request);
    if (!auth.isAuthenticated) {
      return auth.response;
    }

    await connectDB();

    const payload = await request.json();
    const validatedData = createGroupSchema.parse(payload);

    const user = await User.findById(auth.payload!.userId).select(
      "_id groupId",
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const requestedGroupName = validatedData.groupName.trim();
    let targetGroup = await Group.findOne({ name: requestedGroupName });
    let action: "created" | "joined" = "joined";

    if (!targetGroup) {
      const passwordHash = await hashPassword(validatedData.password);
      targetGroup = await Group.create({
        name: requestedGroupName,
        passwordHash,
        users: [user._id],
      });
      action = "created";
    } else {
      const isValidPassword = await verifyPassword(
        validatedData.password,
        targetGroup.passwordHash,
      );

      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid group password" },
          { status: 403 },
        );
      }

      await Group.findByIdAndUpdate(targetGroup._id, {
        $addToSet: { users: user._id },
      });
      action = "joined";
    }

    // Keep Group.users aligned when the user switches from one group to another.
    if (
      user.groupId &&
      user.groupId.toString() !== targetGroup._id.toString()
    ) {
      await Group.findByIdAndUpdate(user.groupId, {
        $pull: { users: user._id },
      });
    }

    user.groupId = targetGroup._id;
    await user.save();

    return NextResponse.json({
      success: true,
      action,
      message: action === "created" ? "Group created" : "Group joined",
      group: {
        id: targetGroup._id.toString(),
        name: targetGroup.name,
      },
      // Legacy key kept temporarily during frontend migration.
      groupNameLegacy: targetGroup.name,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
