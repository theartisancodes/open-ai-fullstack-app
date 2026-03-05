import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/env";
import { getOpenAIClient } from "@/lib/openai/client";

export const runtime = "nodejs";

type OpenAIRequest = {
  prompt?: string;
  model?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OpenAIRequest;

    if (!body.prompt) {
      return NextResponse.json(
        {
          ok: false,
          error: "prompt is required",
        },
        { status: 400 }
      );
    }

    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: body.model ?? serverEnv.OPENAI_MODEL,
      input: body.prompt,
    });

    return NextResponse.json({
      ok: true,
      source: "openai",
      output: response.output_text,
      responseId: response.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown OpenAI error";

    return NextResponse.json(
      {
        ok: false,
        source: "openai",
        error: message,
      },
      { status: 500 }
    );
  }
}
