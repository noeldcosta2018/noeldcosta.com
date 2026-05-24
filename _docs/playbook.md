# Migration playbook

Read top to bottom. Do steps in order. Don't skip.

## Why this order

64.5% of your traffic comes through GTranslate-served URLs. URL preservation is the single biggest risk. SEO work protects it. Mobile is 22% of clicks so it matters but it's not what makes or breaks the migration. GTranslate setup happens last because it depends on a working English site.

## Before you start

You need three things in place. If any are missing, fix that first.

1. Local clone of the Next.js repo with Claude Code installed.
2. Admin access to the live WordPress site (for fallback if migration goes wrong).
3. Access to the GTranslate dashboard. Login credentials. Note the current plan tier.

If you don't have GTranslate dashboard access, get it before anything else. You'll need it in phase 3.

---

## Step 1. Set up reference files in the repo

Copy these files into the repo at the paths shown. Commit them.

| File | Save to |
|------|---------|
| `wordpress-urls.md` | `_docs/references/wordpress-urls.md` |
| `search-console-findings.md` | `_docs/references/search-console-findings.md` |
| `priority-urls.md` | `_docs/references/priority-urls.md` |
| `audit-1-mobile.md` | `_docs/audits/_prompts/audit-1-mobile.md` |
| `audit-2-seo.md` | `_docs/audits/_prompts/audit-2-seo.md` |
| `phase-3-gtranslate.md` | `_docs/audits/_prompts/phase-3-gtranslate.md` |

Also save the raw Search Console export. `_docs/references/search-console-export.xlsx`.

Commit these. The audits reference them.

---

## Step 2. Update CLAUDE.md

Your current CLAUDE.md says "Multi-language via the `[lang]` segment in src/app/." That's now outdated. GTranslate handles translation externally. The Next.js site serves English only.

Edit CLAUDE.md. Make these changes:

1. Replace the multi-language line with. "Translation handled by GTranslate proxy externally. The Next.js site serves English only at flat URLs."

2. Update the routing table. Remove `[lang]` from every path. Routes go from `src/app/[lang]/page.tsx` to `src/app/page.tsx`.

3. Add a new rule under Constraints. "Do not add a language prefix to any URL. Do not nest routes under `[lang]`. English at root only. GTranslate handles other languages externally."

Commit this.

---

## Step 3. Fetch the full WordPress URL list

The `wordpress-urls.md` file has the static pages plus top 50 traffic URLs. You need the full blog post list too.

In Claude Code, run:

```
Fetch these three sitemaps and add every URL to _docs/references/wordpress-urls.md under a new "Blog posts", "Categories", and "Tags" section:

- https://noeldcosta.com/post-sitemap.xml
- https://noeldcosta.com/category-sitemap.xml  
- https://noeldcosta.com/post_tag-sitemap.xml

For each URL just list the path (e.g. /master-the-sap-btp-cockpit-simple-steps/) and the lastmod date.
```

Commit the updated file.

---

## Step 4. Run the SEO audit (highest priority)

Open a fresh Claude Code session. Run:

```
Read _docs/audits/_prompts/audit-2-seo.md and follow it exactly. Save findings to _docs/audits/seo-audit-YYYY-MM-DD.md.
```

Wait for it to complete. Should take 15-30 minutes depending on codebase size.

Review the output. You're looking for three categories of findings.

**Critical (must fix before launch).**
- URL mismatches between Next.js and WordPress.
- Any route nested under `[lang]` that should be flat.
- Missing sitemap entries.
- Missing schema on pages that need it.
- Pages that 404 instead of serving content.

**High (fix before launch).**
- Missing or duplicate meta tags.
- Broken Yoast feature parity.
- GTranslate compatibility risks (content rendered client-side).

**Medium/low (fix when convenient).**
- Image optimization improvements.
- Schema improvements beyond parity.

Document the critical and high findings as GitHub issues or a tracking doc.

---

## Step 5. Fix critical SEO issues

In Claude Code, work through the critical issues one at a time. Don't batch them. One issue, one commit, one verification.

The biggest one is likely the `[lang]` segment removal. This will involve:

1. Moving every file from `src/app/[lang]/*` to `src/app/*`.
2. Removing locale-specific logic from layouts and pages.
3. Updating `src/lib/locales.ts` (probably delete it or stub it out).
4. Removing locale handling from `src/middleware.ts` if present.
5. Updating any internal links that include language prefixes.
6. Updating sitemap.ts to generate flat URLs.

For each critical fix:

```
Fix issue [X] from _docs/audits/seo-audit-YYYY-MM-DD.md. Don't touch other issues. Test that the route serves at the WordPress-equivalent URL before committing.
```

After fixing all critical issues, run the SEO audit again. Confirm critical count is now zero.

---

## Step 6. Run the mobile audit (parallel to SEO fixes)

Once the SEO audit is complete (step 4), you can run the mobile audit in parallel with the fixes in step 5. They don't conflict.

Open a separate Claude Code session. Run:

```
Read _docs/audits/_prompts/audit-1-mobile.md and follow it exactly. Save findings to _docs/audits/mobile-audit-YYYY-MM-DD.md.
```

Review the output. For mobile, only fix critical issues. Things that make the site unusable on a phone. Skip the polish.

