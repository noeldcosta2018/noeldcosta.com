"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { isTargetLanguage, type Locale } from "@/lib/locales";
import { stripMarkers, useTranslation } from "@/lib/i18n/useTranslation";

function detectLocale(pathname: string | null): Locale {
  if (!pathname) return "en";
  const path = pathname.startsWith("/intl/") ? pathname.slice(5) : pathname;
  const first = path.split("/").filter(Boolean)[0];
  if (first && isTargetLanguage(first)) return first;
  return "en";
}

// Project rows split between static (client names, numeric metrics,
// terminal-style dashboard labels, badge type, active phase, tag
// arrays) and translated (title, desc, metric labels) — see
// MESSAGES.trackRecord.projects in src/lib/i18n/messages.ts. The
// translated fields contain `<noTranslate>...</noTranslate>` wrappers
// around non-glossary proper nouns (IPSAS, Azure, AWS, Microsoft, MEA,
// PIF, EBS, Fusion Cloud, TOGAF, P&L); stripMarkers() removes the
// wrappers at render time so they don't show up in the DOM.
//
// Tag arrays stay inline — heavy on subsidiary proper nouns (NIMR,
// HALCON, SIGN4L) and visually compact badge UI; the translation
// pipeline's glossary handles SAP/Oracle/S-4HANA-family names that
// appear inside tag arrays, but the per-project mix isn't worth
// modelling in MESSAGES until the badge UI itself is reconsidered.

/**
 * Track-record section with sticky right-panel content swap.
 *
 * The left list is a vertical sequence of programmes. As each enters the
 * viewport (50 % visible), the right-side dashboard crossfades its
 * metrics, phase-bar position, and tag list to match. On lg+ the panel
 * is sticky; on smaller screens it stacks under the list and the swap
 * still works (just without the sticky behaviour).
 *
 * Implementation: one IntersectionObserver shared across rows. Active
 * index lives in component state. AnimatePresence handles the crossfade
 * (320 ms quart-out). No external triggers, no scroll listeners.
 *
 * Every dashboard number is sourced from the project's own desc string
 * — no invented metrics.
 */

type Phase = "DISCOVER" | "PREPARE" | "EXPLORE" | "REALIZE" | "DEPLOY";

type ProjectData = {
  company: string;
  badge: string;
  badgeType: "p" | "g" | "c";
  title: string;
  desc: string;
  dashboardLabel: string;
  metrics: { lbl: string; val: string; color: "text-papaya" | "text-brand-green" | "text-corbeau" }[];
  activePhase: Phase;
  tags: string[];
};

// Static parts of each project — client names (proper nouns), badge
// text (numeric + proper-noun mix), dashboard labels (terminal-style
// identifiers), metric values (numerics + glossary-protected acronyms),
// metric colors (visual classes), active phase, tag arrays. None of
// these translate.
type ProjectStatic = {
  company: string;
  badge: string;
  badgeType: "p" | "g" | "c";
  dashboardLabel: string;
  metricVals: [string, string, string, string];
  metricColors: [
    "text-papaya" | "text-brand-green" | "text-corbeau",
    "text-papaya" | "text-brand-green" | "text-corbeau",
    "text-papaya" | "text-brand-green" | "text-corbeau",
    "text-papaya" | "text-brand-green" | "text-corbeau",
  ];
  activePhase: Phase;
  tags: string[];
};

const PROJECTS_STATIC: ProjectStatic[] = [
  {
    company: "EDGE Group",
    badge: "$60M saved",
    badgeType: "p",
    dashboardLabel: "edge.dashboard",
    metricVals: ["$60M", "81%", "126", "8 → 1"],
    metricColors: ["text-papaya", "text-brand-green", "text-corbeau", "text-papaya"],
    activePhase: "REALIZE",
    tags: ["EDGE HQ", "NIMR", "HALCON", "SIGN4L", "AL TARIQ", "+20 more"],
  },
  {
    company: "Etihad Airways",
    badge: "$400M+ impact",
    badgeType: "g",
    dashboardLabel: "etihad.dashboard",
    metricVals: ["$400M+", "$36M", "100+", "1,000+"],
    metricColors: ["text-papaya", "text-brand-green", "text-corbeau", "text-papaya"],
    activePhase: "DEPLOY",
    tags: ["Finance", "SAP COE", "Route P&L", "8 years"],
  },
  {
    company: "TII",
    badge: "Greenfield",
    badgeType: "c",
    dashboardLabel: "tii.dashboard",
    metricVals: ["5", "Greenfield", "Dual", "IPSAS"],
    metricColors: ["text-papaya", "text-brand-green", "text-corbeau", "text-papaya"],
    activePhase: "DEPLOY",
    tags: ["S/4HANA", "Azure", "AWS", "Cash + Accrual", "Hypercare"],
  },
  {
    company: "DXC Technology",
    badge: "$300M pipeline",
    badgeType: "p",
    dashboardLabel: "mea.practice",
    metricVals: ["$300M", "800+", "3", "MEA"],
    metricColors: ["text-papaya", "text-brand-green", "text-corbeau", "text-papaya"],
    activePhase: "DEPLOY",
    tags: ["SAP", "Oracle", "Microsoft", "PIF", "Banking", "Public Sector"],
  },
  {
    company: "Govt. Enablement",
    badge: "84 entities",
    badgeType: "c",
    dashboardLabel: "govt.dashboard",
    metricVals: ["84", "EBS → Fusion", "TOGAF", "Advisor"],
    metricColors: ["text-papaya", "text-brand-green", "text-corbeau", "text-papaya"],
    activePhase: "REALIZE",
    tags: ["Oracle EBS", "Oracle Fusion", "Enterprise Arch", "Strategy"],
  },
];

