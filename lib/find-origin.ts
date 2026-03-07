import { extractEntities } from "./extract-entities";
import {
  detectInputType,
  extractTelegramPostText,
  validateInput,
} from "./input-parser";
import { rankSourcesByMeaning } from "./rank-sources";
import { serperSearch } from "./serper-search";
import { RankedSource } from "./types";

export interface FindOriginResult {
  sources: RankedSource[];
  queries: string[];
}

export async function findOriginsByInput(
  inputText: string,
): Promise<FindOriginResult> {
  const validationError = validateInput(inputText);
  if (validationError) {
    throw new Error(validationError);
  }

  const parsed = detectInputType(inputText);
  let textToAnalyze: string;

  if (parsed.type === "telegram_link") {
    textToAnalyze = await extractTelegramPostText(parsed.originalUrl!);
  } else {
    textToAnalyze = parsed.text;
  }

  if (!textToAnalyze) {
    throw new Error("Не удалось получить текст для анализа.");
  }

  const entities = await extractEntities(textToAnalyze);
  const queries =
    entities.searchQueries.length > 0
      ? entities.searchQueries
      : [textToAnalyze.slice(0, 220)];

  const searchResults = await serperSearch(queries);
  if (searchResults.length === 0) {
    return { sources: [], queries };
  }

  const topSources = await rankSourcesByMeaning(textToAnalyze, searchResults);
  return { sources: topSources, queries };
}
