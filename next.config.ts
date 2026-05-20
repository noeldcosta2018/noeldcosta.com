import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inline critical above-the-fold CSS and defer the rest. Uses
  // `critters` under the hood (already in deps). Eliminates the two
  // large render-blocking _next/static/chunks/*.css requests for
  // first-paint, dropping LCP by ~200-400 ms on cold loads.
  experimental: {
    optimizeCss: true,
  },
  images: {
    // Serve AVIF when supported, WebP as fallback. AVIF cuts the headshot
    // PNG (4.6 MB source) by ~85% at equivalent quality. Browser
    // negotiation is automatic via Accept headers.
    formats: ["image/avif", "image/webp"],
    // Trim device-pixel-ratio variants. Default Next.js generates up to
    // 3840w which is wasteful for our largest single image (headshot,
    // 480px display max). Capping at 1920w covers 4x DPR on a 480px slot
    // and 2x DPR on a 960px slot — every realistic case for this site.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cards lean on `quality={70}` to shave bytes — list it alongside the
    // Next.js default of 75 so the runtime stops warning on every render.
    qualities: [70, 75],
    remotePatterns: [
      // YouTube thumbnails — RSS feed uses numbered subdomains (i1–i4.ytimg.com)
      { protocol: "https", hostname: "**.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      // Pexels stock imagery used in blog body content. Free, commercial-use,
      // no attribution required. Article authors embed via raw <img> tags
      // (which bypass next/image), but listing here keeps the policy clean
      // if any tool wraps these URLs in next/image later.
      { protocol: "https", hostname: "images.pexels.com" },
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
