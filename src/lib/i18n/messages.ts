// Central messages source for the public site UI. Block 6c (Phase 4)
// externalised ~680 hardcoded English strings from components into the
// typed structure below; the translation pipeline in
// scripts/translate-ui-strings.mjs populates each non-English locale.
//
// ── Architecture ──────────────────────────────────────────────────────
//
// 1. `Messages` is a typed nested object with namespaces per UI surface
//    (nav, footer, hero, category, calculator, …). TypeScript enforces
//    every locale carries every key — no silent fallback to undefined.
//
// 2. `MESSAGES: Record<Locale, Messages>` is the single export.
//    English values are the canonical source. Non-English locales are
//    populated by scripts/translate-ui-strings.mjs and replace these
//    placeholders byte-for-byte. During development (before the script
//    runs), every non-English locale clones English so the site still
//    builds.
//
// 3. Consumers use `getMessages(locale)` (server) or
//    `useTranslation(locale)` (client) from ./useTranslation.ts. Both
//    return either the typed messages object (preferred — full IDE
//    autocomplete) or a `t(path)` helper for dot-notation lookup.
//
// ── What does NOT live in MESSAGES ────────────────────────────────────
//
// MESSAGES holds UI chrome and section copy only. The following content
// is intentionally OUT OF SCOPE — it must NEVER be machine-translated
// and so must NOT be added here. See
// _docs/audits/i18n-strings-audit-2026-05-26.md "Do-not-translate
// policy" for the full rationale.
//
// - Testimonial bodies (real attributed quotes). They stay inline in
//   `src/components/Testimonials.tsx` and
//   `src/components/article/testimonials/data.ts`.
// - Proper-noun client and product names (EDGE Group, Etihad, ADNOC,
//   Command Central, ERPCV, etc.). They stay in their inline data.
// - Personal name "Noel D'Costa". Stays as inline literal.
// - URLs, email addresses, phone numbers.
// - Copyright line "© 2026 Noel D'Costa · Quantinoid LLC" (legal text).
// - Code snippets, inline `<code>` content, terminal output.
//
// If a UI surface mixes do-not-translate content with translatable
// chrome (e.g. "Trusted by EDGE Group, Etihad, and ADNOC"), wrap the
// proper nouns inline with `<noTranslate>…</noTranslate>` markers in
// the MESSAGES value. The translation pipeline preserves the marker
// content verbatim. See scripts/test-no-translate.mjs for the smoke
// test of that mechanism.
//
// ── Category / Tools / Beliefs / Book questions ───────────────────────
//
// Some content is already in a typed canonical source (Block 6b):
//
//   src/lib/categories.ts — CATEGORIES record (label, navBlurb, tagline, description)
//   src/lib/tools.ts — TOOLS array (label, blurb)
//   src/components/article/beliefs/data.ts — BELIEFS array
//   src/components/books/accordion-questions.ts — BOOK_ACCORDION_QUESTIONS
//
// Block 6c translates THOSE files separately rather than duplicating
// their content into MESSAGES. The translation script reads them, emits
// per-locale variants, and consumers continue to import them as today
// (with a locale-aware getter). Keeps the single-source-of-truth pattern
// from Block 6b intact.

import type { Locale } from "@/lib/locales";

// ── Messages schema ────────────────────────────────────────────────────
//
// The shape of this type drives the entire pipeline:
//   - TypeScript enforces every locale carries every key.
//   - The translation script walks `MESSAGES.en` recursively, sends each
//     leaf string to GPT-5.4, and writes the result back at the matching
//     path on every target locale.
//   - Components import the typed messages object and use direct field
//     access (`m.nav.solutions`) — full IDE autocomplete, no string
//     keys to typo.
//
// Pass 2 (Block 6c) will populate the body of every namespace. Pass 1
// (this file) defines the namespace structure with exemplar keys per
// surface so the user can review the design before extraction begins.
//
// Namespace conventions:
//   - Top-level groups by UI surface or shared concern.
//   - Camel-case keys, no abbreviations beyond well-known ones (cta, faq).
//   - Avoid deep nesting beyond 3 levels — readability beats taxonomy.
//   - When a string appears in multiple components, define it once under
//     a shared namespace (common.*, card.*) and reference from all sites.
export interface Messages {
  // Global chrome — present on every page.
  nav: {
    solutionsDropdown: string;     // "Solutions" — desktop trigger + mobile heading
    toolsDropdown: string;         // "Tools" — desktop trigger + mobile heading
    caseStudies: string;           // "Case Studies" — top-level link
    books: string;                 // "Books" — top-level link
    about: string;                 // "About" — top-level link
    contact: string;               // "Contact" — primary CTA
    company: string;               // "Company" — mobile drawer heading
    brandHomeAria: string;         // "noeldcosta — home" — link aria-label
    closeMenu: string;             // "Close menu" — hamburger aria-label
    openMenu: string;              // "Open menu" — hamburger aria-label
  };
  footer: {
    tagline: string;               // "ERP, Data & AI consulting. 25+ years …"
    solutionsHeading: string;      // "Solutions"
    freeToolsHeading: string;      // "Free Tools"
    companyHeading: string;        // "Company"
    privacyLink: string;           // "Privacy"
    supportLink: string;           // "Support"
    youtubeLink: string;           // "YouTube"
    // Copyright + brand wordmark intentionally NOT translated — see
    // do-not-translate policy at the top of this file.
  };
  languageSwitcher: {
    selectLanguage: string;        // "Select language" — button + listbox aria-label
  };
  stickyCta: {
    bookConsultation: string;      // "Book consultation"
  };

  // Homepage section components.
  hero: {
    headline: string;              // "I run ERP transformations"
    emphasis: string;              // "the board can defend."
    eyebrow: string;               // "ERP · AI · 25 years"
    statDeliveredLabel: string;    // "delivered"
    statEntitiesLabel: string;     // "entities migrated"
    statYearsLabel: string;        // "in ERP & AI"
    statContinentsLabel: string;   // "continents"
    subheadlineLead: string;       // "ECC to S/4HANA. AI on SAP. 25 years delivering …"
    subheadlineIndustries: string; // "defence, aviation, energy, …"
    subheadlineImpact: string;     // "$700M+ in total impact"
    subheadlineTail: string;       // "CIMA-qualified. I lead the engagement. I don't subcontract."
    primaryCta: string;            // "Book a 30-min call"
    secondaryCta: string;          // "See case studies"
    // Credibility line — rendered as:
    //   CIMA · AICPA · {credMasters} · {credYearsAndClients}
    // with papaya-coloured "·" separators between segments. CIMA + AICPA
    // stay inline as do-not-translate proper-noun credentials.
    credMasters: string;           // "Masters in Accounting"
    credYearsAndClients: string;   // "25+ years across EDGE Group, Etihad, ADNOC, PIF entities, DXC, and the UAE Government" — client names protected by glossary in the translation pipeline.
    linkedinAria: string;          // "Noel D'Costa on LinkedIn"
    headshotAlt: string;           // "Noel D'Costa" — image alt text (proper noun — DO NOT translate)
  };
  logoScroll: {
    eyebrow: string;               // "Delivered for companies including"
    // Client names live in src/components/LogoScroll.tsx as inline data —
    // do-not-translate.
  };
  problemStats: {
    eyebrow: string;               // "[ The problem ]"
    h2Lead: string;                // "Most ERP projects fail."
    h2Emphasis: string;            // "Yours doesn't have to."
    intro: string;                 // "You already know this. The numbers just confirm it."
    stat1Body: string;
    stat1Source: string;           // "Panorama Consulting, 2024" — citation, DO NOT translate
    stat2Body: string;
    stat2Source: string;
    stat3Body: string;
    stat3Source: string;
  };
  services: {
    eyebrow: string;               // "[ 01 · Who I help ]"
    h2Lead: string;
    h2Emphasis: string;
    intro: string;
    card1: ServiceCard;
    card2: ServiceCard;
  };
  trackRecord: {
    eyebrow: string;
    h2Lead: string;
    h2Emphasis: string;
    intro: string;
    liveBadge: string;             // "LIVE" — dashboard live indicator
    programmePhasesLabel: string;  // "Programme Phases"
    // 5 project rows. Per project, `title` and `desc` are translatable
    // (proper nouns and non-glossary acronyms inside them are wrapped in
    // `<noTranslate>...</noTranslate>` markers so the translation
    // pipeline preserves them verbatim; stripMarkers() strips the
    // wrapper tags at render time). `metric{N}Lbl` keys are translatable
    // descriptive labels; metric VALUES stay inline in TrackRecord.tsx
    // (numerics + glossary-protected acronyms like S/4HANA). Tag arrays
    // stay inline — heavy on subsidiary proper nouns and visually
    // compact badge UI; deferred.
    projects: [
      TrackRecordProject,
      TrackRecordProject,
      TrackRecordProject,
      TrackRecordProject,
      TrackRecordProject,
    ];
  };
  howIWork: {
    eyebrow: string;
    h2Lead: string;
    h2Emphasis: string;
    intro: string;
    steps: [HowIWorkStep, HowIWorkStep, HowIWorkStep, HowIWorkStep];
  };
  whatIBelieve: {
    eyebrow: string;               // "[ 05 · What I believe ]"
    h2Lead: string;                // "Five positions."
    h2Emphasis: string;            // "All defensible in print."
    intro: string;
    primaryCta: string;            // "Book a 30-min call"
    ctaTagline: string;            // "Direct with me. No SDR layer."
    // Belief bodies themselves live in src/components/article/beliefs/data.ts
    // (the typed BELIEFS array consolidated in Block 6b). The
    // translation pipeline emits per-locale beliefs/data.<lang>.ts.
  };
  aiCapabilities: {
    eyebrow: string;
    h2Lead: string;
    h2Emphasis: string;
    intro: string;
    terminalLabel: string;         // "agent.erp — agentic pipeline"
    terminalLiveBadge: string;     // "LIVE"
    stackHeading: string;          // "AI Stack"
    feature1Title: string;
    feature1Body: string;
    feature2Title: string;
    feature2Body: string;
    feature3Title: string;
    feature3Body: string;
    feature4Title: string;
    feature4Body: string;
    // Terminal demo lines (Anomaly detected: PO-4891 …, Cash flow forecast: Q3 …)
    // stay inline in AICapabilities.tsx. They are heavy on proper nouns
    // (PO-4891, MX-220, Q3, Aug 15) and embedded JSX styling that
    // doesn't fit cleanly through the translation pipeline. The
    // surrounding chrome (terminalLabel, terminalLiveBadge, stackHeading)
    // IS translated.
    // STACK_TAGS labels (SAP Business AI, Joule, SAP BTP, Datasphere,
    // Analytics Cloud, Custom Agents) stay inline — SAP product names
    // are proper nouns; "Custom Agents" is the only descriptive label
    // and translates as part of any future Block 6c pass.
  };
  tools: {
    eyebrow: string;
    h2Lead: string;
    h2Emphasis: string;
    intro: string;
    // Product names "Command Central" and "ERPCV" are proper nouns —
    // do-not-translate, kept inline in Tools.tsx. The descriptive
    // fields below ARE translatable.
    card1Type: string;             // "Implementation"
    card1Title: string;            // "Track your ERP implementation in one place."
    card1Body: string;
    card1Cta: string;              // "Explore Command Central →" — contains proper noun
    card2Type: string;             // "Career"
    card2Title: string;            // "Stop losing interviews you should be winning."
    card2Body: string;
    card2Cta: string;              // "Try ERPCV free →" — contains proper noun
  };
  testimonials: {
    eyebrow: string;
    h2Lead: string;                // "Don't take my word for it."
    h2Emphasis: string;            // "Read theirs."
    // Quote bodies + attributions are do-not-translate; they live in
    // src/components/Testimonials.tsx.
  };
  credentials: {
    eyebrow: string;
    h2Lead: string;
    h2Emphasis: string;
    intro: string;
    featuredOnLabel: string;       // "Featured on"
    alsoPublishedInLabel: string;  // "Also published in:"
    // Credential LABELS (CIMA & AICPA, Masters in Accounting, SAP
    // Certified PM, Solution Architect) and press names are
    // do-not-translate (proper nouns / credential names). They stay
    // inline in Credentials.tsx. The descriptive SUBS below ARE
    // translatable.
    cred1Sub: string;              // "Management accounting"
    cred2Sub: string;              // "Finance depth, not surface"
    cred3Sub: string;              // "Activate · SAFe · ITIL" — three certification names, all proper nouns; the value is unchanged across locales but lives in MESSAGES for shape consistency
    cred4Sub: string;              // "Architecture across the stack"
  };
  youtube: {
    eyebrow: string;
    h2Lead: string;
    h2Emphasis: string;
    intro: string;
    cta: string;                   // "Subscribe on YouTube"
  };
  faq: {
    eyebrow: string;               // "[ Frequently asked questions ]"
    h2: string;                    // "What CFOs ask me first."
    items: [
      FaqItem, FaqItem, FaqItem, FaqItem, FaqItem, FaqItem, FaqItem,
    ];
  };
  ctaBanner: {
    eyebrow: string;               // "READY WHEN YOU ARE"
    h2: string;
    body: string;
    primaryCta: string;            // "Book a 30-min call ↗"
    secondaryCta: string;          // "Email me directly"
  };

