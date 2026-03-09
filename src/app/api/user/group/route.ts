import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import { requireUser } from "@/lib/authGuards";
import { userGroupSchema } from "@/lib/validationSchemas";
import { User } from "@/models/User";

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
    const validatedData = userGroupSchema.parse(payload);

    const user = await User.findByIdAndUpdate(
      auth.payload!.userId,
      { group: validatedData.group },
      { new: true },
    ).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Group updated successfully",
      group: user.group,
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
