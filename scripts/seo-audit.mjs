// Site-wide SEO audit against a running server (default http://localhost:3200).
// Checks every URL in the built sitemap: status, one H1, heading order, title
// and description length, canonical, robots noindex, og:image, html lang,
// images without alt, and broken internal links (every internal href is fetched once).
//
//   node scripts/seo-audit.mjs [baseUrl] [--out report.json]

import { readFileSync, writeFileSync } from "node:fs";

const base = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:3200";
const outIdx = process.argv.indexOf("--out");
const outFile = outIdx > -1 ? process.argv[outIdx + 1] : "seo-audit-report.json";
const SITE = "https://noeldcosta.com";

const sitemap = readFileSync(".next/server/app/sitemap.xml.body", "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, ""));

const attr = (tag, name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "i"))?.[1];
// Entities decoded so lengths are what a search result shows ("l&#x27;IA" is 4 characters).
const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
const text = (html) => decode(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
const length = (s) => [...s].length;
// Han, kana and Hangul take about two Latin widths in a result snippet, so a
// 60-character Japanese description is not "too short".
const width = (s) => [...s].reduce((w, c) => w + (/[\u{1100}-\u{11ff}\u{3000}-\u{9fff}\u{ac00}-\u{d7af}\u{ff00}-\u{ffef}]/u.test(c) ? 2 : 1), 0);

const pages = [];
const linkSet = new Map(); // href -> first page seen
let i = 0;

async function auditPage(path) {
  const res = await fetch(base + path, { redirect: "manual" });
  const html = res.status === 200 ? await res.text() : "";
  const head = html.slice(0, html.indexOf("</head>") + 7);
  const body = html.slice(html.indexOf("<body"));
  const issues = [];
  if (res.status !== 200) issues.push(`status ${res.status}`);

  const title = text(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  if (!title) issues.push("no title");
  else if (length(title) > 70) issues.push(`title ${length(title)} chars`);

  const descTag = head.match(/<meta[^>]+name="description"[^>]*>/i)?.[0];
  const desc = descTag ? decode(attr(descTag, "content") ?? "") : "";
  if (!desc) issues.push("no meta description");
  else if (width(desc) < 70 || length(desc) > 170) issues.push(`description ${length(desc)} chars`);

  const canonicalTag = head.match(/<link[^>]+rel="canonical"[^>]*>/i)?.[0];
  if (!canonicalTag) issues.push("no canonical");

  const robots = head.match(/<meta[^>]+name="robots"[^>]*>/i)?.[0];
  if (robots && /noindex/i.test(attr(robots, "content") ?? "")) issues.push("noindex");

  if (!/<meta[^>]+property="og:image"/i.test(head)) issues.push("no og:image");
  if (!/<html[^>]+lang="/i.test(html)) issues.push("no html lang");

  const h1s = [...body.matchAll(/<h1[\s>]/gi)].length;
  if (h1s !== 1) issues.push(`${h1s} h1`);

  // heading order: no jump of more than one level downwards
  const levels = [...body.matchAll(/<h([1-6])[\s>]/gi)].map((m) => Number(m[1]));
  for (let k = 1; k < levels.length; k++) {
    if (levels[k] > levels[k - 1] + 1) {
      issues.push(`heading jump h${levels[k - 1]}->h${levels[k]}`);
      break;
    }
  }

  const imgs = [...body.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/\balt\s*=/.test(t));
  if (noAlt.length) issues.push(`${noAlt.length} img without alt`);

  for (const a of body.matchAll(/<a\b[^>]*href="([^"]+)"/gi)) {
    let href = a[1].replace(/&amp;/g, "&");
    if (href.startsWith(SITE)) href = href.slice(SITE.length) || "/";
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    href = href.split("#")[0].split("?")[0];
    if (!href || href.startsWith("/_next/") || href.startsWith("/api/")) continue;
    if (!linkSet.has(href)) linkSet.set(href, path);
  }
  pages.push({ path, status: res.status, title, descLength: length(desc), h1s, issues });
}

async function worker() {
  while (i < urls.length) await auditPage(urls[i++]).catch((e) => pages.push({ path: urls[i - 1], issues: [`error ${e.message}`] }));
}
await Promise.all(Array.from({ length: 12 }, worker));

// Broken internal links
const broken = [];
const links = [...linkSet.entries()];
let j = 0;
async function linkWorker() {
  while (j < links.length) {
    const [href, from] = links[j++];
    if (/\.(png|jpe?g|webp|gif|svg|pdf|mp4|ico|txt|xml)$/i.test(href)) {
      const r = await fetch(base + href, { method: "HEAD" }).catch(() => null);
      if (!r || r.status >= 400) broken.push({ href, from, status: r?.status ?? 0 });
      continue;
    }
    const r = await fetch(base + href, { redirect: "manual" }).catch(() => null);
    if (!r || r.status >= 400) broken.push({ href, from, status: r?.status ?? 0 });
    else if (r.status >= 300) broken.push({ href, from, status: r.status, redirect: r.headers.get("location") });
  }
}
await Promise.all(Array.from({ length: 12 }, linkWorker));

const withIssues = pages.filter((p) => p.issues.length);
const counts = {};
for (const p of withIssues) for (const is of p.issues) {
  const key = is.replace(/\d+/g, "N");
  counts[key] = (counts[key] ?? 0) + 1;
}
writeFileSync(outFile, JSON.stringify({ base, pages: pages.length, withIssues, broken, counts }, null, 1));
console.log(`pages ${pages.length}, with issues ${withIssues.length}, internal links checked ${links.length}, broken/redirecting ${broken.length}`);
console.log(counts);
console.log(broken.slice(0, 20));
