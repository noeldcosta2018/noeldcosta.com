# Fix playbook — post-audit

Read this. Do fixes in order. Each fix is a separate Claude Code session.

## Triage summary

**SEO audit. 16 critical, 10 high, 14 medium, 16 low.**

Real-world impact ranking (not just severity count):

1. **6 nested URLs 404.** 700+ monthly clicks at risk. Top priority.
2. **3 category URLs 404.** Category traffic at risk.
3. **6 tag URLs 404.** Lower volume but still indexed.
4. **Sitemap emits 14 locale variants per URL.** Conflicts with GTranslate.
5. **Hreflang annotations emitted on every page.** Conflicts with GTranslate.
6. **`[lang]` segment still in source tree.** Cleanup. Not user-facing because proxy.ts rewrites, but the metadata leak is real.
7. **Schema parity gap.** Hub pages lose Article schema during migration.

**Mobile audit. 0 critical, 7 high, 10 medium, 10 low.**

The mobile audit is in decent shape. Fix the high-severity items but don't delay launch over the rest.

## Order of fixes

Do these in this exact order. Don't skip. Don't batch.

1. Fix the multi-segment URL handler. (SEO critical)
2. Fix category IDs to match WordPress. (SEO critical)
3. Build tag archive route. (SEO critical)
4. Remove `[lang]` segment from source tree. (SEO + cleanup)
5. Strip hreflang and clean up sitemap to English-only. (SEO critical)
6. Add Article/WebPage schema to MdxPageLayout. (SEO high)
7. Fix duplicate H1 in MdxPageLayout. (SEO high)
8. Mobile fixes (parallel track, can start anytime after fix 1).
9. Final URL verification.

Each fix below has:
- What it solves
- A ready-to-paste prompt for Claude Code
- Verification step before commit

## Fix 1. Multi-segment URL handler

**Solves.** Six WordPress URLs currently 404 on Next.js. Top traffic risk in the audit. Files like `/sap-implementation/for-aviation/` (279 clicks), `/sap-implementation/sap-modules/` (418 clicks), `/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/` (246 clicks).

**Effort.** Medium. New route file, updated routing logic.

**Open a fresh Claude Code session. Paste:**

```
Read _docs/audits/seo-audit-2026-05-24.md sections 1 and 2.

Task. The catch-all at src/app/[lang]/[slug]/page.tsx only handles single-segment paths. WordPress URLs with nested paths return 404. Fix this by converting the catch-all to handle arbitrary depth.

Approach.
1. Rename src/app/[lang]/[slug] to src/app/[lang]/[...slug].
2. Update params type from { slug: string } to { slug: string[] }.
3. Where the slug is used to look up MDX content, join the array with "/" to form the full path.
4. Update getStaticParams to generate the multi-segment slugs.
5. Confirm existing single-segment URLs still work (e.g. /sap-implementation/, /case-studies/).

The MDX content for nested URLs exists at flat slugs already (content/pages/for-aviation/, content/pages/sap-modules/, etc). Look up by the LAST segment of the URL path. So /sap-implementation/for-aviation/ resolves to the MDX page with slug "for-aviation". Confirm this by reading existing MDX frontmatter before coding.

Do NOT remove the [lang] segment in this task. That's a separate fix.

Verification before committing.
- Run npm run dev.
- Visit http://localhost:3000/sap-implementation/for-aviation/ and confirm content loads.
- Visit http://localhost:3000/sap-implementation/sap-modules/ and confirm content loads.
- Visit http://localhost:3000/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/ and confirm content loads.
- Visit http://localhost:3000/sap-implementation/ (single segment) and confirm it still loads.
- Visit http://localhost:3000/case-studies/ (single segment) and confirm it still loads.

Report what you changed. Show me the diff before committing.
```

**Commit message.** `Fix multi-segment URL handler. Resolves 6 nested URLs from WordPress sitemap.`

---

## Fix 2. Category IDs match WordPress

**Solves.** Three WordPress category URLs 404 because IDs differ.

**Effort.** Small. Find and replace plus internal link updates.

**Fresh Claude Code session. Paste:**

