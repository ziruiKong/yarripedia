import { randomBytes } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import { googleAuthEnabled } from "@/lib/auth-session";

export const runtime = "nodejs";
const STATE_COOKIE = "yarripedia-oauth-state";

function safeReturnPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/api/")) return "/";
  return value;
}

export async function GET(request: NextRequest) {
  const returnTo = safeReturnPath(request.nextUrl.searchParams.get("next"));
  if (!googleAuthEnabled()) {
    const target = new URL(returnTo, request.url);
    target.searchParams.set("auth", "google-config-missing");
    return NextResponse.redirect(target);
  }

  const state = randomBytes(32).toString("base64url");
  const origin = request.nextUrl.origin;
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${origin}/api/auth/google/callback`);
  const authorizationUrl = client.generateAuthUrl({
    access_type: "online",
    include_granted_scopes: true,
    prompt: "select_account",
    scope: ["openid", "email", "profile"],
    state,
  });
  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(STATE_COOKIE, JSON.stringify({ state, returnTo }), {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
