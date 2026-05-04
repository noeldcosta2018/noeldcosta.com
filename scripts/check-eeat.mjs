#!/usr/bin/env node
/**
 * E-E-A-T frontmatter validator.
 *
 * Per CLAUDE.md, every published post should declare:
 *   - experienceSource: where the content came from (project, interview, etc)
 *   - lastReviewed: ISO date Noel personally read the post end-to-end
 *
 * Without these, the post fails the project's own publishing policy.
 *
 * Usage:
 *   node scripts/check-eeat.mjs           # report-only, exit 0
 *   STRICT_EEAT=true node scripts/check-eeat.mjs   # exit 1 on missing fields
 *
 * Hook into CI by setting STRICT_EEAT=true on main-branch builds once the
 * 1500+ migrated WordPress posts are backfilled. Until then, run in
 * report mode so the existing corpus doesn't fail every build.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const REPO_ROOT = process.cwd();
const POSTS_DIR = join(REPO_ROOT, "content", "posts");
const STRICT = process.env.STRICT_EEAT === "true";

function listPostFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listPostFiles(full));
    } else if (full.endsWith(".mdx")) {
      out.push(full);
    }
  }
  return out;
}

function check() {
  const files = listPostFiles(POSTS_DIR);
  const missing = { experienceSource: [], lastReviewed: [], both: [] };
  let total = 0;

  for (const file of files) {
    total++;
    const raw = readFileSync(file, "utf8");
    const { data } = matter(raw);
    const hasSource = !!data.experienceSource;
    const hasReviewed = !!data.lastReviewed;
    const rel = file.replace(REPO_ROOT, "").replace(/\\/g, "/");

    if (!hasSource && !hasReviewed) missing.both.push(rel);
    else if (!hasSource) missing.experienceSource.push(rel);
    else if (!hasReviewed) missing.lastReviewed.push(rel);
  }

  const compliant =
    total -
    missing.both.length -
    missing.experienceSource.length -
    missing.lastReviewed.length;

  console.log("");
  console.log("─── E-E-A-T frontmatter audit ──────────────────────────");
  console.log(`  Total posts scanned:        ${total}`);
  console.log(`  Compliant (both fields):    ${compliant}`);
  console.log(`  Missing experienceSource:   ${missing.experienceSource.length}`);
  console.log(`  Missing lastReviewed:       ${missing.lastReviewed.length}`);
  console.log(`  Missing BOTH:               ${missing.both.length}`);
  console.log("");

  if (compliant > 0 && compliant < 20) {
    console.log("  Compliant posts:");
    // We don't have the list, just report the count.
  }

  if (missing.experienceSource.length > 0 && missing.experienceSource.length <= 20) {
    console.log("  Posts missing experienceSource:");
    for (const f of missing.experienceSource) console.log(`    - ${f}`);
    console.log("");
  }

  if (missing.lastReviewed.length > 0 && missing.lastReviewed.length <= 20) {
    console.log("  Posts missing lastReviewed:");
    for (const f of missing.lastReviewed) console.log(`    - ${f}`);
    console.log("");
  }

  const totalMissing =
    missing.both.length +
    missing.experienceSource.length +
    missing.lastReviewed.length;

  if (totalMissing === 0) {
    console.log("  ✓ All posts pass the E-E-A-T policy.");
    return 0;
  }

  if (STRICT) {
    console.log(
      `  ✗ STRICT mode: ${totalMissing} posts fail the E-E-A-T policy. Build will fail.`,
    );
    return 1;
  }

  console.log(
    `  ⚠ ${totalMissing} posts missing E-E-A-T fields. Set STRICT_EEAT=true to fail the build.`,
  );
  return 0;
}

process.exit(check());
