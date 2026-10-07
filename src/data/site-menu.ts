// Site menu. One source for the desktop panels, the mobile menu and the footer.
// Classification follows docs/claude/site-inventory.md (every live URL mapped to a
// menu section). All hrefs end with a slash (trailingSlash: true) so no link
// costs a redirect hop.

export type MenuLink = { label: string; href: string; note?: string; external?: boolean };
export type MenuGroup = { title: string; area?: "apps" | "data" | "ai"; links: MenuLink[] };

export const ARTICLES_INDEX = "/best-sap-articles-for-implementation-noel-dcosta/";
export const CONTACT = "/contact-noel-erp-support/";
export const ABOUT = "/sap-erp-consultant-my-story-noel-dcosta/";
export const ACADEMY = "/ai-academy/";
export const CLIENT_WORK = "/case-studies/";
export const EXPERTISE = "/erp-ai-services/";
export const LINKEDIN = "https://www.linkedin.com/in/noeldcosta/";
export const YOUTUBE = "https://www.youtube.com/@NoelDCostaERPAI";
export const CALENDLY_URL = "https://calendly.com/noeldcosta/30min";

// Noel's other sites.
export const ERPCV = "https://erpcv.com/";
export const ERPCV_ADVISORY = "https://erpcv.com/advisory";
export const ERPCV_DIAGNOSIS = "https://erpcv.com/diagnosis";
export const SAPOPEDIA = "https://www.sapopedia.com/";
// Books are sold on SAPopedia. Replace with the exact books page when Noel sends it.
export const SAPOPEDIA_BOOKS = "https://www.sapopedia.com/";

export const EXPERTISE_GROUPS: MenuGroup[] = [
  {
    title: "Enterprise applications",
    area: "apps",
    links: [
      { label: "SAP implementation", href: "/sap-implementation/", note: "Hub and programme guides" },
      { label: "SAP S/4HANA", href: "/sap-implementation/s4hana/" },
      { label: "RISE with SAP", href: "/sap-implementation/rise-with-sap/" },
      { label: "SAP Business One", href: "/sap-implementation/business-one/" },
      { label: "Oracle", href: "/erp-ai-services/#oracle" },
      { label: "Microsoft Dynamics 365", href: "/erp-ai-services/#microsoft" },
    ],
  },
  {
    title: "Data & analytics",
    area: "data",
    links: [
      { label: "Databricks", href: "/erp-ai-services/#databricks" },
      { label: "SAP Analytics Cloud", href: "/sap-analytics-cloud/" },
      { label: "Data migration", href: "/why-sap-data-migration-fails-and-how-to-fix-it/" },
      { label: "Planning with SAP BPC", href: "/sap-bpc-features-deployment-best-practice-guide/" },
    ],
  },
  {
    title: "AI",
    area: "ai",
    links: [
      { label: "Enterprise AI", href: "/erp-ai-services/#enterprise-ai" },
      { label: "Private AI", href: "/erp-ai-services/#private-ai" },
      { label: "SAP Joule", href: "/erp-ai-services/#sap-joule" },
      { label: "AI for small businesses", href: "/erp-for-small-business-ai-automation/" },
      { label: "AI governance and risk", href: "/ai-governance-services/" },
    ],
  },
];

export const ARTICLE_GROUPS: MenuGroup[] = [
  {
    title: "Articles",
    links: [
      { label: "All articles", href: ARTICLES_INDEX, note: "The full library, by area" },
      { label: "Enterprise applications", href: `${ARTICLES_INDEX}#enterprise-applications` },
      { label: "Data & analytics", href: `${ARTICLES_INDEX}#data-analytics` },
      { label: "AI", href: `${ARTICLES_INDEX}#ai` },
      { label: "Consulting practice", href: `${ARTICLES_INDEX}#consulting-practice` },
      { label: "Case studies", href: "/category/sap-case-studies/" },
    ],
  },
  {
    title: "Free tools",
    links: [
      { label: "SAP cost calculator", href: "/sap-implementation-cost-calculator/" },
      { label: "ERP cost calculator", href: "/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/" },
      { label: "Data migration estimator", href: "/free-data-migration-estimator-sap-oracle-microsoft/" },
      { label: "S/4HANA migration assessment", href: "/sap-s4hana-migration-strategy-greenfield-vs-brownfield/" },
      { label: "SAP job description generator", href: "/sap-job-description-generator/" },
      { label: "SAP solution builder", href: "/sap-solution-builder/" },
    ],
  },
  {
    title: "Library",
    links: [
      { label: "Books", href: "/books/" },
      { label: "Consulting career guides", href: "/consulting-career-guides/" },
      { label: "All tools", href: "/simplify-your-business-with-erp-ai-tools/" },
      { label: "AI insights", href: "/ai-insights-shiftgearx-noeldcosta/" },
      { label: "YouTube channel", href: YOUTUBE, external: true },
      { label: "ERPCV: careers for ERP consultants", href: ERPCV, external: true },
      { label: "SAPopedia: career paths and books", href: SAPOPEDIA, external: true },
    ],
  },
];

export const ABOUT_GROUP: MenuGroup = {
  title: "About Noel",
  links: [
    { label: "My story", href: ABOUT },
    { label: "Advisory", href: "/erp-ai-tech-consulting-advisory/" },
    { label: "Partners", href: "/all-our-partners/" },
    { label: "Contributions", href: "/contributions-sap-experts-industry-professionals/" },
    { label: "Write for us", href: "/write-for-us-lets-share-our-experiences/" },
    { label: "Discuss your project", href: CONTACT },
  ],
};

export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  hi: "हिन्दी",
  it: "Italiano",
  ja: "日本語",
  ko: "한국어",
  nl: "Nederlands",
  pt: "Português",
  ru: "Русский",
  ar: "العربية",
  el: "Ελληνικά",
  hr: "Hrvatski",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  tr: "Türkçe",
};
