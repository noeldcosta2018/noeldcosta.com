# Batch review: phase 2 ECC to S/4HANA migration page (13 October 2026)

Scope: English only, one file: `content/posts/ecc-to-s4hana-migration/en.mdx`. No URL, slug or `date` change. `updated` set to 2026-10-13. `lastReviewed`, `hero`, `heroAlt` and the existing Pexels body image unchanged. `experienceSource` now records Noel's confirmations of 13 October 2026. No build or git run (per instruction). Translations not touched.

Search goal (last 90 days): "sap ecc" (457 impressions, position 37), "sap migration" (19.5), "migration sap s/4hana" (24), "ecc sap" (14), "ecc migration to s4 hana" (71), "data migration from ecc to s4 hana" (58 to 66), "sap ecc to s4hana migration step by step" (46), "ecc 6.0 to s/4hana", "brownfield conversion", "conversion guide for sap s/4hana".

## Title, meta and H1

| Field | Old | New | Reason |
|---|---|---|---|
| title / H1 | ECC to S/4HANA migration: paths, steps, and timelines | ECC to S/4HANA migration: paths, steps and SAP ECC deadlines | Keeps the phrase first; adds "SAP ECC" for the biggest query and "deadlines" for the 2027 intent; drops the Oxford comma (60 chars) |
| metaTitle | ECC to S/4HANA Migration: Paths, Steps and Timelines | unchanged | Already phrase-first and 52 chars; timelines are now Noel's confirmed numbers |
| metaDescription | ECC to S/4HANA migration explained: greenfield, brownfield or selective, the five steps that make up the work, realistic timelines and the 2027 deadline. | ECC to S/4HANA migration step by step: greenfield, brownfield or selective, realistic timelines, data migration, the tools I use and the SAP ECC 2027 deadline. | Adds "step by step", "data migration" and "SAP ECC" for the missed queries (159 chars) |

## What changed

