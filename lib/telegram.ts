const BOT_TOKEN = (
  process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || ""
).trim();
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function sendMessage(chatId: number, text: string) {
  if (!BOT_TOKEN) {
    throw new Error("Не задан BOT_TOKEN или TELEGRAM_BOT_TOKEN");
  }

  const res = await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  if (!res.ok) {
    console.error("sendMessage failed:", res.status, await res.text());
  }
}
