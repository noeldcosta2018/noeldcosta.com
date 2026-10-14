# Batch review: SAP testing cluster (14 October 2026)

Search Console (12 months): about 19,000 impressions for testing searches at an average position of about 50; 70% on the tools comparison page. Ubersuggest: "sap testing" about 2,400 searches a month, no page targeting it.

## Pages

| Page | Status | Target search |
|---|---|---|
| /sap-testing-explained/ | new hub | sap testing, what is sap testing, sap testing types |
| /sap-testing-validation-tools-comparison/ | refreshed | sap testing tools, sap test automation tools |
| /sap-performance-testing-it-leaders/ | refreshed | sap performance testing, sap hana performance testing |
| /sap-test-automation-guide/ | new | sap test automation |
| /sap-regression-testing/ | new | sap regression testing |
| /s4hana-testing-strategy/ | new | s/4hana testing strategy |
| /sap-user-acceptance-testing/ | new | sap user acceptance testing, sap uat |
| /sap-test-data-management/ | new | sap test data management |

All in category erp-consulting-guide, tag sap-testing. Heroes in public/images/testing/ (Noel's real photo on the hub, automation and UAT pages, reused from earlier series with his permission). English only; translations of the six new pages and re-translation of the two refreshed pages follow Noel's approval.

Refresh log:
- Tools comparison: title "Choosing the right toolset for SAP testing and validation" to "SAP testing tools compared: what each one is for"; metaTitle "SAP Testing Tools 2026: Tricentis, Xray, Cloud ALM" to "SAP Testing Tools Compared: 7 Test Automation Tools". Removed three published case studies (Tosca at a manufacturer, Xray at a retailer, Solution Manager at a financial services firm) because they credited results to single vendors; Xray removed (not on Noel's list), heroAlt updated. Tricentis licence with Cloud ALM corrected to 31 December 2028 (SAP usage rights page).
- Performance testing: title "SAP performance testing: what IT leaders must know" to "SAP performance testing: load, concurrency and tools". Tag sap-technical-decisions swapped for sap-testing. Unverified claims removed (SAP load-tests public edition; AI test generation; JMeter limitation).

## Noel's answers (14 October 2026)
Tools used: Tricentis Tosca, Worksoft, Panaya, SAP Cloud ALM, Solution Manager, UiPath, LoadRunner. Phases: SIT rounds, UAT rounds, regression (no cycle count given). Most common failure: not enough testing in UAT and SIT. Business owns UAT; at least 6 to 8 weeks. Automate when there is a large number of test cases needing extensive testing. Regression: two landscapes, project and BAU. Test data: masked but production level. Performance testing before go-live; concurrency tests matter. Testing about 35% of effort. Go-live: an extensive cutover checklist agreed in advance.

## Checks
2,000 to 2,330 words each, no paragraph over three sentences, no dashes, all internal links resolve, 5 to 6 FAQs each. Tests 330/330, build OK (2,698 pages), all eight render locally.

## For Noel
Sentences in his voice that go beyond the confirmed answers: UAT "That is my position, and it should not move when the schedule gets tight."; strategy "Write the names into the strategy, not the roles."; performance "The tests I treat as the important ones are the concurrency tests"; tools (kept from the published page) "I have sat through dozens of tool demos where everything works perfectly...". Decide whether the three removed tool case studies come back.
