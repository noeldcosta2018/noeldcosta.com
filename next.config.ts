import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // YouTube thumbnails — RSS feed uses numbered subdomains (i1–i4.ytimg.com)
      { protocol: "https", hostname: "**.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  // Keep the /content/ tree (268 MB of MDX) and public images out of every
  // serverless function bundle on Vercel. Static pages read content at build
  // time and bake it into HTML, so the runtime function body does not need
  // the raw MDX files. Without this, each page function balloons to ~264 MB
  // and Vercel rejects the deploy (250 MB cap per function).
  //
  // Docs: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
  // The '/*' key targets all routes; values are globs from project root.
  outputFileTracingExcludes: {
    "/*": [
      "content/**",
      "public/images/**",
      "scripts/**",
      ".next/cache/**",
      "node_modules/@anthropic-ai/sdk/**/*.md",
    ],
  },
  // Security headers — applied globally. CSP intentionally omitted because
  // the site loads external resources (Calendly embed, Google Fonts, OG
  // image previews) that need a careful per-resource allowlist; doing it
  // wrong silently breaks features. Will revisit as a dedicated task.
  // Strict-Transport-Security is set at the Vercel platform layer already.
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        // Stop browsers MIME-sniffing responses (defends against
        // confused-deputy attacks where untrusted content is reinterpreted)
        { key: "X-Content-Type-Options", value: "nosniff" },
        // Prevent the site being framed by other origins (clickjacking)
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        // Send referrer to same-origin in full, cross-origin only the origin
        // (gives analytics referrer signal without leaking full URLs)
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        // Disable powerful APIs we don't use; opt out of FLoC cohorts
        {
          key: "Permissions-Policy",
          value:
            "camera=(), microphone=(), geolocation=(), interest-cohort=()",
        },
      ],
    },
  ],
};

export default nextConfig;
