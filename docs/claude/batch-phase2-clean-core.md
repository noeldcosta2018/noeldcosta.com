# Batch review: phase 2 SAP clean core page (13 October 2026)

Scope: English only, one file: `content/posts/sap-clean-core-strategy-what-it-means-for-your-business/en.mdx`. No URL, slug or `date` change. `updated` set to 2026-10-13. `lastReviewed`, `hero`, `heroAlt` and the existing explainer diagram unchanged. `experienceSource` now records Noel's confirmations of 13 October 2026. No build or git run (per instruction). Translations not touched. They rank 2 to 10, so the page keeps plain H2/H3 structure, two GFM tables and short paragraphs that translate cleanly.

Search goal: "clean core" (English position 61) and "sap clean core" (57), plus the missed queries at positions 47 to 64: clean core erp, clean core change management, clean core compliance sap, clean core extensibility for sap s/4hana cloud, abap clean core, sap clean core governance, clean core implementation, clean core dashboard.

## Title, meta and H1

| Field | Old | New | Reason |
|---|---|---|---|
| title / H1 | SAP clean core strategy: what it means and how to apply it | SAP clean core: what it means, levels A to D and governance | "SAP clean core" as the opening words; names the two things the page now owns (levels, governance) (59 chars) |
| metaTitle | SAP Clean Core: 5 Principles, Levels A to D, Where to Start | SAP Clean Core: Principles, Levels A to D and Governance | Keeps the exact phrase first and adds the governance intent (56 chars) |
| metaDescription | What SAP clean core means for S/4HANA: SAP's five principles, the A to D extension levels, ECC maintenance dates and where I would start an assessment. | SAP clean core explained: the five principles, levels A to D, ABAP Cloud and BTP extensions, governance, change management and how to measure compliance. | Covers the missed queries (extensibility, governance, change management, compliance) in one readable line (153 chars) |

## What changed

