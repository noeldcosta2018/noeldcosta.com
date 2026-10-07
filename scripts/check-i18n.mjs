#!/usr/bin/env node
// Checks the interface dictionaries (src/i18n/locales/<locale>.json) against
// the English vocabulary (src/i18n/vocabulary.json).
//
//   node scripts/check-i18n.mjs [locale ...]
//
// Errors: missing keys, empty values, placeholders ({count}, {label}) or
// markdown links that differ from English, em dashes.
// Warnings: keys not in the vocabulary, values identical to English (fine for
// product names, worth a look for sentences).
//
// Rebuild the vocabulary after adding interface text:
//   I18N_COLLECT=strings.txt npm run build   (one JSON string per line)
import { readFileSync } from "node:fs";

const LOCALES = ["ar", "de", "el", "es", "fr", "hi", "hr", "it", "ja", "ko", "nl", "pt", "ru", "tr", "zh", "zh-TW"];
const vocabulary = JSON.parse(readFileSync("src/i18n/vocabulary.json", "utf8"));
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : LOCALES;

const placeholders = (s) => (s.match(/\{[a-z]+\}/g) || []).sort().join();
const links = (s) => (s.match(/\]\([^)]*\)/g) || []).join();

let failed = 0;
for (const locale of wanted) {
  const table = JSON.parse(readFileSync(`src/i18n/locales/${locale}.json`, "utf8"));
  const errors = [];
  const warnings = [];
  for (const en of vocabulary) {
    const v = table[en];
    if (v === undefined) errors.push(`missing: ${JSON.stringify(en).slice(0, 90)}`);
    else if (!v.trim()) errors.push(`empty: ${JSON.stringify(en).slice(0, 90)}`);
    else {
      if (placeholders(v) !== placeholders(en)) errors.push(`placeholders differ: ${JSON.stringify(en).slice(0, 90)}`);
      if (links(v) !== links(en)) errors.push(`links differ: ${JSON.stringify(en).slice(0, 90)}`);
      if (v.includes("—")) errors.push(`em dash: ${JSON.stringify(v).slice(0, 90)}`);
      if (v === en && /\s/.test(en) && en.split(" ").length > 3) warnings.push(`same as English: ${JSON.stringify(en).slice(0, 90)}`);
    }
  }
  const known = new Set(vocabulary);
  for (const k of Object.keys(table)) if (!known.has(k.split("|")[0])) warnings.push(`not in vocabulary: ${JSON.stringify(k).slice(0, 90)}`);
  if (errors.length) failed++;
  const covered = vocabulary.filter((k) => table[k]).length;
  console.log(`${errors.length ? "FAIL" : warnings.length ? "WARN" : "OK"} ${locale}: ${covered}/${vocabulary.length}`);
  for (const e of errors.slice(0, 40)) console.log(`  error: ${e}`);
  if (errors.length > 40) console.log(`  ... ${errors.length - 40} more errors`);
  for (const w of warnings.slice(0, 20)) console.log(`  warn: ${w}`);
}
process.exit(failed ? 1 : 0);
