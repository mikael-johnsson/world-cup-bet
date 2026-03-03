import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getAuthCookieName } from "@/lib/auth";

/**
 * GET /api/auth/me
 *
 * Validates the user's JWT token from the auth_token cookie
 * and returns their current authentication context.
 *
 * Returns:
 *   - 200: {userId, username, role}
 *   - 401: Not authenticated or token invalid/expired
 */
export async function GET(request: NextRequest) {
  try {
    // Extract the auth token from cookies
    const token = request.cookies.get(getAuthCookieName())?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify and decode the JWT token
    const payload = verifyAuthToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // Return the authenticated user's identity
    return NextResponse.json({
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 },
    );
  }
}
