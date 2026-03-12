import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

let cachedClient: OpenAI | undefined;

const getOpenAIClient = (): OpenAI => {
    if (!cachedClient) {
        cachedClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    return cachedClient;
};

interface TTSRequest {
    model?: string;
    voice?: "alloy" | "ash" | "ballad" | "coral" | "echo" | "sage" | "shimmer" | "verse";
    text: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as TTSRequest;
        const text = body.text?.trim();

        if (!text) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "A text is required to proceed",
                },
                {
                    status: 400,
                }
            );
        }

        const client = getOpenAIClient();
        const speech = await client.audio.speech.create({
            input: text,
            model: body.model ?? "gpt-4o-mini-tts",
            voice: body.voice ?? "alloy",
        });

        const audioBuffer = await speech.arrayBuffer();
        const bytes = new Uint8Array(audioBuffer);

        return new Response(bytes, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Disposition": "inline; filename=speech.mp3",
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown TTS error",
            },
            {
                status: 500,
            }
        );
    }
}