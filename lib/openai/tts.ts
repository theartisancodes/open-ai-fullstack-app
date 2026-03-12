import { getOpenAIClient } from "@/lib/openai/client";

export type TtsInput = {
  text: string;
  voice?: string;
  model?: string;
};

export async function synthesizeSpeechMp3({
  text,
  voice = "alloy",
  model = "gpt-4o-mini-tts",
}: TtsInput): Promise<ArrayBuffer> {
  if (!text.trim()) {
    throw new Error("text is required");
  }

  const client = getOpenAIClient();
  const speech = await client.audio.speech.create({
    model,
    voice,
    input: text,
    format: "wav",
  });

  return await speech.arrayBuffer();
}
