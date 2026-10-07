#!/usr/bin/env node
// Recomputes locale availability in the locale content manifest from the
// content tree: for every post and page, which locales have a publishable
// `<locale>.mdx` and which only a `<locale>.raw.mdx`. Paths, kinds and the URL
// contract stay as they are. Writes src/data/locale-content-manifest.json (read
// by the routes) and keeps docs/codex/locale-content-manifest.json identical.
//
//   node scripts/refresh-locale-manifest.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const TARGETS = ["src/data/locale-content-manifest.json", "docs/codex/locale-content-manifest.json"];

// Same order as CONTENT_LOCALES in src/lib/locales.ts.
const CONTENT_LOCALES = ["en", "ar", "de", "el", "es", "fr", "hi", "hr", "it", "ja", "ko", "nl", "pt", "ru", "tr", "zh", "zh-TW"];
const PUBLIC_LOCALE_MAP = Object.fromEntries(
  CONTENT_LOCALES.map((l) => [l, l === "en" ? null : l === "zh" ? "zh-CN" : l]),
);

const manifest = JSON.parse(readFileSync(join(ROOT, TARGETS[0]), "utf8"));
const folder = (item) => join(ROOT, "content", item.kind === "post" ? "posts" : "pages", item.slug);

for (const item of manifest.items) {
  const dir = folder(item);
  item.available_locales = CONTENT_LOCALES.filter((l) => existsSync(join(dir, `${l}.mdx`)));
  item.missing_locales = CONTENT_LOCALES.filter((l) => !item.available_locales.includes(l));
  item.raw_locales = CONTENT_LOCALES.filter((l) => l !== "en" && existsSync(join(dir, `${l}.raw.mdx`)));
}

manifest.content_locales = CONTENT_LOCALES;
manifest.public_locale_map = PUBLIC_LOCALE_MAP;
manifest.generated_at = new Date().toISOString().slice(0, 10);

const json = `${JSON.stringify(manifest, null, 2)}\n`;
for (const target of TARGETS) writeFileSync(join(ROOT, target), json);

const perLocale = Object.fromEntries(
  CONTENT_LOCALES.map((l) => [l, manifest.items.filter((i) => i.available_locales.includes(l)).length]),
);
console.log("items per locale:", JSON.stringify(perLocale));
