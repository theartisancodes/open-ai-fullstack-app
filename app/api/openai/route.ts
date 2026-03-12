import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { APIError, RateLimitError } from "openai";

import { authOptions } from "@/lib/auth";
import { serverEnv } from "@/lib/env";
import { getOpenAIClient } from "@/lib/openai/client";

export const runtime = "nodejs";

type OpenAIRequest = {
  prompt?: string;
  model?: string;
  /** Optional system/developer instructions (Responses API: instructions) */
  instructions?: string;
  /** Optional max tokens to generate (Responses API: max_output_tokens) */
  max_output_tokens?: number;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

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
      ...(body.instructions != null && body.instructions !== ""
        ? { instructions: body.instructions }
        : {}),
      ...(body.max_output_tokens != null && body.max_output_tokens > 0
        ? { max_output_tokens: body.max_output_tokens }
        : {}),
    });

    return NextResponse.json({
      ok: true,
      source: "openai",
      output: response.output_text,
      responseId: response.id,
    });
  } catch (error) {
    if (error instanceof APIError) {
      console.error("[OpenAI API error]", {
        status: error.status,
        code: error.code,
        type: error.type,
        message: error.message,
      });
    }

    if (error instanceof RateLimitError) {
      const isQuota =
        error.code === "insufficient_quota" ||
        error.message?.toLowerCase().includes("quota") ||
        error.message?.toLowerCase().includes("billing");
      return NextResponse.json(
        {
          ok: false,
          source: "openai",
          error: isQuota
            ? "OpenAI quota exceeded. Add credits or upgrade your plan at platform.openai.com/account/billing."
            : "OpenAI rate limit exceeded. Wait a minute and try again.",
          detail: error.message,
        },
        { status: 429 }
      );
    }
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
