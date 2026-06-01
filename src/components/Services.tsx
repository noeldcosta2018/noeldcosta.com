"use client";

import { ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { isTargetLanguage, type Locale } from "@/lib/locales";
import { useTranslation } from "@/lib/i18n/useTranslation";

// Auto-detect locale from URL — same pattern as Nav and LanguageSwitcher.
function detectLocale(pathname: string | null): Locale {
  if (!pathname) return "en";
  const path = pathname.startsWith("/intl/") ? pathname.slice(5) : pathname;
  const first = path.split("/").filter(Boolean)[0];
  if (first && isTargetLanguage(first)) return first;
  return "en";
}

function ServiceCard({
  num,
  title,
  who,
  paras,
  list,
  cta,
  ctaHref,
  gradient,
}: {
  num: string;
  title: string;
  who: string;
  paras: string[];
  list: string[];
  cta: string;
  ctaHref: string;
  gradient: string;
}) {
  return (
    <div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--spotlight-x", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--spotlight-y", `${e.clientY - r.top}px`);
      }}
      className="cc-spotlight relative bg-haiti border border-white/[0.06] rounded-2xl p-10 overflow-hidden transition-all duration-300 hover:border-papaya/20 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]"
    >
      {/* top accent line — gradient follows reading direction so it sweeps
          left-to-right in LTR and right-to-left in RTL. */}
      <div className={`absolute top-0 inset-x-0 h-0.5 ltr:bg-gradient-to-r rtl:bg-gradient-to-l ${gradient}`} />

      <p className="font-mono text-[0.72rem] text-silver tracking-[2px] uppercase mb-3.5">{num}</p>
      <h3 className="font-display text-[1.4rem] font-extrabold text-bone tracking-[-0.03em] mb-1">
        {title}
      </h3>
      <p className="font-mono text-canyon text-[0.72rem] font-medium uppercase tracking-[1.5px] mb-4">
        {who}
      </p>
      {paras.map((p, i) => (
        <p key={i} className="text-moon text-[0.92rem] leading-[1.7] mb-3.5">
          {p}
        </p>
      ))}
      <ul className="flex flex-col gap-2 mb-5">
        {list.map((item, i) => (
          <li
            key={i}
            className="text-[0.88rem] text-moon ps-[22px] relative leading-[1.5]"
          >
            <span
              className="absolute start-0 top-[6px] w-2 h-2 rounded-[2px] border border-papaya"
              style={{ background: "rgba(252,152,90,0.2)" }}
            />
            {item}
          </li>
        ))}
      </ul>
      <a
        href={ctaHref}
        className="inline-flex items-center gap-1.5 font-mono text-papaya no-underline text-[0.82rem] font-semibold transition-colors hover:text-[#fdaa78] min-h-[44px] py-2.5 -my-2.5"
      >
        {cta}
        <ArrowRight size={14} className="rtl:-scale-x-100" aria-hidden />
      </a>
    </div>
  );
}

export default function Services() {
  const pathname = usePathname();
  const { messages: m } = useTranslation(detectLocale(pathname));
  return (
    <section
      id="services"
      className="bg-corbeau text-bone"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          {m.services.eyebrow}
        </p>
        <h2
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-bone"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          {m.services.h2Lead}{" "}
          <em className="not-italic text-papaya font-extrabold">
            {m.services.h2Emphasis}
          </em>
        </h2>
        <p className="text-moon text-[1rem] max-w-[520px] leading-[1.7] mb-12">
          {m.services.intro}
        </p>

        <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
          <ServiceCard
            num={m.services.card1.numberEyebrow}
            title={m.services.card1.title}
            who={m.services.card1.who}
            paras={[...m.services.card1.paragraphs]}
            list={[...m.services.card1.bullets]}
            cta={m.services.card1.cta}
            ctaHref="#cta"
            gradient="from-papaya to-canyon"
          />
          <ServiceCard
            num={m.services.card2.numberEyebrow}
            title={m.services.card2.title}
            who={m.services.card2.who}
            paras={[...m.services.card2.paragraphs]}
            list={[...m.services.card2.bullets]}
            cta={m.services.card2.cta}
            ctaHref="#tools"
            gradient="from-canyon to-papaya"
          />
        </div>
      </div>
    </section>
  );
}
