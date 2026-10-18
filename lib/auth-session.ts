import { createHmac, timingSafeEqual } from "node:crypto";
import type { AuthUser } from "@/lib/auth-types";

const SESSION_COOKIE = "yarripedia-session";
const SESSION_SECONDS = 60 * 60 * 24 * 14;

export function googleAuthEnabled() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && (process.env.SESSION_SECRET?.length || 0) >= 32);
}

function signature(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createSessionToken(user: AuthUser) {
  const payload = Buffer.from(JSON.stringify({ user, expiresAt: Date.now() + SESSION_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function readSessionToken(token?: string): AuthUser | null {
  if (!token) return null;
  const [payload, receivedSignature, extra] = token.split(".");
  if (!payload || !receivedSignature || extra) return null;
  try {
    const expectedSignature = signature(payload);
    const expected = Buffer.from(expectedSignature);
    const received = Buffer.from(receivedSignature);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { user?: AuthUser; expiresAt?: number };
    if (!data.user?.sub || !data.user.name || !data.expiresAt || data.expiresAt < Date.now()) return null;
    return data.user;
  } catch { return null; }
}

export const sessionCookieName = SESSION_COOKIE;
export const sessionMaxAge = SESSION_SECONDS;
