# FindOrigin

Telegram-бот для поиска первоисточников: принимает текст/ссылку на пост, ищет кандидатов через Google Search API и ранжирует их по смыслу через AI.

## Переменные окружения

- `BOT_TOKEN` — токен Telegram-бота
- `OPENAI_API_KEY` или `OPENROUTER_API_KEY` — ключ AI-провайдера
- `OPENAI_BASE_URL` — опционально (например, для OpenRouter)
- `OPENAI_MODEL` — опционально, по умолчанию `openai/gpt-4o-mini`
- `GOOGLE_SEARCH_API_KEY` или `SEARCH_API_KEY` — ключ Google Custom Search API
- `GOOGLE_SEARCH_ENGINE_ID` или `GOOGLE_CSE_ID` — ID поискового движка (cx)

## Запуск (PowerShell)

```powershell
npm install
npm run dev
```