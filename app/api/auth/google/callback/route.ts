import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, googleAuthEnabled, sessionCookieName, sessionMaxAge } from "@/lib/auth-session";
import type { AuthUser } from "@/lib/auth-types";

export const runtime = "nodejs";
const STATE_COOKIE = "yarripedia-oauth-state";

function safeReturnPath(value?: string) {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/api/") ? value : "/";
}

function fail(request: NextRequest, returnTo = "/", reason = "google-failed", stage?: string) {
  const target = new URL(safeReturnPath(returnTo), request.url);
  target.searchParams.set("auth", reason);
  if (stage) target.searchParams.set("auth_reason", stage);
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
  if (!stateData || !state || stateData.state !== state || !code) return fail(request, returnTo, "google-failed", "state");

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${request.nextUrl.origin}/api/auth/google/callback`);
    let tokens: { id_token?: string; access_token?: string };
    try {
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID || "",
          client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
          redirect_uri: `${request.nextUrl.origin}/api/auth/google/callback`,
          grant_type: "authorization_code",
        }),
        cache: "no-store",
      });
      if (!tokenResponse.ok) throw new Error("token exchange failed");
      tokens = await tokenResponse.json() as { id_token?: string; access_token?: string };
    } catch {
      console.error("[auth] google callback failed at token exchange");
      return fail(request, returnTo, "google-failed", "exchange");
    }
    if (!tokens.id_token && !tokens.access_token) return fail(request, returnTo, "google-failed", `tokens-${tokens.id_token ? "id" : "noid"}-${tokens.access_token ? "access" : "noaccess"}`);
    let claims: { sub?: string; name?: string; email?: string; picture?: string } | undefined;
    if (tokens.id_token && !tokens.access_token) {
      let ticket;
      try {
        ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
      } catch {
        console.error("[auth] google callback failed at id token verification");
        return fail(request, returnTo, "google-failed", "id-token");
      }
      claims = ticket.getPayload();
    }

    let userInfo: { sub?: string; name?: string; email?: string; picture?: string } = {};
    if (tokens.access_token) {
      const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
        cache: "no-store",
      });
      if (!userInfoResponse.ok) return fail(request, returnTo, "google-failed", "userinfo");
      userInfo = await userInfoResponse.json() as { sub?: string; name?: string; email?: string; picture?: string };
      if (claims?.sub && userInfo.sub !== claims.sub) return fail(request, returnTo, "google-failed", "subject");
    }
    const subject = claims?.sub || userInfo.sub;
    if (!subject) return fail(request, returnTo, "google-failed", "claims");
    const user: AuthUser = {
      sub: subject,
      name: userInfo.name || claims?.name || userInfo.email || "Google 用户",
      email: userInfo.email || claims?.email || "",
      picture: userInfo.picture || claims?.picture || "",
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
    console.error("[auth] google callback failed at session creation");
    return fail(request, returnTo, "google-failed", "session");
  }
}