const ALL_PHASES: Phase[] = ["DISCOVER", "PREPARE", "EXPLORE", "REALIZE", "DEPLOY"];

function badgeStyle(type: "p" | "g" | "c") {
  if (type === "g") return { background: "rgba(34,197,94,0.12)", color: "#22c55e" };
  if (type === "c") return { background: "rgba(226,130,107,0.12)", color: "#e2826b" };
  return { background: "rgba(252,152,90,0.12)", color: "#fc985a" };
}

export default function TrackRecord() {
  const pathname = usePathname();
  const { messages: m } = useTranslation(detectLocale(pathname));
  const [activeIdx, setActiveIdx] = useState(0);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();

  // Build the per-project view-model by merging the static fields with
  // the translated title/desc/metric labels from MESSAGES. stripMarkers
  // removes the `<noTranslate>...</noTranslate>` wrappers around proper
  // nouns and non-glossary acronyms (the wrappers survive in the
  // translated MDX/TS files for idempotency, but they're authoring
  // metadata only — never rendered to the DOM).
  const PROJECTS: ProjectData[] = PROJECTS_STATIC.map((p, i) => {
    const t = m.trackRecord.projects[i];
    return {
      company: p.company,
      badge: p.badge,
      badgeType: p.badgeType,
      title: stripMarkers(t.title),
      desc: stripMarkers(t.desc),
      dashboardLabel: p.dashboardLabel,
      metrics: [
        { lbl: stripMarkers(t.metric1Lbl), val: p.metricVals[0], color: p.metricColors[0] },
        { lbl: stripMarkers(t.metric2Lbl), val: p.metricVals[1], color: p.metricColors[1] },
        { lbl: stripMarkers(t.metric3Lbl), val: p.metricVals[2], color: p.metricColors[2] },
        { lbl: stripMarkers(t.metric4Lbl), val: p.metricVals[3], color: p.metricColors[3] },
      ],
      activePhase: p.activePhase,
      tags: p.tags,
    };
  });

  useEffect(() => {
    // Pick the row whose intersection ratio is highest. Threshold 0.5 so
    // a row only "wins" once it's clearly in the centre of the viewport,
    // not just barely poking in. Single observer for all rows.
    const observer = new IntersectionObserver(
      (entries) => {
        let bestIdx = activeIdx;
        let bestRatio = 0;
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > bestRatio) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            if (!Number.isNaN(idx)) {
              bestRatio = e.intersectionRatio;
              bestIdx = idx;
            }
          }
        }
        if (bestRatio > 0 && bestIdx !== activeIdx) {
          setActiveIdx(bestIdx);
        }
      },
      { threshold: [0.5, 0.75, 1] }
    );

    rowRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = PROJECTS[activeIdx];
  const fadeDur = reduced ? 0 : 0.32;

  return (
    <section
      id="track"
      className="bg-bone"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          {m.trackRecord.eyebrow}
        </p>
        <h2
          aria-label={`${m.trackRecord.h2Lead} ${m.trackRecord.h2Emphasis}`}
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          <span aria-hidden>
            {`${m.trackRecord.h2Lead} `}
            <span className="cc-emphasis-italic">{m.trackRecord.h2Emphasis}</span>
          </span>
        </h2>
        <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-12">
          {m.trackRecord.intro}
        </p>

        <div className="grid grid-cols-2 gap-14 items-start max-lg:grid-cols-1 max-lg:gap-8">
          {/* Project list. On < lg the dashboard renders above the list
              (CSS order) so the active-project showcase is visible before
              the user scrolls past it — the previous layout buried the
              dashboard below five list rows, off-screen on mobile. */}
          <div className="flex flex-col max-lg:order-2">
            {PROJECTS.map((p, i) => (
              <div
                key={p.company}
                ref={(el) => { rowRefs.current[i] = el; }}
                data-idx={i}
                aria-current={i === activeIdx ? "true" : undefined}
                className={`py-5 border-b border-corbeau/[0.06] transition-opacity duration-300 opacity-100 hover:opacity-60 ${
                  i === 0 ? "pt-0" : ""
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[0.72rem] uppercase tracking-[2px] text-eyebrow">{p.company}</span>
                  <span
                    className="font-mono text-[0.62rem] px-2 py-0.5 rounded font-semibold"
                    style={badgeStyle(p.badgeType)}
                  >
                    {p.badge}
                  </span>
                </div>
                <h4 className="font-display text-[1.05rem] font-bold tracking-[-0.02em] mb-1">{p.title}</h4>
                <p className="text-night text-[0.85rem] leading-[1.55]">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Dashboard mockup — content swaps with AnimatePresence.
              Sticky only at lg+ where it shares a row with the project
              list. At < lg it renders above the list (order-1) and stays
              in normal flow so the user actually sees it. */}
          <div
            className="cc-card relative rounded-2xl overflow-hidden max-lg:order-1 max-lg:max-w-[500px] max-lg:mx-auto max-lg:w-full lg:sticky lg:top-[84px]"
            style={{ boxShadow: "0 24px 48px -12px rgba(14,16,32,0.15)" }}
          >
            <div className="cc-scan-line" />
            <div className="flex items-center justify-between px-[18px] py-3 bg-corbeau/[0.02] border-b border-corbeau/[0.06]">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={active.dashboardLabel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: fadeDur, ease: [0.22, 1, 0.36, 1] }}
                    className="font-mono text-[0.7rem] text-silver ml-2.5"
                  >
                    {active.dashboardLabel}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] text-brand-green font-semibold">
                <span className="w-[5px] h-[5px] rounded-full bg-brand-green animate-pulse-dot" />
                {m.trackRecord.liveBadge}
              </span>
            </div>

            <div className="p-5">
              {/* Metrics — crossfade as a single block keyed by project.
                  initial={false} on AnimatePresence so first paint matches
                  SSR (no hydration mismatch); subsequent key changes still
                  use the initial/exit values for the crossfade. */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.company}
                  initial={{ opacity: 0, y: reduced ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduced ? 0 : -6 }}
                  transition={{ duration: fadeDur, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-2 gap-2.5 mb-2.5"
                >
                  {active.metrics.map((metric) => (
                    <div key={metric.lbl} className="bg-cream border border-corbeau/[0.04] rounded-[10px] p-4">
                      <p className="font-mono text-[0.6rem] text-silver uppercase tracking-[1.5px] mb-1">{metric.lbl}</p>
                      <p className={`font-display font-black text-2xl tracking-[-0.03em] tabular-nums ${metric.color}`}>{metric.val}</p>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Phase bar — same shape always, just the active position changes */}
              <div>
                <p className="font-mono text-[0.6rem] text-silver uppercase tracking-[1.5px] mb-2">{m.trackRecord.programmePhasesLabel}</p>
                <div className="flex gap-1 h-[30px] rounded-lg overflow-hidden">
                  {ALL_PHASES.map((label) => {
                    const isActive = label === active.activePhase;
                    const isDone = ALL_PHASES.indexOf(label) < ALL_PHASES.indexOf(active.activePhase);
                    return (
                      <div
                        key={label}
                        className={`flex items-center justify-center font-mono text-[0.58rem] font-semibold rounded-[5px] flex-1 transition-colors duration-300 ${
                          isActive
                            ? "bg-papaya text-corbeau animate-soft-pulse"
                            : isDone
                              ? "bg-brand-green text-white"
                              : "text-silver"
                        }`}
                        style={!isActive && !isDone ? { background: "rgba(14,16,32,0.06)" } : {}}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tag row — crossfade as a single block */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`tags-${active.company}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: fadeDur, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-wrap gap-[5px] mt-2.5 pt-2.5 border-t border-corbeau/[0.06]"
                >
                  {active.tags.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[0.6rem] px-2 py-0.5 rounded bg-cream border border-corbeau/[0.06] text-night"
                    >
                      {t}
                    </span>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
