# FindOrigin

Telegram-бот для поиска первоисточников: принимает текст/ссылку на пост и ранжирует кандидатов по смыслу через AI.

## Переменные окружения

- `BOT_TOKEN` — токен Telegram-бота
- `OPENAI_API_KEY` или `OPENROUTER_API_KEY` — ключ AI-провайдера
- `OPENAI_BASE_URL` — опционально (например, для OpenRouter)
- `OPENAI_MODEL` — опционально, по умолчанию `openai/gpt-4o-mini`

## Запуск (PowerShell)

```powershell
npm install
npm run dev
```