import { SearchResult } from "./types";

const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY || process.env.SEARCH_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_SEARCH_ENGINE_ID || process.env.GOOGLE_CSE_ID;

function buildUrl(query: string): string {
  const params = new URLSearchParams({
    key: GOOGLE_API_KEY || "",
    cx: GOOGLE_CX || "",
    q: query,
    num: "5",
    safe: "off",
    hl: "ru",
  });

  return `https://www.googleapis.com/customsearch/v1?${params.toString()}`;
}

export async function googleSearch(queries: string[]): Promise<SearchResult[]> {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    throw new Error(
      "GOOGLE_SEARCH_API_KEY или GOOGLE_SEARCH_ENGINE_ID не настроены.",
    );
  }

  const uniqueResults = new Map<string, SearchResult>();

  for (const query of queries.slice(0, 3)) {
    const res = await fetch(buildUrl(query));
    if (!res.ok) {
      throw new Error(`Google Search API error: ${res.status}`);
    }

    const data = (await res.json()) as {
      items?: Array<{ link?: string; title?: string; snippet?: string }>;
    };

    for (const item of data.items || []) {
      if (!item.link) continue;

      uniqueResults.set(item.link, {
        url: item.link,
        title: item.title || item.link,
        snippet: item.snippet || "",
      });
    }
  }

  return Array.from(uniqueResults.values()).slice(0, 12);
}
