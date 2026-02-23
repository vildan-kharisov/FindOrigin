import { ParsedInput } from "./types";

const TG_LINK_RE = /https?:\/\/t\.me\/([a-zA-Z0-9_]+)\/(\d+)/;

export function detectInputType(text: string): ParsedInput {
  const match = text.trim().match(TG_LINK_RE);

  if (match) {
    return { type: "telegram_link", text: "", originalUrl: match[0] };
  }

  return { type: "text", text: text.trim() };
}

export async function extractTelegramPostText(url: string): Promise<string> {
  const embedUrl = url + "?embed=1&mode=tme";

  const res = await fetch(embedUrl);
  if (!res.ok) {
    throw new Error(`Telegram embed returned ${res.status}`);
  }

  const html = await res.text();

  const m = html.match(
    /<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/,
  );
  if (!m) {
    throw new Error("Could not find message text in embed HTML");
  }

  return m[1]
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

export function validateInput(text: string): string | null {
  if (!text || text.trim().length === 0) {
    return "Пожалуйста, отправьте текст или ссылку на Telegram-пост.";
  }
  if (text.length > 4096) {
    return "Текст слишком длинный. Максимум 4096 символов.";
  }
  return null;
}
