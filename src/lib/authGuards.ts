import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getAuthCookieName } from "./auth";

/**
 * JWT payload type containing authenticated user information
 */
export interface AuthPayload {
  userId: string;
  username: string;
  role: "user" | "admin";
}

/**
 * Extracts and validates the auth token from request cookies.
 *
 * Returns the decoded JWT payload if valid, or null if missing/invalid.
 * Used internally by requireUser() and requireAdmin().
 */
export function extractAuthPayload(request: NextRequest): AuthPayload | null {
  try {
    const token = request.cookies.get(getAuthCookieName())?.value;

    if (!token) {
      return null;
    }

    const payload = verifyAuthToken(token);
    return payload || null;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Route guard: Requires user to be authenticated
 *
 * Usage in a route handler:
 *   const auth = requireUser(request);
 *   if (!auth.isAuthenticated) {
 *     return auth.response;
 *   }
 *   // auth.payload contains {userId, username, role}
 *
 * Returns:
 *   - {isAuthenticated: false, response: 401 JSON} if not authenticated
 *   - {isAuthenticated: true, payload: AuthPayload} if authenticated
 */
export function requireUser(request: NextRequest) {
  const payload = extractAuthPayload(request);

  if (!payload) {
    return {
      isAuthenticated: false,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
    };
  }

  return {
    isAuthenticated: true,
    payload,
  };
}

/**
 * Route guard: Requires user to be authenticated AND have admin role
 *
 * Usage in a route handler:
 *   const auth = requireAdmin(request);
 *   if (!auth.isAuthorized) {
 *     return auth.response;
 *   }
 *   // auth.payload contains {userId, username, role}
 *
 * Returns:
 *   - {isAuthorized: false, response: 401 JSON} if not authenticated
 *   - {isAuthorized: false, response: 403 JSON} if authenticated but not admin
 *   - {isAuthorized: true, payload: AuthPayload} if admin
 */
export function requireAdmin(request: NextRequest) {
  const payload = extractAuthPayload(request);

  if (!payload) {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
    };
  }

  if (payload.role !== "admin") {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      ),
    };
  }

  return {
    isAuthorized: true,
    payload,
  };
}
