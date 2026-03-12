import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { RateLimitError } from "openai";

import { authOptions } from "@/lib/auth";
import { serverEnv } from "@/lib/env";
import { getOpenAIClient } from "@/lib/openai/client";

export const runtime = "nodejs";

type StreamRequest = {
  prompt?: string;
  model?: string;
  instructions?: string;
  max_output_tokens?: number;
};

function sseMessage(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as StreamRequest;
    if (!body.prompt?.trim()) {
      return NextResponse.json(
        { ok: false, error: "prompt is required" },
        { status: 400 }
      );
    }

    const client = getOpenAIClient();
    const stream = await client.responses.create({
      model: body.model ?? serverEnv.OPENAI_MODEL,
      input: body.prompt,
      stream: true,
      ...(body.instructions?.trim() ? { instructions: body.instructions } : {}),
      ...(body.max_output_tokens != null && body.max_output_tokens > 0
        ? { max_output_tokens: body.max_output_tokens }
        : {}),
    });

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const event of stream as AsyncIterable<{ type: string; delta?: string }>) {
            if (event.type === "response.output_text.delta" && event.delta != null) {
              controller.enqueue(encoder.encode(sseMessage({ type: "delta", delta: event.delta })));
            }
            if (event.type === "response.completed") {
              controller.enqueue(encoder.encode(sseMessage({ type: "done" })));
            }
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              sseMessage({
                type: "error",
                error: err instanceof Error ? err.message : "Stream error",
              })
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        {
          ok: false,
          source: "openai",
          error:
            "OpenAI rate limit exceeded. Wait a minute and try again, or check your API usage/tier.",
        },
        { status: 429 }
      );
    }
    const message = error instanceof Error ? error.message : "Unknown OpenAI error";
    return NextResponse.json(
      { ok: false, source: "openai", error: message },
      { status: 500 }
    );
  }
}