```
Read _docs/audits/seo-audit-2026-05-24.md section 1, the "WordPress categories" table.

Task. Rename CATEGORIES keys in src/lib/content.ts:22-58 to match Yoast slugs. Current names don't match WordPress.

Rename map.
- Current Next.js ID → WordPress slug (target)
- erp-implementation OR consulting-career → erp-consulting-guide
- case-studies → sap-case-studies
- platforms-modules → sap-modules
- ai-governance → ai-governance (already matches, leave alone)

Important. The "case-studies" category ID is used internally for the case study INDEX page at /case-studies/. Don't break that. The new ID needs to coexist with the index page. If renaming the category to "sap-case-studies" causes the /case-studies/ index to break, find a way to keep both working. Ask before improvising.

After renaming the keys, find every reference and update.
- src/lib/content.ts (the source).
- src/components/Nav.tsx (category links in dropdown).
- src/components/Footer.tsx (category links in footer).
- src/components/CategoryPage.tsx (lines 84-91 and 245-251 per audit).
- src/components/Hero.tsx:139 (the lang-prefixed case-studies link).
- Any MDX frontmatter that references categories.
- sitemap.ts category URL generation.

Verification.
- Run npm run dev.
- Visit /category/ai-governance/ — should work.
- Visit /category/erp-consulting-guide/ — should work after fix.
- Visit /category/sap-case-studies/ — should work after fix.
- Visit /category/sap-modules/ — should work after fix.
- Visit /case-studies/ — must still work.

Report changes. Show diff. Don't commit until I review.
```

**Commit message.** `Fix category IDs to match WordPress slugs. Resolves 3 category 404s.`

---

## Fix 3. Tag archive route

**Solves.** Six WordPress tag URLs return 404. No tag route exists at all.

**Effort.** Small to medium. New route file plus tag aggregation logic.

**Fresh Claude Code session. Paste:**

```
Read _docs/audits/seo-audit-2026-05-24.md section 1, the "WordPress tags" table.

Task. Build a tag archive route at src/app/[lang]/tag/[tag]/page.tsx that lists posts with the matching tag in frontmatter.

WordPress URLs to support.
- /tag/sap-crisis-management/
- /tag/sap-erp-modernization/
- /tag/sap-implementation-strategies/
- /tag/sap-industry-topics/
- /tag/sap-planning-and-selection/
- /tag/sap-technical-decisions/

Reference. Post frontmatter already has tags arrays (see src/components/CategoryPage.tsx:36-65 for TAG_META). Read CategoryPage.tsx and reuse its post-listing pattern for the tag pages. Same layout, different filter.

Add generateStaticParams that returns the 6 tag slugs above. Plus any other tags found in post frontmatter that aren't in this list (do a content/posts/*/en.mdx scan to find them).

Also add tag URLs to src/app/sitemap.ts. English only (no locale variants).

Verification.
- Run npm run dev.
- Visit /tag/sap-crisis-management/ — should render a list of posts.
- Visit each of the 6 tag URLs.
- Confirm tags with no posts still render gracefully (empty state) or 404 with a clear message.
- Check sitemap.xml output includes the tag URLs.

Report changes. Show diff. Don't commit until I review.
```

**Commit message.** `Add tag archive routes. Resolves 6 tag URL 404s.`

---

## Fix 4. Remove [lang] segment

**Solves.** The cleanup the audit prompt asked for. Removes the [lang] segment from source tree. Simplifies metadata. Eliminates hreflang emissions tied to locale prefix logic.

**Effort.** Large. Touches ~30 files. Plan to commit in stages.

**Important.** This is mechanical but big. Do it in a fresh Claude Code session with no other work in progress. Don't try to bundle this with other fixes.

**Fresh Claude Code session. Paste:**

```
Read _docs/audits/seo-audit-2026-05-24.md section 2 (the full [lang] segment removal scope).

Task. Remove the [lang] segment from src/app/ routing. Strip all locale-prefix logic. Delete or stub locale infrastructure. The Next.js site becomes English-only flat URLs.

Plan it first. Before making any changes, output a step-by-step plan with:
1. Files to move (src/app/[lang]/ → src/app/).
2. Files to delete (src/proxy.ts, possibly src/lib/locales.ts).
3. Files to edit (components that accept locale props, seo.ts metadata builders, sitemap.ts).
4. Order of operations (which to do first to avoid breaking the build at any intermediate step).
5. Verification points along the way.

Wait for me to approve the plan before executing.

Constraints.
- Do NOT change URL slugs. WordPress URL preservation is non-negotiable.
- Do NOT remove hreflang yet. That's a separate fix (#5).
- Do NOT update sitemap to English-only yet. Also separate fix (#5).
- Just remove the [lang] segment and the locale prop threading.

After plan approval, work through it. Pause and report after each stage. Do not commit until the full refactor is done and verified.
```

**This is a multi-step session.** Approve the plan when Claude Code shows it. Walk through stages with it. Don't rush.

**Commit message.** `Remove [lang] segment from routing. Flat English URLs throughout.`

