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
import { arMessages } from "./messages.ar";
import { deMessages } from "./messages.de";
import { elMessages } from "./messages.el";
import { esMessages } from "./messages.es";
import { frMessages } from "./messages.fr";
import { itMessages } from "./messages.it";
import { jaMessages } from "./messages.ja";
import { nlMessages } from "./messages.nl";
import { ptMessages } from "./messages.pt";
import { ruMessages } from "./messages.ru";

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
    primaryCta: string;            // "Book a 30-min call"
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
    fullBioLink: string;           // "Full bio"
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
    backToAll: string;             // "All case studies"
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
  // ToolShell chrome — page-level wrapper around each free-tool route.
  tool: {
    breadcrumbToolsLabel: string;  // "Tools" — breadcrumb segment
    freeToolEyebrow: string;       // "[ Free Tool ]" — hero eyebrow
  };

  // ToolForm.tsx — shared form chrome used by the 3 form-based
  // calculators (SapCost, Migration, Jd). Pass 2b-2a.
  toolForm: {
    generateDefault: string;             // "Generate" — default submit label
    generating: string;                  // "Generating…" — in-flight label
    selectPlaceholder: string;           // "Select…"
    tagsHelper: string;                  // "Separate multiple values with commas."
    tagsPlaceholderDefault: string;      // "Comma-separated values"
    yesCheckbox: string;                 // "Yes"
    errorNoResponse: string;             // "No response stream"
    errorNetwork: string;                // "Network error"
    errorStream: string;                 // "Stream error"
    errorRequired: string;               // "This field is required"
    errorSelect: string;                 // "Please select an option"
    errorRequestFailedTemplate: string;  // "Request failed ({status})"
  };

  // ToolOutput.tsx — shared output panel for streamed markdown results.
  toolOutput: {
    generating: string;                  // "Generating…"
    resultHeading: string;               // "Result"
    copyMarkdown: string;                // "Copy as markdown"
    startOver: string;                   // "Start over"
  };

  // ModulePicker.tsx — 70+ SAP module picker used inside SapCost.
  // Templated strings use {placeholder} tokens resolved at render via
  // interpolate() from useTranslation.ts (Pass 2b-1b pattern).
  modulePicker: {
    selectedCountTemplate: string;       // "{count} selected"
    searchPlaceholder: string;
    addCoreFinanceTitle: string;
    addCoreFinanceLabel: string;         // "+ Add core finance"
    clear: string;
    coreBadge: string;                   // "Core"
    ofTotalTemplate: string;             // "of {total}"
    chipRemoveTitleTemplate: string;     // "Remove {label}"
    categorySelectAllAriaTemplate: string;     // "Select all {label} modules"
    categoryDeselectAllAriaTemplate: string;   // "Deselect all {label} modules"
    categoryAllSelectedTitleTemplate: string;  // "All {total} {label} modules selected · click to clear"
    categorySelectAllTitleTemplate: string;    // "Select all {total} {label} modules"
    searchNoMatchTemplate: string;       // `No modules match "{query}".`
    searchTryShorter: string;
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

  // Pass 2b-2b: 3 form-based calculators built on top of ToolForm.
  // Each namespace pairs formHeading + submitLabel + per-field
  // {label, placeholder} pairs + per-field {options} sub-objects keyed
  // by the enum value used in the component code. The shared form
  // chrome (Select…, errors, tags helper, etc.) lives in toolForm.*
  // from Pass 2b-2a — these namespaces only carry calculator-specific
  // copy.

  sapCostCalculator: {
    formHeading: string;
    submitLabel: string;

    sectorLabel: string;
    sectorOptions: {
      manufacturing: string;
      retail: string;
      financeBanking: string;
      aviationTransport: string;
      governmentPublic: string;
      utilitiesEnergy: string;
      telecom: string;
      healthcare: string;
      oilGas: string;
      constructionRealEstate: string;
      professionalServices: string;
      other: string;
    };

    companySizeLabel: string;
    companySizeOptions: {
      smallUnder250: string;
      midUnder1000: string;
      largeUnder5000: string;
      enterprise5000Plus: string;
    };

    editionLabel: string;
    editionOptions: {
      grow: string;        // "S/4HANA Cloud Public (GROW with SAP)"
      rise: string;        // "S/4HANA Cloud Private (RISE with SAP)"
      s4Onprem: string;
      eccBrownfield: string;
      unsure: string;
    };

    currentSystemLabel: string;
    currentSystemPlaceholder: string;

    modulesLabel: string;

    fioriScopeLabel: string;
    fioriScopeOptions: {
      minimal: string;
      selected: string;
      full: string;
    };

    cleanCoreLabel: string;

    industrySolutionLabel: string;
    industrySolutionPlaceholder: string;

    userCountLabel: string;
    userCountPlaceholder: string;

    regionsLabel: string;
    regionsOptions: {
      uae: string;
      saudiArabia: string;
      gccOther: string;
      unitedKingdom: string;
      europeOther: string;
      northAmerica: string;
      apac: string;
      africa: string;
      latam: string;
    };

    timelineMonthsLabel: string;
    timelineMonthsPlaceholder: string;

    notesLabel: string;
    notesPlaceholder: string;
  };

  migrationEstimator: {
    formHeading: string;
    submitLabel: string;

    sourceLabel: string;
    sourceOptions: {
      sapEcc: string;
      sapS4hana: string;
      oracleEbs: string;
      oracleFusion: string;
      microsoftDynamicsAx: string;
      microsoftDynamics365: string;
      jdEdwards: string;
      peoplesoft: string;
      ifs: string;
      infor: string;
      customLegacy: string;
      other: string;
    };

    sourceVersionLabel: string;
    sourceVersionPlaceholder: string;

    targetLabel: string;
    targetOptions: {
      sapS4hanaCloud: string;
      sapS4hanaOnPrem: string;
      oracleFusionCloud: string;
      microsoftDynamics365: string;
      other: string;
    };

    masterDataRecordsLabel: string;
    masterDataRecordsPlaceholder: string;

    transactionalRecordsLabel: string;
    transactionalRecordsPlaceholder: string;

    customObjectsCountLabel: string;
    customObjectsCountPlaceholder: string;

    historicalYearsLabel: string;
    historicalYearsPlaceholder: string;

    dataQualityLabel: string;
    dataQualityOptions: {
      excellent: string;
      good: string;
      fair: string;
      poor: string;
      unknown: string;
    };

    languagesInScopeLabel: string;
    languagesInScopePlaceholder: string;

    notesLabel: string;
    notesPlaceholder: string;
  };

  jdGenerator: {
    formHeading: string;
    submitLabel: string;

    roleFamilyLabel: string;
    roleFamilyOptions: {
      functionalFiCo: string;
      functionalMmSd: string;
      functionalPpQm: string;
      functionalHcmSuccessfactors: string;
      functionalEwmTm: string;
      technicalAbap: string;
      technicalBasis: string;
      technicalFioriUi5: string;
      technicalIntegrationCpi: string;
      technicalBtpDeveloper: string;
      architectSolution: string;
      architectEnterprise: string;
      programmeManager: string;
      dataMigrationLead: string;
      securityGrc: string;
      other: string;
    };

    roleTitleLabel: string;
    roleTitlePlaceholder: string;

    seniorityLabel: string;
    seniorityOptions: {
      junior: string;
      mid: string;
      senior: string;
      principalArchitect: string;
      manager: string;
      director: string;
    };

    sectorLabel: string;
    sectorOptions: {
      manufacturing: string;
      retail: string;
      financeBanking: string;
      aviationTransport: string;
      governmentPublic: string;
      utilitiesEnergy: string;
      telecom: string;
      healthcare: string;
      oilGas: string;
      constructionRealEstate: string;
      professionalServices: string;
      other: string;
    };

    regionLabel: string;
    regionOptions: {
      uae: string;
      saudiArabia: string;
      gccOther: string;
      unitedKingdom: string;
      europeOther: string;
      northAmerica: string;
      apac: string;
      africa: string;
      latam: string;
    };

    remoteLabel: string;
    remoteOptions: {
      onsite: string;
      hybrid: string;
      remote: string;
    };

    clearanceRequiredLabel: string;

    certificationsLabel: string;
    certificationsPlaceholder: string;

    keyProjectsLabel: string;
    keyProjectsPlaceholder: string;

    notesLabel: string;
    notesPlaceholder: string;
  };
  // SAP module catalogue (Pass 2b-2c). 82 modules + 9 categories.
  // Pairs with src/lib/sap-modules.ts which keeps the structural fields
  // (id, code, category, effortWeight, core) inline as static data; only
  // the user-facing label + description / blurb live here.
  //
  // Module keys MUST match the `id` field in SAP_MODULES (hyphen-cased
  // identifiers like "fi-gl", "co-pa", "re-fx"). Drift between the two
  // surfaces is a bug — the getter falls back to the ID on mismatch.
  //
  // Category keys are the typed SapModuleCategory enum union; the
  // Record<SapModuleCategory, …> shape forces all 9 to be present.
  //
  // <noTranslate> markers wrap proper-noun SAP product names (BTP,
  // Fiori, Ariba, Joule, etc.), SAP module codes that survive verbatim
  // in body copy (FI-GL, EWM, TM, etc. — note: codes also appear in the
  // separate `code` field on SAP_MODULES, which stays as a proper-noun
  // constant), regulatory standards (IFRS 16, ASC 842, ViDA, GDPR), and
  // any acronym that should not be translated (FX, VAT, JVA, RF, etc.).
  sapModules: {
    modules: Record<string, { label: string; description: string }>;
    categories: Record<
      | "finance"
      | "procurement"
      | "supply-chain"
      | "sales-cx"
      | "hcm"
      | "projects"
      | "analytics"
      | "platform"
      | "industry",
      { label: string; blurb: string }
    >;
  };

  // SAP Solution Builder (Pass 2b-2d). Final calculator namespace.
  // Covers SolutionClient chrome + the lib data files
  // (solution-builder/data.ts industries/sizes/phases/team-roles) and
  // the cost taxonomy from solution-builder/engine.ts.
  //
  // Note: the cost-roadmap CATEGORY_LABEL (engine.ts) is intentionally
  // *separate* from sapModules.categories — the picker uses one labelling
  // ("Finance & Controlling") and the cost breakdown uses another
  // ("Finance & Compliance"). Same enum keys, different display strings.
  solutionBuilder: {
    // SolutionClient chrome — selectors, buttons, section headings.
    formHeading: string;
    industryLabel: string;
    industrySelectPlaceholder: string;
    companySizeLabel: string;
    companySizeSelectPlaceholder: string;
    resetCta: string;
    generateRecommendationsCta: string;
    changeIndustryOrSizeCta: string;
    modulesSelectionHeading: string;
    mandatoryModulesTitle: string;
    industryModulesTitle: string;
    recommendedModulesTitle: string;
    moduleSingular: string;
    modulePlural: string;
    generateRoadmapCta: string;
    bestPracticesTitleTemplate: string;        // "Industry best practices: {industry}"

    // Module table (Step 2 / phase modules).
    moduleTableModule: string;
    moduleTableLicense: string;
    moduleTableQuantity: string;
    moduleTableCategory: string;
    moduleTableDescription: string;

    // Roadmap summary cards.
    summaryTotalDuration: string;
    summaryTotalInvestment: string;
    summaryTeamSize: string;
    summaryMonthsTemplate: string;             // "{n} months"
    summaryPeopleTemplate: string;             // "{n} people"

    // Implementation timeline section.
    timelineHeading: string;
    timelineCaptionTemplate: string;           // "Phased delivery sized to {industry} at {size} scale."

    // Cost breakdown section.
    costBreakdownHeading: string;
    costBreakdownCaptionTemplate: string;      // "Where the {total} programme cost lands by category. Directional, not a vendor quote."

    // Implementation team section.
    implementationTeamHeading: string;
    implementationTeamCaptionTemplate: string;

    // Team table headers + footer.
    teamTableRole: string;
    teamTableFunction: string;
    teamTableCount: string;
    teamTableDayRate: string;                  // "Day rate (USD)"
    teamTableTotal: string;

    // Phase card chrome.
    phaseFocusPrefix: string;                  // "Focus:"
    phaseModulesCaption: string;               // "Modules in this phase"
    phaseMonthsTemplate: string;               // "{n} months"

    // Action buttons (final step).
    printPdfCta: string;
    startOverCta: string;

    // INDUSTRIES — 14 entries. Keys match the IndustryId union literal.
    industries: Record<
      | "manufacturing"
      | "retail"
      | "healthcare"
      | "financial-services"
      | "public-sector"
      | "utilities"
      | "consumer-goods"
      | "professional-services"
      | "telecommunications"
      | "oil-gas"
      | "education"
      | "hospitality"
      | "logistics-transport"
      | "construction-real-estate",
      { label: string; bestPractices: string; phasingNarrative: string }
    >;

    // COMPANY_SIZES — labels only. The numeric quantity bands
    // ("25-50", "1,000-5,000") stay inline in data.ts because they are
    // pure numeric ranges; locale-aware thousand-separator formatting is
    // deferred to a post-launch concern (the bands are rendered into the
    // module table and currently use comma separators globally).
    companySizes: Record<
      "small" | "mid" | "large" | "enterprise",
      { label: string }
    >;

    // PHASES — 3 entries. Each has label + description + array of
    // focusArea strings (variable length 4-5 per phase).
    phases: Record<
      "phase1" | "phase2" | "phase3",
      { label: string; description: string; focusAreas: string[] }
    >;

    // TEAM_ROLES — 13 entries. Keyed by kebab-case role identifier.
    // dayRateBand stays inline in data.ts (numeric currency formatting).
    teamRoles: Record<
      | "programme-director"
      | "programme-manager"
      | "solution-architect"
      | "functional-lead-finance"
      | "functional-lead-supply-chain"
      | "functional-lead-hr"
      | "functional-consultants"
      | "technical-abap-developer"
      | "basis-btp-admin"
      | "integration-cpi-consultant"
      | "data-migration-lead"
      | "change-manager"
      | "test-lead",
      { role: string; function: string }
    >;

    // License type labels returned by licenseTypeFor() in data.ts.
    licenseTypes: {
      userBased: string;
      employeeBased: string;
      transactionBased: string;
    };

    // engine.ts CATEGORY_LABEL — cost-roadmap category names (DIFFERENT
    // copy from sapModules.categories).
    costRoadmapCategories: Record<
      | "finance"
      | "procurement"
      | "supply-chain"
      | "sales-cx"
      | "hcm"
      | "projects"
      | "analytics"
      | "platform"
      | "industry",
      string
    >;

    // engine.ts cost share categories + descriptions. The keys are the
    // 9 cost lines in costSharesPct; pairs label + description as
    // displayed in the cost breakdown table.
    costCategories: {
      softwareLicensing: { label: string; description: string };
      implementationServices: { label: string; description: string };
      internalTeamTime: { label: string; description: string };
      dataMigration: { label: string; description: string };
      customisationDevelopment: { label: string; description: string };
      trainingChangeManagement: { label: string; description: string };
      infrastructureHosting: { label: string; description: string };
      postGoliveSupport: { label: string; description: string };
      contingency: { label: string; description: string };
    };
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

export const EN: Messages = {
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
      cta: "Talk about your project",
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
      cta: "Check out my tools",
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
    cred3Sub: "<noTranslate>Activate</noTranslate> · <noTranslate>SAFe</noTranslate> · <noTranslate>ITIL</noTranslate>",
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
    primaryCta: "Book a 30-min call",
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
    fullBioLink: "Full bio",
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
    backToAll: "All case studies",
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
  },

  // Pass 2b-2a.
  toolForm: {
    generateDefault: "Generate",
    generating: "Generating…",
    selectPlaceholder: "Select…",
    tagsHelper: "Separate multiple values with commas.",
    tagsPlaceholderDefault: "Comma-separated values",
    yesCheckbox: "Yes",
    errorNoResponse: "No response stream",
    errorNetwork: "Network error",
    errorStream: "Stream error",
    errorRequired: "This field is required",
    errorSelect: "Please select an option",
    errorRequestFailedTemplate: "Request failed ({status})",
  },
  toolOutput: {
    generating: "Generating…",
    resultHeading: "Result",
    copyMarkdown: "Copy as markdown",
    startOver: "Start over",
  },
  modulePicker: {
    selectedCountTemplate: "{count} selected",
    searchPlaceholder:
      "Search modules (e.g. <noTranslate>Treasury</noTranslate>, <noTranslate>Payroll</noTranslate>, <noTranslate>EWM</noTranslate>, <noTranslate>Group Reporting</noTranslate>)…",
    addCoreFinanceTitle: "Add the core Finance modules most ERPs start with",
    addCoreFinanceLabel: "+ Add core finance",
    clear: "Clear",
    coreBadge: "Core",
    ofTotalTemplate: "of {total}",
    chipRemoveTitleTemplate: "Remove {label}",
    categorySelectAllAriaTemplate: "Select all {label} modules",
    categoryDeselectAllAriaTemplate: "Deselect all {label} modules",
    categoryAllSelectedTitleTemplate:
      "All {total} {label} modules selected · click to clear",
    categorySelectAllTitleTemplate: "Select all {total} {label} modules",
    searchNoMatchTemplate: 'No modules match "{query}".',
    searchTryShorter:
      'Try shorter terms like "<noTranslate>treasury</noTranslate>", "<noTranslate>payroll</noTranslate>", "<noTranslate>ariba</noTranslate>", or "<noTranslate>ewm</noTranslate>".',
  },
  calculator: {
    // Wizard chrome.
    wizardStepIndicatorAria: "Calculator steps",
    wizardNavBack: "Back",
    wizardNavContinue: "Continue",
    wizardNavCalculate: "Calculate",
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
      startOver: "Start over",
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
  // Pass 2b-2b.
  sapCostCalculator: {
    formHeading: "Enter your SAP programme details",
    submitLabel: "Estimate my <noTranslate>SAP</noTranslate> cost",

    sectorLabel: "Industry sector",
    sectorOptions: {
      manufacturing: "Manufacturing",
      retail: "Retail",
      financeBanking: "Finance & Banking",
      aviationTransport: "Aviation & Transport",
      governmentPublic: "Government & Public Sector",
      utilitiesEnergy: "Utilities & Energy",
      telecom: "Telecom",
      healthcare: "Healthcare",
      oilGas: "Oil & Gas",
      constructionRealEstate: "Construction & Real Estate",
      professionalServices: "Professional Services",
      other: "Other",
    },

    companySizeLabel: "Company size",
    companySizeOptions: {
      smallUnder250: "Small (50–250 employees)",
      midUnder1000: "Mid-size (250–1,000)",
      largeUnder5000: "Large (1,000–5,000)",
      enterprise5000Plus: "Enterprise (5,000+)",
    },

    editionLabel: "<noTranslate>SAP</noTranslate> edition / deployment model",
    editionOptions: {
      grow: "<noTranslate>S/4HANA Cloud Public (GROW with SAP)</noTranslate>",
      rise: "<noTranslate>S/4HANA Cloud Private (RISE with SAP)</noTranslate>",
      s4Onprem: "<noTranslate>S/4HANA</noTranslate> On-Premise",
      eccBrownfield: "<noTranslate>ECC</noTranslate> Brownfield → <noTranslate>S/4HANA</noTranslate> Conversion",
      unsure: "Not sure yet",
    },

    currentSystemLabel: "Current system",
    currentSystemPlaceholder: "e.g. SAP ECC 6.0, Oracle EBS, custom legacy",

    modulesLabel: "<noTranslate>SAP</noTranslate> modules in scope",

    fioriScopeLabel: "<noTranslate>SAP Fiori</noTranslate> / UI scope",
    fioriScopeOptions: {
      minimal: "Minimal (standard delivered apps only)",
      selected:
        "Selected personas (custom <noTranslate>Fiori</noTranslate> for key roles)",
      full: "Full coverage (all users on <noTranslate>Fiori</noTranslate>)",
    },

    cleanCoreLabel:
      "Committing to clean-core / no <noTranslate>ABAP</noTranslate> customisation",

    industrySolutionLabel: "Industry solution (optional)",
    industrySolutionPlaceholder:
      "e.g. IS-Retail, IS-Oil, A&D, IS-U",

    userCountLabel: "Named / concurrent user count",
    userCountPlaceholder: "e.g. 800",

    regionsLabel: "Deployment regions",
    regionsOptions: {
      uae: "<noTranslate>UAE</noTranslate>",
      saudiArabia: "Saudi Arabia",
      gccOther: "<noTranslate>GCC</noTranslate> (other)",
      unitedKingdom: "<noTranslate>UK</noTranslate>",
      europeOther: "Europe (other)",
      northAmerica: "North America",
      apac: "<noTranslate>APAC</noTranslate>",
      africa: "Africa",
      latam: "<noTranslate>LATAM</noTranslate>",
    },

    timelineMonthsLabel: "Target go-live timeline (months)",
    timelineMonthsPlaceholder: "e.g. 18",

    notesLabel: "Additional context (optional)",
    notesPlaceholder:
      "Integration landscape, legacy <noTranslate>ABAP</noTranslate> volume, compliance requirements…",
  },

  migrationEstimator: {
    formHeading: "Enter your migration details",
    submitLabel: "Estimate migration effort",

    sourceLabel: "Source system",
    sourceOptions: {
      sapEcc: "<noTranslate>SAP ECC</noTranslate>",
      sapS4hana: "<noTranslate>SAP S/4HANA</noTranslate>",
      oracleEbs: "<noTranslate>Oracle EBS</noTranslate>",
      oracleFusion: "<noTranslate>Oracle Fusion Cloud</noTranslate>",
      microsoftDynamicsAx: "<noTranslate>Microsoft Dynamics AX</noTranslate>",
      microsoftDynamics365: "<noTranslate>Microsoft Dynamics 365</noTranslate>",
      jdEdwards: "<noTranslate>JD Edwards</noTranslate>",
      peoplesoft: "<noTranslate>PeopleSoft</noTranslate>",
      ifs: "<noTranslate>IFS</noTranslate>",
      infor: "<noTranslate>Infor</noTranslate>",
      customLegacy: "Custom / legacy system",
      other: "Other",
    },

    sourceVersionLabel: "Source system version (optional)",
    sourceVersionPlaceholder: "e.g. ECC 6.0 EhP8, AX 2012 R3",

    targetLabel: "Target system",
    targetOptions: {
      sapS4hanaCloud: "<noTranslate>SAP S/4HANA Cloud</noTranslate>",
      sapS4hanaOnPrem: "<noTranslate>SAP S/4HANA</noTranslate> On-Premise",
      oracleFusionCloud: "<noTranslate>Oracle Fusion Cloud</noTranslate>",
      microsoftDynamics365: "<noTranslate>Microsoft Dynamics 365</noTranslate>",
      other: "Other",
    },

    masterDataRecordsLabel: "Approximate master data records",
    masterDataRecordsPlaceholder:
      "e.g. 250000 (customers + materials + vendors combined)",

    transactionalRecordsLabel: "Approximate transactional records",
    transactionalRecordsPlaceholder:
      "e.g. 5000000 (open + historical documents)",

    customObjectsCountLabel:
      "Number of custom objects / Z-tables / non-standard entities",
    customObjectsCountPlaceholder: "e.g. 40",

    historicalYearsLabel: "Years of historical data to carry forward",
    historicalYearsPlaceholder: "e.g. 7",

    dataQualityLabel: "Self-assessed data quality",
    dataQualityOptions: {
      excellent: "Excellent — clean, documented, consistent",
      good: "Good — minor issues, mostly clean",
      fair: "Fair — known gaps and inconsistencies",
      poor: "Poor — major cleanup required",
      unknown: "Unknown / not yet assessed",
    },

    languagesInScopeLabel: "Languages in scope",
    languagesInScopePlaceholder:
      "EN, AR, FR, DE, ZH… (ISO codes, comma-separated)",

    notesLabel: "Additional context (optional)",
    notesPlaceholder:
      "Cutover constraints, parallel-run requirements, regulatory archiving needs…",
  },

  jdGenerator: {
    formHeading: "Describe the role",
    submitLabel: "Generate job description",

    roleFamilyLabel: "Role family",
    roleFamilyOptions: {
      functionalFiCo:
        "Functional — <noTranslate>FI</noTranslate> / <noTranslate>CO</noTranslate> (Finance & Controlling)",
      functionalMmSd:
        "Functional — <noTranslate>MM</noTranslate> / <noTranslate>SD</noTranslate> (Materials & Sales)",
      functionalPpQm:
        "Functional — <noTranslate>PP</noTranslate> / <noTranslate>QM</noTranslate> (Production & Quality)",
      functionalHcmSuccessfactors:
        "Functional — <noTranslate>HCM</noTranslate> / <noTranslate>SuccessFactors</noTranslate>",
      functionalEwmTm:
        "Functional — <noTranslate>EWM</noTranslate> / <noTranslate>TM</noTranslate> (Warehouse & Transport)",
      technicalAbap:
        "Technical — <noTranslate>ABAP</noTranslate> Developer",
      technicalBasis: "Technical — Basis / System Admin",
      technicalFioriUi5:
        "Technical — <noTranslate>Fiori</noTranslate> / <noTranslate>UI5</noTranslate> Developer",
      technicalIntegrationCpi:
        "Technical — Integration / <noTranslate>CPI</noTranslate>",
      technicalBtpDeveloper:
        "Technical — <noTranslate>BTP</noTranslate> Developer",
      architectSolution: "Solution Architect",
      architectEnterprise: "Enterprise Architect",
      programmeManager: "Programme Manager",
      dataMigrationLead: "Data Migration Lead",
      securityGrc: "Security / <noTranslate>GRC</noTranslate>",
      other: "Other",
    },

    roleTitleLabel: "Specific job title",
    roleTitlePlaceholder:
      "e.g. Senior SAP FI/CO Consultant, SAP ABAP Developer",

    seniorityLabel: "Seniority level",
    seniorityOptions: {
      junior: "Junior (2–4 years)",
      mid: "Mid-level (4–7 years)",
      senior: "Senior (7–12 years)",
      principalArchitect: "Principal / Architect (12+ years)",
      manager: "Manager",
      director: "Director",
    },

    sectorLabel: "Industry sector",
    sectorOptions: {
      manufacturing: "Manufacturing",
      retail: "Retail",
      financeBanking: "Finance & Banking",
      aviationTransport: "Aviation & Transport",
      governmentPublic: "Government & Public Sector",
      utilitiesEnergy: "Utilities & Energy",
      telecom: "Telecom",
      healthcare: "Healthcare",
      oilGas: "Oil & Gas",
      constructionRealEstate: "Construction & Real Estate",
      professionalServices: "Professional Services",
      other: "Other",
    },

    regionLabel: "Hiring region",
    regionOptions: {
      uae: "<noTranslate>UAE</noTranslate>",
      saudiArabia: "Saudi Arabia",
      gccOther: "<noTranslate>GCC</noTranslate> (other)",
      unitedKingdom: "<noTranslate>UK</noTranslate>",
      europeOther: "Europe (other)",
      northAmerica: "North America",
      apac: "<noTranslate>APAC</noTranslate>",
      africa: "Africa",
      latam: "<noTranslate>LATAM</noTranslate>",
    },

    remoteLabel: "Work arrangement",
    remoteOptions: {
      onsite: "On-site",
      hybrid: "Hybrid",
      remote: "Remote",
    },

    clearanceRequiredLabel: "Security clearance required",

    certificationsLabel: "Certifications to require or prefer",
    certificationsPlaceholder:
      "e.g. SAP Certified Application Associate FI, SAP BTP Developer",

    keyProjectsLabel: "Key project context (optional)",
    keyProjectsPlaceholder:
      "e.g. S/4HANA greenfield implementation in manufacturing, RISE with SAP migration, Centre of Excellence setup…",

    notesLabel: "Additional requirements (optional)",
    notesPlaceholder:
      "Language requirements, visa eligibility, team size, reporting line…",
  },
  // Pass 2b-2c. 82 modules + 9 categories. Wrapper tags around proper
  // nouns survive the translation pipeline and are stripped at render
  // by stripMarkers / deepStripMarkers at every consumer site.
  sapModules: {
    modules: {
      // ─── Finance & Controlling ──────────────────────────────────────
      "fi-gl": {
        label: "Financial Accounting",
        description: "General Ledger, statutory reporting foundation",
      },
      "fi-ap": {
        label: "Accounts Payable",
        description: "Vendor invoicing, payment processing",
      },
      "fi-ar": {
        label: "Accounts Receivable",
        description: "Customer invoices, collections, dunning",
      },
      "fi-aa": {
        label: "Asset Accounting",
        description: "Fixed assets, depreciation, capitalisation",
      },
      "fi-bl": {
        label: "Bank Accounting & Cash Management",
        description: "Bank reconciliation, daily liquidity",
      },
      "tax-mgmt": {
        label: "Tax Management",
        description: "Indirect tax, <noTranslate>VAT</noTranslate>, withholding, jurisdiction logic",
      },
      "co": {
        label: "Controlling",
        description: "Internal cost accounting and management reporting",
      },
      "co-cca": {
        label: "Cost Center Accounting",
        description: "Cost centre design, allocations, settlements",
      },
      "co-pca": {
        label: "Profit Center Accounting",
        description: "Profit centre P&L, intra-company transfers",
      },
      "co-pc": {
        label: "Product Costing",
        description: "Standard cost, actual cost, variance analysis",
      },
      "co-pa": {
        label: "Profitability Analysis",
        description: "Margin reporting by customer, region, product",
      },
      "internal-orders": {
        label: "Internal Orders",
        description: "Capex orders, event/campaign cost capture",
      },
      "group-reporting": {
        label: "Group Reporting (<noTranslate>S/4HANA</noTranslate>)",
        description:
          "Native <noTranslate>S/4HANA</noTranslate> consolidation, replaces <noTranslate>BPC</noTranslate> for new builds",
      },
      "bpc": {
        label:
          "Financial Consolidation (<noTranslate>BPC</noTranslate> / <noTranslate>SEM-BCS</noTranslate>)",
        description: "Legacy consolidation, planning, eliminations",
      },
      "fpa-planning": {
        label: "Financial Planning & Analysis",
        description: "Planning, budgeting, forecasting on <noTranslate>SAC</noTranslate> for Planning",
      },
      "treasury": {
        label: "Treasury & Risk Management",
        description: "Cash management, in-house cash, <noTranslate>FX</noTranslate>, hedging, money market",
      },
      "in-house-cash": {
        label: "In-House Cash / Cash Pooling",
        description: "Intercompany payments, payment factory",
      },
      "fscm-credit": {
        label: "Credit Management",
        description: "Credit scoring, limit management, exposure",
      },
      "fscm-dispute": {
        label: "Dispute Management",
        description: "<noTranslate>AR</noTranslate> dispute case workflow",
      },
      "fscm-collections": {
        label: "Collections Management",
        description: "Worklist-driven collections, dunning strategy",
      },
      "re-fx": {
        label: "Real Estate Management",
        description:
          "Lease contracts, <noTranslate>IFRS 16</noTranslate> / <noTranslate>ASC 842</noTranslate> compliance",
      },
      "drc": {
        label: "Document & Reporting Compliance",
        description:
          "Global e-invoicing, statutory reporting, <noTranslate>ViDA</noTranslate>, <noTranslate>KSA</noTranslate>, <noTranslate>UAE</noTranslate>, India",
      },

      // ─── Procurement ────────────────────────────────────────────────
      "mm": {
        label: "Materials Management",
        description: "Purchasing, inventory, vendor management",
      },
      "ariba-sourcing": {
        label: "<noTranslate>Ariba</noTranslate> Sourcing",
        description: "<noTranslate>RFx</noTranslate>, e-auctions, supplier discovery",
      },
      "ariba-buying": {
        label: "<noTranslate>Ariba</noTranslate> Buying & Invoicing",
        description:
          "Catalog-driven indirect procurement, invoice automation",
      },
      "ariba-contracts": {
        label: "<noTranslate>Ariba</noTranslate> Contracts",
        description: "Contract lifecycle management",
      },
      "ariba-supplier": {
        label: "<noTranslate>Ariba</noTranslate> Supplier Management",
        description: "Supplier qualification, risk, performance",
      },
      "inventory-mgmt": {
        label: "Inventory Management",
        description: "Stock movements, valuation, physical inventory",
      },
      "gr-ir": {
        label: "Goods Receipt / Invoice Verification",
        description: "3-way match, <noTranslate>GR/IR</noTranslate> clearing",
      },

      // ─── Supply Chain & Manufacturing ───────────────────────────────
      "pp": {
        label: "Production Planning",
        description: "<noTranslate>MRP</noTranslate>, production orders, capacity planning",
      },
      "ppds": {
        label: "Production Planning & Detailed Scheduling",
        description: "Advanced finite scheduling, sequencing",
      },
      "me": {
        label: "Manufacturing Execution",
        description: "Shop-floor execution, work instructions, traceability",
      },
      "qm": {
        label: "Quality Management",
        description: "Inspection lots, certificates, batch quality",
      },
      "pm-eam": {
        label: "Plant Maintenance / <noTranslate>EAM</noTranslate>",
        description:
          "Maintenance orders, asset master, preventive maintenance",
      },
      "ehs": {
        label: "Environment, Health & Safety",
        description:
          "Hazardous substances, incident management, <noTranslate>SDS</noTranslate>",
      },
      "ewm": {
        label: "Extended Warehouse Management",
        description:
          "Multi-bin warehouse, wave management, <noTranslate>RF</noTranslate>, slotting",
      },
      "tm": {
        label: "Transportation Management",
        description: "Freight planning, carrier selection, settlement",
      },
      "ibp": {
        label: "Integrated Business Planning",
        description:
          "Demand, supply, <noTranslate>S&OP</noTranslate>, inventory optimisation",
      },
      "dmc": {
        label: "Digital Manufacturing Cloud",
        description: "Cloud <noTranslate>MES</noTranslate> with <noTranslate>IoT</noTranslate> and analytics",
      },
      "apm": {
        label: "Asset Performance Management",
        description: "Predictive maintenance, asset strategy",
      },

      // ─── Sales & CX ─────────────────────────────────────────────────
      "sd": {
        label: "Sales & Distribution",
        description: "Order-to-cash, pricing, billing",
      },
      "pricing-conditions": {
        label: "Pricing & Condition Technique",
        description: "Multi-tier pricing, discounts, rebates",
      },
      "brim": {
        label: "Billing & Revenue Innovation Management",
        description:
          "Subscription billing, convergent invoicing, <noTranslate>IFRS 15</noTranslate>",
      },
      "sales-cloud": {
        label: "Sales Cloud",
        description: "<noTranslate>CRM</noTranslate>, pipeline, activity tracking",
      },
      "service-cloud": {
        label: "Service Cloud",
        description:
          "Case management, omnichannel service, field service",
      },
      "marketing-cloud": {
        label: "Marketing Cloud (<noTranslate>Emarsys</noTranslate>)",
        description:
          "Campaign automation, segmentation, personalisation",
      },
      "commerce-cloud": {
        label: "Commerce Cloud",
        description: "<noTranslate>B2B</noTranslate> / <noTranslate>B2C</noTranslate> storefront, catalog, checkout",
      },
      "cdc": {
        label: "Customer Data Cloud (<noTranslate>CDC</noTranslate>)",
        description:
          "Single sign-on, consent management, identity",
      },
      "cpq": {
        label: "Configure, Price, Quote",
        description: "Guided selling, complex configuration",
      },
      "subscription-billing": {
        label: "Subscription Billing",
        description: "Recurring revenue, usage-based pricing",
      },

      // ─── HCM (SuccessFactors) ───────────────────────────────────────
      "sf-ec": {
        label: "Employee Central (core <noTranslate>HR</noTranslate>)",
        description:
          "Org structure, employee master, self-service",
      },
      "sf-ec-payroll": {
        label: "Employee Central Payroll",
        description: "Cloud payroll, multi-country",
      },
      "hcm-payroll-onprem": {
        label: "<noTranslate>SAP HCM</noTranslate> Payroll (on-prem)",
        description:
          "Legacy <noTranslate>SAP HCM</noTranslate> payroll, country-specific schemas",
      },
      "sf-time": {
        label: "Time Management",
        description: "Time entry, attendance, absence quotas",
      },
      "sf-recruiting": {
        label: "Recruiting",
        description: "Requisitions, candidate pipeline, offers",
      },
      "sf-onboarding": {
        label: "Onboarding",
        description: "Pre-hire workflows, paperwork, equipment",
      },
      "sf-performance": {
        label: "Performance & Goals",
        description:
          "Goal cascade, performance reviews, calibration",
      },
      "sf-lms": {
        label: "Learning Management",
        description:
          "Learning catalogue, compliance training, certifications",
      },
      "sf-comp": {
        label: "Compensation",
        description: "Comp planning, merit cycles, bonus",
      },
      "sf-variable-pay": {
        label: "Variable Pay",
        description: "Bonus plans, sales incentives",
      },
      "sf-succession": {
        label: "Succession & Development",
        description: "Talent pools, career paths, 9-box",
      },
      "sf-analytics": {
        label: "People Analytics / Workforce Planning",
        description: "Workforce dashboards, headcount planning",
      },

      // ─── Projects ───────────────────────────────────────────────────
      "ps": {
        label: "Project Systems",
        description:
          "<noTranslate>WBS</noTranslate>, project costing, milestone billing",
      },
      "ppm": {
        label: "Portfolio & Project Management",
        description: "Portfolio dashboards, resource planning",
      },
      "concur": {
        label: "<noTranslate>Concur</noTranslate> (Travel & Expense)",
        description:
          "Expense reports, travel booking, <noTranslate>T&E</noTranslate> policy",
      },

      // ─── Analytics & Data ───────────────────────────────────────────
      "sac": {
        label: "<noTranslate>SAP Analytics Cloud</noTranslate>",
        description:
          "Dashboards, planning, predictive on <noTranslate>SAC</noTranslate>",
      },
      "datasphere": {
        label: "<noTranslate>SAP Datasphere</noTranslate>",
        description: "Data warehousing, data products, semantic layer",
      },
      "bw4hana": {
        label: "<noTranslate>SAP BW/4HANA</noTranslate>",
        description: "Enterprise data warehouse on <noTranslate>HANA</noTranslate>",
      },
      "embedded-analytics": {
        label: "Embedded Analytics in <noTranslate>S/4HANA</noTranslate>",
        description:
          "<noTranslate>CDS</noTranslate> views, <noTranslate>KPI</noTranslate> cards in <noTranslate>Fiori</noTranslate>",
      },

      // ─── Platform & Integration ─────────────────────────────────────
      "btp": {
        label: "<noTranslate>SAP BTP</noTranslate> (Business Technology Platform)",
        description: "Extension platform, dev runtime, services",
      },
      "integration-suite": {
        label:
          "<noTranslate>SAP Integration Suite</noTranslate> (<noTranslate>CPI</noTranslate>)",
        description:
          "<noTranslate>iFlows</noTranslate>, <noTranslate>API</noTranslate> management, event-driven integration",
      },
      "build": {
        label: "<noTranslate>SAP Build</noTranslate> (Apps + Process Automation)",
        description:
          "Low-code app builder, process automation, <noTranslate>RPA</noTranslate>",
      },
      "mdg": {
        label: "Master Data Governance",
        description:
          "Central data governance, stewardship, workflows",
      },
      "signavio": {
        label: "<noTranslate>SAP Signavio</noTranslate>",
        description: "Process intelligence, mining, modelling",
      },
      "ias": {
        label: "Identity & Access Management",
        description:
          "<noTranslate>SSO</noTranslate>, provisioning, identity federation (<noTranslate>IAS</noTranslate> / <noTranslate>IPS</noTranslate>)",
      },
      "ilm": {
        label: "Information Lifecycle Management",
        description:
          "Data retention, archiving, <noTranslate>GDPR</noTranslate> / right-to-erasure",
      },

      // ─── Industry add-ons ───────────────────────────────────────────
      "is-retail": {
        label: "<noTranslate>SAP</noTranslate> for Retail",
        description: "Article master, assortment, store ops",
      },
      "is-oil": {
        label: "<noTranslate>SAP</noTranslate> for Oil, Gas & Energy",
        description:
          "Hydrocarbon Management, <noTranslate>JVA</noTranslate>, exchanges",
      },
      "is-utilities": {
        label: "<noTranslate>SAP</noTranslate> for Utilities",
        description: "Device Management, billing, customer service",
      },
      "is-public-sector": {
        label: "<noTranslate>SAP</noTranslate> for Public Sector",
        description:
          "Funds Management, Grants Management, Budget Control",
      },
      "is-banking": {
        label: "<noTranslate>SAP</noTranslate> for Banking",
        description:
          "Deposits Management, Loans Management, Account Management",
      },
      "is-defense": {
        label: "<noTranslate>SAP</noTranslate> for Defence & Security",
        description:
          "Force Element, Stock Aggregation, military planning",
      },
    },

    categories: {
      finance: {
        label: "Finance & Controlling",
        blurb:
          "<noTranslate>FI</noTranslate>, <noTranslate>CO</noTranslate>, Group Reporting, Treasury, <noTranslate>FSCM</noTranslate>, <noTranslate>FP&A</noTranslate>",
      },
      procurement: {
        label: "Procurement & Sourcing",
        blurb:
          "<noTranslate>MM</noTranslate>, <noTranslate>Ariba</noTranslate>, Inventory, <noTranslate>GR/IR</noTranslate>",
      },
      "supply-chain": {
        label: "Supply Chain & Manufacturing",
        blurb:
          "<noTranslate>PP</noTranslate>, <noTranslate>EWM</noTranslate>, <noTranslate>TM</noTranslate>, <noTranslate>IBP</noTranslate>, <noTranslate>QM</noTranslate>, <noTranslate>PM</noTranslate>, <noTranslate>EHS</noTranslate>",
      },
      "sales-cx": {
        label: "Sales & Customer Experience",
        blurb:
          "<noTranslate>SD</noTranslate>, <noTranslate>BRIM</noTranslate>, Sales/Service/Commerce/Marketing Cloud, <noTranslate>CPQ</noTranslate>",
      },
      hcm: {
        label: "Human Capital Management",
        blurb:
          "<noTranslate>SuccessFactors</noTranslate>, Payroll, Time, Recruiting, <noTranslate>LMS</noTranslate>",
      },
      projects: {
        label: "Projects & Expense",
        blurb:
          "<noTranslate>PS</noTranslate>, <noTranslate>PPM</noTranslate>, <noTranslate>Concur</noTranslate>",
      },
      analytics: {
        label: "Analytics & Data",
        blurb:
          "<noTranslate>SAC</noTranslate>, <noTranslate>Datasphere</noTranslate>, <noTranslate>BW/4HANA</noTranslate>, embedded analytics",
      },
      platform: {
        label: "Platform & Integration",
        blurb:
          "<noTranslate>BTP</noTranslate>, Integration Suite, <noTranslate>MDG</noTranslate>, <noTranslate>Signavio</noTranslate>, <noTranslate>IAM</noTranslate>",
      },
      industry: {
        label: "Industry add-ons",
        blurb:
          "Retail, Oil & Gas, Utilities, Public Sector, Banking, Defense",
      },
    },
  },

  // Pass 2b-2d.
  solutionBuilder: {
    formHeading: "Create your SAP implementation roadmap",
    industryLabel: "Industry",
    industrySelectPlaceholder: "Select industry",
    companySizeLabel: "Company size",
    companySizeSelectPlaceholder: "Select company size",
    resetCta: "Reset",
    generateRecommendationsCta: "Generate recommendations",
    changeIndustryOrSizeCta: "Change industry or size",
    modulesSelectionHeading: "<noTranslate>SAP</noTranslate> modules selection",
    mandatoryModulesTitle: "Mandatory modules",
    industryModulesTitle: "Industry-specific modules",
    recommendedModulesTitle: "Recommended modules",
    moduleSingular: "module",
    modulePlural: "modules",
    generateRoadmapCta: "Generate implementation roadmap",
    bestPracticesTitleTemplate: "Industry best practices: {industry}",

    moduleTableModule: "Module",
    moduleTableLicense: "License",
    moduleTableQuantity: "Quantity",
    moduleTableCategory: "Category",
    moduleTableDescription: "Description",

    summaryTotalDuration: "Total duration",
    summaryTotalInvestment: "Total investment",
    summaryTeamSize: "Team size",
    summaryMonthsTemplate: "{n} months",
    summaryPeopleTemplate: "{n} people",

    timelineHeading: "Implementation timeline",
    timelineCaptionTemplate:
      "Phased delivery sized to {industry} at {size} scale.",

    costBreakdownHeading: "Cost breakdown",
    costBreakdownCaptionTemplate:
      "Where the {total} programme cost lands by category. Directional, not a vendor quote.",

    implementationTeamHeading: "Implementation team",
    implementationTeamCaptionTemplate:
      "Suggested team composition for a {size} programme. Headcount scales with selected modules. Day-rate bands are <noTranslate>USD</noTranslate>.",

    teamTableRole: "Role",
    teamTableFunction: "Function",
    teamTableCount: "Count",
    teamTableDayRate: "Day rate (<noTranslate>USD</noTranslate>)",
    teamTableTotal: "Total",

    phaseFocusPrefix: "Focus:",
    phaseModulesCaption: "Modules in this phase",
    phaseMonthsTemplate: "{n} months",

    printPdfCta: "Print / save as PDF",
    startOverCta: "Start over",

    // INDUSTRIES — 14 entries.
    industries: {
      manufacturing: {
        label: "Manufacturing",
        bestPractices:
          "Focus on integrating production planning with materials management. Quality management and manufacturing execution are non-negotiable. Plant maintenance and <noTranslate>EHS</noTranslate> protect uptime.",
        phasingNarrative:
          "Start with core ERP and manufacturing modules in Phase 1. Add quality management and execution systems in Phase 2. Deploy <noTranslate>IoT</noTranslate>, predictive maintenance, and analytics in Phase 3.",
      },
      retail: {
        label: "Retail",
        bestPractices:
          "Article master and assortment depth determine the size of the build. Omnichannel commerce, customer data, and store operations require tight integration. Inventory accuracy across stores and <noTranslate>DCs</noTranslate> is the value driver.",
        phasingNarrative:
          "Phase 1 covers core ERP, finance, and merchandise management. Phase 2 layers in commerce, marketing cloud, and store operations. Phase 3 brings analytics, customer data, and personalisation.",
      },
      healthcare: {
        label: "Healthcare",
        bestPractices:
          "Patient data privacy and audit trails dominate the design. Procurement and inventory of medical supplies need strict batch and expiry control. Workforce planning is mission-critical for clinical staffing.",
        phasingNarrative:
          "Phase 1 covers finance, procurement, and core HR with full audit trail. Phase 2 adds workforce planning, learning, and analytics. Phase 3 layers AI for forecasting and patient operations.",
      },
      "financial-services": {
        label: "Financial Services",
        bestPractices:
          "Regulatory reporting, Group consolidation, and <noTranslate>FSCM</noTranslate> (credit, dispute, collections) are the spine. Treasury, in-house cash, and risk management carry the heaviest configuration burden.",
        phasingNarrative:
          "Phase 1: core finance, controlling, Group Reporting, and statutory compliance. Phase 2: treasury, <noTranslate>FSCM</noTranslate>, and regulatory reporting (<noTranslate>DRC</noTranslate>). Phase 3: analytics, planning, and risk dashboards.",
      },
      "public-sector": {
        label: "Public Sector",
        bestPractices:
          "Funds management, grants, and budget control are the heart of the system. Procurement transparency and audit are non-negotiable. Citizen-facing services need a separate engagement layer.",
        phasingNarrative:
          "Phase 1: core finance with Funds Management and grants. Phase 2: procurement transparency, HR/payroll, and audit reporting. Phase 3: citizen engagement, analytics, and <noTranslate>DRC</noTranslate> reporting.",
      },
      utilities: {
        label: "Utilities",
        bestPractices:
          "Device management, metering, and customer billing dominate. Plant maintenance and asset performance management protect grid reliability. Regulatory reporting and unbundling are baseline.",
        phasingNarrative:
          "Phase 1: core ERP plus <noTranslate>IS-U</noTranslate> device management and billing. Phase 2: <noTranslate>PM</noTranslate>, <noTranslate>EAM</noTranslate>, and <noTranslate>APM</noTranslate> for asset operations. Phase 3: customer engagement, <noTranslate>IBP</noTranslate>, and analytics.",
      },
      "consumer-goods": {
        label: "Consumer Goods",
        bestPractices:
          "Trade promotion management and demand planning drive margin. Warehouse and transportation management determine service levels. Subscription and direct-to-consumer add channel complexity.",
        phasingNarrative:
          "Phase 1: core ERP, finance, and supply chain. Phase 2: <noTranslate>IBP</noTranslate>, warehouse and transportation. Phase 3: commerce, customer data, and advanced analytics.",
      },
      "professional-services": {
        label: "Professional Services",
        bestPractices:
          "Project accounting, time and expense, and resource planning are the engine. Revenue recognition under <noTranslate>IFRS 15</noTranslate> carries hidden complexity. Talent management drives utilisation.",
        phasingNarrative:
          "Phase 1: core finance, project systems, and <noTranslate>Concur</noTranslate>. Phase 2: HR, recruiting, performance. Phase 3: analytics, planning, and workforce optimisation.",
      },
      telecommunications: {
        label: "Telecommunications",
        bestPractices:
          "Subscription and convergent billing (<noTranslate>BRIM</noTranslate>) carry the heaviest load. Customer experience and service cloud are baseline. Network asset management on <noTranslate>PM</noTranslate>/<noTranslate>APM</noTranslate> is the operations spine.",
        phasingNarrative:
          "Phase 1: core ERP, finance, <noTranslate>BRIM</noTranslate>. Phase 2: service cloud, commerce, customer data. Phase 3: <noTranslate>PM</noTranslate>, <noTranslate>APM</noTranslate>, and analytics.",
      },
      "oil-gas": {
        label: "Oil, Gas & Energy",
        bestPractices:
          "Hydrocarbon management, exchanges, and joint venture accounting are non-negotiable. <noTranslate>PM</noTranslate> and <noTranslate>EHS</noTranslate> protect both safety and uptime. <noTranslate>EWM</noTranslate> handles complex bulk and packaged inventory.",
        phasingNarrative:
          "Phase 1: core ERP plus <noTranslate>IS-OIL</noTranslate> and <noTranslate>EHS</noTranslate>. Phase 2: <noTranslate>PM</noTranslate>, <noTranslate>EAM</noTranslate>, <noTranslate>EWM</noTranslate>. Phase 3: <noTranslate>APM</noTranslate>, <noTranslate>IBP</noTranslate>, and analytics.",
      },
      education: {
        label: "Education",
        bestPractices:
          "Student finance, grants, and donor management are unique to the sector. HR and payroll for academic and admin staff need separate schemas. Compliance and reporting are heavy.",
        phasingNarrative:
          "Phase 1: core finance, procurement, and HR. Phase 2: payroll, recruiting, learning. Phase 3: analytics and student engagement.",
      },
      hospitality: {
        label: "Hospitality",
        bestPractices:
          "Procurement, inventory, and F&B costing carry the operational load. Customer experience and loyalty drive revenue. Workforce time and scheduling are the daily friction.",
        phasingNarrative:
          "Phase 1: core ERP, finance, procurement. Phase 2: HR, time, learning. Phase 3: customer experience, commerce, analytics.",
      },
      "logistics-transport": {
        label: "Logistics & Transportation",
        bestPractices:
          "Transportation management is the spine. Warehouse management at scale across distribution centres is the second pillar. Fleet, asset, and driver management round out the operations.",
        phasingNarrative:
          "Phase 1: core ERP, finance, <noTranslate>MM</noTranslate>. Phase 2: <noTranslate>TM</noTranslate> and <noTranslate>EWM</noTranslate>. Phase 3: <noTranslate>APM</noTranslate>, <noTranslate>IBP</noTranslate>, analytics.",
      },
      "construction-real-estate": {
        label: "Construction & Real Estate",
        bestPractices:
          "Project systems, lease accounting (<noTranslate>IFRS 16</noTranslate> / <noTranslate>ASC 842</noTranslate>), and progress billing dominate. Procurement of materials and subcontractors needs strong contract control. <noTranslate>EHS</noTranslate> is regulated.",
        phasingNarrative:
          "Phase 1: core finance, <noTranslate>PS</noTranslate>, <noTranslate>RE-FX</noTranslate>. Phase 2: procurement, contracts, <noTranslate>EHS</noTranslate>. Phase 3: analytics and asset operations.",
      },
    },

    companySizes: {
      small:      { label: "Small (< 100 employees)" },
      mid:        { label: "Mid-size (100-500 employees)" },
      large:      { label: "Large (500-2,000 employees)" },
      enterprise: { label: "Enterprise (2,000+ employees)" },
    },

    phases: {
      phase1: {
        label: "Phase 1: Core ERP, Finance & Compliance",
        description:
          "Establish the core ERP foundation with finance, procurement, and HR.",
        focusAreas: [
          "Core ERP configuration",
          "Financial accounting",
          "Procurement setup",
          "HR and payroll",
          "Statutory compliance",
        ],
      },
      phase2: {
        label: "Phase 2: Industry-Specific Solutions",
        description:
          "Layer in the modules that make the system fit your industry.",
        focusAreas: [
          "Industry-specific processes",
          "Specialised modules",
          "Industry compliance",
          "Extended features",
        ],
      },
      phase3: {
        label: "Phase 3: Advanced, Analytics & Platform",
        description:
          "Add analytics, integration, and the platform capabilities for scale.",
        focusAreas: [
          "Analytics and reporting",
          "Integration and extension",
          "Master data governance",
          "Process intelligence",
        ],
      },
    },

    teamRoles: {
      "programme-director": {
        role: "Programme Director",
        function: "Programme leadership and stakeholder management",
      },
      "programme-manager": {
        role: "Programme Manager",
        function: "Day-to-day delivery, plan, <noTranslate>RAID</noTranslate> log",
      },
      "solution-architect": {
        role: "Solution Architect",
        function: "End-to-end design, integration patterns",
      },
      "functional-lead-finance": {
        role: "Functional Lead — Finance",
        function:
          "<noTranslate>FI</noTranslate>/<noTranslate>CO</noTranslate>/Treasury design, <noTranslate>GL</noTranslate> chart, controlling model",
      },
      "functional-lead-supply-chain": {
        role: "Functional Lead — Supply Chain",
        function:
          "<noTranslate>MM</noTranslate>/<noTranslate>PP</noTranslate>/<noTranslate>EWM</noTranslate>/<noTranslate>TM</noTranslate> design and config",
      },
      "functional-lead-hr": {
        role: "Functional Lead — HR",
        function: "<noTranslate>SuccessFactors</noTranslate> / <noTranslate>HCM</noTranslate> design",
      },
      "functional-consultants": {
        role: "Functional Consultants",
        function: "Module-level configuration and testing",
      },
      "technical-abap-developer": {
        role: "Technical / <noTranslate>ABAP</noTranslate> Developer",
        function: "Custom dev, <noTranslate>RICEFW</noTranslate>, performance",
      },
      "basis-btp-admin": {
        role: "Basis / <noTranslate>BTP</noTranslate> Admin",
        function:
          "Landscape, transports, performance, security",
      },
      "integration-cpi-consultant": {
        role: "Integration / <noTranslate>CPI</noTranslate> Consultant",
        function:
          "Interfaces, <noTranslate>iFlows</noTranslate>, <noTranslate>API</noTranslate> management",
      },
      "data-migration-lead": {
        role: "Data Migration Lead",
        function: "Data mapping, cleansing, cutover",
      },
      "change-manager": {
        role: "Change Manager",
        function: "Communications, training plan, adoption",
      },
      "test-lead": {
        role: "Test Lead",
        function:
          "Test strategy, <noTranslate>UAT</noTranslate>, regression, defect triage",
      },
    },

    licenseTypes: {
      userBased: "User-Based",
      employeeBased: "Employee-Based",
      transactionBased: "Transaction-Based",
    },

    // Cost-roadmap CATEGORY_LABEL — distinct from sapModules.categories.
    costRoadmapCategories: {
      finance:        "Finance & Compliance",
      procurement:    "Procurement & Supply Chain",
      "supply-chain": "Supply Chain & Manufacturing",
      "sales-cx":     "Sales & Customer Experience",
      hcm:            "HR & Workforce Management",
      projects:       "Projects & Expense",
      analytics:      "Analytics & Reporting",
      platform:       "Platform & Integration",
      industry:       "Industry Solution",
    },

    costCategories: {
      softwareLicensing: {
        label: "Software licensing",
        description:
          "Core modules, user licences, and add-ons across the selected scope",
      },
      implementationServices: {
        label: "Implementation services",
        description:
          "Consulting, configuration, testing, and project management",
      },
      internalTeamTime: {
        label: "Internal team time",
        description:
          "IT, business SMEs, and process owners (often invisible in vendor quotes)",
      },
      dataMigration: {
        label: "Data migration",
        description:
          "Extraction, cleansing, conversion, validation, cutover dress rehearsal",
      },
      customisationDevelopment: {
        label: "Customisation & development",
        description:
          "Z-code, <noTranslate>Fiori</noTranslate> extensions, integrations beyond standard",
      },
      trainingChangeManagement: {
        label: "Training & change management",
        description:
          "End-user training, change agents, communications, adoption",
      },
      infrastructureHosting: {
        label: "Infrastructure & hosting",
        description:
          "Cloud subscriptions, middleware, network readiness",
      },
      postGoliveSupport: {
        label: "Post-go-live support (hypercare)",
        description:
          "First 30-90 days post-cutover with elevated support staffing",
      },
      contingency: {
        label: "Contingency",
        description:
          "Reserve for scope changes, delays, unforeseen requirements",
      },
    },
  },
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
  ar: arMessages,
  de: deMessages,
  el: elMessages,
  es: esMessages,
  fr: frMessages,
  it: itMessages,
  ja: jaMessages,
  nl: nlMessages,
  pt: ptMessages,
  ru: ruMessages,
  // Future-reserved locales (not in TARGET_LANGUAGES). Mapped to EN until
  // they are added to the translation pipeline.
  zh: EN,
  ko: EN,
  hi: EN,
  tr: EN,
};
