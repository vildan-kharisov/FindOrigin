import OpenAI from "openai";
import { ExtractedEntities } from "./types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  return JSON.parse(content) as ExtractedEntities;
}
