import { after, NextResponse } from "next/server";
import { TelegramUpdate } from "@/lib/types";
import { sendMessage } from "@/lib/telegram";
import {
  detectInputType,
  extractTelegramPostText,
  validateInput,
} from "@/lib/input-parser";
import { extractEntities } from "@/lib/extract-entities";
import { rankSourcesByMeaning } from "@/lib/rank-sources";
import { SearchResult } from "@/lib/types";

async function processUpdate(update: TelegramUpdate) {
  const message = update.message;
  if (!message?.text || !message.chat?.id) return;

  const chatId = message.chat.id;
  const inputText = message.text;

  if (inputText === "/start") {
    await sendMessage(
      chatId,
      "Привет! Я — FindOrigin.\n\n" +
        "Отправь мне текст или ссылку на Telegram-пост, " +
        "и я попробую найти первоисточник этой информации.",
    );
    return;
  }

  const validationError = validateInput(inputText);
  if (validationError) {
    await sendMessage(chatId, validationError);
    return;
  }

  try {
    const parsed = detectInputType(inputText);

    let textToAnalyze: string;

    if (parsed.type === "telegram_link") {
      try {
        textToAnalyze = await extractTelegramPostText(parsed.originalUrl!);
      } catch {
        await sendMessage(
          chatId,
          "Не удалось извлечь текст из поста. Проверьте ссылку.",
        );
        return;
      }
    } else {
      textToAnalyze = parsed.text;
    }

    if (!textToAnalyze) {
      await sendMessage(chatId, "Не удалось получить текст для анализа.");
      return;
    }

    const entities = await extractEntities(textToAnalyze);

    // Google Search API отключен. Используем только ссылки, если они есть во входном тексте.
    const searchResults: SearchResult[] = entities.links.map((url) => ({
      url,
      title: url,
      snippet: "Ссылка из исходного сообщения",
    }));

    if (searchResults.length === 0) {
      await sendMessage(
        chatId,
        "Google Search API отключен. В сообщении не найдено ссылок для проверки. Добавьте ссылку на источник или включите поиск.",
      );
      return;
    }

    const topSources = await rankSourcesByMeaning(textToAnalyze, searchResults);

    let response = "Возможные первоисточники:\n\n";

    if (topSources.length === 0) {
      response +=
        "Не удалось найти достаточно релевантные источники. Попробуйте уточнить текст.";
      await sendMessage(chatId, response);
      return;
    }

    topSources.forEach((source, index) => {
      response += `${index + 1}) ${source.title}\n`;
      response += `${source.url}\n`;
      response += `Уверенность: ${source.confidence}%\n`;
      response += `Почему: ${source.reason}\n\n`;
    });

    await sendMessage(chatId, response);
  } catch (error) {
    console.error("Processing error:", error);
    await sendMessage(
      chatId,
      "Произошла ошибка при обработке. Попробуйте позже.",
    );
  }
}

export async function POST(req: Request) {
  try {
    const update: TelegramUpdate = await req.json();
    after(async () => {
      await processUpdate(update);
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
