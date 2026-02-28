import OpenAI from "openai";

let client: OpenAI | null = null;

export function getAiClient(): OpenAI {
  if (client) {
    return client;
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY или OPENROUTER_API_KEY не настроены.");
  }

  client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });

  return client;
}

export const PRIMARY_MODEL = process.env.OPENAI_MODEL || "openai/gpt-4o-mini";
export const FALLBACK_MODEL = "gpt-4o-mini";
