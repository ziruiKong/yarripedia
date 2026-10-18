import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { googleAuthEnabled, readSessionToken, sessionCookieName } from "@/lib/auth-session";

export const runtime = "nodejs";

export async function GET() {
  const token = (await cookies()).get(sessionCookieName)?.value;
  return NextResponse.json({ user: readSessionToken(token), googleEnabled: googleAuthEnabled() }, { headers: { "Cache-Control": "no-store" } });
}