  // Article + category + tag page chrome (shared layout components).
  category: {
    startHere: string;             // "Start here" — sidebar eyebrow
    viewAllPrefix: string;         // "View all" — followed by count + "articles"
    articleSingular: string;       // "article" — singular plural form
    articlePlural: string;         // "articles" — plural form
    browseByTopicEyebrow: string;  // "[ Browse by topic ]"
    browseByTopicH2Lead: string;
    browseByTopicH2Emphasis: string;
    browseByTopicIntro: string;
    featuredEyebrow: string;       // "[ Featured insights ]"
    featuredH2Lead: string;
    featuredH2Emphasis: string;
    featuredIntro: string;
    latestEyebrow: string;         // "[ Latest articles ]"
    latestH2Lead: string;
    latestH2Emphasis: string;
    latestIntro: string;
    aboutStripBio: string;         // Bio paragraph on category page about strip
    aboutStripCredentialBoardLevel: string;
    aboutStripCredentialIndependent: string;
    aboutStripCredentialEnterprise: string;
    fullBioLink: string;           // "Full bio →"
    categoryKicker: string;        // "Category" — breadcrumb segment label
    badgeSeniorAdvisory: string;
    badgeFieldExperience: string;
    defaultHeroTagline: string;    // "Practical. Not theoretical." — fallback
  };
  tag: {
    tagKicker: string;             // "Tag" — kicker + breadcrumb segment label
    badgeFieldExperience: string;
    emptyStateEyebrow: string;     // "[ No articles yet ]"
    emptyStateTitlePrefix: string; // "Nothing tagged"
    emptyStateTitleSuffix: string; // "yet."
    emptyStateBody: string;
    featuredEyebrow: string;       // "[ Featured insights ]" — duplicate of category.featuredEyebrow; consider shared key
    featuredH2Lead: string;
    featuredH2Emphasis: string;
    featuredIntro: string;
    moreEyebrow: string;           // "[ More on this tag ]"
    moreH2Lead: string;
    moreH2Emphasis: string;
    moreIntroPrefix: string;       // "Every article tagged"
    otherTagsEyebrow: string;      // "[ Other tags ]"
    otherTagsH2: string;           // "Pick another angle."
  };
  post: {
    contentsLabel: string;         // "Contents" — mobile ToC summary
    continueReadingLabel: string;  // "Continue reading"
    // Promo-card content. Product names "Command Centre" and "ERPCV"
    // stay inline as do-not-translate proper nouns; the
    // descriptive chrome around them flows through these keys.
    commandCentreKicker: string;   // "Built by Noel"
    commandCentreDescription: string;
    commandCentreCta: string;      // "Try Command Centre free" — contains product name
    erpcvKicker: string;           // "Tool · Free to start"
    erpcvTitle: string;            // "Build a professional ERP CV in minutes"
    erpcvDescription: string;
    erpcvCta: string;              // "Generate your ERP CV"
  };
  card: {
    readArticle: string;           // "Read article" — affordance text on PostCard
    minRead: string;               // "min read" — reading-time suffix
  };
  breadcrumb: {
    home: string;                  // "Home" — used across PostPage, MdxPageLayout, CategoryPage, TagPage, ToolShell, about/page.tsx, CaseStudyArticlePage
  };

  // Article components.
  article: {
    updatedLabel: string;          // "Updated " — date prefix
    reviewedLabel: string;         // "Reviewed " — date prefix
    minRead: string;               // "min read" — reading-time suffix (shared with card.minRead — consider consolidating)
    keyTakeawaysHeading: string;   // "Key takeaways" — default KeyTakeaways title
    writtenByLabel: string;        // "Written by" — AuthorBox eyebrow
    aboutNoelLink: string;         // "About Noel"
    linkedinLink: string;          // "LinkedIn"
    youtubeLink: string;           // "YouTube"
    primaryCtaBookCall: string;    // "Book a 30-min call"
    secondaryCtaCaseStudies: string; // "See case studies"
    relatedReadingDefault: string; // "Related reading"
    moreFromArchive: string;       // "More from the archive"
    browseAllLink: string;         // "Browse all"
    tableOfContentsAria: string;   // "Table of contents"
    tableOfContentsHeadingLead: string; // "Table of"
    tableOfContentsHeadingEmphasis: string; // "contents"
    ctaWorkingOnSomething: string; // default CTASection title
    ctaWorkingBody: string;
    ctaPrimary: string;            // "Talk about your project"
    ctaSecondary: string;          // "See how I help"
    nextStepEyebrow: string;       // "Next step" — CTASection eyebrow
    authorBio: string;             // ~50-word bio paragraph rendered in AuthorBox under the headshot
  };

  // Case studies.
  caseStudy: {
    backToAll: string;             // "← All case studies"
    metaClient: string;            // "Client"
    metaIndustry: string;          // "Industry"
    metaRegion: string;            // "Region"
    metaDuration: string;          // "Duration"
    metaRole: string;              // "My role"
    featuredEyebrow: string;       // "[ Featured case study ]"
    readFullCaseStudyCta: string;  // "Read the full case study"
    readTheCaseAffordance: string; // "Read the case"
    portfolioEyebrow: string;      // "[ Hand-picked ]"
    portfolioH2Lead: string;
    portfolioH2Emphasis: string;
    archiveEyebrow: string;        // "[ The archive ]"
    archiveH2Lead: string;
    archiveH2Emphasis: string;
    methodologyEyebrow: string;    // "[ How I write these ]"
    methodologyH2Lead: string;
    methodologyH2Emphasis: string;
    methodologyIntro: string;
    ruleLabel: string;             // "Rule" — per-cell eyebrow
    relatedEyebrow: string;        // "[ Other programmes ]"
    relatedH2Lead: string;
    relatedH2Emphasis: string;
  };
  filters: {
    closeFiltersAria: string;      // "Close filters"
    filtersHeading: string;        // "Filters"
    industryLabel: string;         // "Industry"
    serviceLabel: string;          // "Service"
    regionLabel: string;           // "Region"
    clearAll: string;              // "Clear all"
    showResults: string;           // "Show results"
    allChip: string;               // "All"
    sortLabel: string;             // "Sort"
    sortAria: string;              // "Sort case studies"
    sortRecent: string;            // "Recent"
    sortIndustry: string;          // same word, different context — "Industry"
    sortRegion: string;            // "Region"
    removeFilterPrefix: string;    // "Remove" — followed by label + "filter"
    removeFilterSuffix: string;    // "filter"
  };

  // Books page suite.
  books: {
    pageMetaTitle: string;         // Browser <title>
    pageMetaDescription: string;
    heroEyebrow: string;           // "[ 01 · Books ]"
    heroH1: string;
    heroIntro: string;
    heroBrowseFreeCta: string;     // "Browse free books"
    heroBrowsePaidCta: string;     // "Browse paid books"
    heroCredentials: string;       // "25 years in ERP · CIMA & AICPA · $700M+ delivered" — proper nouns CIMA/AICPA stay verbatim; the surrounding numerics + descriptor translate
    pressEyebrow: string;          // "Writing and commentary featured in"
    freeBooksEyebrow: string;      // "[ 02 · Free books ]"
    freeBooksHeading: string;      // "Free reading. Sent by email."
    freeBooksIntro: string;
    paidBooksEyebrow: string;      // "[ 03 · Paid books ]"
    paidBooksHeading: string;      // "The deep one. Paid."
    paidBooksIntro: string;
  };
  bookCard: {
    paidBadge: string;             // "Paid"
    freeBadge: string;             // "Free"
    getTheBookCta: string;         // "Get the book"
    // 3 accordion questions live in
    // src/components/books/accordion-questions.ts — translated as a
    // separate canonical source (Block 6b consolidation).
  };
  leadCapture: {
    errorEnterName: string;
    errorValidEmail: string;
    errorDataConsent: string;
    errorAcceptTerms: string;
    errorGeneric: string;
    errorNetwork: string;
    closeAria: string;             // "Close"
    paidSuccessHeading: string;    // "We have your details."
    paidSuccessBody: string;
    freeSuccessHeading: string;    // "Sent. Check your inbox."
    freeSuccessBodyPrefix: string; // "The download link for"
    freeSuccessBodySuffix: string; // "is on its way."
    downloadCta: string;           // "Download now"
    requestingEyebrow: string;     // "Requesting"
    nameLabel: string;             // "Name"
    namePlaceholder: string;       // "Your name"
    emailLabel: string;            // "Email"
    emailPlaceholder: string;      // "you@company.com"
    dataConsentParagraph: string;
    privacyPolicyLinkLabel: string; // "Privacy Policy"
    termsAcceptParagraph: string;
    termsOfUseLinkLabel: string;   // "Terms of Use"
    marketingOptIn: string;
    submitSending: string;         // "Sending…"
    submitContinueCheckout: string; // "Continue to checkout"
    submitSendBook: string;        // "Send me the book"
    ebookSuffix: string;           // "ebook"
  };

  // Free tool page chrome (ToolShell + ToolForm + ToolOutput + ModulePicker).
  tool: {
    breadcrumbToolsLabel: string;  // "Tools" — breadcrumb segment
    freeToolEyebrow: string;       // "[ Free Tool ]" — hero eyebrow
    formGenerateDefault: string;   // "Generate" — default submit label
    formGenerating: string;        // "Generating…" — in-flight label
    formErrorNoResponse: string;
    formErrorNetwork: string;
    formErrorRequired: string;     // "This field is required"
    formErrorSelect: string;       // "Please select an option"
    formSelectPlaceholder: string; // "Select…"
    formTagsHelper: string;        // "Separate multiple values with commas."
    formYesCheckbox: string;       // "Yes"
    outputResultHeading: string;   // "Result"
    outputCopyMarkdown: string;    // "Copy as markdown"
    outputStartOver: string;       // "Start over"
    moduleSelectedSuffix: string;  // "selected" — counter suffix
    moduleSearchPlaceholder: string;
    moduleAddCoreFinanceTitle: string;
    moduleAddCoreFinanceLabel: string; // "+ Add core finance"
    moduleClear: string;           // "Clear"
  };

