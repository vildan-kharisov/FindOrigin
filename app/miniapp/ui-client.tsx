"use client";

import { useEffect, useMemo, useState } from "react";

interface RankedSource {
  url: string;
  title: string;
  snippet: string;
  confidence: number;
  reason: string;
}

interface AnalyzeResponse {
  ok: boolean;
  sources?: RankedSource[];
  queries?: string[];
  error?: string;
}

function initTelegramWebApp() {
  if (typeof window === "undefined") return;

  type TgWindow = Window & {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        colorScheme?: "light" | "dark";
      };
    };
  };

  const tg = (window as TgWindow).Telegram?.WebApp;
  if (!tg) return;

  tg.ready();
  tg.expand();
}

export function MiniAppClient() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [queries, setQueries] = useState<string[]>([]);
  const [sources, setSources] = useState<RankedSource[]>([]);

  const hasResults = useMemo(() => sources.length > 0, [sources]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      initTelegramWebApp();
    }, 100);

    return () => window.clearTimeout(timer);
  }, []);

  async function handleAnalyze() {
    setError("");
    setSources([]);
    setQueries([]);
    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = (await res.json()) as AnalyzeResponse;
      if (!res.ok || !data.ok) {
        setError(data.error || "Ошибка анализа.");
        return;
      }

      setSources(data.sources || []);
      setQueries(data.queries || []);
    } catch {
      setError("Ошибка сети. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        padding: 16,
        fontFamily: "system-ui, sans-serif",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      <h1 style={{ margin: 0 }}>FindOrigin Mini App</h1>
      <p style={{ marginTop: 8, color: "#666" }}>
        Вставьте текст новости или ссылку на Telegram-пост.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Например: https://t.me/channel/12345"
        rows={7}
        style={{
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: 12,
          padding: 12,
          fontSize: 16,
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading || text.trim().length === 0}
        style={{
          marginTop: 12,
          width: "100%",
          border: "none",
          borderRadius: 12,
          padding: "12px 14px",
          fontSize: 16,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          background: "#007aff",
          color: "#fff",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Ищу источники..." : "Найти первоисточник"}
      </button>

      {error ? (
        <p style={{ marginTop: 12, color: "#c62828" }}>{error}</p>
      ) : null}

      {queries.length > 0 ? (
        <div style={{ marginTop: 18 }}>
          <strong>Поисковые запросы:</strong>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {queries.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasResults ? (
        <section style={{ marginTop: 18, display: "grid", gap: 12 }}>
          {sources.map((source, index) => (
            <article
              key={source.url + index}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong>
                  {index + 1}. {source.title}
                </strong>
                <span>{source.confidence}%</span>
              </div>
              <p style={{ marginTop: 8 }}>{source.reason}</p>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.url}
              </a>
              {source.snippet ? (
                <p style={{ marginTop: 8, color: "#666" }}>{source.snippet}</p>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