---

## Fix 5. Strip hreflang and English-only sitemap

**Solves.** GTranslate handles hreflang and locale alternates externally on its proxy. The Next.js site must not emit these. Today's sitemap emits 14 locale variants per URL.

**Effort.** Medium.

**Fresh Claude Code session. Paste:**

```
Read _docs/audits/seo-audit-2026-05-24.md sections 3, 4, and 8.

Task. Strip hreflang annotations from metadata. Update sitemap to English-only flat URLs.

Specific edits.
1. src/lib/seo.ts:73-79 and 122-127. Remove the languages dict from buildPostMetadata and buildPageMetadata.
2. src/lib/seo.ts:20-39. Remove or stub LOCALE_HREFLANG. Keep the file working but no hreflang output.
3. src/app/sitemap.ts. Replace the LOCALES traversal with a single English emit. Remove alternates blocks. URL builder becomes ${SITE_URL}/${path}. Confirm URLs match WordPress format exactly (trailing slashes, etc).
4. src/app/sitemap.ts. Add image sitemap entries for posts (the audit flagged this as a Yoast feature parity gap).
5. Confirm canonical URLs in metadata no longer include locale prefix.

This work depends on Fix 4 being complete. The [lang] removal makes most of this simpler.

Verification.
- npm run build succeeds.
- View /sitemap.xml in dev mode. Confirm.
  - No locale-prefixed URLs.
  - All WordPress page URLs present.
  - All blog post URLs present.
  - Image entries present for posts that have hero images.
  - No <xhtml:link rel="alternate" hreflang="..."> entries.
- View any page's HTML source. Confirm no <link rel="alternate" hreflang> tags in <head>.
- Confirm canonical link still points to the correct flat URL.

Report changes. Show diff. Don't commit until I review.
```

**Commit message.** `Strip hreflang. Sitemap emits English-only flat URLs. Add image entries.`

---

## Fix 6. Article/WebPage schema on MdxPageLayout

**Solves.** Schema parity regression vs WordPress. Yoast emits Article on every page. Next.js currently emits only BreadcrumbList.

**Effort.** Small.

**Fresh Claude Code session. Paste:**

```
Read _docs/audits/seo-audit-2026-05-24.md sections 5 and 8 (rows on Article schema and Yoast parity).

Task. Add WebPage and Article schema to MdxPageLayout. Add FAQPage schema where FAQ content is present.

Specific.
1. In src/components/MdxPageLayout.tsx (or wherever the JSON-LD is emitted for content pages), add a WebPage schema for every rendered page. Include url, name (from fm.title), description (from fm.description), inLanguage: "en", isPartOf reference to the sitewide WebSite, author reference to the sitewide Person.
2. If the page has substantive content (>500 words), also emit Article schema. Use the same author/publisher pattern as posts.
3. Tool pages (src/components/tools/ToolShell.tsx or wherever): if FAQ content exists in the MDX or component props, emit FAQPage schema. Reference https://schema.org/FAQPage.
4. Don't remove existing BreadcrumbList. Keep it.

Verification.
- View source of /sap-implementation/ in dev. Confirm WebPage and Article JSON-LD blocks present.
- View source of /sap-implementation-cost-calculator/. Confirm FAQPage emits if FAQ exists.
- Validate the JSON-LD at https://search.google.com/test/rich-results (paste the page source).

Report changes. Show diff. Don't commit until I review.
```

**Commit message.** `Add Article/WebPage schema to MdxPageLayout. Add FAQPage on tool pages.`

---

## Fix 7. Duplicate H1 in MdxPageLayout

**Solves.** Some MDX pages render two H1 elements. The layout emits one. The MDX body emits another. Accessibility and SEO issue.

**Effort.** Tiny.

**Fresh Claude Code session. Paste:**

```
Read _docs/audits/seo-audit-2026-05-24.md section 6, row on content/pages/sap-implementation/en.mdx.

Task. Find and fix duplicate H1 elements where the layout's H1 and the MDX body H1 both render.

Approach.
1. Grep across content/pages/*/en.mdx for lines starting with "# " at the top of the body (after frontmatter).
2. For each file found, remove the body H1 (the layout already renders one from fm.h1 || fm.title).
3. Confirm fm.h1 or fm.title is set appropriately in each affected file.

Verification.
- Run grep -rE '^# ' content/pages/*/en.mdx after fix. Should return zero results.
- npm run dev.
- View source on /sap-implementation/. Confirm only one <h1> element.
- Pick 2-3 other pages and confirm the same.

Report changes. Show diff. Don't commit until I review.
```

