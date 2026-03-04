import { NextResponse } from "next/server";
import { getAuthCookieName } from "@/lib/auth";

/**
 * Logs out the current user by clearing the auth cookie.
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.set(getAuthCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
