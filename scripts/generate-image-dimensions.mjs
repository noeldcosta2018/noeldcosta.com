#!/usr/bin/env node
// Regenerates src/data/image-dimensions.json: intrinsic width/height for every
// raster image under public/ that content/ references by site-relative path
// (article bodies and hero frontmatter, all locales). Article renderers use
// the map to emit width/height attributes so images reserve their space.
//
// Usage: node scripts/generate-image-dimensions.mjs
// Re-run after adding or replacing images referenced by content.

import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");
const PUBLIC = join(ROOT, "public");
const OUTPUT = join(ROOT, "src", "data", "image-dimensions.json");

const IMAGE_REF = /(?<![\w.:/-])\/[^\s"'()<>[\]]+?\.(?:webp|png|jpe?g|gif)(?![\w.])/gi;

function* mdxFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* mdxFiles(path);
    else if (entry.endsWith(".mdx") && !entry.endsWith(".raw.mdx")) yield path;
  }
}

function webpSize(b) {
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
  return null;
}

function pngSize(b) {
  if (b.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function gifSize(b) {
  if (b.toString("ascii", 0, 4) !== "GIF8") return null;
  return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
}

function jpegSize(b) {
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    if (marker === 0xff) { i++; continue; }
    const length = b.readUInt16BE(i + 2);
    // SOF0-SOF15, excluding DHT (C4), JPG (C8) and DAC (CC).
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
    }
    i += 2 + length;
  }
  return null;
}

function imageSize(file) {
  const b = readFileSync(file);
  return webpSize(b) ?? pngSize(b) ?? gifSize(b) ?? jpegSize(b);
}

const refs = new Set();
for (const file of mdxFiles(CONTENT)) {
  for (const match of readFileSync(file, "utf8").matchAll(IMAGE_REF)) refs.add(match[0]);
}

const dimensions = {};
const unreadable = [];
for (const src of [...refs].sort()) {
  let file;
  try {
    file = join(PUBLIC, decodeURI(src));
  } catch {
    continue;
  }
  if (!existsSync(file)) continue;
  const size = imageSize(file);
  if (size && size.width > 0 && size.height > 0) dimensions[src] = size;
  else unreadable.push(src);
}

writeFileSync(OUTPUT, JSON.stringify(dimensions, null, 2) + "\n");
console.log(`Wrote ${Object.keys(dimensions).length} entries to ${OUTPUT}`);
if (unreadable.length) console.warn(`Could not read dimensions for:\n  ${unreadable.join("\n  ")}`);
