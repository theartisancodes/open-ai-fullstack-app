import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "open-ai-fullstack-app",
    timestamp: new Date().toISOString(),
  });
}
