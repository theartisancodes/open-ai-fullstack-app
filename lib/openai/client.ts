import OpenAI from "openai";

import { getRequiredEnv } from "@/lib/env";

let cachedClient: OpenAI | undefined;

export function getOpenAIClient(): OpenAI {
  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey: getRequiredEnv("OPENAI_API_KEY") });
  }

  return cachedClient;
}