Reason. Mobile is 22% of traffic. Don't delay launch over typography refinements.

Critical mobile issues to fix:
- Horizontal scroll at 375px.
- Nav menu broken on mobile.
- Buttons or CTAs too small to tap.
- Content that overflows the viewport.
- Forms unusable on mobile.

Everything else. Backlog. Fix post-launch.

---

## Step 7. Pre-launch verification

Before phase 3, confirm the English site is solid.

In Claude Code:

```
Take every URL in _docs/references/wordpress-urls.md. For each one, confirm:
1. The Next.js dev server serves a 200 at that exact path.
2. The page renders content (not an error or blank).
3. The page title and meta description are present.

Output a pass/fail table. Save to _docs/audits/pre-launch-check-YYYY-MM-DD.md.
```

Any fail in this step is a hard launch blocker. Fix before continuing.

---

## Step 8. Deploy Next.js to staging

Push to a staging URL. Could be a Vercel preview, a staging subdomain, or any URL that's stable for testing.

Confirm the staging URL serves all the WordPress URLs identically.

---

## Step 9. Configure GTranslate to point at staging

This is the dress rehearsal for the cutover.

In the GTranslate dashboard:

1. Note the current origin (the WordPress server). Write it down. You'll need it to roll back.
2. Add a test/sandbox configuration pointing to your staging URL.
3. Use a temporary test domain if GTranslate supports it. If not, prepare to switch origins briefly during a low-traffic window.

Test 10 URLs from `_docs/references/priority-urls.md`. Specifically:

- Visit each URL with `/es/`, `/ja/`, `/fr/`, `/de/`, `/ru/` prefixes via GTranslate proxy.
- Confirm content loads.
- Confirm translation looks similar to current production.
- Confirm internal links work.

Document any failures. Fix them in the Next.js code before continuing.

---

## Step 10. Run phase 3 GTranslate setup audit

Open Claude Code. Run:

```
Read _docs/audits/_prompts/phase-3-gtranslate.md and follow it exactly. Save findings to _docs/audits/gtranslate-setup-YYYY-MM-DD.md.
```

This produces a checklist of GTranslate compatibility issues plus a DNS cutover plan.

Address any compatibility issues. Then proceed.

---

## Step 11. Production cutover

Pick a low-traffic window. Probably weekend, late evening UAE time.

The cutover sequence:

1. Deploy Next.js to production (the real server, not staging).
2. Update DNS or origin configuration so GTranslate points to the new Next.js origin.
3. Verify within 5 minutes:
   - English homepage loads at noeldcosta.com.
   - At least 5 sample WordPress URLs load with correct content.
   - At least 5 sample translated URLs load via GTranslate.
4. If anything is broken and not fixable in under 15 minutes, roll back. Point GTranslate origin back to WordPress. Investigate. Retry later.

---

## Step 12. Post-launch monitoring (30 days)

Daily for the first week. Weekly after.

Check Search Console:
- Crawl errors. Any new 404s indicate URL mismatches.
- Coverage report. Any indexed pages dropping out.
- Performance report. Compare clicks to baseline. Drops of more than 10% in any language are red flags.

Check GTranslate dashboard:
- Translation request volume should be stable.
- No failed translation jobs.
- No spike in cache misses (indicates URL structure mismatch).

Watch the Search Console "Translated results" search appearance metric. If it drops significantly, GTranslate isn't being treated by Google the same way as before.

---

## If something breaks during or after migration

**Symptom. English pages 404 on the new site.**
Roll back DNS or origin pointer to WordPress. Investigate the URL mapping. Re-deploy when fixed.

**Symptom. Translated URLs 404 or return broken pages.**
This is a GTranslate problem. Check that the English version exists at the canonical URL. GTranslate proxies the English version then translates. If English is broken, the translation breaks.

**Symptom. Rankings drop in Search Console.**
Don't panic in the first 7-14 days. Some volatility is normal during a migration. If drops continue past 14 days, investigate specific URL mappings. The priority-urls.md list is your guide to what matters most.

**Symptom. Mobile audit findings keep growing.**
Stop and ship. Don't perfect mobile before launch. Get critical issues only. The site already works on mobile via WordPress; the new site doesn't need to be better, just not worse.

---

## What you're not doing

- Not switching translation vendors.
- Not improving translation quality (GTranslate stays as-is).
- Not adding new pages or content.
- Not rebranding.
- Not redesigning beyond what's already in the Next.js codebase.

This is a migration. Same content. Same URLs. Same SEO footprint. Better technical foundation.

---

## Files reference

| File | Purpose | Used in step |
|------|---------|--------------|
| `_docs/references/wordpress-urls.md` | Canonical URL list to preserve | 4, 5, 7, 10, 11 |
| `_docs/references/priority-urls.md` | Top 143 URLs by traffic | 9, 10, 12 |
| `_docs/references/search-console-findings.md` | Strategic context | Reference only |
| `_docs/references/search-console-export.xlsx` | Raw data | 9, 10 |
| `_docs/audits/_prompts/audit-1-mobile.md` | Mobile audit prompt | 6 |
| `_docs/audits/_prompts/audit-2-seo.md` | SEO audit prompt | 4 |
| `_docs/audits/_prompts/phase-3-gtranslate.md` | GTranslate setup prompt | 10 |
