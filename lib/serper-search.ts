import { SearchResult } from "./types";

const SERPER_API_KEY = (process.env.SERPER_API_KEY || "").trim();

interface SerperOrganicResult {
  title?: string;
  link?: string;
  snippet?: string;
}

interface SerperResponse {
  organic?: SerperOrganicResult[];
}

function buildSerperBody(query: string): string {
  return JSON.stringify({
    q: query,
    gl: "ru",
    hl: "ru",
    num: 10,
  });
}

export async function serperSearch(queries: string[]): Promise<SearchResult[]> {
  if (!SERPER_API_KEY) {
    throw new Error("SERPER_API_KEY не настроен.");
  }

  const uniqueResults = new Map<string, SearchResult>();

  for (const query of queries.slice(0, 4)) {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: buildSerperBody(query),
    });

    if (!res.ok) {
      let details = "";
      try {
        details = await res.text();
      } catch {
        details = "";
      }

      throw new Error(
        `Serper API error: ${res.status}${details ? ` (${details})` : ""}`,
      );
    }

    const data = (await res.json()) as SerperResponse;

    for (const item of data.organic || []) {
      if (!item.link) continue;

      uniqueResults.set(item.link, {
        url: item.link,
        title: item.title || item.link,
        snippet: item.snippet || "",
      });
    }
  }

  return Array.from(uniqueResults.values()).slice(0, 16);
}
