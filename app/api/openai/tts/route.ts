import { NextResponse } from "next/server";

import { synthesizeSpeechMp3 } from "@/lib/openai/tts";

export const runtime = "nodejs";

type TtsRequestBody = {
  text?: string;
  voice?: string;
  model?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TtsRequestBody;

    const audioData = await synthesizeSpeechMp3({
      text: body.text ?? "",
      voice: body.voice,
      model: body.model,
    });
    const bytes = new Uint8Array(audioData as ArrayBuffer);

    return new Response(bytes, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "inline; filename=speech.mp3",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown TTS error";
    const status = message === "text is required" ? 400 : 500;

    return NextResponse.json(
      {
        ok: false,
        source: "openai-tts",
        error: message,
      },
      { status }
    );
  }
}
