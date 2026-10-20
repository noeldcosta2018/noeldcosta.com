# Batch: SAP implementation hub and inline images (20 October 2026)

## 1. Inline images for 66 more long articles (commit 4a3418fb)

- Every English post over 2,000 words now has one inline image (the 20 highest-impression posts were done on 15 October).
- Files: `public/images/inline/<slug>.webp`, 1600 x 900, registered in `src/data/image-dimensions.json`.
- Placement: before the H2 nearest 35 percent through the article. When that spot directly follows a diagram or component, the image moves to the next H2 so two visuals never stack (this also moved two images from the first batch).
- Skipped: `oracle-erp-vs-sap` and `sap-vs-oracle-which-erp-is-better-for-your-business`, which already have a body image at that point.
- Generated with Higgsfield `gpt_image_2_5`: bright editorial desk and office scenes, papaya orange accents, no people, no logos. English only, like the first batch.

## 2. /sap-implementation/ becomes the cluster hub

Decision: the existing `/sap-implementation/` page (already ranking, already a protected URL) is the hub. No new page, so nothing competes with it.

- New section "SAP implementation, topic by topic" before "The SAP Success Formula": 35 links in seven numbered groups (start and plan, cost, partners, team and governance, scope, testing, people and go-live). Translated into all 16 locale files.
- Up-links: before 2026-10-20 no article linked to the hub. All 34 linked articles now carry one sentence before their FAQ linking to `/sap-implementation/`, in all 17 languages (578 files). The site localises the plain path at render time.
- Legacy link repair on the page (all locale files, by link position): 25 WordPress-era links whose anchor text did not match the target (eight pointed at the BTP cockpit article, five at the testing tools comparison, four at the JD generator as plain text, and others) were removed or pointed at the right article. The four "Talk to Noel" buttons used a broken `mailto:%20solutions@` link; they now go to the contact page booking flow and say 30 minutes, matching the Cal.com event.
- Tool card links (calculator, JD generator, estimators) are unchanged.

## Checks
- Build clean (2,967 pages), 330 tests pass, typecheck clean.
- Preview: hub section renders with its seven H3 groups and appears in the page contents; German article shows the localised hub link `/de/sap-implementation/`.

## 3. Rebuild of /sap-implementation/ (21 October 2026, approved by Noel)

Noel found the live page confusing. The WordPress export had untitled numbered card images in every phase, run-on arrow link rows, two duplicate success sections, a 13-question FAQ without a heading and four identical call buttons, and the 35-link hub list made it longer.

- Rebuilt from Noel's existing text only, about 1,900 words (was about 4,800). URL, title, H1, hero and meta description unchanged.
- Order: intro and one call button; where an implementation begins; the six phases (stepper plus one short section per phase, each ending with a "Go deeper" line of two or three links); topic-by-topic table (7 rows, all cluster links kept); what makes implementations succeed (merged with the benefits); common challenges (with the Oracle and Microsoft advice); how I can help with the six free tools; six-question FAQ in details blocks (FAQPage schema emitted).
- Industry image tiles replaced by links to /for-manufacturing/, /for-retail/ and /sap-for-aviation/.
- All 16 locale bodies rebuilt from the new English, frontmatter kept. Structure checked against English (headings, stepper, table, FAQ, link order). French non-breaking spaces restored by script.
- Build clean; tests pass (the sitemap contract test timed out under load and passes on its own).
