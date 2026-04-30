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
};

export default nextConfig;