**Commit message.** `Remove duplicate H1s in MDX page bodies. Layout owns the H1.`

---

## Fix 8. Mobile high-severity fixes

**Solves.** The 7 high-severity mobile findings. Can run in parallel with any of the SEO fixes above. No dependencies.

**Effort.** Small to medium. Each item is a few lines.

**Fresh Claude Code session. Paste:**

```
Read _docs/audits/mobile-audit-2026-05-24.md.

Task. Address the 7 high-severity mobile findings. Skip MED/LOW for now.

Fix list.
1. HIGH-1. Bump body font from 15px to 16px in src/app/globals.css:510. Re-check components that visibly change.
2. HIGH-2. Remove `body { overflow-x: hidden }` from globals.css:509. Then fix any horizontal overflow that surfaces. Likely candidates: marquees (Ticker, LogoScroll) need their own overflow-hidden scoped to the marquee container.
3. HIGH-3. Fix MDX tables. src/components/mdx/MdxBody.tsx:200-206. Replace `overflow-hidden` on the wrapping figure with `overflow-x-auto`. Drop `table-fixed` from the table.
4. HIGH-4. Add a mobile Hero headshot. src/components/Hero.tsx around line 210. Today the headshot is hidden below lg. Add a smaller framed photo above the headline at < lg, or an inline avatar next to the eyebrow text. Don't shrink the desktop frame onto mobile.
5. HIGH-5. PostPage breadcrumb. src/components/PostPage.tsx:128-133. Drop the post title from breadcrumb on mobile. Keep Home / Category only at < md.
6. HIGH-6. TrackRecord on mobile. src/components/TrackRecord.tsx:218-220. The sticky dashboard renders below the project list when grid collapses to single column. Either disable sticky observer at < lg and render dashboard above the list, or inline a mini-dashboard per project row.
7. HIGH-7. Hero headline. src/components/Hero.tsx:61-98. Replace per-word flex spans with plain text inside the h1. Apply per-word stagger via parent CSS animation, not per-span elements. Let normal text-wrap handle line breaks.

Test each fix at 375px viewport (Chrome dev tools, set device to iPhone SE or similar).

Verification per fix.
- HIGH-1, HIGH-4, HIGH-5: visual check at 375px.
- HIGH-2: visual check that no horizontal scroll appears at 375px after removing the hidden.
- HIGH-3: load a blog post with a table, scroll the table horizontally on mobile.
- HIGH-6: scroll through TrackRecord on mobile, confirm dashboard shows the active project.
- HIGH-7: confirm hero headline wraps cleanly at 375px and 414px.

Commit each fix separately or batch as you see fit. Show me the changes before committing.
```

**Commit message.** `Mobile high-severity fixes. Body font, MDX tables, mobile hero, TrackRecord.`

---

## Fix 9. Final URL verification

**Run after all fixes above are merged.**

**Fresh Claude Code session. Paste:**

```
Final pre-launch URL verification. Read _docs/references/wordpress-urls.md.

Task. For every WordPress URL in that file (pages, blog posts, categories, tags), confirm the Next.js dev server returns a 200 response with real content.

Approach.
1. Run npm run dev.
2. For each URL in wordpress-urls.md, fetch http://localhost:3000{path} and check status code and that the response body is not an error page.
3. Output a pass/fail table grouped by section (pages, posts, categories, tags).
4. Any fail is a hard blocker for launch.

Save the report to _docs/audits/pre-launch-check-2026-05-24.md.

After the check, also confirm:
- /sitemap.xml returns valid XML with all URLs listed.
- /robots.txt returns valid content.
- No locale prefixes appear in any rendered URL.
- No hreflang annotations in any page source.

Report findings. If anything fails, list the URL and what you saw.
```

If everything passes, you're ready for Phase 3 (GTranslate setup) and DNS cutover. Go back to playbook.md step 8.

---

## What to do if something breaks

**Fix introduces build errors.** Revert the commit. Try again with a more focused prompt.

**Fix breaks a URL that was working before.** Don't merge. Send the diff back to Claude Code with the specific URL that broke and ask for a smaller-scope fix.

**Fix conflicts with another fix.** Rebase. Don't merge two SEO fixes from different sessions without confirming they don't touch the same files.

**You run out of context mid-fix.** Open a fresh session. Tell the new session what was done and what's left. Reference the audit findings file.

## Reminder

These are fixes against the AUDIT findings. They are not a replacement for reading CLAUDE.md before making code changes. CLAUDE.md still applies. The voice rules still apply. The URL preservation rule still applies.
