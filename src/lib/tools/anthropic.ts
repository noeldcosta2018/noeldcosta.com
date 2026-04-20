import Anthropic from "@anthropic-ai/sdk";

// Model preference ladder — matches what the translation scripts use.
// Probed at runtime in case an org doesn't have access to the newest.
export const MODEL_CANDIDATES = [
  "claude-sonnet-4-5-20250929",
  "claude-sonnet-4-5",
  "claude-sonnet-4-6",
] as const;

let client: Anthropic | null = null;
let resolvedModel: string | null = null;

export function getClient(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local for local dev or to your deployment environment."
    );
  }
  client = new Anthropic({ apiKey });
  return client;
}

/**
 * Resolve the first model ID the current API key can actually use.
 * Caches the result for the lifetime of the server process.
 *
 * We do a tiny 5-token probe rather than guessing — org-level access
 * differs and hardcoding the wrong ID produces opaque 404s at request time.
 */
export async function resolveModel(): Promise<string> {
  if (resolvedModel) return resolvedModel;
  const c = getClient();
  for (const candidate of MODEL_CANDIDATES) {
    try {
      await c.messages.create({
        model: candidate,
        max_tokens: 5,
        messages: [{ role: "user", content: "ok" }],
      });
      resolvedModel = candidate;
      return candidate;
    } catch (err) {
      const status = (err as { status?: number })?.status;
      // Model-not-found or permission error — try the next candidate.
      if (status === 404 || status === 403) continue;
      // Auth / network / rate-limit — bail out, don't retry silently.
      throw err;
    }
  }
  throw new Error(
    `No accessible Sonnet model found. Tried: ${MODEL_CANDIDATES.join(", ")}`
  );
}
