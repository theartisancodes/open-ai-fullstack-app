import { NextResponse } from "next/server";

import { fetchJson } from "@/lib/api/fetch-json";
import { serverEnv } from "@/lib/env";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export async function GET() {
  try {
    const todo = await fetchJson<Todo>(`${serverEnv.EXTERNAL_API_BASE_URL}/todos/1`);

    return NextResponse.json({
      ok: true,
      source: "external-api",
      data: todo,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown API error";

    return NextResponse.json(
      {
        ok: false,
        source: "external-api",
        error: message,
      },
      { status: 500 }
    );
  }
}
