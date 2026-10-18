import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, googleAuthEnabled, sessionCookieName, sessionMaxAge } from "@/lib/auth-session";
import type { AuthUser } from "@/lib/auth-types";

export const runtime = "nodejs";
const STATE_COOKIE = "yarripedia-oauth-state";

function safeReturnPath(value?: string) {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/api/") ? value : "/";
}

function fail(request: NextRequest, returnTo = "/", reason = "google-failed") {
  const target = new URL(safeReturnPath(returnTo), request.url);
  target.searchParams.set("auth", reason);
  const response = NextResponse.redirect(target);
  response.cookies.delete(STATE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const saved = request.cookies.get(STATE_COOKIE)?.value;
  let stateData: { state: string; returnTo: string } | null = null;
  try { stateData = saved ? JSON.parse(saved) as { state: string; returnTo: string } : null; } catch { /* invalid state cookie */ }
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const returnTo = safeReturnPath(stateData?.returnTo);
  if (!googleAuthEnabled()) return fail(request, returnTo, "google-config-missing");
  if (!stateData || !state || stateData.state !== state || !code) return fail(request, returnTo);

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${request.nextUrl.origin}/api/auth/google/callback`);
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token || !tokens.access_token) return fail(request, returnTo);
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const claims = ticket.getPayload();
    if (!claims?.sub) return fail(request, returnTo);

    const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: "no-store",
    });
    if (!userInfoResponse.ok) return fail(request, returnTo);
    const userInfo = await userInfoResponse.json() as { sub?: string; name?: string; email?: string; picture?: string };
    if (userInfo.sub !== claims.sub) return fail(request, returnTo);
    const user: AuthUser = {
      sub: claims.sub,
      name: userInfo.name || claims.name || userInfo.email || "Google 用户",
      email: userInfo.email || claims.email || "",
      picture: userInfo.picture || claims.picture || "",
    };
    const response = NextResponse.redirect(new URL(returnTo, request.url));
    response.cookies.set(sessionCookieName, createSessionToken(user), {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: sessionMaxAge,
    });
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch {
    return fail(request, returnTo);
  }
}
