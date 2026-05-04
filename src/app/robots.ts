import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt — explicit AI crawler allowlist.
 *
 * `User-agent: *` already permits everyone, so the named rules below are
 * about INTENT signalling, not access. OpenAI, Anthropic, Google, and
 * Perplexity have publicly stated they look for explicit allowlist entries
 * as opt-in signals for training and answer-engine inclusion. Sites with
 * named allow directives demonstrably get cited more often in AI answers.
 *
 * Bytespider and ImagesiftBot are blocked because they ignore robots.txt
 * and scrape aggressively without attribution.
 */
export default function robots(): MetadataRoute.Robots {
  const aiCrawlers = [
    // OpenAI
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    // Anthropic
    "ClaudeBot",
    "anthropic-ai",
    "Claude-Web",
    // Perplexity
    "PerplexityBot",
    "Perplexity-User",
    // Google AI Overviews / Gemini
    "Google-Extended",
    // Apple Intelligence
    "Applebot-Extended",
    // Cohere
    "cohere-ai",
    // Meta AI
    "Meta-ExternalAgent",
    "FacebookBot",
    // Common Crawl (training data for many models)
    "CCBot",
    // Mistral
    "MistralAI-User",
    // Diffbot (used by Perplexity and others)
    "Diffbot",
  ];

  const blocked = ["Bytespider", "ImagesiftBot"];

  return {
    rules: [
      // Default allow — covers Googlebot, Bingbot, DuckDuckBot, Ahrefs, etc.
      { userAgent: "*", allow: "/" },
      // Explicit AI crawler allowlist (signals opt-in for training + citations)
      ...aiCrawlers.map((ua) => ({ userAgent: ua, allow: "/" })),
      // Explicit blocks for known bad actors
      ...blocked.map((ua) => ({ userAgent: ua, disallow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
