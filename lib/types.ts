export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
    date: number;
  };
}

export interface ExtractedEntities {
  claims: string[];
  dates: string[];
  numbers: string[];
  names: string[];
  links: string[];
  searchQueries: string[];
}

export interface ParsedInput {
  type: "text" | "telegram_link";
  text: string;
  originalUrl?: string;
}

export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
}

export interface RankedSource {
  url: string;
  title: string;
  snippet: string;
  confidence: number;
  reason: string;
}
