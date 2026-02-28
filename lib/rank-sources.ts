import { RankedSource, SearchResult } from "./types";
import { FALLBACK_MODEL, PRIMARY_MODEL, getAiClient } from "./ai-client";

const SYSTEM_PROMPT = `Ты проверяешь возможные первоисточники.
Сравни исходный текст и результаты поиска по смыслу, а не по буквальным совпадениям.
Верни JSON:
{
  "sources": [
    {
      "url": "https://...",
      "title": "заголовок",
      "snippet": "краткий сниппет",
      "confidence": 0-100,
      "reason": "почему это вероятный источник"
    }
  ]
}

Правила:
- Верни от 1 до 3 лучших источников.
- confidence должен быть целым числом 0-100.
- reason короткий, 1 предложение.
- Если релевантных источников нет, верни пустой массив sources.`;

export async function rankSourcesByMeaning(
  originalText: string,
  searchResults: SearchResult[],
): Promise<RankedSource[]> {
  let response;

  const userPayload = JSON.stringify(
    {
      originalText,
      searchResults,
    },
    null,
    2,
  );

  try {
    response = await getAiClient().chat.completions.create({
      model: PRIMARY_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPayload },
      ],
    });
  } catch {
    response = await getAiClient().chat.completions.create({
      model: FALLBACK_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPayload },
      ],
    });
  }

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI for source ranking");
  }

  const parsed = JSON.parse(content) as { sources?: RankedSource[] };
  const sources = (parsed.sources || [])
    .filter((s) => !!s.url)
    .map((s) => ({
      ...s,
      confidence: Number.isFinite(s.confidence)
        ? Math.max(0, Math.min(100, Math.round(s.confidence)))
        : 0,
      reason: s.reason || "Без пояснения.",
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  return sources;
}
