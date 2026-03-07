# FindOrigin

Telegram-бот для поиска первоисточников: принимает текст/ссылку на пост, ищет кандидатов через Serper API и ранжирует их по смыслу через AI.

## Переменные окружения

- `BOT_TOKEN` — токен Telegram-бота
- `OPENAI_API_KEY` или `OPENROUTER_API_KEY` — ключ AI-провайдера
- `OPENAI_BASE_URL` — опционально (например, для OpenRouter)
- `OPENAI_MODEL` — опционально, по умолчанию `openai/gpt-4o-mini`
- `SERPER_API_KEY` — ключ Serper.dev для веб-поиска

## Запуск (PowerShell)

```powershell
npm install
npm run dev
```

## Telegram Mini App

- UI-слой доступен по пути: `/miniapp`
- API для UI: `POST /api/analyze` с JSON `{ "text": "..." }`

Пример настройки кнопки меню бота на Mini App (PowerShell):

```powershell
$token = "ВАШ_BOT_TOKEN"
$payload = @{
  menu_button = @{
    type = "web_app"
    text = "FindOrigin"
    web_app = @{
      url = "https://find-origin-drab.vercel.app/miniapp"
    }
  }
} | ConvertTo-Json -Depth 6

Invoke-RestMethod -Method Post `
  -Uri "https://api.telegram.org/bot$token/setChatMenuButton" `
  -ContentType "application/json" `
  -Body $payload
```