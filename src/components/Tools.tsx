"use client";

import { usePathname } from "next/navigation";
import { isTargetLanguage, type Locale } from "@/lib/locales";
import { useTranslation } from "@/lib/i18n/useTranslation";

function detectLocale(pathname: string | null): Locale {
  if (!pathname) return "en";
  const path = pathname.startsWith("/intl/") ? pathname.slice(5) : pathname;
  const first = path.split("/").filter(Boolean)[0];
  if (first && isTargetLanguage(first)) return first;
  return "en";
}

// Product names "Command Central" and "ERPCV" are proper nouns — do-not-
// translate. Stay inline. Icons stay inline (SVG). The rest of each card
// flows through MESSAGES via the two cardN* fields.

export default function Tools() {
  const pathname = usePathname();
  const { messages: m } = useTranslation(detectLocale(pathname));
  const TOOLS = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
      ),
      name: "Command Central",
      type: m.tools.card1Type,
      title: m.tools.card1Title,
      body: m.tools.card1Body,
      cta: m.tools.card1Cta,
      href: "https://commandcc.io",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      name: "ERPCV",
      type: m.tools.card2Type,
      title: m.tools.card2Title,
      body: m.tools.card2Body,
      cta: m.tools.card2Cta,
      href: "https://erpcv3.vercel.app/",
    },
  ];
  return (
    <section
      id="tools"
      className="bg-corbeau text-bone"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          {m.tools.eyebrow}
        </p>
        <h2
          aria-label={`${m.tools.h2Lead} ${m.tools.h2Emphasis}`}
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-bone"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          <span aria-hidden>
            {`${m.tools.h2Lead} `}
            <span className="cc-emphasis-italic">{m.tools.h2Emphasis}</span>
          </span>
        </h2>
        <p className="text-moon text-[1rem] max-w-[520px] leading-[1.7] mb-12">
          {m.tools.intro}
        </p>

        <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
          {TOOLS.map((t) => (
            <div
              key={t.name}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--spotlight-x", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--spotlight-y", `${e.clientY - r.top}px`);
              }}
              className="cc-spotlight bg-haiti border border-white/[0.06] rounded-[14px] overflow-hidden transition-all duration-300 hover:border-papaya/20 hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
            >
              <div className="px-[18px] py-3 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-papaya">{t.icon}</span>
                  <span className="font-mono text-[0.75rem] font-semibold text-bone">{t.name}</span>
                </div>
                <span
                  className="font-mono text-[0.6rem] px-2 py-0.5 rounded font-semibold uppercase tracking-[1px] text-papaya"
                  style={{ background: "rgba(252,152,90,0.1)" }}
                >
                  {t.type}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-[1.3rem] font-extrabold tracking-[-0.02em] mb-2 text-bone">{t.title}</h3>
                <p className="text-moon text-[0.92rem] leading-[1.65] mb-3">{t.body}</p>
                <a
                  href={t.href}
                  className="inline-flex items-center font-mono text-papaya no-underline text-[0.82rem] font-semibold transition-colors hover:text-[#fdaa78] min-h-[44px] py-2.5 -my-2.5"
                  target={t.href.startsWith("http") ? "_blank" : undefined}
                  rel={t.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {t.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
