import { ExtractedEntities } from "./types";
import { FALLBACK_MODEL, PRIMARY_MODEL, getAiClient } from "./ai-client";

const SYSTEM_PROMPT = `Ты — аналитик текста. Извлеки из текста структурированные данные и верни JSON:
{
  "claims": ["ключевое утверждение 1", ...],
  "dates": ["дата 1", ...],
  "numbers": ["число и его контекст", ...],
  "names": ["имя или название", ...],
  "links": ["ссылка", ...],
  "searchQueries": ["поисковый запрос 1", ...]
}

Правила:
- claims: основные утверждения и факты (1-5 штук)
- dates: все упомянутые даты
- numbers: числа с контекстом (например "42% роста")
- names: имена людей, организаций, мест
- links: любые URL из текста
- searchQueries: 2-3 конкретных поисковых запроса для поиска первоисточника информации. Должны содержать ключевые факты.

Если категория пуста — верни пустой массив.`;

export async function extractEntities(
  text: string,
): Promise<ExtractedEntities> {
  let response;
  try {
    response = await getAiClient().chat.completions.create({
      model: PRIMARY_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
    });
  } catch {
    response = await getAiClient().chat.completions.create({
      model: FALLBACK_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
    });
  }

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  return JSON.parse(content) as ExtractedEntities;
}
