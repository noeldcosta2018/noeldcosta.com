import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { POST } from "./route";

// Provider routing for the site assistant: DeepSeek first, Claude when
// DeepSeek is missing or fails, the booking fallback when both fail.

const ask = (ip: string) =>
  new Request("http://localhost/api/chat/", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ messages: [{ role: "user", content: "What does Noel do?" }], page: "/" }),
  }) as unknown as NextRequest;

const deepseekOk = () => Response.json({ choices: [{ message: { content: "From DeepSeek" } }] });
const claudeOk = () => Response.json({ content: [{ type: "text", text: "From Claude" }] });
const failed = (status: number) => new Response('{"error":{"message":"Authentication Fails"}}', { status });

describe("POST /api/chat", () => {
  const env = { ...process.env };
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    delete process.env.DEEPSEEK_API_KEY;
    delete process.env.Deepseek;
    delete process.env.DEEPSEEK;
    delete process.env.ANTHROPIC_API_KEY;
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("answers with DeepSeek when its key is set, reading the Vercel name and trimming it", async () => {
    process.env.Deepseek = '  "Bearer sk-test"\n';
    fetchMock.mockResolvedValueOnce(deepseekOk());
    const body = await (await POST(ask("10.0.0.1"))).json();
    expect(body.reply).toBe("From DeepSeek");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer sk-test");
  });

  it("falls back to Claude when DeepSeek fails, and logs the status without the key", async () => {
    process.env.Deepseek = "sk-secret-value";
    process.env.ANTHROPIC_API_KEY = "anthropic-test";
    fetchMock.mockResolvedValueOnce(failed(401)).mockResolvedValueOnce(claudeOk());
    const body = await (await POST(ask("10.0.0.2"))).json();
    expect(body.reply).toBe("From Claude");
    const logged = vi.mocked(console.error).mock.calls.flat().join(" ");
    expect(logged).toContain("DeepSeek HTTP 401");
    expect(logged).not.toContain("sk-secret-value");
  });

  it("shows the booking fallback when every provider fails", async () => {
    process.env.Deepseek = "sk-test";
    process.env.ANTHROPIC_API_KEY = "anthropic-test";
    fetchMock.mockResolvedValueOnce(failed(402)).mockResolvedValueOnce(failed(500));
    const body = await (await POST(ask("10.0.0.3"))).json();
    expect(body.unavailable).toBe(true);
  });
});
