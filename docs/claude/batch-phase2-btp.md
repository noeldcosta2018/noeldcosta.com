# Batch review: phase 2 SAP BTP cockpit article (13 October 2026)

Scope: English only, one file: `content/posts/master-the-sap-btp-cockpit-simple-steps/en.mdx`. No URL, slug or `date` change. `updated` set to 2026-10-13. `lastReviewed`, `hero`, `heroAlt`, `category`, `tags` and the existing `explainer-org` diagram unchanged. `experienceSource` rewritten to list the register lines and Noel's confirmations. No build or git run (per instruction). Translations not touched.

Search goal: win back "sap btp cockpit" and "btp cockpit" (clicks fell from 480 to 101, impressions from 134,534 to 27,249; figures as given in the brief), and answer: sap btp cockpit login, btp cockpit url, global account vs subaccount, how to create subaccount in btp, btp entitlements, btp cockpit trial, cloud foundry vs kyma.

## Title, meta and H1

| Field | Old | New | Reason |
|---|---|---|---|
| title / H1 | Master the SAP BTP Cockpit: simple steps anyone can follow | SAP BTP Cockpit: login, subaccounts and entitlements guide | Exact head term first; names the three most searched tasks (58 chars) |
| metaTitle | SAP BTP Cockpit: Simple Steps for Admins and Developers | SAP BTP Cockpit: Login URL, Subaccounts and Setup Guide | "Login URL" matches the login and url queries (55 chars) |
| metaDescription | How to use the SAP BTP Cockpit: log in, set up subaccounts and entitlements, connect your identity provider, deploy apps, and keep costs under control. | How to use the SAP BTP Cockpit: login URL, trial, global account vs subaccount, entitlements, Cloud Foundry or Kyma, role collections, monitoring and cost. | Covers each target query in one readable line (155 chars) |

## What changed

