#!/usr/bin/env node
// Checks a translated article or page against its reviewed English source.
//
//   node scripts/check-translation.mjs <locale> [slug ...]
//   node scripts/check-translation.mjs <locale> --all
//   node scripts/check-translation.mjs <locale> --pages [slug ...|--all]
//
// --pages checks content/pages instead of content/posts; a page canonical
// uses the public path from src/data/locale-content-manifest.json.
//
// Errors (exit 1): frontmatter does not parse, protected keys differ from
// English, heading / FAQ / table / code / custom tag structure differs,
// custom tag attribute names or separators differ, em dashes in the body.
// Warnings: numbers from English missing in the translation, English-looking
// sentences left in the body, internal links not pointing at /<locale>/.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const PAGES_MODE = process.argv.includes("--pages");
const POSTS = join(ROOT, "content", PAGES_MODE ? "pages" : "posts");
const PAGE_PATHS = PAGES_MODE
  ? Object.fromEntries(
      JSON.parse(readFileSync(join(ROOT, "src", "data", "locale-content-manifest.json"), "utf8"))
        .items.filter((i) => i.kind === "page")
        .map((i) => [i.slug, i.public_path]),
    )
  : {};
const LOCALES = ["ar", "de", "el", "es", "fr", "hi", "hr", "it", "ja", "ko", "nl", "pt", "ru", "tr", "zh", "zh-TW"];
// Content locale "zh" (Simplified Chinese) is published under /zh-CN/.
const PREFIX = { zh: "zh-CN" };
const SITE = "https://noeldcosta.com";

const [locale, ...rest] = process.argv.slice(2).filter((a) => a !== "--pages");
if (!LOCALES.includes(locale)) {
  console.error(`usage: node scripts/check-translation.mjs <${LOCALES.join("|")}> <slug ...|--all>`);
  process.exit(2);
}
const slugs = rest.includes("--all")
  ? readdirSync(POSTS).filter((s) => existsSync(join(POSTS, s, "en.mdx")))
  : rest;

const SAME_KEYS = ["slug", "date", "updated", "lastReviewed", "category", "hero", "author"];
const SAME_ARRAY_KEYS = ["tags", "mentions"];
// Pages carry fewer keys than articles; only keys the English has are required.
const TRANSLATED_KEYS = PAGES_MODE ? ["title", "h1", "metaTitle", "metaDescription", "excerpt"] : ["title", "metaTitle", "metaDescription", "excerpt"];

function stripCode(body) {
  return body.replace(/```[\s\S]*?```/g, "");
}

function count(re, s) {
  return (s.match(re) || []).length;
}

