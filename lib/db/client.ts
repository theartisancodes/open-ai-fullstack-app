import { Pool, type QueryResultRow } from "pg";

import { getRequiredEnv } from "@/lib/env";

declare global {
  var __pgPool__: Pool | undefined;
}

function createPool(): Pool {
  return new Pool({
    connectionString: getRequiredEnv("DATABASE_URL"),
    max: 10,
    idleTimeoutMillis: 30_000,
  });
}

export const db = globalThis.__pgPool__ ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis.__pgPool__ = db;
}

export async function queryDb<T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await db.query<T>(text, params);
  return result.rows;
}