1. Opening: the first two sentences say what the cockpit is and give the login URL. A three-sentence "Short answer" block follows with the setup order and the trial URL.
2. Login URL corrected: SAP Help now gives `https://cockpit.btp.cloud.sap` as the single entry point that redirects to the nearest regional cockpit. The regional gateways (emea, amer, apac, eu-access) stay as a numbered list. Added the China entry point, the `?idp=` parameter for corporate identity providers, and a note that feature set A and Neo accounts use another URL.
3. New "note on names" paragraph: SAP Business AI Platform (announced at Sapphire, May 2026) brings together BTP, Business Data Cloud and AI Foundation. The console is still documented as the SAP BTP cockpit. The ABAP environment is now documented as "SAP Business AI Platform, ABAP environment", and the runtime table and an FAQ say so.
4. New H2 "Global account vs subaccount": SAP's definitions, directories (optional, up to five levels between global account and subaccount), Cloud Foundry org and spaces, Kyma clusters and namespaces. The diagram stays here.
5. The how-to became ten numbered H3 steps: login, naming plan, create subaccount (SAP's documented fields as an 8-item numbered list), entitlements (Configure Entitlements > Add Service Plans > Save), runtime, service instances, trust and role collections, integration, monitoring, cost.
6. Runtime table rewritten with SAP's own descriptions; it now covers "cloud foundry vs kyma". Kyma free plan limit (once per global account, up to 30 days) added.
7. Cost step now separates Usage Analytics (subaccount, actual usage, 24-hour refresh) from Costs and Usage (global account, balance statement terms), and adds budgets, which do not stop usage.
8. New H2 "SAP BTP cockpit trial vs free tier" with a table. Trial lifecycle corrected: the 90 days run in intervals that extend automatically while you keep signing in; 30 days without a sign-in suspends the account. The old wording ("extension needed after 30") is out of date.
9. New H2 "Common BTP cockpit errors and fixes": six numbered items, each tied to a documented cause.
10. Closing H2 "Where the cockpit fits in an S/4HANA programme" uses the confirmed lines only: 21 SAP programmes led or rescued, clean core with BTP side-by-side extensions, design authority of business and IT. CTA to the contact page.
11. FAQ: 8 items, all phrased as searches: login URL, global account vs subaccount, create subaccount, entitlements, trial, Cloud Foundry vs Kyma, Business AI Platform name, identity provider. Dropped: "What is the cockpit used for" (answered in the first sentence), "four pillars", "structure subaccounts" and "on-premise connection" (covered in the body).
12. Removed "four pillars" paragraph and FAQ (not needed for a cockpit how-to and not rechecked today); "Mistakes I see most often" folded into errors and steps; `SAP HANA Cloud`, `SAP Build` and `SAP Datasphere` removed from `mentions` (not in the body); `SAP Business AI Platform`, `SAP Discovery Center`, `Kyma` and `Cloud Foundry` added.
13. Counts: about 2,650 words in the body (including FAQ and diagram attributes), 3 tables, 1 diagram, 8 H2s, 10 H3s, 8 FAQ items, no em or en dashes. Internal links (4): `/sap-cpi/`, `/sap-btp-cockpit-issues/`, `/sap-clean-core-strategy-what-it-means-for-your-business/`, `/contact-noel-erp-support/`. External links (6), all SAP.

Noel's published lines kept as in register-b: days working it out the first time; 50+ randomly named subaccounts (no "European manufacturing 2024, three weeks"); "saved my clients thousands in unused services"; projects delayed by months on a new environment; dashboards every morning with coffee; email for critical apps and a Slack webhook; 12 developers via a script ("On one engagement"); 80 percent setup time on one engagement; hours to minutes; executives noticed custom domains.

## Sources (all checked 13 October 2026)

1. SAP Help, Access the Cockpit: `cockpit.btp.cloud.sap` redirects to the closest regional cockpit; `idp` parameter; China URL `cockpit.cn40.platform.sapcloud.cn`. https://help.sap.com/docs/btp/sap-business-technology-platform/4e750660b72e4fd6b2485ffb0b3cbdca (linked; read via SAP-docs/btp-cloud-platform on GitHub, last updated 12 Oct 2026)
2. SAP Learning, Demonstrating / Utilizing SAP BTP Cockpit: regional gateways amer, apac, emea, eu-access; gateways do not restrict access to other regions; feature set A and Neo use another URL. learning.sap.com (search extracts; not linked)
3. SAP Help, Account Model: global account definition, subaccount, directories (5 directory levels, Manage Entitlements, Manage Authorizations), CF org 1:1, Kyma clusters 1:n, labels. https://help.sap.com/docs/btp/sap-business-technology-platform/8ed4a705efa0431b910056c0acdbf377 (linked)
4. SAP Help, Create a Subaccount: Account Explorer, Create > Subaccount, subdomain unique per region, Used for production, beta features cannot be disabled, labels. https://help.sap.com/docs/btp/sap-business-technology-platform/05280a123d3044ae97457a25b3013918 (linked)
5. SAP Help, Environments: enable from subaccount overview, Service Marketplace or btp CLI; multi-environment subaccounts. Kyma Environment, Cloud Foundry Environment, ABAP Environment pages (names and descriptions). Not linked.
6. SAP Help, Trial Accounts and Free Tier: 90 days, intervals, suspension after 30 days without sign-in, no production or team development, apps stop daily, Kyma free plan once per global account up to 30 days, Discovery Center Free Tier and Always Free tags, free tier community support only. https://help.sap.com/docs/btp/sap-business-technology-platform/046f127f2a614438b616ccfc575fdb16 (linked)
7. SAP Developers, Take a Tour of SAP BTP Trial: trial URL `cockpit.hanatrial.ondemand.com/trial/`, CF subaccount with `dev` space created automatically, CF, ABAP and Kyma on trial. https://developers.sap.com/tutorials/cp-trial-quick-onboarding.html (not linked)
8. SAP Developers, Get an Account on SAP BTP to Try Out Free Tier Service Plans: Pay-As-You-Go sign-up, free plans without time limits, paid plans incur costs. https://developers.sap.com/tutorials/btp-free-tier-account.html (not linked)
9. SAP Developers, Manage Entitlements Using the Cockpit: Configure Entitlements > Add Service Plans > Save. https://developers.sap.com/tutorials/btp-cockpit-entitlements.html (not linked)
10. SAP Developers, Create a Service Instance: Services > Service Marketplace, Create, plan warning, Instances and Subscriptions. https://developers.sap.com/tutorials/btp-cockpit-instances.html (linked)
11. SAP Help, Establishing Trust of Type OpenID Connect: Security > Trust Configuration > Establish Trust. Bringing Your Corporate Identity Provider for Platform Users: same email in two identity providers is two users. Add Members to Your Global Account: Global Account Administrator and Viewer role collections; SAP Note 2669325 workaround. Not linked.
12. SAP Help, View Subaccount Usage Analytics (24-hour refresh, actual not billed usage); Monitoring Usage and Consumption Costs in Your Global Account (Costs and Usage page); Managing Budgets (email alerts, budgets do not suspend usage). Not linked.
13. SAP Help, Access Joule in the Cockpit: diamond icon, bound to the user's own authorisations. Boosters and btp CLI pages for automation wording. Not linked.
14. SAP News, 13 May 2026: SAP Business AI Platform as "a unified architecture bringing together SAP Business Technology Platform, SAP Business Data Cloud, and AI Foundation". https://news.sap.com/2026/05/sap-sapphire-keynote-business-ai-platform-power-autonomous-enterprise/ (linked)
15. Kept from register-b (checked 7 Oct 2026): SAP Alert Notification service channels (email, Slack); Cloud Connector outbound tunnel; SAP Custom Domain service.

## Unverified, cut or for Noel

1. Error message wording "Your user does not belong to any global account" comes from the public preview of SAP KBA 2458489 ("Our records indicate that your user does not belong to any global account"); the full KBA is login-gated. The fix (add as a global account member) follows SAP Help, Add Members.
2. Not used: a community claim that BTP itself was formally "renamed"; SAP News describes a unification, so the article says "brings together". Partner competency rename date (30 June 2026) is third-party only.
3. Not used: Joule in the cockpit only working with the SAP default identity provider (true per SAP Help, but too much detail for this page).
4. Advice sentences that are not Noel's published words: the setup order in the short answer, the error list framing, "Have a design authority of business and IT approve any change to them", and the closing CTA line. No new numbers, clients or incidents were added. Noel may want to reword these.
5. The opening "Most of the pain came from doing the later steps before the early ones" rewords the published "doing step four before step one", because the step numbers changed.
6. Integration patterns table kept from the 7 October version; not re-verified line by line today.
7. 8 H2s (blog-editor suggests about 6); each H2 targets a separate query. Ten H3 steps carry the how-to.
8. blog-editor asks for an inline body image on posts over 1,500 words. The page has none and the brief said keep images; add one in a later batch if wanted.
9. Build, MDX render and browser checks not run (instruction: no build). Diagram tag is single-line; tables are GFM; details blocks follow existing markup.