function structure(body) {
  const b = stripCode(body);
  return {
    h2: count(/^## /gm, b),
    h3: count(/^### /gm, b),
    h4: count(/^#### /gm, b),
    details: count(/<details>/g, b),
    summary: count(/<summary>/g, b),
    tableRows: count(/^\|.*\|\s*$/gm, b),
    codeFences: count(/^```/gm, body),
    images: count(/!\[[^\]]*\]\(/g, b) + count(/<img\s/g, b),
  };
}

// One-line custom tags: <name attr="..." ...></name> or self-closing.
// Attribute values may contain "=>", so attributes are matched as quoted pairs.
const TAG_RE = /<([a-z]+(?:-[a-z]+)+)((?:\s+[a-zA-Z-]+="[^"]*")*)\s*\/?>/g;
function customTags(body) {
  const tags = [];
  for (const m of stripCode(body).matchAll(TAG_RE)) {
    const attrs = {};
    for (const a of m[2].matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) attrs[a[1]] = a[2];
    tags.push({ name: m[1], attrs });
  }
  return tags;
}

function separatorShape(value) {
  // Count of the list separators the explainer components split on.
  return {
    pipe: count(/\|/g, value),
    semi: count(/;/g, value),
    arrow: count(/=>/g, value),
    brackets: count(/\[\d+\]/g, value),
  };
}

function numbers(text) {
  // Digit runs that are meaningful facts (years, money, percentages, counts).
  const out = new Map();
  const plain = stripCode(text)
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/(\d)[\s\u00a0\u202f'](?=\d{3}(?!\d))/g, "$1"); // 18 000, 18'000
  for (const m of plain.matchAll(/\d+(?:[.,]\d+)*/g)) {
    const n = m[0].replace(/[.,]/g, "");
    if (n.length < 2) continue;
    out.set(n, (out.get(n) || 0) + 1);
  }
  return out;
}

// Letter-aware boundaries: "to" inside Croatian "što" is not an English word.
const EN_STOP = /(?<!\p{L})(the|and|of|to|is|that|for|with|this|are|you|your|when|which|not|but|have)(?!\p{L})/giu;
const LATIN = new Set(["de", "es", "fr", "hr", "it", "nl", "pt", "tr"]);

function proseLines(body) {
  return stripCode(body)
    .split("\n")
    .filter((l) => l.trim() && !/^\s*</.test(l) && !/^\|/.test(l) && !/^#+\s/.test(l))
    .map((l) => l.replace(/\]\([^)]*\)/g, "]").replace(/`[^`]*`/g, ""));
}

function englishLeftovers(body) {
  const flagged = [];
  for (const line of proseLines(body)) {
    const words = line.match(/[A-Za-z']+/g) || [];
    const stops = (line.match(EN_STOP) || []).length;
    if (LATIN.has(locale)) {
      if (words.length >= 8 && stops / words.length > 0.18) flagged.push(line.trim().slice(0, 120));
    } else {
      const letters = [...line].filter((c) => /\p{L}/u.test(c));
      const latin = letters.filter((c) => /[A-Za-z]/.test(c));
      if (letters.length >= 40 && latin.length / letters.length > 0.75 && stops >= 3) {
        flagged.push(line.trim().slice(0, 120));
      }
    }
  }
  return flagged;
}

let failed = 0;
for (const slug of slugs) {
  const enPath = join(POSTS, slug, "en.mdx");
  const trPath = join(POSTS, slug, `${locale}.mdx`);
  const errors = [];
  const warnings = [];
  if (!existsSync(trPath)) {
    console.log(`MISSING ${locale}/${slug}`);
    failed++;
    continue;
  }
  let en, tr;
  try {
    en = matter(readFileSync(enPath, "utf8"));
    tr = matter(readFileSync(trPath, "utf8"));
  } catch (e) {
    console.log(`ERROR ${locale}/${slug}: frontmatter does not parse: ${e.message}`);
    failed++;
    continue;
  }
  const ef = en.data;
  const tf = tr.data;

  for (const k of SAME_KEYS) {
    if (ef[k] !== undefined && String(ef[k]) !== String(tf[k])) errors.push(`frontmatter ${k} differs from English`);
  }
  for (const k of SAME_ARRAY_KEYS) {
    if (ef[k] !== undefined && JSON.stringify(ef[k]) !== JSON.stringify(tf[k])) errors.push(`frontmatter ${k} differs from English`);
  }
  for (const k of TRANSLATED_KEYS) {
    if (PAGES_MODE && !ef[k]) continue;
    if (!tf[k]) errors.push(`frontmatter ${k} missing`);
    else if (ef[k] && tf[k] === ef[k]) warnings.push(`frontmatter ${k} identical to English`);
  }
  if (ef.heroAlt && !tf.heroAlt) errors.push("frontmatter heroAlt missing");
  if (Array.isArray(ef.keyTakeaways) && (!Array.isArray(tf.keyTakeaways) || tf.keyTakeaways.length !== ef.keyTakeaways.length)) {
    errors.push("keyTakeaways count differs");
  }
  if (ef.pullQuote && !tf.pullQuote) errors.push("pullQuote missing");
  if (tf.locale !== locale) errors.push(`frontmatter locale must be "${locale}"`);
  const prefix = PREFIX[locale] ?? locale;
  const canonical = `${SITE}/${prefix}/${PAGES_MODE ? (PAGE_PATHS[slug] ?? `${slug}/`) : `${slug}/`}`;
  if (tf.canonicalUrl !== canonical) errors.push(`canonicalUrl must be ${canonical}`);
  if (tf.metaTitle && [...tf.metaTitle].length > 70) warnings.push(`metaTitle is ${[...tf.metaTitle].length} characters`);
  if (tf.metaDescription) {
    const n = [...tf.metaDescription].length;
    if (n > 175 || n < 70) warnings.push(`metaDescription is ${n} characters`);
  }

  const es = structure(en.content);
  const ts = structure(tr.content);
  for (const k of Object.keys(es)) {
    if (es[k] !== ts[k]) errors.push(`${k}: English ${es[k]}, ${locale} ${ts[k]}`);
  }

  const eTags = customTags(en.content);
  const tTags = customTags(tr.content);
  if (eTags.map((t) => t.name).join() !== tTags.map((t) => t.name).join()) {
    errors.push(`custom tags differ: English [${eTags.map((t) => t.name)}], ${locale} [${tTags.map((t) => t.name)}]`);
  } else {
    eTags.forEach((et, i) => {
      const tt = tTags[i];
      const ek = Object.keys(et.attrs).sort().join();
      const tk = Object.keys(tt.attrs).sort().join();
      if (ek !== tk) errors.push(`<${et.name}> #${i + 1} attribute names differ`);
      for (const [k, v] of Object.entries(et.attrs)) {
        if (tt.attrs[k] === undefined) continue;
        const a = separatorShape(v);
        const b = separatorShape(tt.attrs[k]);
        // Free-text attributes are not split by the components; only list attributes must keep separators.
        const freeText = /^(title|caption|source|result|subtitle|label|metric|x-label|y-label|summary|kicker|before-label|after-label|center|unit)$/.test(k);
        if (!freeText && JSON.stringify(a) !== JSON.stringify(b)) errors.push(`<${et.name}> #${i + 1} ${k}: separators differ`);
        // The components parse numbers out of attribute text, so they must keep English formatting.
        const en_nums = (v.match(/\d+(?:[.,]\d+)*/g) || []).join(" ");
        const tr_nums = (tt.attrs[k].match(/\d+(?:[.,]\d+)*/g) || []).join(" ");
        // Only these attributes are parsed as numbers; everywhere else digits are display text.
        const parsed = /^(parts|stages|before-value|after-value)$/.test(k);
        if (parsed && en_nums !== tr_nums) warnings.push(`<${et.name}> #${i + 1} ${k}: numbers differ (English "${en_nums}", ${locale} "${tr_nums}")`);
      }
    });
  }

  if (/—/.test(tr.content) || /—/.test(JSON.stringify(tf))) errors.push("em dash present");

  const en_n = numbers(en.content);
  const tr_n = numbers(tr.content);
  const missing = [...en_n.keys()].filter((n) => !tr_n.has(n));
  if (missing.length) warnings.push(`numbers missing: ${missing.slice(0, 12).join(", ")}${missing.length > 12 ? " ..." : ""}`);

  const left = englishLeftovers(tr.content);
  if (left.length) warnings.push(`possible English left (${left.length}): ${left.slice(0, 3).map((l) => JSON.stringify(l)).join(" | ")}`);

  const english = [...tr.content.matchAll(/\]\((\/(?!images\/|media\/|books\/|[a-z]{2}(?:-[A-Z]{2})?\/)[^)\s]*)\)/g)].map((m) => m[1]);
  if (english.length) warnings.push(`internal links without /${PREFIX[locale] ?? locale}/: ${english.slice(0, 5).join(", ")}`);

  if (errors.length) failed++;
  const status = errors.length ? "FAIL" : warnings.length ? "WARN" : "OK";
  console.log(`${status} ${locale}/${slug}`);
  for (const e of errors) console.log(`  error: ${e}`);
  for (const w of warnings) console.log(`  warn: ${w}`);
}

console.log(`\n${slugs.length - failed}/${slugs.length} passed`);
process.exit(failed ? 1 : 0);