  // The ErpCostClient calculator. Pass 2b-1a populated the component body
  // (wizard + result panels + chrome). Pass 2b-1b will add the lib
  // surfaces (calc-engine warnings, scenarios presets, countries
  // REGIONS) under nested sub-objects below as they're refactored.
  calculator: {
    // Wizard chrome — navigation, step indicator, live estimate badge.
    wizardStepIndicatorAria: string;
    wizardNavBack: string;
    wizardNavContinue: string;
    wizardNavCalculate: string;
    wizardStepOfLabel: string;            // "Step {step} of {total}"
    wizardToggleLiveAria: string;
    wizardLiveEstimateLabel: string;      // "Live estimate"
    wizardLiveEstimatePrefix: string;     // "Live estimate:"
    wizardLiveEstimateMetricsSuffix: string; // "{months}m · {complexity}/100 complexity"

    // Disclaimer banner.
    disclaimerPrefix: string;             // "Directional estimate only."
    disclaimerBody: string;

    // Step labels (icons stay inline).
    stepCompanyLabel: string;             // "Company"
    stepScopeLabel: string;               // "Scope"
    stepCountriesLabel: string;           // "Countries"
    stepDeliveryLabel: string;            // "Delivery"
    stepFinancialsLabel: string;          // "Financials"

    // Section titles (inside each step).
    section: {
      companyProfile: string;
      programScope: string;
      complexityLevels: string;
      complexityIntro: string;
      countryRollout: string;
      deliveryModel: string;
      financialAssumptions: string;
    };

    // Preset picker.
    presetEyebrow: string;                // "Load a preset scenario"

    // Module options + categories.
    modules: {
      categoryCore: string;
      categoryOperations: string;
      categoryExtended: string;
      finance: string;
      procurement: string;
      sales: string;
      hr: string;
      payroll: string;
      manufacturing: string;
      supplyChain: string;
      warehouse: string;
      quality: string;
      projectSystems: string;
      crm: string;
      analytics: string;
      epm: string;
    };

    // Chart category labels — same keys as the breakdown object.
    chart: {
      software: string;
      siServices: string;
      internalTeam: string;
      dataMigration: string;
      integration: string;
      changeAndTraining: string;
      testingAndCutover: string;
      infrastructure: string;
      localization: string;
      pmo: string;
      contingency: string;
    };

    // Step 1 — Company profile.
    step1: {
      companyNameLabel: string;
      companyNameOptional: string;        // "(optional)"
      companyNamePlaceholder: string;
      revenueLabel: string;
      revenueHint: string;
      revenueUnder10m: string;
      revenue10m50m: string;
      revenue50m250m: string;
      revenue250m1b: string;
      revenue1b5b: string;
      revenueOver5b: string;
      employeesLabel: string;
      employeesUnder100: string;
      employees100to500: string;
      employees500to1000: string;
      employees1000to3000: string;
      employees3000to10000: string;
      employeesOver10000: string;
      userCountLabel: string;
      userCountHint: string;
      userCountPlaceholder: string;
      legalEntitiesLabel: string;
      legalEntitiesHint: string;
      businessUnitsLabel: string;
      businessUnitsHint: string;
      industryLabel: string;
      industryManufacturing: string;
      industryRetail: string;
      industryFinancial: string;
      industryAviation: string;
      industryGovernment: string;
      industryUtilities: string;
      industryOilGas: string;
      industryHealthcare: string;
      industryTelecom: string;
      industryConstruction: string;
      industryProfessional: string;
      industryOther: string;
      maturityLabel: string;
      maturityHint: string;
      maturitySpreadsheetsLabel: string;
      maturitySpreadsheetsDetail: string;
      maturityLegacyLabel: string;
      maturityLegacyDetail: string;
      maturityMixedLabel: string;
      maturityMixedDetail: string;
      maturityModernLabel: string;
      maturityModernDetail: string;
      implTypeLabel: string;
      implTypeFirstLabel: string;
      implTypeFirstDetail: string;
      implTypeReimplLabel: string;
      implTypeReimplDetail: string;
      implTypeConsolLabel: string;
      implTypeConsolDetail: string;
      implTypeCarveLabel: string;
      implTypeCarveDetail: string;
      implTypePostMergerLabel: string;
      implTypePostMergerDetail: string;
    };

    // Step 2 — Program scope.
    step2: {
      erpApproachLabel: string;
      erpApproachSapLabel: string;
      erpApproachSapDetail: string;
      erpApproachOracleLabel: string;
      erpApproachOracleDetail: string;
      erpApproachMicrosoftLabel: string;
      erpApproachMicrosoftDetail: string;
      erpApproachInforLabel: string;
      erpApproachInforDetail: string;
      erpApproachOtherLabel: string;
      erpApproachOtherDetail: string;
      erpApproachAgnosticLabel: string;
      erpApproachAgnosticDetail: string;
      deploymentLabel: string;
      deploymentHint: string;
      deploymentCloudLabel: string;
      deploymentCloudDetail: string;
      deploymentPrivateLabel: string;
      deploymentPrivateDetail: string;
      deploymentOnPremLabel: string;
      deploymentOnPremDetail: string;
      deploymentHybridLabel: string;
      deploymentHybridDetail: string;
      modulesLabel: string;
      modulesHint: string;
      customizationLevelLabel: string;
      customizationLevelHint: string;
      integrationLabel: string;
      integrationHint: string;
      dataMigrationLabel: string;
      dataMigrationHint: string;
      reportingLabel: string;
      reportingHint: string;
      complexityLow: string;
      complexityLowDetail: string;
      complexityMedium: string;
      complexityMediumDetail: string;
      complexityHigh: string;
      complexityHighDetail: string;
      timelineLabel: string;
      timelineHint: string;
      timeline6m: string;
      timeline9m: string;
      timeline12m: string;
      timeline15m: string;
      timeline18m: string;
      timeline24m: string;
      timeline30m: string;
      timeline36m: string;
    };

    // Step 3 — Country rollout.
    step3: {
      hqCountryLabel: string;
      hqCountryAria: string;
      hqCountryHint: string;
      additionalCountries: string;
      addCountryCta: string;
      emptyTitle: string;
      emptyHint: string;
      multiDetectedTitle: string;
      multiDetectedBody: string;
      rowCountryAria: string;
      rowRemoveAria: string;
      rowUsersLabel: string;
      rowEntitiesLabel: string;
      rowLocalComplexityLabel: string;
      rowWaveLabel: string;
      rowComplexityLow: string;
      rowComplexityMedium: string;
      rowComplexityHigh: string;
    };

    // Step 4 — Delivery model.
    step4: {
      siTierLabel: string;
      siTierHint: string;
      siTierBoutiqueLabel: string;
      siTierBoutiqueDetail: string;
      siTierMidLabel: string;
      siTierMidDetail: string;
      siTierGlobalLabel: string;
      siTierGlobalDetail: string;
      deliveryLabel: string;
      deliveryHint: string;
      deliveryOnshoreLabel: string;
      deliveryOnshoreDetail: string;
      deliveryOffshoreLabel: string;
      deliveryOffshoreDetail: string;
      deliveryHybridLabel: string;
      deliveryHybridDetail: string;
      internalTeamLabel: string;
      internalTeamHint: string;
      internalTeamPlaceholder: string;
      changeMgmtLabel: string;
      changeMgmtHint: string;
      changeMgmtLightLabel: string;
      changeMgmtLightDetail: string;
      changeMgmtStandardLabel: string;
      changeMgmtStandardDetail: string;
      changeMgmtHeavyLabel: string;
      changeMgmtHeavyDetail: string;
      trainingLabel: string;
      trainingT3Label: string;
      trainingT3Detail: string;
      trainingRoleLabel: string;
      trainingRoleDetail: string;
      trainingIntensiveLabel: string;
      trainingIntensiveDetail: string;
    };

    // Step 5 — Financial assumptions.
    step5: {
      horizonLabel: string;
      horizonHint: string;
      horizon1Label: string;
      horizon1Detail: string;
      horizon3Label: string;
      horizon3Detail: string;
      horizon5Label: string;
      horizon5Detail: string;
      contingencyLabel: string;
      contingencyHint: string;
      inflationLabel: string;
      inflationHint: string;
      discountLabel: string;
      discountHint: string;
      reportingCurrencyLabel: string;
      reportingCurrencyHint: string;
      currencyUsd: string;
      currencyEur: string;
      currencyGbp: string;
      currencyAed: string;
      currencySar: string;
      currencyInr: string;
      currencyAud: string;
      currencyCad: string;
      currencySgd: string;
    };

    // Executive summary card.
    exec: {
      estimatedCostEyebrow: string;
      expectedPrefix: string;             // "Expected:"
      year1TotalSuffix: string;           // "· Year 1 total"
      complexityEyebrow: string;          // "Complexity"
      scoreSuffix: string;                // "/100"
      statTimeline: string;
      statTimelineSubMonths: string;      // "{months} months"
      statTimelineSubRange: string;       // "{min}–{max} range"
      statCostPerUser: string;
      statPctOfRevenue: string;
      statPctOfRevenueSub: string;
      statCountryScope: string;
      statCountryScopeSingle: string;     // "1 country"
      statCountryScopePlural: string;     // "{n} countries"
      multiCountryLow: string;            // "Single country"
      multiCountryModerate: string;
      multiCountryHigh: string;
      multiCountryVeryHigh: string;
    };

    // CFO view.
    cfo: {
      tileY1: string;                     // "Year 1 total"
      tileTco3yr: string;                 // "3-year TCO"
      tileTco5yr: string;                 // "5-year TCO"
      rangeLabel: string;                 // "Range"
      annualSpendTitle: string;           // "Annual spend profile"
      annualSpendNote: string;
      budgetAllocationY1: string;
      tableCategory: string;
      tableLow: string;
      tableExpected: string;
      tableHigh: string;
    };

    // CIO view.
    cio: {
      complexityScoreLabel: string;       // "Complexity score: {score}/100"
      interpretationLow: string;
      interpretationMedium: string;
      interpretationHigh: string;
      timelinePrefix: string;             // "Timeline:"
      timelineRangeSuffix: string;        // "{min}–{max} months"
      timelineExpectedSuffix: string;     // "(expected {n} months)"
      riskIndicatorsHeading: string;
      deliveryPhasesHeading: string;
      keyDriversHeading: string;
      riskLevelLow: string;
      riskLevelMedium: string;
      riskLevelHigh: string;
      riskDataMigration: string;
      riskIntegration: string;
      riskChangeManagement: string;
      riskLocalisation: string;
      riskCustomDevelopment: string;
      riskTesting: string;
      driverWideModule: string;
      driverHighIntegration: string;
      driverHighDataComplexity: string;
      driverHighCustomisation: string;
      driverManyCountries: string;        // "{n} countries — wave planning..."
      driverSpreadsheetsStart: string;
      driverPostMerger: string;
    };

    // Country breakdown table.
    countryTable: {
      country: string;
      users: string;
      entities: string;
      wave: string;
      localComplexity: string;
      costShare: string;
      expectedCost: string;
    };

    // Assumptions panel.
    assumptions: {
      introBody: string;
      softwareLabel: string;
      softwareValueTemplate: string;       // "~{rate} ({approach}, {deployment})"
      siBaseLabel: string;
      siBaseValueTemplate: string;
      contingencyLabel: string;
      contingencyValueTemplate: string;    // "{pct}%"
      totalModulesLabel: string;
      countriesLabel: string;
      horizonLabel: string;
      horizonValueTemplate: string;        // "{n} years"
      inflationLabel: string;
      inflationValueTemplate: string;
      internalTeamRateLabel: string;
      internalTeamRateValueTemplate: string;  // "${rate}/day (fully loaded)"
      pmoLabel: string;
      pmoValue: string;
      amsLabel: string;
      amsValue: string;
    };

    // Saved scenario compare card.
    scenario: {
      emptyTitle: string;
      emptyBody: string;
      removeCta: string;
      statY1: string;
      statTco3yr: string;
      statTimeline: string;
    };

    // Result panel tabs.
    tabs: {
      breakdown: string;
      cfo: string;
      cio: string;
      countries: string;
      scenarios: string;
      assumptions: string;
    };

    // Result panel action buttons.
    actions: {
      saveScenario: string;
      saveScenarioCountTemplate: string;   // "({n}/3)"
      copySummary: string;
      printExport: string;
      startOver: string;
    };

    // Lib-side strings (Pass 2b-1b).
    //
    // calc-engine.ts warnings — 7 entries, each with workstream label +
    // human-readable message + detail. Messages support {placeholder}
    // tokens for runtime interpolation via interpolate(); calc-engine
    // pre-resolves them per locale before returning WarningFlag[].
    warnings: {
      tooManyCountriesShortTimeline: {
        workstream: string;                // "Timeline"
        message: string;                   // "{countries} countries in {months} months is high-risk"
        detail: string;
      };
      highCustomShortTimeline: {
        workstream: string;
        message: string;
        detail: string;
      };
      lightChangeManyUsers: {
        workstream: string;
        message: string;
        detail: string;
      };
      multiCountryPayrollWave1: {
        workstream: string;
        message: string;
        detail: string;
      };
      spreadsheetsHighIntegration: {
        workstream: string;
        message: string;
        detail: string;
      };
      postMergerShortTimeline: {
        workstream: string;
        message: string;
        detail: string;
      };
      offshoreHighComplexity: {
        workstream: string;
        message: string;
        detail: string;
      };
    };

    // calc-engine.ts timeline phase names.
    phases: {
      prepareExplore: string;
      designBlueprint: string;
      buildConfigure: string;
      test: string;
      deployCutover: string;
      hypercareStabilise: string;
    };

    // scenarios.ts preset descriptions.
    presets: {
      midMarketName: string;
      midMarketDescription: string;
      midMarketBadge: string;
      regionalName: string;
      regionalDescription: string;
      regionalBadge: string;
      globalName: string;
      globalDescription: string;
      globalBadge: string;
    };

    // countries.ts REGIONS labels. Keys match the internal English
    // strings used to join country data — only the display label is
    // translated. Individual country names stay inline as proper nouns.
    regions: {
      northAmerica: string;
      europe: string;
      middleEast: string;
      middleEastAndAfrica: string;
      asiaPacific: string;
      africa: string;
      latinAmerica: string;
    };

    // Enum-value humanisation for AssumptionsPanel. The panel renders
    // raw input values ("sap", "cloud-saas") inline today; this provides
    // short, presentational labels keyed by the same enum strings.
    // <noTranslate> markers wrap proper-noun values.
    enumLabels: {
      erpApproach: {
        sap: string;
        oracle: string;
        microsoft: string;
        infor: string;
        other: string;
        "vendor-agnostic": string;
      };
      deploymentModel: {
        "cloud-saas": string;
        "private-cloud": string;
        "on-premise": string;
        hybrid: string;
      };
      siPartnerTier: {
        boutique: string;
        "mid-tier": string;
        "global-si": string;
      };
      deliveryModel: {
        onshore: string;
        offshore: string;
        hybrid: string;
      };
    };

    // Copy-summary email template.
    email: {
      titlePrefix: string;                 // "ERP Programme Estimate"
      companyPrefix: string;
      companyDefault: string;              // "—"
      erpApproachPrefix: string;
      deploymentLabel: string;
      countriesPrefix: string;
      usersLabel: string;
      modulesPrefix: string;
      y1EstimatePrefix: string;
      expectedInlineTemplate: string;      // "(expected: {value})"
      tco3yrPrefix: string;
      tco5yrPrefix: string;
      timelinePrefix: string;
      monthsSuffix: string;
      complexityPrefix: string;
      disclaimerLine: string;
      generatedPrefix: string;
    };
  };

