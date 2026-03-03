import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import { registerSchema } from "@/lib/validationSchemas";
import { hashPassword } from "@/lib/auth";
import { User } from "@/models/User";

/**
 * Creates a new user account.
 *
 * Steps:
 * 1) Validate request payload
 * 2) Check username/email uniqueness
 * 3) Hash password
 * 4) Save user with default role
 * 5) Return safe user fields (never password hash)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const payload = await request.json();
    const validatedData = registerSchema.parse(payload);

    const normalizedUsername = validatedData.username.trim();
    const normalizedEmail = validatedData.email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existingUser) {
      if (existingUser.username === normalizedUsername) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(validatedData.password);

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      firstName: validatedData.firstName.trim(),
      lastName: validatedData.lastName.trim(),
      passwordHash,
      role: "user",
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
