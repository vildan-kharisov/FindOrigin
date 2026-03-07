import { after, NextResponse } from "next/server";
import { TelegramUpdate } from "@/lib/types";
import { sendMessage } from "@/lib/telegram";
import { findOriginsByInput } from "@/lib/find-origin";

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

  try {
    const { sources } = await findOriginsByInput(inputText);

    let response = "Возможные первоисточники:\n\n";

    if (sources.length === 0) {
      response +=
        "Не удалось найти достаточно релевантные источники. Попробуйте уточнить текст.";
      await sendMessage(chatId, response);
      return;
    }

    sources.forEach((source, index) => {
      response += `${index + 1}) ${source.title}\n`;
      response += `${source.url}\n`;
      response += `Уверенность: ${source.confidence}%\n`;
      response += `Почему: ${source.reason}\n\n`;
    });

    await sendMessage(chatId, response);
  } catch (error) {
    console.error("Processing error:", error);
    const message =
      error instanceof Error &&
      (error.message.includes("SERPER_API_KEY") ||
        error.message.includes("Serper API error"))
        ? "Не удалось выполнить веб-поиск через Serper API. Проверьте SERPER_API_KEY и лимиты."
        : error instanceof Error
          ? error.message
          : "Произошла ошибка при обработке. Попробуйте позже.";
    await sendMessage(
      chatId,
      message,
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
