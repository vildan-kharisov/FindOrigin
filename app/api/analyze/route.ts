import { NextResponse } from "next/server";
import { findOriginsByInput } from "@/lib/find-origin";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string };
    const text = (body.text || "").trim();

    if (!text) {
      return NextResponse.json(
        { ok: false, error: "Передайте текст или ссылку в поле text." },
        { status: 400 },
      );
    }

    const result = await findOriginsByInput(text);

    return NextResponse.json({
      ok: true,
      sources: result.sources,
      queries: result.queries,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка анализа.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
