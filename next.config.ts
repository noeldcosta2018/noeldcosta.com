import type { NextConfig } from "next";
import { legacyRedirectRules, wordpressSystemRedirects } from "./src/lib/legacy-redirects.mjs";

const nextConfig: NextConfig = {
  // Preserve the WordPress URL contract: every legacy URL ends in `/`, and
  // 64.5% of clicks come via GTranslate, which fetches the origin path
  // verbatim. With `trailingSlash: true`, Next.js emits trailing slashes in
  // sitemap, canonical, and generated <Link> hrefs, and 308-redirects any
  // bare-path hit to its trailing-slash form. Single source of truth for
  // the URL shape — matters more than the routing ergonomics.
  trailingSlash: true,
  // Inline critical above-the-fold CSS and defer the rest. Uses
  // `critters` under the hood (already in deps). Eliminates the two
  // large render-blocking _next/static/chunks/*.css requests for
  // first-paint, dropping LCP by ~200-400 ms on cold loads.
  experimental: {
    optimizeCss: true,
    // One branded 404 for unmatched URLs across both root layouts
    // ((site) English and (localized)/[locale]). See app/global-not-found.tsx.
    globalNotFound: true,
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
  // Translated homepages (/de/, /fr/ ...) are rendered by the translated content
  // route at /<locale>/__home/. A rewrite keeps the public URL /<locale>/ without
  // a route that would also match every one-segment English path. Locales whose
  // homepage is not generated simply 404 as before.
  rewrites: async () => [
    {
      source: "/:locale(ar|de|el|es|fr|hi|hr|it|ja|ko|nl|pt|ru|tr|zh-CN|zh-TW)/",
      destination: "/:locale/__home/",
    },
  ],
  // Old WordPress URLs that the live site 301-redirects today, recreated on
  // Noel's approval (7 October 2026). Checked before pages and the proxy.
  // WordPress media, feed and sitemap addresses: see wordpressSystemRedirects.
  redirects: async () => [...legacyRedirectRules(), ...wordpressSystemRedirects()],
  // Security headers — applied globally. CSP intentionally omitted because
  // the site loads external resources (Calendly embed, Google Fonts, OG
  // image previews) that need a careful per-resource allowlist; doing it
  // wrong silently breaks features. Will revisit as a dedicated task.
  // Strict-Transport-Security is set at the Vercel platform layer already.
  headers: async () => [
    // The site-search data files are JSON for the search box, not pages:
    // keep them out of search results and SEO reports.
    {
      source: "/search-index/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex" }],
    },
    {
      source: "/:path*",
      headers: [
        // Stop browsers MIME-sniffing responses (defends against
        // confused-deputy attacks where untrusted content is reinterpreted)
        { key: "X-Content-Type-Options", value: "nosniff" },
        // HTTPS only, for two years, subdomains included. Vercel also redirects
        // http to https; this tells browsers never to try http again.
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
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
