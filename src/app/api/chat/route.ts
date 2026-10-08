export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { allow, clean, clientIp, json } from "@/lib/forms";
import { ASSISTANT_FALLBACK, retrieve, systemPrompt } from "@/lib/chat-assistant";

/**
 * POST /api/chat
 * Body: { messages: { role: "user" | "assistant", content: string }[], page?: string }
 * Answers with DeepSeek (OpenAI-compatible API) when DEEPSEEK_API_KEY is set,
 * otherwise with Claude when ANTHROPIC_API_KEY is set.
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

  // The Vercel project stores the key as "Deepseek"; DEEPSEEK_API_KEY is the documented name.
  const deepseekKey = process.env.DEEPSEEK_API_KEY || process.env.Deepseek || process.env.DEEPSEEK;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!deepseekKey && !anthropicKey) return json({ reply: ASSISTANT_FALLBACK, unavailable: true });

  const page = clean(body.page, 300) || "/";
  const docs = retrieve(`${lastUser.content} ${messages.length > 2 ? messages[messages.length - 3]?.content ?? "" : ""}`);
  const system = systemPrompt(docs, page);

  try {
    const reply = deepseekKey ? await askDeepSeek(deepseekKey, system, messages) : await askClaude(anthropicKey!, system, messages);
    // House style: no em dashes, even if the model produces one.
    return json({ reply: reply ? reply.replace(/\s*—\s*/g, ", ") : ASSISTANT_FALLBACK, ...(reply ? {} : { unavailable: true }) });
  } catch {
    return json({ reply: ASSISTANT_FALLBACK, unavailable: true });
  }
}

/** DeepSeek (OpenAI-compatible chat completions). Used when DEEPSEEK_API_KEY is set. */
async function askDeepSeek(key: string, system: string, messages: Msg[]): Promise<string | undefined> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 500,
      messages: [{ role: "system", content: system }, ...messages],
    }),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) return undefined;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim();
}

/**
 * Claude (Anthropic Messages API), used when only ANTHROPIC_API_KEY is set.
 * The API wants the conversation to start with the visitor and alternate, so
 * leading assistant turns are dropped and consecutive turns are merged.
 */
async function askClaude(key: string, system: string, messages: Msg[]): Promise<string | undefined> {
  const turns: Msg[] = [];
  for (const m of messages) {
    if (!turns.length && m.role !== "user") continue;
    const last = turns[turns.length - 1];
    if (last && last.role === m.role) last.content += `\n\n${m.content}`;
    else turns.push({ ...m });
  }
  if (!turns.length) return undefined;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_CHAT_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 600,
      temperature: 0.3,
      system,
      messages: turns,
    }),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) return undefined;
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  return data.content
    ?.filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("")
    .trim();
}
