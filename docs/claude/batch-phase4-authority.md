# Batch review: Phase 4, authority (14 October 2026)

## noeldcosta.com

1. `/system-implementation-sap/` rewritten in English and all 16 translations (Noel: "this page is not professional").
   - Old title "System Implementation of SAP and How I Help", new "SAP implementation support: how I help".
   - Old H1 "System Implementation of SAP: Why Most Projects Fail and How to Fix Yours", new "System implementation of SAP: independent help when it matters". New metaTitle "System Implementation of SAP: Independent Support".
   - Removed: emoji problem/solution blocks, Title Case headings, the unsourced "grow their business by over 40% and cut costs by 50%" claim, the empty "I've been featured on" logo strip, "COMING SOON!", a stock image and the broken run-together testimonial markup.
   - Added: three situations, six services linked to the relevant guides, how an engagement starts, four tools, "Where my writing has appeared" with links to the SAP Press blog, Techronicler and InfoSites pieces Noel supplied, the structured testimonials grid (quotes verbatim from `testimonials/data.ts`) and a contact call to action.
   - Translations keep each locale's established ranking phrase (for example "Implementazione del sistema SAP"). URL, slug, date and canonical unchanged.
2. Person schema (`src/lib/seo.ts`): author URL now `/about/` (was a redirecting `/about`); `sameAs` adds erpcv.com, ai.sapopedia.com, clarity.fm/noeldcosta and connectively.us/p/noel-dcosta (supplied by Noel). Same URL fix in `ToolShell.tsx`.
3. Three case studies with no inbound article links now linked: finance modernisation (from the CFO/Excel article), the Middle East defence customer information study (from the CRM and Salesforce integration articles), and the European public sector SAP CX study (from the CRM and public sector compliance articles). English only.
4. `docs/claude/linkedin-posts-migration.md`: nine LinkedIn drafts for Noel to post himself, two a week from 20 October.

Checks: tests 330/330, build OK (2,532 pages), page renders in English, Italian, Arabic and Japanese with the testimonials grid.

## ERPCV (separate repo, `C:\Projects\ERPCV Update`, not committed)

Six contextual links to noeldcosta.com guides: About page (migration guide, cost guide), FICO, MM and SD interview question pages (migration guide, Readiness Check, Migration Cockpit), FICO CV guide (RISE public vs private). Typecheck and 538 tests pass. Not yet checked in a browser.

## Deferred

- YouTube embeds: the site has no video embed component. A privacy-friendly click-to-load embed is a separate feature batch.
- Original data piece (survey): Noel said not now.
