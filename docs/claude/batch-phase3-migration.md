# Batch review: Phase 3, S/4HANA migration cluster (13 October 2026)

## What changed

- Hub: `/ecc-to-s4hana-migration/` (English) gains a section "The S/4HANA migration guide, topic by topic" linking all eight articles and the cost calculator and data migration estimator. The cost section now also links the migration cost guide. No URL, slug or canonical change.
- Eight new English articles, category `erp-strategy`, heroes in `public/images/migration/`:

| Slug | Primary keyword | Search Console demand (12 months, current position) |
|---|---|---|
| `/s4hana-migration-timeline-project-plan/` | s/4hana migration timeline | 2,924 impressions, position 46 |
| `/s4hana-migration-cost/` | s/4hana migration cost | about 3,200, position 50 |
| `/rise-with-sap-public-vs-private-cloud/` | rise with sap public cloud | 1,332, position 64 |
| `/rise-with-sap-contract-pricing/` | rise with sap pricing | 496, position 35 |
| `/choose-s4hana-migration-partner/` | sap ecc to s/4hana migration partner | 2,232, position 54 |
| `/s4hana-migration-cockpit-step-by-step/` | sap s/4hana migration cockpit | about 1,000 a month (Ubersuggest), no page before |
| `/sap-readiness-check-migration-assessment/` | s/4hana migration assessment | 2,132, position 58 |
| `/sap-programme-recovery/` | sap project recovery | 563, position 37 |

- Every article links up to the hub once, across to two or three siblings, and to related existing posts or tools.
- `page-sections.json` (group Enterprise Applications), `image-dimensions.json` and the chat index updated. All tags already existed.
- English only. No locale manifest change (translations follow after Noel approves the English).

## Checks

- 1,930 to 2,320 words each, 5 to 7 H2s, 1 or 2 tables, 6 FAQ items (FAQPage schema emitted), 3 to 6 official SAP sources each.
- No em or en dashes, no banned words, no paragraph over three sentences.
- Tests 330/330, typecheck clean, build OK. Local production preview: all nine pages 200, self-canonical, indexable, hero renders.

## Noel's answers (13 October 2026) used

Custom code overruns most and is the most forgotten cost; 3 mock conversions on a brownfield; cutover from a weekend to a week; brownfield vs greenfield cost "depends"; public cloud for standard processes that need no very specific configuration; an entertainment company that chose public cloud and regretted it (no name); RISE traps: renewal terms, FUE sizing, AI credits; always negotiate the modules and phase-wise pricing; partner questions: references and high-level design; walk away on generic information; big SI or boutique depends on references; Noel leads teams that use the Migration Cockpit and prefers staging tables; the Readiness Check misses custom objects; assessment length depends; week one of a rescue: status, design, what is deployed; aviation 2018: modules deployed, nothing configured to business requirements (nothing added beyond that).

## Images

Bright GPT Image 2.5 scenes, no people in five. Three carry a different real photo of Noel, background removed with Higgsfield and composited: cost (navy blazer headshot), partner (blue shirt), recovery (speaking with a microphone). None of the four photos used in the Data & analytics series is reused. No generated likeness.

## For Noel to check

Sentences written as Noel's view that follow from his answers but are not his words (the drafting notes list them per article). The main ones:

1. Recovery: "In 2018 I worked on the recovery of an aviation programme." and "Week one is for finding out what is true. Not for fixing, not for blaming and not for writing a new plan."
2. Timeline: "A date set at kickoff is a guess with a board presentation attached."
3. Public vs private: "a private edition system that never upgrades is an ECC system with a cloud invoice."
4. Contract: pullQuote "Most RISE overspend is decided in the first order form, not at renewal."
5. Partner: "A partner's commercial incentive is to start, and to add work when it finds it."
6. Cost: "My honest answer is that it depends, and I do not give a percentage."

Fact notes: SAP's naming is in transition (SAP Cloud ERP, SAP Cloud ERP Private; help.sap.com still says S/4HANA Cloud Private Edition), so the articles use the name their sources use. The Private Edition conversion guide says the standard contract includes two dry runs; the cost article tells readers to agree who pays for Noel's third. `lastReviewed` is not set.
