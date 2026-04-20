export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getClient, resolveModel } from "@/lib/tools/anthropic";
import { getTool } from "@/lib/tools/registry";
import { checkRate } from "@/lib/tools/rate-limit";

function getIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function sseFrame(payload: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ tool: string }> }
) {
  const { tool: slug } = await context.params;

  // 1. Look up tool definition
  const tool = getTool(slug);
  if (!tool) {
    return Response.json({ error: "unknown tool" }, { status: 404 });
  }

  // 2. Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  // 3. Validate inputs
  const parsed = tool.schema.safeParse(
    (body as Record<string, unknown>)?.inputs
  );
  if (!parsed.success) {
    return Response.json(
      { error: "validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // 4. Rate limit
  const ip = getIp(request);
  const rate = checkRate(ip);
  if (!rate.ok) {
    return Response.json(
      { error: "rate limit exceeded" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfter ?? 3600),
        },
      }
    );
  }

  // 5. Stream response
  const encoder = new TextEncoder();
  const abort = new AbortController();
  const timeoutHandle = setTimeout(() => abort.abort(), 60_000);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const model = await resolveModel();
        const anthropic = getClient();

        const runner = anthropic.messages.stream(
          {
            model,
            max_tokens: tool.maxTokens,
            system: tool.system,
            messages: [
              {
                role: "user",
                content: tool.formatUser(parsed.data),
              },
            ],
          },
          { signal: abort.signal }
        );

        runner.on("text", (delta: string) => {
          controller.enqueue(sseFrame({ type: "text", value: delta }));
        });

        await runner.finalMessage();
        clearTimeout(timeoutHandle);
        controller.enqueue(sseFrame({ type: "done" }));
        controller.close();
      } catch (err: unknown) {
        clearTimeout(timeoutHandle);
        const isAbort =
          err instanceof Error && err.name === "AbortError";
        const message = isAbort
          ? "timeout"
          : err instanceof Error
          ? err.message
          : "stream error";
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message })}\n\n`
            )
          );
        } catch {
          // controller may already be closed
        }
        controller.close();
      }
    },
    cancel() {
      clearTimeout(timeoutHandle);
      abort.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
    },
  });
}

export async function GET() {
  return Response.json({ error: "method not allowed" }, { status: 405 });
}

export async function PUT() {
  return Response.json({ error: "method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ error: "method not allowed" }, { status: 405 });
}

export async function PATCH() {
  return Response.json({ error: "method not allowed" }, { status: 405 });
}
