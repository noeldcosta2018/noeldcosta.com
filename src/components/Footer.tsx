import Link from "next/link";
import SignupForm from "@/components/site/SignupForm";
import CookieSettingsButton from "@/components/site/CookieSettingsButton";
import { signupCopy } from "@/components/site/signup-copy";
import { hasTranslation, translator } from "@/i18n";
import { localizeHref } from "@/lib/link-repair";
import type { Locale } from "@/lib/content";
import { getArticleMessages } from "@/lib/article-localization";
import { publicPrefixFromContentLocale } from "@/lib/locale-url";
import {
  ABOUT,
  ACADEMY,
  ARTICLES_INDEX,
  CLIENT_WORK,
  CONTACT,
  EXPERTISE,
  ERPCV,
  LINKEDIN,
  SAPOPEDIA,
  YOUTUBE,
  type MenuGroup,
} from "@/data/site-menu";

const COLUMNS: MenuGroup[] = [
  {
    title: "Expertise",
    links: [
      { label: "All expertise", href: EXPERTISE },
      { label: "SAP implementation", href: "/sap-implementation/" },
      { label: "Oracle, Microsoft and ServiceNow", href: "/erp-ai-services/#oracle" },
      { label: "Data and analytics", href: "/erp-ai-services/#databricks" },
      { label: "Enterprise and private AI", href: "/erp-ai-services/#enterprise-ai" },
      { label: "AI governance", href: "/ai-governance-services/" },
    ],
  },
  {
    title: "Work and academy",
    links: [
      { label: "Case studies", href: CLIENT_WORK },
      { label: "Case study articles", href: "/category/sap-case-studies/" },
      { label: "AI Academy", href: ACADEMY },
      { label: "Consulting career guides", href: "/consulting-career-guides/" },
    ],
  },
  {
    title: "Articles",
    links: [
      { label: "All articles", href: ARTICLES_INDEX },
      { label: "ERP consulting guide", href: "/category/erp-consulting-guide/" },
      { label: "ERP strategy", href: "/category/erp-strategy/" },
      { label: "SAP modules", href: "/category/sap-modules/" },
      { label: "AI governance", href: "/category/ai-governance/" },
      { label: "Agentic AI", href: "/category/agentic-ai/" },
      { label: "Books", href: "/books/" },
    ],
  },
  {
    title: "Free tools",
    links: [
      { label: "SAP cost calculator", href: "/sap-implementation-cost-calculator/" },
      { label: "ERP cost calculator", href: "/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/" },
      { label: "Migration estimator", href: "/free-data-migration-estimator-sap-oracle-microsoft/" },
      { label: "S/4HANA assessment", href: "/sap-s4hana-migration-strategy-greenfield-vs-brownfield/" },
      { label: "JD generator", href: "/sap-job-description-generator/" },
      { label: "Solution builder", href: "/sap-solution-builder/" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "My story", href: ABOUT },
      { label: "Partners", href: "/all-our-partners/" },
      { label: "Contributions", href: "/contributions-sap-experts-industry-professionals/" },
      { label: "Write for us", href: "/write-for-us-lets-share-our-experiences/" },
      { label: "Contact", href: CONTACT },
      { label: "Privacy", href: "/privacy-policy-noeldcosta/" },
      { label: "Terms", href: "/terms/" },
    ],
  },
];

/** signup: false on pages that already show the sign-up band (the homepage), so one page never carries two identical forms. */
export default function Footer({ locale = "en", signup = true }: { locale?: Locale; signup?: boolean }) {
  const messages = getArticleMessages(locale);
  const tr = translator(locale);
  const prefix = publicPrefixFromContentLocale(locale);
  const href = (h: string) => localizeHref(prefix, h);
  const translated = locale === "en" || hasTranslation(locale, "Expertise");
  return (
    <footer className="nd-footer" lang={translated ? undefined : "en"}>
      <div className="nd-container">
        {!translated && messages.englishDestinationNotice && (
          <p
            lang={publicPrefixFromContentLocale(locale) ?? "en"}
            style={{ paddingTop: 32, fontSize: 13, color: "var(--mut)" }}
          >
            {messages.englishDestinationNotice}
          </p>
        )}
        {signup && (
          <div className="nd-footer-signup" id="newsletter">
            <div>
              <h2 className="nd-display">{tr("New articles, first.")}</h2>
              <p>{tr("Articles, videos and AI Academy updates by email. Leave any time.")}</p>
            </div>
            <SignupForm source="footer" copy={signupCopy(locale)} />
          </div>
        )}
        <div className="cols">
          <div className="about">
            <Link className="nd-brand" href={href("/")} aria-label={tr("Noel D'Costa, home")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="nd-on-dark" src="/brand/nd-monogram-on-dark.svg" alt="" width={36} height={22} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="nd-on-light" src="/brand/nd-monogram.svg" alt="" width={36} height={22} />
              <span className="word">NOEL DCOSTA</span>
            </Link>
            <p>
              {tr(
                "Enterprise applications, data and AI. I work with leadership teams to choose the right platforms, deliver programmes and put AI to work where it earns its place.",
              )}
            </p>
            <div style={{ marginTop: 20 }}>
              <Link className="nd-btn nd-btn-primary magnetic" href={href(CONTACT)}>
                {tr("Discuss your project")} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="group">{tr(col.title)}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={href(l.href)}>{tr(l.label)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="bar">
          <div className="nd-social">
            <a href={LINKEDIN} target="_blank" rel="me noopener noreferrer">
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              LinkedIn
            </a>
            <a href={YOUTUBE} target="_blank" rel="me noopener noreferrer">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
              </svg>
              YouTube
            </a>
            <a href={ERPCV} target="_blank" rel="noopener">
              ERPCV
            </a>
            <a href={SAPOPEDIA} target="_blank" rel="noopener">
              SAPopedia
            </a>
            <a href="mailto:solutions@noeldcosta.com">
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <polyline points="22,4 12,13 2,4" />
              </svg>
              solutions@noeldcosta.com
            </a>
          </div>
          <span className="legal">
            <CookieSettingsButton label={tr("Cookie settings")} />
            © 2026 Noel D&apos;Costa. {tr("This website is operated and maintained by Quantinoid LLC")}
          </span>
        </div>
      </div>
    </footer>
  );
}
