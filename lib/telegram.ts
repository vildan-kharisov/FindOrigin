const BOT_TOKEN = process.env.BOT_TOKEN!;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function sendMessage(chatId: number, text: string) {
  const res = await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  });

  if (!res.ok) {
    console.error("sendMessage failed:", res.status, await res.text());
  }
}
