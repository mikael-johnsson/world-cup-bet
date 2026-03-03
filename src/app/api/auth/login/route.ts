import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import { loginSchema } from "@/lib/validationSchemas";
import {
  getAuthCookieName,
  getAuthCookieOptions,
  signAuthToken,
  verifyPassword,
} from "@/lib/auth";
import { User } from "@/models/User";

/**
 * Logs in an existing user using username + password.
 *
 * Steps:
 * 1) Validate request payload
 * 2) Find user by username
 * 3) Verify password hash
 * 4) Create JWT and set HttpOnly auth cookie
 * 5) Return safe user fields
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const payload = await request.json();
    const validatedData = loginSchema.parse(payload);

    const normalizedUsername = validatedData.username.trim();

    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    const isPasswordValid = await verifyPassword(
      validatedData.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    const token = signAuthToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

    response.cookies.set(getAuthCookieName(), token, getAuthCookieOptions());

    return response;
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
