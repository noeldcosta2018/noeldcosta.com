export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { allow, clean, clientIp, json } from "@/lib/forms";
import { ASSISTANT_FALLBACK, retrieve, systemPrompt } from "@/lib/chat-assistant";

/**
 * POST /api/chat
 * Body: { messages: { role: "user" | "assistant", content: string }[], page?: string }
 * Answers with DeepSeek (OpenAI-compatible API). Needs DEEPSEEK_API_KEY.
 * Conversations are not stored.
 */

const ENDPOINT = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/chat/completions";
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const MAX_TURNS = 10;

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (!allow(`chat:${ip}`, 20, 10 * 60 * 1000)) {
    return json({ reply: "You've sent a lot of messages in a short time. Please wait a few minutes, or book a call with Noel directly." }, 429);
  }

  let body: { messages?: unknown; page?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ reply: ASSISTANT_FALLBACK }, 400);
  }

  const messages: Msg[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m): m is Msg => !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: clean(m.content, 1500) }))
    .filter((m) => m.content.length > 0);

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return json({ reply: "Ask me about SAP, ERP, data or AI programmes, or book an intro call with Noel." });

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return json({ reply: ASSISTANT_FALLBACK, unavailable: true });

  const page = clean(body.page, 300) || "/";
  const docs = retrieve(`${lastUser.content} ${messages.length > 2 ? messages[messages.length - 3]?.content ?? "" : ""}`);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 500,
        messages: [{ role: "system", content: systemPrompt(docs, page) }, ...messages],
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return json({ reply: ASSISTANT_FALLBACK, unavailable: true });
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const reply = data.choices?.[0]?.message?.content?.trim();
    // House style: no em dashes, even if the model produces one.
    return json({ reply: reply ? reply.replace(/\s*—\s*/g, ", ") : ASSISTANT_FALLBACK });
  } catch {
    return json({ reply: ASSISTANT_FALLBACK, unavailable: true });
  }
}
