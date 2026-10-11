# Batch review: Data and AI section (11 October 2026)

## What changed

- New category `/category/data-and-ai/` ("Data and AI"). The root alias `/data-and-ai/` renders the same archive with its canonical on `/category/data-and-ai/`, like the other categories. Footer link added under Articles; label translated in all 16 locale dictionaries.
- Ten new English articles (no translations yet, so no hreflang and no localized archive):

| Slug | Primary keyword |
|---|---|
| `/what-is-databricks-used-for/` | what is databricks used for |
| `/databricks-vs-microsoft-fabric/` | databricks vs microsoft fabric |
| `/databricks-pricing-explained/` | databricks pricing |
| `/databricks-unity-catalog-data-governance/` | unity catalog databricks |
| `/databricks-genie-agent-bricks/` | databricks genie |
| `/snowflake-vs-databricks/` | snowflake vs databricks |
| `/snowflake-pricing-credits-explained/` | snowflake pricing |
| `/erp-data-into-snowflake/` | sap data to snowflake (SAP, Oracle, Dynamics 365) |
| `/snowflake-cortex-ai-snowflake-intelligence/` | snowflake cortex ai |
| `/snowflake-architecture-explained/` | snowflake architecture |

- New tag archives created by the articles' tags: databricks, snowflake, microsoft-fabric, data-governance, data-platform-cost, enterprise-ai, erp-data, defence (manufacturing already existed). Display names added in `tagMeta.ts`.
- `seo.ts`: the data-and-ai category gets no default SAP schema mentions; each article names its own platforms.
- Chat index regenerated.

No existing URL, slug, canonical, hreflang or redirect changed.

## Checks

- Each article: 2,000 to 2,300 words, 6 or 7 sections, 1 or 2 tables, a 5 or 6 question FAQ (FAQPage schema emitted), 3 to 6 links to official vendor sources.
- No em dashes, no VOICE.md banned words, title 60 characters or fewer, meta description 140 to 160.
- Build OK (2,380 pages). Tests 330/330. Typecheck and lint clean.
- Local preview: all 10 articles and the archive return 200, self-canonical; diagrams render; tables scroll on mobile with no page overflow.

## Sourcing and experience

- Product facts, statuses and list prices were checked against official Databricks, Snowflake, Microsoft and SAP sources in October 2026. Facts that could not be verified were cut.
- Renames reflected: Databricks One is now Genie One, Genie spaces are Genie Agents, AI Gateway is Unity Gateway, Delta Sharing is OpenSharing, Snowflake Intelligence is Snowflake CoWork, Snowflake Document AI was retired (March 2026).
- First person is used at sector level only ("in the manufacturing and defence programmes I've worked on"), as Noel confirmed on 11 October 2026. No client names, figures or anecdotes. Two over-specific lines written by the drafting agents were softened.
- `lastReviewed` is not set. Noel has not reviewed the articles yet.
- No hero images (the cards show the typographic placeholder). blog-editor.md asks for an inline image on posts over 1,500 words; none added.

## Hero images

Bright, photorealistic scenes generated with Higgsfield (GPT Image 2.5, 16:9) under `public/images/data-ai/`. No people in six. The four decision guides (Fabric, Databricks pricing, Snowflake vs Databricks, Snowflake pricing) carry a different real photo of Noel each: existing site photos with the background removed (Higgsfield background remover), composited onto the scene. No generated likeness of Noel. Alt text on every hero; dimensions added to `src/data/image-dimensions.json`.

## Noel's answers (11 October 2026), worked into the articles

1. First manufacturing use case: costing raw materials and labour to arrive at a standard cost.
2. Defence design driver: keeping classified and unclassified apart.
3. "Use both" failure point: the right integration and knowing which platform owns the data.
4. Databricks for streaming and ML on sensor data.
5. Biggest Databricks waste: production jobs on the expensive compute.
6. Contract sizing: understand use cases first, plan for the next three years.
7. Defence audit logs: copied into their own security systems.
8. Catalogs organised by factory systems.
9. Natural-language pilots: users were not onboarded properly, so they were unprepared.
10. Semantic-layer work: about two months, see 9.
11. What decided the platform in manufacturing: sensor and machine data.
12. Both platforms side by side: mostly to test the outputs.
13. Three months on demand before sizing a Snowflake contract: yes, it shows the consumption model.
14. Snowflake government or GCC regions: no.
15. ERP extraction: middleware that can serve a bigger stack.
16. Finance trust check: trial balance.
17. Hard part of AI on Snowflake: agreeing metric definitions.
18. Maintenance and quality assistant as first pilot: yes.
19. Operations data landed in Snowflake: production planning.
20. Supplier data exchange: still mostly file transfers.