  // Other tool clients (~40 + 35 + 50 + 80 strings respectively).
  sapCostCalculator: {
    _todo: string;
  };
  migrationEstimator: {
    _todo: string;
  };
  jdGenerator: {
    _todo: string;
  };
  solutionBuilder: {
    _todo: string;
  };

  // Contact page (ContactHero + ContactBlock + CalendlyEmbed).
  contact: {
    eyebrow: string;               // "Get in touch"
    h2Lead: string;                // "30 minutes."
    h2Emphasis: string;            // "No sales pitch."
    body: string;
    calendlyLoading: string;       // "Loading scheduler…"
    calendlyFallbackCta: string;   // "Book on Calendly →"
    contactPhoneUae: string;       // "Phone UAE" — label
    contactPhoneUs: string;        // "Phone US" — label
    contactEmail: string;          // "Email" — label
    contactWebsite: string;        // "Website" — label
    contactLinkedin: string;       // "LinkedIn" — label
    contactYoutube: string;        // "YouTube" — label
  };

  // Privacy + terms full-page copy. Long-form legal text — translates
  // but stays readable.
  privacy: {
    eyebrow: string;               // "[ Site · Privacy ]"
    h1: string;                    // "Privacy"
    intro: string;
    h2WhatICollect: string;
    bodyWhatICollect: string;
    h2WhyICollect: string;
    bodyWhyICollect: string;
    h2HowLong: string;
    bodyHowLong: string;
    h2YourRights: string;
    bodyYourRights: string;
    h2Cookies: string;
    bodyCookies: string;
    seeAlsoLabel: string;          // "See also:"
    termsOfUseLink: string;        // "Terms of use"
    updatedLabelPrefix: string;    // "Updated:"
  };
  terms: {
    // Same shape as privacy. Pass 2.
    _todo: string;
  };

  // Error pages + 404.
  error: {
    notFoundH1: string;            // "Page not found"
    notFoundBody: string;
    backHomeCta: string;           // "Back home"
  };
}

// ── Helper sub-types ──────────────────────────────────────────────────

export interface ServiceCard {
  numberEyebrow: string;           // "CLIENT · 01"
  title: string;                   // "Company Executives & Sponsors"
  who: string;                     // "CIOs · CFOs · Programme Directors"
  paragraphs: [string, string];    // 2 body paragraphs
  bullets: [string, string, string, string, string]; // 5 list items
  cta: string;                     // "Talk about your project →"
}

export interface HowIWorkStep {
  num: string;                     // "01"
  title: string;                   // "Discovery call"
  duration: string;                // "30 minutes · free"
  who: string;                     // "Direct with me"
  body: string;
  output: string;                  // "Output: clear yes or no on whether to scope a paid engagement."
}

export interface FaqItem {
  q: string;
  a: string;
}

// Project row in the homepage TrackRecord sticky-panel section. Client
// names, badge values, dashboard labels, tags, and metric values stay
// inline in TrackRecord.tsx — proper nouns, numerics, and identifier-
// shaped strings. Title + desc + metric labels flow through this
// interface; inline `<noTranslate>...</noTranslate>` markers preserve
// non-glossary proper nouns within otherwise-translatable text.
export interface TrackRecordProject {
  title: string;
  desc: string;
  metric1Lbl: string;
  metric2Lbl: string;
  metric3Lbl: string;
  metric4Lbl: string;
}

// ── Locale records ────────────────────────────────────────────────────
//
// Pass 1 (this file) defines the type. The English exemplar values below
// demonstrate the schema with real strings from the audit. Pass 2 will
// extend the English record to ALL ~680 keys as it walks each component.
// Pass 4 (translation script) will overwrite each non-English locale
// with translated values.
//
// During development before the translation script runs, every
// non-English locale references the English record so the site still
// builds. The `Record<Locale, Messages>` type enforces total coverage —
// TypeScript will fail the build if a key is missing from any locale.

