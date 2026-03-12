import { NextResponse } from "next/server";

/** Legacy login route; sign-in is handled by NextAuth at /api/auth/signin and /auth page. */
export async function GET() {
  return NextResponse.json(
    { message: "Use /auth to sign in or POST to /api/auth/callback/credentials" },
    { status: 404 }
  );
}
