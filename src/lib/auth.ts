import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface AuthTokenPayload {
  userId: string;
  username: string;
  role: "user" | "admin";
}

const AUTH_COOKIE_NAME = "auth_token";
const AUTH_TOKEN_EXPIRES_IN = "7d";
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Hashes a plain text password before storing it in the database.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Compares a plain text password against a stored hash.
 */
export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

/**
 * Creates a signed JWT for authenticated user sessions.
 */
export function signAuthToken(payload: AuthTokenPayload): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("Missing JWT_SECRET environment variable");
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: AUTH_TOKEN_EXPIRES_IN,
  });
}

/**
 * Verifies and decodes an auth JWT.
 */
export function verifyAuthToken(token: string): AuthTokenPayload {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("Missing JWT_SECRET environment variable");
  }

  const decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;
  return decoded;
}

/**
 * Returns the cookie name used for auth sessions.
 */
export function getAuthCookieName(): string {
  return AUTH_COOKIE_NAME;
}

/**
 * Returns the default auth cookie options.
 */
export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
