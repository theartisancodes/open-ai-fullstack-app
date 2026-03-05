import { NextResponse } from "next/server";

import { queryDb } from "@/lib/db/client";

export const runtime = "nodejs";

type DbPingRow = {
  now: string;
};

export async function GET() {
  try {
    const rows = await queryDb<DbPingRow>("select now()::text as now");

    return NextResponse.json({
      ok: true,
      source: "database",
      now: rows[0]?.now ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown DB error";

    return NextResponse.json(
      {
        ok: false,
        source: "database",
        error: message,
      },
      { status: 500 }
    );
  }
}