1. Opening: the first two sentences define SAP clean core. A three-sentence "Short answer" block follows for snippets and AI answers. The six-weeks-or-six-months framing became "weeks instead of months".
2. Noel's confirmed answers placed as given: 40% upgrade timelines with his explanation (minimal customisation, governed well); European consumer goods 2024 pricing app on BTP that "eliminated regression testing for that logic entirely"; smartShift 18,000 to 3,200; European industrial sales workshop 2023 (80%); GCC retail 2024, over 15,000 custom fields; data migration 30 to 40% of implementation "effort"; design authority of business and IT; "trying to make SAP work like Oracle" plus one advice sentence; AI answer now opens "Yes" with his view on Joule. Finance lead and manufacturer stories kept word for word.
3. "What clean core means in practice" became "What clean core means for your ERP" (clean core erp).
4. Levels A to D: the levels table was replaced by two short paragraphs, because the existing explainer-compare diagram already shows the same comparison. This frees a table for the edition comparison. A sentence explains that the A to D levels superseded the older "tier" material.
5. New H2 "ABAP Cloud and BTP extensibility for S/4HANA Cloud": ABAP Cloud definition, the three extension routes (key user, developer with ABAP Cloud, side-by-side on BTP), and a Public vs Private Edition table.
6. New H2 "Clean core governance: who owns the decisions": design authority in five numbered steps (advice), the level-A question, and the Oracle mistake.
7. New H2 "Clean core and change management": framing plus the existing skills / manufacturer BTP paragraph (moved here from after the steps).
8. New H2 "Clean core compliance: how to measure it": ABAP test cockpit, SAP Readiness Check, and the RISE with SAP Methodology dashboard (also known as the clean core dashboard) in SAP Cloud ALM.
9. "Where I would start" kept as 7 steps; step 7 now points to the governance section.
10. RISE and AI section: the three questions are now H3s so each paragraph stays at three sentences or fewer.
11. FAQ: 8 items: what is clean core in SAP, five principles, levels A to D, is clean core mandatory for RISE, what is ABAP Cloud, how do you measure clean core, who should own SAP clean core governance, when does ECC support end. "Role of SAP BTP" and "how do I assess readiness" FAQs dropped (answered in the body).
12. keyTakeaways updated (edition difference, governance and measurement added); "SAP Cloud ALM" added to `mentions`.
13. Counts: about 2,640 words including FAQ, 2 tables, 1 diagram, 10 H2s, 3 H3s, no em or en dashes. Internal links (5): `/sap-vs-oracle-which-erp-is-better-for-your-business/`, `/sap-implementation-cost-and-budget-breakdown/`, `/ecc-to-s4hana-migration/`, `/erp-modernization-2025-cloud-ai-clean-core/`, `/contact-noel-erp-support/`. External links (5), all SAP.
14. Removed: links to `/why-sap-data-migration-fails-and-how-to-fix-it/` and `/sap-s4hana-migration-strategy-greenfield-vs-brownfield/` (to stay within 3 to 5 internal links); "Earlier enhancement packages left mainstream maintenance at the end of 2025" and "order extended maintenance by Q3 2027" (their only source, an SAP Community page, could not be fetched); "before their S/4HANA programme started" from the 40% sentence (Noel's explanation replaces it).

## Sources (checked 13 October 2026 unless noted)

1. SAP News, "How to extend SAP S/4HANA Cloud the right way" (12 August 2025; Hois, Panda, Pietsch): level concept A to D evolving the three-tier model, ABAP Cloud, BTP-first, ABAP test cockpit, RISE with SAP Methodology dashboard for clean core adoption, Joule for developers generating clean code. https://news.sap.com/2025/08/extend-sap-s4hana-cloud-right-way-clean-clear/ (linked)
2. SAP Community (SAP-authored topic page), ABAP Cloud FAQ: definition, "ABAP for Cloud Development" language version, Public Edition mandatory since 2208 for new customers, Private Edition and on-premise recommended since 2022, ATC clean core checks should be regularly scheduled. https://pages.community.sap.com/topics/abap/abap-cloud-faq (linked)
3. SAP Support, "Why SAP Cloud ALM supports the adoption of clean core": RISE with SAP dashboard system view and operations view. https://support.sap.com/en/alm/sap-cloud-alm/sap-cloud-alm-clean-core-adoption.html (linked)
4. SAP Learning, "Exploring the RISE with SAP Methodology Dashboard" (course: Harnessing SAP Cloud ALM for Effective Transformation Execution with RISE): "also known as the Clean Core Dashboard", accessed through SAP Cloud ALM. https://learning.sap.com/courses/harnessing-sap-cloud-alm-for-effective-transformation-execution-with-rise/exploring-the-rise-with-sap-methodology-dashboard_f77a2c16-cdb1-4532-ad80-c090cbd600a9 (not linked)
5. SAP Learning, extensibility model and edition table (Public Edition ABAP Cloud only; Private Edition and on-premise ABAP Cloud recommended, classic ABAP permitted; key user, developer and side-by-side extensibility). learning.sap.com, "Exploring the SAP S/4HANA Cloud Extensibility Model" and "Describing Application Development" (read via search result extracts; not linked)
6. SAP News, ECC mainstream maintenance to 31 Dec 2027, extended to 31 Dec 2030. https://news.sap.com/2020/02/sap-s4hana-maintenance-2040-clarity-choice-sap-business-suite-7/ (linked; checked 7 and 13 Oct)
7. SAP News, SAP ERP, private edition, transition option 2031 to 2033. https://news.sap.com/2025/08/rise-with-sap-journey-sap-erp-private-edition-transition-option-updates/ (linked; checked 7 Oct, kept from register-b)
8. Five guiding principles: sap.com RISE methodology clean core page returned 403 today; principle names reconfirmed via the SAP Support page above and register-b (7 Oct).

## Unverified, cut or for Noel

1. Not used because only third-party or login-gated sources were found: the named dashboard KPIs "Clean Core Share" and "Technical Debt Score" (SAP KB 3760982 preview and secondary summaries), the claim that Tier 2 is formally "retired", and dashboard availability outside RISE. The article says the clean core dashboard is for RISE customers, which matches SAP's naming.
2. Advice sentences that follow from Noel's confirmed points but are not his words: the five design-authority steps and its membership; "IT alone will approve anything that is technically possible. The business alone will ask for its old process back."; "treat it as if it were Public Edition for anything new"; the change management framing paragraph; the monthly numbers for the design authority. No numbers, clients or incidents added. Noel may want to reword any of these.
3. "The payoff is upgrades that take weeks instead of months" restates the published six-weeks / six-months line in general terms.
4. The page has 10 H2s (blog-editor suggests about 6). Each targets a separate missed query; merge governance, change management and compliance under one H2 with H3s if Noel prefers.
5. blog-editor asks for an inline body image on posts over 1,500 words. The page has none and the brief said not to change images; add one in a later batch if wanted.
6. The levels table was removed in favour of the existing diagram plus prose. The diagram's text is rendered by a component, so check that search engines see it in server-rendered HTML; restore the table if not.
7. Build, MDX render and browser checks not run (instruction: no build). Diagram tag is single-line; tables are GFM; details blocks follow existing markup.
