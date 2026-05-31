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

  // The ErpCostClient calculator — biggest single chunk (~160 strings).
  // Pass 2 will model the full step/option/label/hint surface. Listed
  // here as a top-level namespace to reserve the slot.
  calculator: {
    // ~160 strings — see audit doc.
    _todo: string;
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
  calculator: { _todo: "Pass 2: ~160 strings from ErpCostClient.tsx" },
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
