import { NextResponse } from "next/server";
import { TelegramUpdate } from "@/lib/types";
import { sendMessage } from "@/lib/telegram";
import {
  detectInputType,
  extractTelegramPostText,
  validateInput,
} from "@/lib/input-parser";
import { extractEntities } from "@/lib/extract-entities";

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

  await sendMessage(chatId, "Анализирую...");

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

    let response = "*Результаты анализа:*\n\n";

    if (entities.claims.length > 0) {
      response += "*Ключевые утверждения:*\n";
      entities.claims.forEach((c, i) => (response += `${i + 1}. ${c}\n`));
      response += "\n";
    }

    if (entities.dates.length > 0) {
      response += `*Даты:* ${entities.dates.join(", ")}\n\n`;
    }

    if (entities.numbers.length > 0) {
      response += `*Числа:* ${entities.numbers.join(", ")}\n\n`;
    }

    if (entities.names.length > 0) {
      response += `*Имена/Названия:* ${entities.names.join(", ")}\n\n`;
    }

    if (entities.links.length > 0) {
      response += `*Ссылки:* ${entities.links.join(", ")}\n\n`;
    }

    if (entities.searchQueries.length > 0) {
      response += "*Поисковые запросы:*\n";
      entities.searchQueries.forEach(
        (q, i) => (response += `${i + 1}. ${q}\n`),
      );
    }

    response += "\n_Поиск источников будет добавлен в следующем обновлении._";

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
    processUpdate(update).catch(console.error);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