const EN: Messages = {
  nav: {
    solutionsDropdown: "Solutions",
    toolsDropdown: "Tools",
    caseStudies: "Case Studies",
    books: "Books",
    about: "About",
    contact: "Contact",
    company: "Company",
    brandHomeAria: "noeldcosta — home",
    closeMenu: "Close menu",
    openMenu: "Open menu",
  },
  footer: {
    tagline:
      "ERP, Data & AI consulting. 25+ years helping companies get real value from SAP, Oracle, and AI systems.",
    solutionsHeading: "Solutions",
    freeToolsHeading: "Free Tools",
    companyHeading: "Company",
    privacyLink: "Privacy",
    supportLink: "Support",
    youtubeLink: "YouTube",
  },
  languageSwitcher: {
    selectLanguage: "Select language",
  },
  stickyCta: {
    bookConsultation: "Book consultation",
  },
  hero: {
    headline: "I run ERP transformations",
    emphasis: "the board can defend.",
    eyebrow: "ERP · AI · 25 years",
    statDeliveredLabel: "delivered",
    statEntitiesLabel: "entities migrated",
    statYearsLabel: "in ERP & AI",
    statContinentsLabel: "continents",
    subheadlineLead:
      "ECC to S/4HANA. AI on SAP. 25 years delivering enterprise transformations across",
    subheadlineIndustries:
      "defence, aviation, energy, financial services, and the public sector",
    subheadlineImpact: "$700M+ in total impact",
    subheadlineTail:
      "CIMA-qualified. I lead the engagement. I don't subcontract.",
    primaryCta: "Book a 30-min call",
    secondaryCta: "See case studies",
    credMasters: "Masters in Accounting",
    credYearsAndClients:
      "25+ years across EDGE Group, Etihad, ADNOC, PIF entities, DXC, and the UAE Government",
    linkedinAria: "Noel D'Costa on LinkedIn",
    headshotAlt: "Noel D'Costa",
  },
  logoScroll: {
    eyebrow: "Delivered for companies including",
  },
  problemStats: {
    eyebrow: "[ The problem ]",
    h2Lead: "Most ERP projects fail.",
    h2Emphasis: "Yours doesn't have to.",
    intro: "You already know this. The numbers just confirm it.",
    stat1Body: "of ERP projects go over budget or miss their deadline.",
    stat1Source: "Panorama Consulting, 2024",
    stat2Body: "average cost overrun on mid-market S/4HANA migrations.",
    stat2Source: "Resulting IT, 2024",
    stat3Body: "of companies say ERP failed to deliver expected business value.",
    stat3Source: "Gartner Research, 2023",
  },
  // ── Pass 1 exemplar — remaining namespaces have placeholder shapes ──
  // Pass 2 (Block 6c extraction step) will populate every leaf with the
  // English string sourced from the audited component. The shapes below
  // are illustrative; the audit doc is the canonical inventory.
  services: {
    eyebrow: "[ 01 · Who I help ]",
    h2Lead: "Two types of people find me useful.",
    h2Emphasis: "Maybe you're one.",
    intro:
      "Companies that need ERP and AI done right. Consultants who need straight advice on their career.",
    card1: {
      numberEyebrow: "CLIENT · 01",
      title: "Company Executives & Sponsors",
      who: "CIOs · CFOs · Programme Directors",
      paragraphs: [
        "You have an ECC to S/4HANA migration coming up. Or you're mid-implementation and things aren't going well. Maybe you want AI on top of your ERP but nobody's giving you a straight answer.",
        "I step in and get things moving. Direct involvement. No junior team learning on your budget.",
      ],
      bullets: [
        "ECC to S/4HANA migration planning and delivery",
        "AI and Agentic AI strategy on SAP BTP",
        "Programme recovery when things go sideways",
        "Vendor selection and contract negotiation",
        "Solution architecture with finance depth",
      ],
      cta: "Talk about your project →",
    },
    card2: {
      numberEyebrow: "CLIENT · 02",
      title: "ERP & SAP Consultants",
      who: "Independent Consultants · Career Changers",
      paragraphs: [
        "You're trying to break into ERP consulting. Or you're already in the game and need guidance. Which certifications matter. How to position yourself. What clients actually want.",
        "25 years of experience. Happy to share what I know.",
      ],
      bullets: [
        "Career path guidance for ERP consulting",
        "Which certifications actually get you hired",
        "How to build your personal brand",
        "Use ERPCV to build recruiter-ready CVs",
        "Real talk on the consulting business",
      ],
      cta: "Check out my tools →",
    },
  },
  trackRecord: {
    eyebrow: "[ 03 · Track record ]",
    h2Lead: "Programmes I've led.",
    h2Emphasis: "Not advised on. Led.",
    intro: "Real companies. Real numbers. I was in the room running these.",
    liveBadge: "LIVE",
    programmePhasesLabel: "Programme Phases",
    projects: [
      // EDGE Group — defence consolidation. S/4HANA is glossary-protected;
      // the numerals 8, 126, 81% are durable across locales; no markers
      // needed here.
      {
        title: "25 Defense Entities → One S/4HANA",
        desc: "Consolidated 8 legacy ERPs onto single S/4HANA core. 126-member team. 81% process automation across the entire defence group.",
        metric1Lbl: "Cost Reduction",
        metric2Lbl: "Automation",
        metric3Lbl: "Team Size",
        metric4Lbl: "Legacy Systems",
      },
      // Etihad — SAP CoE. "P&L" is a finance acronym kept in markers so
      // it stays "P&L" in every locale rather than being expanded; SAP
      // is glossary-protected; numerals durable.
      {
        title: "SAP Centre of Excellence — 8 Years",
        desc: "Built route profitability on SAP. Flight-level <noTranslate>P&L</noTranslate> across 100+ aircraft and 1,000+ weekly flights. $36M in direct benefits.",
        metric1Lbl: "Total Impact",
        metric2Lbl: "Direct Benefit",
        metric3Lbl: "Aircraft",
        metric4Lbl: "Weekly Flights",
      },
      // TII — IPSAS, Azure, AWS are non-glossary proper nouns/acronyms;
      // wrap so the translation pipeline preserves them verbatim.
      {
        title: "S/4HANA Greenfield — 5 Research Entities",
        desc: "Dual-ledger Finance (cash + accrual, <noTranslate>IPSAS</noTranslate>). Cloud on <noTranslate>Azure</noTranslate> and <noTranslate>AWS</noTranslate>. Full lifecycle from blueprint through hypercare.",
        metric1Lbl: "Entities",
        metric2Lbl: "Architecture",
        metric3Lbl: "Ledger",
        metric4Lbl: "Reporting",
      },
      // DXC — Microsoft, MEA, PIF are non-glossary proper nouns. SAP +
      // Oracle are glossary-protected. PIF is the Saudi Public
      // Investment Fund — a proper-noun acronym that should NOT
      // translate.
      {
        title: "Managing Partner — 800+ Consultants",
        desc: "SAP, Oracle, <noTranslate>Microsoft</noTranslate> practices across <noTranslate>MEA</noTranslate>. <noTranslate>PIF</noTranslate> entities, banking, public sector.",
        metric1Lbl: "Pipeline",
        metric2Lbl: "Consultants",
        metric3Lbl: "Practices",
        metric4Lbl: "Region",
      },
      // Govt. Enablement — EBS, Fusion Cloud, TOGAF are non-glossary.
      // SAP + Oracle are glossary-protected. EBS = E-Business Suite, a
      // specific Oracle product name; Fusion Cloud = Oracle Fusion
      // Cloud, also a product name; TOGAF = enterprise-architecture
      // framework — all should not translate.
      {
        title: "Digital Executive Advisor",
        desc: "SAP and Oracle landscape strategy. Oracle <noTranslate>EBS</noTranslate> to <noTranslate>Fusion Cloud</noTranslate> migration. Enterprise Architecture (<noTranslate>TOGAF</noTranslate>).",
        metric1Lbl: "Entities",
        metric2Lbl: "Migration",
        metric3Lbl: "Framework",
        metric4Lbl: "Role",
      },
    ],
  },
  howIWork: {
    eyebrow: "[ 04 · How I work ]",
    h2Lead: "Four steps.",
    h2Emphasis: "No opaque engagement model.",
    intro:
      "Each step has a clear output. You can stop after any of them. The first one is free.",
    steps: [
      {
        num: "01",
        title: "Discovery call",
        duration: "30 minutes · free",
        who: "Direct with me",
        body: "We talk about your programme. The state it is in, the decisions on your desk, the things keeping you up. I tell you whether I can actually help and where I would start. No deck, no pre-read, no follow-up sales loop.",
        output: "Output: clear yes or no on whether to scope a paid engagement.",
      },
      {
        num: "02",
        title: "Scoping engagement",
        duration: "1 to 2 weeks · day rate or fixed",
        who: "Direct with me plus your nominated lead",
        body: "I review your current state. Existing artefacts, recent SteerCo reports, the SI's plan, your finance close cycle, the risk log. I run targeted conversations with the people who actually do the work. The output is a written diagnostic and a recommended engagement shape.",
        output: "Output: diagnostic report and engagement proposal. You can take both elsewhere.",
      },
      {
        num: "03",
        title: "Delivery engagement",
        duration: "3 to 12 months · fee structure varies",
        who: "Direct involvement throughout",
        body: "I work alongside your team and the SI on the agreed scope. Programme recovery, S/4HANA migration oversight, AI on SAP design, vendor governance, business case validation. No junior team learning on your budget. I limit client load on purpose, so the senior in the pitch is the senior in the room.",
        output: "Output: programme that lands. Weekly written updates. Honest escalation when something is off.",
      },
      {
        num: "04",
        title: "Hypercare or advisory retainer",
        duration: "Optional · monthly",
        who: "Lighter touch, named contact",
        body: "Post-go-live stabilisation, or ongoing board-level advisory for the next phase. Most clients take this for the first three months after a major go-live. Some keep it as standing capacity for the next big decision.",
        output: "Output: documented stabilisation actions or quarterly advisory notes to the SteerCo.",
      },
    ],
  },
  whatIBelieve: {
    eyebrow: "[ 05 · What I believe ]",
    h2Lead: "Five positions.",
    h2Emphasis: "All defensible in print.",
    intro:
      "These are the opinions I will hold in a SteerCo. If one of them matches something you have already thought but could not say out loud, we should talk.",
    primaryCta: "Book a 30-min call",
    ctaTagline: "Direct with me. No SDR layer.",
  },
  aiCapabilities: {
    eyebrow: "[ 02 · AI capabilities ]",
    h2Lead: "AI on top of your ERP.",
    h2Emphasis: "Not buzzwords. Real systems.",
    intro:
      "I build practical AI that works with your SAP data. Agentic AI, predictive models, intelligent automation. Things that actually move the needle.",
    terminalLabel: "agent.erp — agentic pipeline",
    terminalLiveBadge: "LIVE",
    stackHeading: "AI Stack",
    feature1Title: "Agentic AI on SAP BTP",
    feature1Body:
      "Autonomous AI agents that work inside your SAP landscape. Handle approvals, flag anomalies, route decisions. Not chatbots. Agents that take action.",
    feature2Title: "Predictive Analytics",
    feature2Body:
      "Forecast demand, cash flow, maintenance schedules from your ERP data. Built on SAP Datasphere and Analytics Cloud. Real models, not dashboards.",
    feature3Title: "Intelligent Automation",
    feature3Body:
      "Invoice matching, PO creation, journal entries. AI handles the repetitive work. Your team handles exceptions. 81% automation at EDGE Group.",
    feature4Title: "AI Governance & Risk",
    feature4Body:
      "Policies, oversight frameworks, compliance processes. Deploy AI without the legal risk. Satisfy regulators and stakeholders.",
  },
  tools: {
    eyebrow: "[ 06 · Built by me ]",
    h2Lead: "Tools I build",
    h2Emphasis: "for the ERP world.",
    intro:
      "Advice is half the job. The other half is building the tools the work actually needs. Used by consultants and companies across 130+ regions.",
    card1Type: "Implementation",
    card1Title: "Track your ERP implementation in one place.",
    card1Body:
      "Progress, risks, milestones, team performance. Built because every project I walked into had tracking spread across 15 different spreadsheets. Real-time dashboards. Not another status deck.",
    card1Cta: "Explore Command Central →",
    card2Type: "Career",
    card2Title: "Stop losing interviews you should be winning.",
    card2Body:
      "6-document career pack. Executive CV, project portfolio, cover letter, interview prep, LinkedIn messages, reference sheet. 1,200+ packs delivered. 89% more interviews. $19.99 one-time.",
    card2Cta: "Try ERPCV free →",
  },
  testimonials: {
    eyebrow: "[ 09 · From people I've worked with ]",
    h2Lead: "Don't take my word for it.",
    h2Emphasis: "Read theirs.",
  },
  credentials: {
    eyebrow: "[ 08 · Why this works ]",
    h2Lead: "Senior on the system.",
    h2Emphasis: "Senior on the close.",
    intro:
      "Most SAP consultants understand the system. Few understand the business. I have both.",
    featuredOnLabel: "Featured on",
    alsoPublishedInLabel: "Also published in:",
    cred1Sub: "Management accounting",
    cred2Sub: "Finance depth, not surface",
    cred3Sub: "Activate · SAFe · ITIL",
    cred4Sub: "Architecture across the stack",
  },
  youtube: {
    eyebrow: "[ 07 · Watch & learn ]",
    h2Lead: "Videos from the field.",
    h2Emphasis: "Not theory. Real projects.",
    intro:
      "I share what I've learned from 25 years of ERP and AI implementations. The stuff nobody tells you.",
    cta: "Subscribe on YouTube",
  },
  faq: {
    eyebrow: "[ Frequently asked questions ]",
    h2: "What CFOs ask me first.",
    items: [
      {
        q: "What does an engagement actually look like?",
        a: "Depends on what you need. If you're pre-implementation, I run a 4 to 6 week diagnostic. Current state, vendor selection, business case, programme structure. If you're mid-implementation and things are off, I step in for 90 days as Programme Director or Senior Advisor to the CIO. If you're post-go-live and AI is the next wave, I scope and lead 8 to 16 week AI builds on SAP BTP. Always direct involvement. I don't disappear after the kickoff.",
      },
      {
        q: "Are you available right now?",
        a: "Usually 4 to 8 weeks out. I take on two or three programmes at a time, max. If you have a hard deadline I can't meet, I'll tell you on the first call and either point you to someone else or we plan for the next window.",
      },
      {
        q: "How do you charge?",
        a: "Day rate or fixed-fee programme. Day rate for advisory and diagnostics. Fixed-fee for delivery work where the scope is clear. Numbers depend on the engagement. We discuss it on the first call. No surprises in writing later.",
      },
      {
        q: "Do you replace my SI partner or work alongside them?",
        a: "Either. Most often I sit on the client side as Programme Director and hold the SI accountable. Sometimes I replace a struggling SI mid-stream. Sometimes I'm there to make sure the SI doesn't oversell what they can deliver. Depends on what's already in place.",
      },
      {
        q: "Will you sign an NDA?",
        a: "Yes. Standard practice on day one. I work with regulated entities and government clients regularly. Confidentiality isn't a line item, it's the default.",
      },
      {
        q: "How is this different from McKinsey, BCG, or the Big 4?",
        a: "I'm one person, not a pyramid. The senior partner you meet is the senior partner who runs your programme. I have CIMA and AICPA, so I read your finances the same way your CFO does. And I've actually delivered the systems, not just produced slide decks about them. Big firms have their place. For ERP and AI delivery, you usually want the human who's done it before.",
      },
      {
        q: "Why personal brand and not a firm?",
        a: "I run Quantinoid LLC as the trading entity. The personal brand is intentional. My value is judgement and direct involvement, not a logo on a deck. If you hire a firm, you get whoever they assign. If you hire me, you get me.",
      },
    ],
  },
  ctaBanner: {
    eyebrow: "READY WHEN YOU ARE",
    h2: "Your next programme starts with a conversation.",
    body:
      "30 minutes. No sales pitch. Tell me what's going on with your ERP or AI programme. I'll tell you straight if I can help.",
    primaryCta: "Book a 30-min call ↗",
    secondaryCta: "Email me directly",
  },
  category: {
    startHere: "Start here",
    viewAllPrefix: "View all",
    articleSingular: "article",
    articlePlural: "articles",
    browseByTopicEyebrow: "[ Browse by topic ]",
    browseByTopicH2Lead: "Find what matters to you.",
    browseByTopicH2Emphasis: "Pick your topic.",
    browseByTopicIntro:
      "Every article is tagged by subject. Start where your problem is.",
    featuredEyebrow: "[ Featured insights ]",
    featuredH2Lead: "Reads worth your time.",
    featuredH2Emphasis: "Start with these.",
    featuredIntro:
      "The guides I wish existed when I started. Drawn from 25 years of ERP delivery.",
    latestEyebrow: "[ Latest articles ]",
    latestH2Lead: "The full archive.",
    latestH2Emphasis: "Field notes, not theory.",
    latestIntro:
      "Every article in this category. Written from delivery experience, not vendor decks.",
    aboutStripBio:
      "Senior ERP and AI advisor. 25 years delivering for EDGE Group, Etihad Airways, ADNOC, PIF entities, and the UAE Government. CIMA, AICPA, Masters in Accounting.",
    aboutStripCredentialBoardLevel: "Board-level perspective",
    aboutStripCredentialIndependent: "Independent advice",
    aboutStripCredentialEnterprise: "Enterprise delivery experience",
    fullBioLink: "Full bio →",
    categoryKicker: "Category",
    badgeSeniorAdvisory: "Senior advisory",
    badgeFieldExperience: "25 years field experience",
    defaultHeroTagline: "Practical. Not theoretical.",
  },
  tag: {
    tagKicker: "Tag",
    badgeFieldExperience: "25 years field experience",
    emptyStateEyebrow: "[ No articles yet ]",
    emptyStateTitlePrefix: "Nothing tagged",
    emptyStateTitleSuffix: "yet.",
    emptyStateBody:
      "I haven't published anything under this tag yet. Browse another topic below, or check the full archive.",
    featuredEyebrow: "[ Featured insights ]",
    featuredH2Lead: "Reads worth your time.",
    featuredH2Emphasis: "Start with these.",
    featuredIntro:
      "The pieces in this tag I send to clients most often.",
    moreEyebrow: "[ More on this tag ]",
    moreH2Lead: "The full archive.",
    moreH2Emphasis: "Field notes, not theory.",
    moreIntroPrefix: "Every article tagged",
    otherTagsEyebrow: "[ Other tags ]",
    otherTagsH2: "Pick another angle.",
  },
  post: {
    contentsLabel: "Contents",
    continueReadingLabel: "Continue reading",
    commandCentreKicker: "Built by Noel",
    commandCentreDescription:
      "Executive visibility, risk posture, and decision governance for ERP and SAP programmes. See where delivery is actually bleeding — before it hits the steering committee.",
    commandCentreCta: "Try Command Centre free",
    erpcvKicker: "Tool · Free to start",
    erpcvTitle: "Build a professional ERP CV in minutes",
    erpcvDescription:
      "Turn years of SAP, Oracle, and Microsoft programme work into a polished CV structured by role, modules, and outcomes. Used by senior ERP consultants across the Middle East, Europe, and North America.",
    erpcvCta: "Generate your ERP CV",
  },
  card: {
    readArticle: "Read article",
    minRead: "min read",
  },
  breadcrumb: {
    home: "Home",
  },
  article: {
    updatedLabel: "Updated ",
    reviewedLabel: "Reviewed ",
    minRead: "min read",
    keyTakeawaysHeading: "Key takeaways",
    writtenByLabel: "Written by",
    aboutNoelLink: "About Noel",
    linkedinLink: "LinkedIn",
    youtubeLink: "YouTube",
    primaryCtaBookCall: "Book a 30-min call",
    secondaryCtaCaseStudies: "See case studies",
    relatedReadingDefault: "Related reading",
    moreFromArchive: "More from the archive",
    browseAllLink: "Browse all",
    tableOfContentsAria: "Table of contents",
    tableOfContentsHeadingLead: "Table of",
    tableOfContentsHeadingEmphasis: "contents",
    ctaWorkingOnSomething: "Working on something similar?",
    ctaWorkingBody:
      "If this article touched on a programme you are live in right now, a 30-minute conversation usually gets further than another week of internal analysis.",
    ctaPrimary: "Talk about your project",
    ctaSecondary: "See how I help",
    nextStepEyebrow: "Next step",
    authorBio:
      "25 years across SAP and Oracle ERP programmes in aviation, government, finance, retail, and manufacturing. Finance background. I help leadership teams scope transformations honestly, recover programmes in trouble, and build systems that survive their first year in production.",
  },
  caseStudy: {
    backToAll: "← All case studies",
    metaClient: "Client",
    metaIndustry: "Industry",
    metaRegion: "Region",
    metaDuration: "Duration",
    metaRole: "My role",
    featuredEyebrow: "[ Featured case study ]",
    readFullCaseStudyCta: "Read the full case study",
    readTheCaseAffordance: "Read the case",
    portfolioEyebrow: "[ Hand-picked ]",
    portfolioH2Lead: "Programmes that show the range.",
    portfolioH2Emphasis: "Different industries, same playbook.",
    archiveEyebrow: "[ The archive ]",
    archiveH2Lead: "Everything else.",
    archiveH2Emphasis: "Filter to your situation.",
    methodologyEyebrow: "[ How I write these ]",
    methodologyH2Lead: "Full numbers.",
    methodologyH2Emphasis: "Anonymous where it matters.",
    methodologyIntro:
      "TODO: Pass 2 — pull intro paragraph from CaseStudyMethodology.tsx.",
    ruleLabel: "Rule",
    relatedEyebrow: "[ Other programmes ]",
    relatedH2Lead: "Different industries.",
    relatedH2Emphasis: "Same playbook.",
  },
  filters: {
    closeFiltersAria: "Close filters",
    filtersHeading: "Filters",
    industryLabel: "Industry",
    serviceLabel: "Service",
    regionLabel: "Region",
    clearAll: "Clear all",
    showResults: "Show results",
    allChip: "All",
    sortLabel: "Sort",
    sortAria: "Sort case studies",
    sortRecent: "Recent",
    sortIndustry: "Industry",
    sortRegion: "Region",
    removeFilterPrefix: "Remove",
    removeFilterSuffix: "filter",
  },
  books: {
    pageMetaTitle: "Books by Noel D'Costa | SAP, ERP and Enterprise AI",
    pageMetaDescription:
      "Practical books for SAP consultants, CIOs, CFOs, and ERP programme leaders covering SAP careers, enterprise AI, autonomous agents, and the SAP career playbook for the AI era.",
    heroEyebrow: "[ 01 · Books ]",
    heroH1:
      "Books for teams building, fixing, or surviving ERP and AI programmes.",
    heroIntro:
      "I write for SAP consultants, CIOs, CFOs, and programme leaders who need clear answers. The stuff I wish more teams knew before they spent millions getting it wrong.",
    heroBrowseFreeCta: "Browse free books",
    heroBrowsePaidCta: "Browse paid books",
    heroCredentials:
      "25 years in ERP · CIMA & AICPA · $700M+ delivered",
    pressEyebrow: "Writing and commentary featured in",
    freeBooksEyebrow: "[ 02 · Free books ]",
    freeBooksHeading: "Free reading. Sent by email.",
    freeBooksIntro:
      "Three field guides from active SAP and AI work. Drop an email, the PDF arrives.",
    paidBooksEyebrow: "[ 03 · Paid books ]",
    paidBooksHeading: "The deep one. Paid.",
    paidBooksIntro:
      "Practical execution, not theory. $12.99 ebook, ships the day you buy.",
  },
  bookCard: {
    paidBadge: "Paid",
    freeBadge: "Free",
    getTheBookCta: "Get the book",
  },
  leadCapture: {
    errorEnterName: "Please enter your name.",
    errorValidEmail: "Please enter a valid email address.",
    errorDataConsent: "Please tick the data-processing consent to continue.",
    errorAcceptTerms: "Please accept the Terms of Use to continue.",
    errorGeneric: "Something went wrong. Please try again.",
    errorNetwork: "Network error. Please try again.",
    closeAria: "Close",
    paidSuccessHeading: "We have your details.",
    paidSuccessBody:
      "We have your details and will email the download link after payment.",
    freeSuccessHeading: "Sent. Check your inbox.",
    freeSuccessBodyPrefix: "The download link for",
    freeSuccessBodySuffix: "is on its way.",
    downloadCta: "Download now",
    requestingEyebrow: "Requesting",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    dataConsentParagraph: "TODO: Pass 2 — paragraph copy",
    privacyPolicyLinkLabel: "Privacy Policy",
    termsAcceptParagraph: "TODO: Pass 2 — paragraph copy",
    termsOfUseLinkLabel: "Terms of Use",
    marketingOptIn: "TODO: Pass 2 — marketing opt-in paragraph",
    submitSending: "Sending…",
    submitContinueCheckout: "Continue to checkout",
    submitSendBook: "Send me the book",
    ebookSuffix: "ebook",
  },
  tool: {
    breadcrumbToolsLabel: "Tools",
    freeToolEyebrow: "[ Free Tool ]",
    formGenerateDefault: "Generate",
    formGenerating: "Generating…",
    formErrorNoResponse: "No response stream",
    formErrorNetwork: "Network error",
    formErrorRequired: "This field is required",
    formErrorSelect: "Please select an option",
    formSelectPlaceholder: "Select…",
    formTagsHelper: "Separate multiple values with commas.",
    formYesCheckbox: "Yes",
    outputResultHeading: "Result",
    outputCopyMarkdown: "Copy as markdown",
    outputStartOver: "Start over",
    moduleSelectedSuffix: "selected",
    moduleSearchPlaceholder:
      "Search modules (e.g. Treasury, Payroll, EWM, Group Reporting)…",
    moduleAddCoreFinanceTitle:
      "Add the core Finance modules most ERPs start with",
    moduleAddCoreFinanceLabel: "+ Add core finance",
    moduleClear: "Clear",
  },
  calculator: {
    // Wizard chrome.
    wizardStepIndicatorAria: "Calculator steps",
    wizardNavBack: "← Back",
    wizardNavContinue: "Continue →",
    wizardNavCalculate: "Calculate →",
    wizardStepOfLabel: "Step {step} of {total}",
    wizardToggleLiveAria: "Toggle live estimate",
    wizardLiveEstimateLabel: "Live estimate",
    wizardLiveEstimatePrefix: "Live estimate:",
    wizardLiveEstimateMetricsSuffix: "{months}m · {complexity}/100 complexity",

    // Disclaimer banner.
    disclaimerPrefix: "Directional estimate only.",
    disclaimerBody:
      "This tool produces budget ranges based on multiplier-based assumptions, not vendor quotes. Use it to frame early business-case conversations. Engage your SI and software vendor for programme-specific pricing before committing budget.",

    // Step labels.
    stepCompanyLabel: "Company",
    stepScopeLabel: "Scope",
    stepCountriesLabel: "Countries",
    stepDeliveryLabel: "Delivery",
    stepFinancialsLabel: "Financials",

    // Section titles.
    section: {
      companyProfile: "Company profile",
      programScope: "Program scope",
      complexityLevels: "Complexity levels",
      complexityIntro:
        "These four axes are the biggest cost drivers after module count. Be honest — under-scoping complexity is the most common cause of overruns.",
      countryRollout: "Country rollout",
      deliveryModel: "Delivery model",
      financialAssumptions: "Financial assumptions",
    },

    presetEyebrow: "Load a preset scenario",

    // Modules.
    modules: {
      categoryCore: "Core",
      categoryOperations: "Operations",
      categoryExtended: "Extended",
      finance: "Finance & Accounting",
      procurement: "Procurement",
      sales: "Sales & Distribution",
      hr: "Human Resources",
      payroll: "Payroll",
      manufacturing: "Manufacturing / <noTranslate>PP</noTranslate>",
      supplyChain: "Supply Chain",
      warehouse: "Warehouse Management",
      quality: "Quality Management",
      projectSystems: "Project Systems",
      crm: "<noTranslate>CRM</noTranslate>",
      analytics: "Analytics & <noTranslate>BI</noTranslate>",
      epm: "<noTranslate>EPM</noTranslate> / Advanced Finance",
    },

    // Chart category labels.
    chart: {
      software: "Software",
      siServices: "<noTranslate>SI</noTranslate> Services",
      internalTeam: "Internal Team",
      dataMigration: "Data Migration",
      integration: "Integration",
      changeAndTraining: "Change & Training",
      testingAndCutover: "Testing & Cutover",
      infrastructure: "Infrastructure",
      localization: "Localization",
      pmo: "<noTranslate>PMO</noTranslate> & Governance",
      contingency: "Contingency",
    },

    // Step 1.
    step1: {
      companyNameLabel: "Company name",
      companyNameOptional: "(optional)",
      companyNamePlaceholder: "e.g. Acme Industries",
      revenueLabel: "Annual revenue",
      revenueHint:
        "Used to calculate cost as % of revenue — a common board-level metric.",
      revenueUnder10m: "Under $10M",
      revenue10m50m: "$10M – $50M",
      revenue50m250m: "$50M – $250M",
      revenue250m1b: "$250M – $1B",
      revenue1b5b: "$1B – $5B",
      revenueOver5b: "Over $5B",
      employeesLabel: "Total employees",
      employeesUnder100: "Under 100",
      employees100to500: "100 – 500",
      employees500to1000: "500 – 1,000",
      employees1000to3000: "1,000 – 3,000",
      employees3000to10000: "3,000 – 10,000",
      employeesOver10000: "10,000+",
      userCountLabel: "ERP user count",
      userCountHint: "Named users who will access the system.",
      userCountPlaceholder: "e.g. 250",
      legalEntitiesLabel: "Legal entities",
      legalEntitiesHint: "Separate statutory companies, subsidiaries, or JVs.",
      businessUnitsLabel: "Business units",
      businessUnitsHint:
        "Divisions or segments needing separate cost centre / P&L views.",
      industryLabel: "Industry",
      industryManufacturing: "Manufacturing",
      industryRetail: "Retail & Distribution",
      industryFinancial: "Financial Services",
      industryAviation: "Aviation & Transport",
      industryGovernment: "Government & Public Sector",
      industryUtilities: "Utilities & Energy",
      industryOilGas: "Oil & Gas",
      industryHealthcare: "Healthcare",
      industryTelecom: "Telecom",
      industryConstruction: "Construction & Real Estate",
      industryProfessional: "Professional Services",
      industryOther: "Other",
      maturityLabel: "Current ERP maturity",
      maturityHint:
        "Starting from spreadsheets increases data migration effort significantly.",
      maturitySpreadsheetsLabel: "Spreadsheets",
      maturitySpreadsheetsDetail:
        "No ERP. Data in Excel / Access.",
      maturityLegacyLabel: "Legacy ERP",
      maturityLegacyDetail:
        "<noTranslate>ECC</noTranslate>, <noTranslate>EBS R12</noTranslate>, <noTranslate>Axapta</noTranslate>, etc.",
      maturityMixedLabel: "Mixed landscape",
      maturityMixedDetail: "Multiple systems in parallel.",
      maturityModernLabel: "Modern cloud ERP",
      maturityModernDetail:
        "<noTranslate>S/4HANA</noTranslate>, <noTranslate>D365</noTranslate>, <noTranslate>Fusion</noTranslate>, etc.",
      implTypeLabel: "Implementation type",
      implTypeFirstLabel: "First ERP",
      implTypeFirstDetail: "No ERP in place.",
      implTypeReimplLabel: "Reimplementation",
      implTypeReimplDetail: "Replace existing ERP.",
      implTypeConsolLabel: "Consolidation",
      implTypeConsolDetail: "Merge multiple ERPs.",
      implTypeCarveLabel: "Carve-out",
      implTypeCarveDetail: "Separate a division.",
      implTypePostMergerLabel: "Post-merger",
      implTypePostMergerDetail: "Harmonise after M&A.",
    },

    // Step 2.
    step2: {
      erpApproachLabel: "ERP approach",
      erpApproachSapLabel: "<noTranslate>SAP</noTranslate>",
      erpApproachSapDetail:
        "<noTranslate>S/4HANA</noTranslate> or <noTranslate>RISE</noTranslate>/<noTranslate>GROW</noTranslate>",
      erpApproachOracleLabel: "<noTranslate>Oracle</noTranslate>",
      erpApproachOracleDetail:
        "<noTranslate>Fusion Cloud</noTranslate> / <noTranslate>EBS</noTranslate>",
      erpApproachMicrosoftLabel: "<noTranslate>Microsoft</noTranslate>",
      erpApproachMicrosoftDetail: "<noTranslate>Dynamics 365</noTranslate>",
      erpApproachInforLabel: "<noTranslate>Infor</noTranslate>",
      erpApproachInforDetail:
        "<noTranslate>CloudSuite</noTranslate> / <noTranslate>M3</noTranslate>",
      erpApproachOtherLabel: "Other",
      erpApproachOtherDetail:
        "<noTranslate>IFS</noTranslate>, <noTranslate>NetSuite</noTranslate>, etc.",
      erpApproachAgnosticLabel: "Not decided",
      erpApproachAgnosticDetail: "Evaluating options",
      deploymentLabel: "Deployment model",
      deploymentHint:
        "Cloud SaaS typically has lower upfront cost but higher ongoing fees. On-premise flips that ratio over 5+ years.",
      deploymentCloudLabel: "Cloud SaaS",
      deploymentCloudDetail: "Multi-tenant. Low infra.",
      deploymentPrivateLabel: "Private cloud",
      deploymentPrivateDetail: "Dedicated, managed cloud.",
      deploymentOnPremLabel: "On-premise",
      deploymentOnPremDetail: "Own data centre.",
      deploymentHybridLabel: "Hybrid",
      deploymentHybridDetail: "Mix of above.",
      modulesLabel: "Modules in scope",
      modulesHint:
        "Select all modules you expect to implement. More modules = longer timeline and higher cost, but not linearly.",
      customizationLevelLabel: "Custom development",
      customizationLevelHint:
        "Low = standard config only. High = significant <noTranslate>ABAP</noTranslate> / extensions / custom <noTranslate>Fiori</noTranslate>.",
      integrationLabel: "Integration complexity",
      integrationHint:
        "Low = few simple integrations. High = 20+ interfaces, legacy systems, B2B partners.",
      dataMigrationLabel: "Data migration complexity",
      dataMigrationHint:
        "Low = clean master data from one source. High = multiple legacy systems, poor data quality.",
      reportingLabel: "Reporting & compliance complexity",
      reportingHint:
        "Low = standard reports suffice. High = complex statutory reporting, multi-GAAP, group consolidation.",
      complexityLow: "Low",
      complexityLowDetail: "Standard scope",
      complexityMedium: "Medium",
      complexityMediumDetail: "Some deviations",
      complexityHigh: "High",
      complexityHighDetail: "Significant complexity",
      timelineLabel: "Target go-live timeline",
      timelineHint:
        "This is your target — the calculator will tell you if it's realistic given your scope.",
      timeline6m: "6 months",
      timeline9m: "9 months",
      timeline12m: "12 months",
      timeline15m: "15 months",
      timeline18m: "18 months",
      timeline24m: "24 months",
      timeline30m: "30 months",
      timeline36m: "36 months",
    },

    // Step 3.
    step3: {
      hqCountryLabel: "Headquarters country",
      hqCountryAria: "HQ country",
      hqCountryHint:
        "The HQ country is your primary go-live location (wave 1). Add rollout countries below.",
      additionalCountries: "Additional rollout countries",
      addCountryCta: "+ Add country",
      emptyTitle: "Single-country rollout",
      emptyHint: "Add countries for a multi-country estimate.",
      multiDetectedTitle: "Multi-country rollout detected",
      multiDetectedBody:
        "Country cost indices, localisation complexity, and language requirements are all factored into the estimate. Consider wave sequencing — the most complex countries should not all be in wave 1.",
      rowCountryAria: "Country",
      rowRemoveAria: "Remove country",
      rowUsersLabel: "Users",
      rowEntitiesLabel: "Entities",
      rowLocalComplexityLabel: "Local complexity",
      rowWaveLabel: "Wave",
      rowComplexityLow: "Low",
      rowComplexityMedium: "Medium",
      rowComplexityHigh: "High",
    },

    // Step 4.
    step4: {
      siTierLabel: "SI partner tier",
      siTierHint:
        "Day rate is not the biggest variable — team quality and methodology are. But partner tier has a direct multiplier on SI fees.",
      siTierBoutiqueLabel: "Boutique <noTranslate>SI</noTranslate>",
      siTierBoutiqueDetail:
        "Specialised, lower day rate, less process overhead.",
      siTierMidLabel: "Mid-tier <noTranslate>SI</noTranslate>",
      siTierMidDetail: "Good depth, reasonable structure.",
      siTierGlobalLabel: "Global <noTranslate>SI</noTranslate>",
      siTierGlobalDetail:
        "Big 4 / Tier 1. Highest rate, maximum coverage.",
      deliveryLabel: "Delivery model",
      deliveryHint:
        "Offshore delivery significantly reduces day rates but adds coordination overhead. Not recommended for high customisation or complex integrations.",
      deliveryOnshoreLabel: "Onshore",
      deliveryOnshoreDetail: "All consultants co-located.",
      deliveryOffshoreLabel: "Offshore",
      deliveryOffshoreDetail: "Primarily low-cost delivery centre.",
      deliveryHybridLabel: "Hybrid",
      deliveryHybridDetail: "Mix of onshore & offshore.",
      internalTeamLabel: "Internal project team size",
      internalTeamHint:
        "Number of full-time internal staff allocated to the programme (not the SI team). Include project managers, process leads, data owners, and change champions.",
      internalTeamPlaceholder: "e.g. 10",
      changeMgmtLabel: "Change management intensity",
      changeMgmtHint:
        "Post-go-live adoption failure is the most common cause of extended hypercare. Under-investing in change management consistently costs more than the investment would have.",
      changeMgmtLightLabel: "Light",
      changeMgmtLightDetail: "Comms and basic training.",
      changeMgmtStandardLabel: "Standard",
      changeMgmtStandardDetail:
        "Change network, role-based training, exec sponsorship.",
      changeMgmtHeavyLabel: "Heavy",
      changeMgmtHeavyDetail:
        "Full <noTranslate>OCM</noTranslate>: impact assessment, readiness surveys, change agents.",
      trainingLabel: "Training model",
      trainingT3Label: "Train-the-trainer",
      trainingT3Detail: "Lowest cost. Internal trainers cascade.",
      trainingRoleLabel: "Role-based",
      trainingRoleDetail: "All users trained by role.",
      trainingIntensiveLabel: "Intensive",
      trainingIntensiveDetail:
        "Multiple sessions, simulations, job aids.",
    },

    // Step 5.
    step5: {
      horizonLabel: "Planning horizon",
      horizonHint:
        "Board-level ERP business cases typically use a 5-year TCO horizon. For budget approval, 3 years is common.",
      horizon1Label: "1 year",
      horizon1Detail: "Year 1 only.",
      horizon3Label: "3 years",
      horizon3Detail: "Typical TCO view.",
      horizon5Label: "5 years",
      horizon5Detail: "Full payback horizon.",
      contingencyLabel: "Contingency budget",
      contingencyHint:
        "15–20% is standard for well-managed programmes. Under 10% is high risk. Over 25% may indicate scope uncertainty that should be resolved before budgeting.",
      inflationLabel: "Annual inflation assumption",
      inflationHint:
        "Applied to ongoing support costs in years 2+. Typical range: 2–4% in stable markets, higher in emerging markets.",
      discountLabel: "Discount rate (for NPV)",
      discountHint:
        "Used if you want to calculate net present value of the programme. Typical corporate hurdle rate: 8–12%.",
      reportingCurrencyLabel: "Reporting currency",
      reportingCurrencyHint:
        "The primary model calculates in USD. Country-level results also show local currency amounts. Exchange rates used are approximate fixed rates from the config.",
      currencyUsd: "<noTranslate>USD</noTranslate> — US Dollar",
      currencyEur: "<noTranslate>EUR</noTranslate> — Euro",
      currencyGbp: "<noTranslate>GBP</noTranslate> — British Pound",
      currencyAed: "<noTranslate>AED</noTranslate> — UAE Dirham",
      currencySar: "<noTranslate>SAR</noTranslate> — Saudi Riyal",
      currencyInr: "<noTranslate>INR</noTranslate> — Indian Rupee",
      currencyAud: "<noTranslate>AUD</noTranslate> — Australian Dollar",
      currencyCad: "<noTranslate>CAD</noTranslate> — Canadian Dollar",
      currencySgd: "<noTranslate>SGD</noTranslate> — Singapore Dollar",
    },

    // Exec summary.
    exec: {
      estimatedCostEyebrow: "Estimated programme cost",
      expectedPrefix: "Expected:",
      year1TotalSuffix: "· Year 1 total",
      complexityEyebrow: "Complexity",
      scoreSuffix: "/100",
      statTimeline: "Timeline (expected)",
      statTimelineSubMonths: "{months} months",
      statTimelineSubRange: "{min}–{max} range",
      statCostPerUser: "Cost per user",
      statPctOfRevenue: "% of revenue",
      statPctOfRevenueSub: "year 1 programme cost",
      statCountryScope: "Country scope",
      statCountryScopeSingle: "{n} country",
      statCountryScopePlural: "{n} countries",
      multiCountryLow: "Single country",
      multiCountryModerate: "2–3 countries",
      multiCountryHigh: "4–7 countries",
      multiCountryVeryHigh: "8+ countries",
    },

    // CFO view.
    cfo: {
      tileY1: "Year 1 total",
      tileTco3yr: "3-year TCO",
      tileTco5yr: "5-year TCO",
      rangeLabel: "Range",
      annualSpendTitle: "Annual spend profile",
      annualSpendNote:
        "Y1 covers implementation plus software. Y2 onward is AMS support plus software subscription. Figures are directional, not contractual.",
      budgetAllocationY1: "Budget allocation, year 1",
      tableCategory: "Category",
      tableLow: "Low",
      tableExpected: "Expected",
      tableHigh: "High",
    },

    // CIO view.
    cio: {
      complexityScoreLabel: "Complexity score: {score}/100",
      interpretationLow: "Manageable. Standard delivery model should work.",
      interpretationMedium:
        "Moderate. Requires experienced SI and clear programme governance.",
      interpretationHigh:
        "High. Needs dedicated programme management and phased delivery.",
      timelinePrefix: "Timeline:",
      timelineRangeSuffix: "{min}–{max} months",
      timelineExpectedSuffix: "(expected {n} months)",
      riskIndicatorsHeading: "Workstream risk indicators",
      deliveryPhasesHeading: "Estimated delivery phases",
      keyDriversHeading: "Key delivery drivers",
      riskLevelLow: "Low",
      riskLevelMedium: "Medium",
      riskLevelHigh: "High",
      riskDataMigration: "Data migration",
      riskIntegration: "Integration",
      riskChangeManagement: "Change management",
      riskLocalisation: "Localisation",
      riskCustomDevelopment: "Custom development",
      riskTesting: "Testing",
      driverWideModule:
        "Wide module scope (6+ modules) increases test surface",
      driverHighIntegration:
        "High integration complexity — legacy system audit recommended",
      driverHighDataComplexity:
        "High data complexity — data profiling should start in phase 1",
      driverHighCustomisation:
        "High customisation — clean-core strategy review advised",
      driverManyCountries:
        "{n} countries — wave planning and central governance are critical",
      driverSpreadsheetsStart:
        "Starting from spreadsheets — process definition effort underestimated in most programmes",
      driverPostMerger:
        "Post-merger scope — entity harmonisation is typically the longest workstream",
    },

    // Country table.
    countryTable: {
      country: "Country",
      users: "Users",
      entities: "Entities",
      wave: "Wave",
      localComplexity: "Local complexity",
      costShare: "Cost share",
      expectedCost: "Expected cost",
    },

    // Assumptions panel.
    assumptions: {
      introBody:
        "All values below are the directional assumptions used in this estimate. They are calibrated to typical market rates — not specific vendor quotes. Edit the assumptions source file to adjust the model.",
      softwareLabel: "Software cost / user / year",
      softwareValueTemplate: "~{rate} ({approach}, {deployment})",
      siBaseLabel: "SI base rate / user",
      siBaseValueTemplate: "~{rate} ({tier}, {model})",
      contingencyLabel: "Contingency",
      contingencyValueTemplate: "{pct}%",
      totalModulesLabel: "Total modules in scope",
      countriesLabel: "Countries",
      horizonLabel: "Planning horizon",
      horizonValueTemplate: "{n} years",
      inflationLabel: "Inflation assumption",
      inflationValueTemplate: "{pct}%",
      internalTeamRateLabel: "Internal team rate",
      internalTeamRateValueTemplate: "${rate}/day (fully loaded)",
      pmoLabel: "PMO / governance",
      pmoValue: "7% of pre-contingency total",
      amsLabel: "Ongoing AMS support",
      amsValue: "15% of implementation cost in Y2, 12% Y3+",
    },

    // Scenario compare.
    scenario: {
      emptyTitle: "No saved scenarios yet.",
      emptyBody:
        'Run a calculation and click "Save scenario" to compare.',
      removeCta: "Remove",
      statY1: "Year 1",
      statTco3yr: "3-yr TCO",
      statTimeline: "Timeline",
    },

    // Tabs.
    tabs: {
      breakdown: "Cost breakdown",
      cfo: "CFO view",
      cio: "CIO view",
      countries: "Countries",
      scenarios: "Scenarios",
      assumptions: "Assumptions",
    },

    // Actions.
    actions: {
      saveScenario: "Save scenario",
      saveScenarioCountTemplate: "({n}/3)",
      copySummary: "Copy summary",
      printExport: "Print / export",
      startOver: "← Start over",
    },

    // Lib-side strings (Pass 2b-1b).
    warnings: {
      tooManyCountriesShortTimeline: {
        workstream: "Timeline",
        message: "{countries} countries in {months} months is high-risk",
        detail:
          "Multi-country rollouts typically require 18+ months for each wave of 2–3 countries. Compressing this timeline increases cutover risk significantly.",
      },
      highCustomShortTimeline: {
        workstream: "Scope & Customisation",
        message:
          "High customisation with a sub-15-month timeline rarely delivers",
        detail:
          "Extensive custom development requires design, build, unit test, regression, and integration test cycles that don't compress well. Consider phasing customisation into a post-go-live release.",
      },
      lightChangeManyUsers: {
        workstream: "Change Management",
        message: "Light change management for 500+ users is under-resourced",
        detail:
          "Programmes with 500+ users need structured change networks, role-based training, and sustained executive sponsorship. Light-touch approaches typically extend post-go-live stabilisation by 2–3 months.",
      },
      multiCountryPayrollWave1: {
        workstream: "Payroll & HR",
        message:
          "Multi-country payroll in wave 1 adds significant delivery risk",
        detail:
          "Payroll is legally and operationally critical. Implementing it in multiple countries simultaneously in the first wave is a known failure pattern. Phase payroll per country or use local payroll integration in wave 1.",
      },
      spreadsheetsHighIntegration: {
        workstream: "Data & Integration",
        message:
          "High integration complexity from a spreadsheet baseline is high-risk",
        detail:
          "Migrating from spreadsheets while managing complex integrations means building data structures and connecting them simultaneously. Data quality work often takes longer than planned.",
      },
      postMergerShortTimeline: {
        workstream: "Programme Scope",
        message: "Post-merger harmonisation typically requires 24+ months",
        detail:
          "Aligning charts of accounts, legal entity structures, and business processes across merged entities is a significant programme. Sub-24-month targets are achievable but require tightly scoped phases.",
      },
      offshoreHighComplexity: {
        workstream: "Delivery Model",
        message:
          "Offshore delivery works best with well-defined, stable scope",
        detail:
          "High customisation or integration complexity with a fully offshore team increases coordination overhead and rework. Consider a hybrid model with onshore architects and functional leads.",
      },
    },

    // Timeline phase names.
    phases: {
      prepareExplore: "Prepare & explore",
      designBlueprint: "Design & blueprint",
      buildConfigure: "Build & configure",
      test: "Test",
      deployCutover: "Deploy & cutover",
      hypercareStabilise: "Hypercare & stabilise",
    },

    // Preset scenarios (scenarios.ts).
    // Company names ("Orion Manufacturing", "Meridian Capital Group",
    // "Stratton Global Industries") are fictional example labels — kept
    // inline in scenarios.ts as part of the scenario inputs (not in
    // MESSAGES). The translatable parts are the scenario name,
    // description, and badge below.
    presets: {
      midMarketName: "Mid-market single-country rollout",
      midMarketDescription:
        "A 400-person manufacturer moving from legacy ERP to <noTranslate>SAP S/4HANA Cloud</noTranslate>. UK-based, 4 modules, 14-month target.",
      midMarketBadge: "Mid-market",
      regionalName: "Regional 3-country rollout",
      regionalDescription:
        "A financial services group consolidating ERP across UAE, Saudi Arabia, and Qatar on <noTranslate>Oracle Cloud</noTranslate>. Complex tax and reporting scope.",
      regionalBadge: "Regional",
      globalName: "Global 8-country phased rollout",
      globalDescription:
        "A large manufacturing enterprise deploying <noTranslate>SAP S/4HANA</noTranslate> across North America, Europe, Middle East, and APAC in three delivery waves.",
      globalBadge: "Global",
    },

    // Region labels (countries.ts).
    regions: {
      northAmerica: "North America",
      europe: "Europe",
      middleEast: "Middle East",
      middleEastAndAfrica: "Middle East & Africa",
      asiaPacific: "Asia-Pacific",
      africa: "Africa",
      latinAmerica: "Latin America",
    },

    // Enum value humanisation for AssumptionsPanel.
    enumLabels: {
      erpApproach: {
        sap: "<noTranslate>SAP</noTranslate>",
        oracle: "<noTranslate>Oracle</noTranslate>",
        microsoft: "<noTranslate>Microsoft</noTranslate>",
        infor: "<noTranslate>Infor</noTranslate>",
        other: "Other",
        "vendor-agnostic": "Not decided",
      },
      deploymentModel: {
        "cloud-saas": "Cloud SaaS",
        "private-cloud": "Private cloud",
        "on-premise": "On-premise",
        hybrid: "Hybrid",
      },
      siPartnerTier: {
        boutique: "Boutique <noTranslate>SI</noTranslate>",
        "mid-tier": "Mid-tier <noTranslate>SI</noTranslate>",
        "global-si": "Global <noTranslate>SI</noTranslate>",
      },
      deliveryModel: {
        onshore: "Onshore",
        offshore: "Offshore",
        hybrid: "Hybrid",
      },
    },

    // Copy-summary email template.
    email: {
      titlePrefix: "ERP Programme Estimate",
      companyPrefix: "Company:",
      companyDefault: "—",
      erpApproachPrefix: "ERP approach:",
      deploymentLabel: "Deployment:",
      countriesPrefix: "Countries:",
      usersLabel: "Users:",
      modulesPrefix: "Modules:",
      y1EstimatePrefix: "Year 1 estimate:",
      expectedInlineTemplate: "(expected: {value})",
      tco3yrPrefix: "3-year TCO:",
      tco5yrPrefix: "5-year TCO:",
      timelinePrefix: "Implementation timeline:",
      monthsSuffix: "months",
      complexityPrefix: "Complexity score:",
      disclaimerLine:
        "These are directional budget estimates for early business-case planning. Not a vendor quote.",
      generatedPrefix: "Generated:",
    },
  },
  sapCostCalculator: { _todo: "Pass 2: ~40 strings from SapCostClient.tsx" },
  migrationEstimator: { _todo: "Pass 2: ~35 strings from MigrationClient.tsx" },
  jdGenerator: { _todo: "Pass 2: ~50 strings from JdClient.tsx" },
  solutionBuilder: { _todo: "Pass 2: ~80 strings from SolutionClient.tsx" },
  contact: {
    eyebrow: "Get in touch",
    h2Lead: "30 minutes.",
    h2Emphasis: "No sales pitch.",
    body:
      "Pick a slot on my calendar. Tell me what's going on with your ERP or AI programme. I'll tell you straight if I can help.",
    calendlyLoading: "Loading scheduler…",
    calendlyFallbackCta: "Book on Calendly →",
    contactPhoneUae: "Phone UAE",
    contactPhoneUs: "Phone US",
    contactEmail: "Email",
    contactWebsite: "Website",
    contactLinkedin: "LinkedIn",
    contactYoutube: "YouTube",
  },
  privacy: {
    eyebrow: "[ Site · Privacy ]",
    h1: "Privacy",
    intro: "TODO: Pass 2 — privacy page intro paragraph",
    h2WhatICollect: "What I collect",
    bodyWhatICollect: "TODO: Pass 2",
    h2WhyICollect: "Why I collect it",
    bodyWhyICollect: "TODO: Pass 2",
    h2HowLong: "How long it stays",
    bodyHowLong: "TODO: Pass 2",
    h2YourRights: "Your rights",
    bodyYourRights: "TODO: Pass 2",
    h2Cookies: "Cookies and analytics",
    bodyCookies: "TODO: Pass 2",
    seeAlsoLabel: "See also:",
    termsOfUseLink: "Terms of use",
    updatedLabelPrefix: "Updated:",
  },
  terms: { _todo: "Pass 2: full terms page copy" },
  error: {
    notFoundH1: "Page not found",
    notFoundBody:
      "The page you're looking for has moved, been renamed, or never existed. Head back to the homepage and find what you need.",
    backHomeCta: "Back home",
  },
};

// All non-English locales fall back to the English record until the
// translation pipeline populates them. The TypeScript `Record<Locale,
// Messages>` constraint guarantees every locale exists at the top level;
// the deep clones aren't needed because the script overwrites by value.
export const MESSAGES: Record<Locale, Messages> = {
  en: EN,
  ja: EN,
  es: EN,
  fr: EN,
  ru: EN,
  it: EN,
  pt: EN,
  de: EN,
  ar: EN,
  el: EN,
  zh: EN,
  ko: EN,
  hi: EN,
  tr: EN,
  nl: EN,
};