1. Opening: the first two sentences define the migration and the decision. A three-sentence "Short answer" block follows with Noel's path rule, his three timelines and "run the SAP Readiness Check first". The custom reports story keeps its published wording (no "spent months").
2. New H2 "What is SAP ECC, and why move now": ECC as SAP ERP Central Component, core of SAP ERP 6.0 in SAP Business Suite 7; EHP 6 to 8 mainstream to 31 Dec 2027; EHP 5 and lower ended 2025 (restored with an SAP-authored source); S/4HANA maintained to 2040; what a start in October 2026 means for go-live.
3. Changes table: kept the verified rows and added material number length and credit management (SD to SAP Credit Management, FIN-FSCM). New paragraph on simplification items and the Simplification List. Batch jobs story now anchored as "A European manufacturing client I worked with in 2023" (confirmed).
4. Paths: Noel's rule stated as given; decision tree rewritten to his rule (the "Bluefield" label became "Selective data transition"); brownfield section names SUM and the Conversion Guide for SAP S/4HANA; the old six-row comparison table replaced by path / when to choose / typical timeline / main risk.
5. Step by step: five steps as a real sequence: readiness check (prerequisites as a numbered list), choose and plan (Noel's biggest mistake, with "21 SAP programmes I have led or rescued" and one advice sentence), custom code (ATC, Custom Code Migration app, smartShift 18,000 to 3,200, clean core 40%), data, test and cut over. Stepper updated.
6. New H2 "Data migration from ECC to S/4HANA": 30 to 40% of effort, how data moves per path (SUM, Migration Cockpit, specialist tools), hot/warm/cold list, the published five-months cleansing story, link to the data migration article.
7. Tools: replaced the six-row SAP-only table with Noel's five confirmed tools (SAP Readiness Check, Custom Code Migration app, smartShift, SNP, Natuvion), described neutrally. SAP Signavio and SAP LeanIX removed from the table and `mentions` (not in Noel's list). SUM and the Migration Cockpit mentioned in a sentence.
8. Deadlines: 2027 and 2030 (+2 points) restated; the 2033 option named exactly and its conditions given; an explicit paragraph that 2033 is not a general deadline. Timeline diagram notes updated to Noel's timelines.
9. New short cost H2 linking the cost guide, no new figures; closing links to the case study and the migration assessment tool.
10. Removed: "12 to 18 months or more", "18 to 24 months or more once real testing starts" and "24 to 36 months" (replaced by Noel's confirmed timelines); "about 15 months from now"; "most are surprised by how much inactive code shows up"; the Universal Journal and RISE/GROW FAQ overlap (Universal Journal FAQ dropped, covered in the table).
11. FAQ (8): what is SAP ECC, how long does it take, what happens after 2027, brownfield vs greenfield which is better, what is selective data transition, prerequisites for ECC 6.0 conversion, what the Readiness Check tells you, RISE or GROW.
12. Counts: about 2,580 prose words (2,920 tokens with markup), 3 tables, 3 diagrams (existing, single-line tags), 1 existing image, 9 H2s, 8 H3s, no em or en dashes, no paragraph over three sentences. Internal links (5): clean core, data migration, cost, case study, migration assessment. External links (3): SAP Community blog by SAP, two SAP News articles.

## Sources (checked 13 October 2026)

1. SAP News, "SAP S/4HANA maintenance 2040" (4 Feb 2020): Business Suite 7 core applications incl. SAP ERP 6.0 mainstream to end 2027, optional extended maintenance 2028 to end 2030 at two percentage points, S/4HANA to end 2040. https://news.sap.com/2020/02/sap-s4hana-maintenance-2040-clarity-choice-sap-business-suite-7/ (linked)
2. SAP News, Stefan Steinle (4 Aug 2025): "SAP ERP, private edition, transition option", 2031 to 2033, for systems moved to SAP ERP, private edition on SAP HANA before 31 Dec 2030, minimum 2 TB, max success plan only, SAP Note 3591251 mitigation. https://news.sap.com/2025/08/rise-with-sap-journey-sap-erp-private-edition-transition-option-updates/ (linked)
3. SAP Community blog, "Maintenance timelines for SAP ERP 6.0" (20 Sep 2022): EHP 6 to 8 mainstream to 31 Dec 2027; EHP 0 to 5 to 31 Dec 2025; refers to SAP Note 2881788. https://blogs.sap.com/2022/09/20/maintenance-timelines-for-sap-erp-6.0/ (linked; read via search extract)
4. Custom Code Migration app: SAP blogs (2019, 2020) and SAP webinar PDF (Nov 2023): SAP Fiori app showing S/4HANA ATC check results, unused code from usage data, available on S/4HANA 1809+ and SAP BTP ABAP environment 1908+. (not linked)
5. SAP Readiness Check for SAP S/4HANA: SAP blog and SAP PDFs: simplification items, add-on compatibility, custom code analysis (ATC S4HANA_READINESS), sizing. (not linked)
6. smartShift: vendor and partner material (ASUG decks, NTT DATA Deutsche Bahn case): automated ABAP analysis and transformation for S/4HANA. (not linked; vendor claims not used)
7. SNP: snpgroup.com and SAPinsider/ERP Today (Jan 2025): Kyano platform, Bluefield approach, founding member of SAP's Selective Data Transition Engagement community. (not linked)
8. Natuvion: natuvion.com and partner pages: Data Conversion software, Cutover App, founding member of the Selective Data Transition Engagement community. (not linked)
9. Carried from register-b (checked 7 Oct): conversion from ERP 6.0 any EHP, Unicode, dual-stack split, business partner, SUM with DMO, RISE = Private Edition, GROW = Public Edition.

## Unverified, corrected or for Noel

1. Brief correction: the 2033 option is not for customers moving to S/4HANA Cloud Private Edition. SAP's own wording is SAP ERP, private edition (ECC on SAP HANA, run by SAP under RISE). The article states SAP's conditions exactly and says 2033 is not a general deadline.
2. Material number (40 characters, optional) and credit management (FIN-FSCM) rows are standard simplification items but were checked from memory of SAP's Simplification List, not a dated fetch. Verify or drop.
3. "Conversion Guide for SAP S/4HANA" exists per release on help.sap.com; not fetched today. Not linked.
4. Tool names: "Kyano" for SNP comes from SNP and press sources; Natuvion's product naming varies ("Data Conversion Suite"/"Data Conversion Software"), so the table says "data conversion software". Noel may prefer just the company names.
5. Advice sentences that are mine, following confirmed points: "Decide in the first weeks who owns data cleansing...", "A tool does not replace the decisions...", "a clean data plan saves more money than any rate negotiation", "The smartShift analysis only paid off because someone agreed to retire the unused objects" (this implies a detail of the smartShift story; Noel should confirm or cut).
6. The published greenfield regret line and "hundreds of custom objects" and "five months on data cleansing" stories are kept from the published article but were not reconfirmed on 13 October.
7. The selective example "finance works well but procurement needs a redesign" is illustrative, not a client.
8. "Go-live lands between late 2027 and spring 2028" is arithmetic from Noel's timelines, not a forecast.
9. 9 H2s (blog-editor suggests about 6); each serves a separate query. No second inline image (brief said leave images). Build, MDX render and browser checks not run.
