"use client";

import { useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import FadeUp from "@/components/article/FadeUp";
import { getModuleById } from "@/lib/sap-modules";
import {
  getIndustries,
  getCompanySizes,
  type IndustryId,
  type CompanySizeId,
} from "@/lib/solution-builder/data";
import {
  buildRoadmap,
  defaultModulesFor,
  formatUsd,
  moduleToRow,
  type ModuleRow,
  type Roadmap,
} from "@/lib/solution-builder/engine";
import { isTargetLanguage, type Locale } from "@/lib/locales";
import { useTranslation, interpolate, stripMarkers } from "@/lib/i18n/useTranslation";

// Auto-detect locale — same pattern as the rest of Pass 2a/2b client
// components. Helper is duplicated across components; flagged for
// consolidation in _docs/post-launch-backlog.md.
function detectLocale(pathname: string | null): Locale {
  if (!pathname) return "en";
  const path = pathname.startsWith("/intl/") ? pathname.slice(5) : pathname;
  const first = path.split("/").filter(Boolean)[0];
  if (first && isTargetLanguage(first)) return first;
  return "en";
}

// Strip <noTranslate> markers across the solutionBuilder sub-tree at
// the boundary. Pass 2b-1a's deepStripMarkers pattern.
function deepStripMarkers<T>(value: T): T {
  if (typeof value === "string") return stripMarkers(value) as unknown as T;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return (value as unknown[]).map((v) => deepStripMarkers(v)) as unknown as T;
  }
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(value as Record<string, unknown>)) {
    out[k] = deepStripMarkers((value as Record<string, unknown>)[k]);
  }
  return out as T;
}

// ─── Sub-components ──────────────────────────────────────────────────

function ModuleTable({
  title,
  tone,
  rows,
  moduleSingular,
  modulePlural,
  headers,
}: {
  title: string;
  tone: "mandatory" | "industry" | "recommended";
  rows: ModuleRow[];
  moduleSingular: string;
  modulePlural: string;
  headers: {
    module: string;
    license: string;
    quantity: string;
    category: string;
    description: string;
  };
}) {
  if (rows.length === 0) return null;
  const headerBg = {
    mandatory: "bg-papaya/12 text-papaya",
    industry: "bg-canyon/12 text-canyon",
    recommended: "bg-corbeau/[0.05] text-corbeau",
  }[tone];
  const accentBar = {
    mandatory: "bg-papaya",
    industry: "bg-canyon",
    recommended: "bg-corbeau/40",
  }[tone];

  return (
    <FadeUp className="rounded-xl border border-corbeau/10 overflow-hidden mb-6 bg-paper">
      <div className={`flex items-center gap-3 px-5 py-3 ${headerBg}`}>
        <span aria-hidden className={`w-1.5 h-5 rounded-full ${accentBar}`} />
        <h4 className="font-display font-bold text-[1rem] tracking-[-0.015em]">
          {title}
        </h4>
        <span className="ml-auto font-mono text-[0.7rem] tracking-[1.4px] uppercase opacity-70">
          {rows.length} {rows.length === 1 ? moduleSingular : modulePlural}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-[0.88rem]">
          <thead>
            <tr className="bg-bone/60 border-b border-corbeau/8">
              <th className="text-left font-mono font-semibold text-[0.65rem] tracking-[1.6px] uppercase text-corbeau/55 py-2.5 px-4">{headers.module}</th>
              <th className="text-left font-mono font-semibold text-[0.65rem] tracking-[1.6px] uppercase text-corbeau/55 py-2.5 px-4">{headers.license}</th>
              <th className="text-left font-mono font-semibold text-[0.65rem] tracking-[1.6px] uppercase text-corbeau/55 py-2.5 px-4">{headers.quantity}</th>
              <th className="text-left font-mono font-semibold text-[0.65rem] tracking-[1.6px] uppercase text-corbeau/55 py-2.5 px-4">{headers.category}</th>
              <th className="text-left font-mono font-semibold text-[0.65rem] tracking-[1.6px] uppercase text-corbeau/55 py-2.5 px-4">{headers.description}</th>
            </tr>
          </thead>
          <tbody className="[&>tr]:transition-colors [&>tr:hover]:bg-papaya/[0.04]">
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-corbeau/6">
                <td className="py-3 px-4 font-semibold text-corbeau">{r.label}</td>
                <td className="py-3 px-4 font-mono text-[0.78rem] text-night/75 tabular-nums whitespace-nowrap">{r.licenseType}</td>
                <td className="py-3 px-4 font-mono text-[0.78rem] text-night/75 tabular-nums whitespace-nowrap">{r.quantity}</td>
                <td className="py-3 px-4 text-night/80">{r.category}</td>
                <td className="py-3 px-4 text-night/75 leading-[1.5]">{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FadeUp>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "papaya" | "corbeau" | "night";
}) {
  const styles = {
    papaya:
      "bg-gradient-to-br from-papaya to-[#fda66e] text-corbeau shadow-[0_8px_32px_rgba(252,152,90,0.25)]",
    corbeau:
      "bg-paper text-corbeau border border-corbeau/10 shadow-[0_2px_14px_rgba(14,16,32,0.04)]",
    night:
      "bg-corbeau text-bone shadow-[0_8px_32px_rgba(14,16,32,0.18)]",
  }[accent];

  const labelStyles = {
    papaya: "text-corbeau/70",
    corbeau: "text-papaya",
    night: "text-bone/65",
  }[accent];

  return (
    <div className={`rounded-2xl px-6 py-6 ${styles}`}>
      <p className={`font-mono text-[0.62rem] font-semibold uppercase tracking-[2px] mb-3 ${labelStyles}`}>
        {label}
      </p>
      <p
        className="font-display font-black tracking-tight leading-none tabular-nums"
        style={{ fontSize: "clamp(2rem, 4.8vw, 3rem)" }}
      >
        {value}
      </p>
    </div>
  );
}

function PhaseCard({
  phase,
  index,
  locale,
  focusPrefix,
  modulesCaption,
  monthsTemplate,
}: {
  phase: Roadmap["phases"][number];
  index: number;
  locale: Locale;
  focusPrefix: string;
  modulesCaption: string;
  monthsTemplate: string;
}) {
  return (
    <FadeUp delay={index * 80} className="relative pl-10">
      {/* timeline dot + connector */}
      <span aria-hidden className="absolute left-3 top-3 w-3 h-3 rounded-full bg-papaya shadow-[0_0_0_4px_rgba(252,152,90,0.18)]" />
      <span aria-hidden className="absolute left-[18px] top-6 bottom-[-1.5rem] w-px bg-corbeau/15" />

      <div className="rounded-xl border border-corbeau/10 bg-paper p-6 shadow-[0_2px_14px_rgba(14,16,32,0.04)]">
        <div className="flex items-baseline justify-between gap-4 mb-2">
          <h4 className="font-display font-black text-corbeau text-[1.05rem] md:text-[1.15rem] tracking-[-0.02em]">
            {phase.label}
          </h4>
          <span className="font-mono font-bold text-papaya text-[0.85rem] tabular-nums whitespace-nowrap">
            {interpolate(monthsTemplate, { n: phase.durationMonths })}
          </span>
        </div>
        <p className="text-night/75 text-[0.92rem] leading-[1.55] mb-4">
          {phase.description}
        </p>
        <p className="text-[0.78rem] text-night/65 mb-4">
          <span className="font-semibold text-corbeau">{focusPrefix}</span>{" "}
          {phase.focusAreas.join(" · ")}
        </p>
        <p className="font-mono text-[0.62rem] tracking-[1.6px] uppercase text-corbeau/55 mb-2">
          {modulesCaption}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {phase.moduleIds.map((id) => {
            const m = getModuleById(id, locale);
            if (!m) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-papaya/10 text-corbeau text-[0.74rem] font-semibold"
                title={m.description}
              >
                {m.code && (
                  <span className="font-mono text-[0.66rem] opacity-65">{m.code}</span>
                )}
                {m.label}
              </span>
            );
          })}
        </div>
      </div>
    </FadeUp>
  );
}

// ─── Main client ─────────────────────────────────────────────────────

export default function SolutionClient() {
  const pathname = usePathname();
  const locale = detectLocale(pathname);
  const { messages } = useTranslation(locale);
  // One-shot strip on the whole solutionBuilder sub-tree.
  const m = useMemo(
    () => deepStripMarkers(messages.solutionBuilder),
    [messages.solutionBuilder],
  );

  const industries = useMemo(() => getIndustries(locale), [locale]);
  const companySizes = useMemo(() => getCompanySizes(locale), [locale]);

  const [industryId, setIndustryId] = useState<IndustryId | "">("");
  const [companySizeId, setCompanySizeId] = useState<CompanySizeId | "">("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [extraModuleIds, setExtraModuleIds] = useState<string[]>([]);
  const [removedModuleIds, setRemovedModuleIds] = useState<Set<string>>(new Set());
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const industry = industries.find((i) => i.id === industryId);
  const size = companySizes.find((s) => s.id === companySizeId);
  const canGenerate = Boolean(industryId && companySizeId);

  const defaults = useMemo(() => {
    if (!industryId) return null;
    return defaultModulesFor(industryId as IndustryId);
  }, [industryId]);

  const allSelectedIds = useMemo(() => {
    if (!defaults) return [];
    const set = new Set<string>([
      ...defaults.mandatory,
      ...defaults.industry,
      ...defaults.recommended,
      ...extraModuleIds,
    ]);
    for (const r of removedModuleIds) set.delete(r);
    return Array.from(set);
  }, [defaults, extraModuleIds, removedModuleIds]);

  const mandatoryRows = useMemo(() => {
    if (!defaults || !companySizeId) return [];
    return defaults.mandatory
      .map((id) => moduleToRow(id, companySizeId as CompanySizeId, locale))
      .filter((r): r is ModuleRow => Boolean(r));
  }, [defaults, companySizeId, locale]);

  const industryRows = useMemo(() => {
    if (!defaults || !companySizeId) return [];
    return defaults.industry
      .map((id) => moduleToRow(id, companySizeId as CompanySizeId, locale))
      .filter((r): r is ModuleRow => Boolean(r));
  }, [defaults, companySizeId, locale]);

  const recommendedRows = useMemo(() => {
    if (!defaults || !companySizeId) return [];
    return defaults.recommended
      .map((id) => moduleToRow(id, companySizeId as CompanySizeId, locale))
      .filter((r): r is ModuleRow => Boolean(r));
  }, [defaults, companySizeId, locale]);

  const scrollToTop = () => {
    const el = containerRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const goToStep2 = () => {
    setStep(2);
    scrollToTop();
  };

  const generateRoadmap = () => {
    if (!industryId || !companySizeId) return;
    const result = buildRoadmap(
      {
        industryId: industryId as IndustryId,
        companySizeId: companySizeId as CompanySizeId,
        selectedModuleIds: allSelectedIds,
      },
      locale,
    );
    if (result) {
      setRoadmap(result);
      setStep(3);
      setTimeout(scrollToTop, 50);
    }
  };

  const resetAll = () => {
    setIndustryId("");
    setCompanySizeId("");
    setExtraModuleIds([]);
    setRemovedModuleIds(new Set());
    setRoadmap(null);
    setStep(1);
    scrollToTop();
  };

  const moduleTableHeaders = {
    module: m.moduleTableModule,
    license: m.moduleTableLicense,
    quantity: m.moduleTableQuantity,
    category: m.moduleTableCategory,
    description: m.moduleTableDescription,
  };

  return (
    <div ref={containerRef}>
      {/* ─── Step 1 + 2 form (always visible until roadmap) ────────── */}
      {step < 3 && (
        <div className="bg-paper border border-corbeau/[0.08] rounded-2xl p-6 md:p-8 shadow-[0_2px_20px_rgba(14,16,32,0.04)]">
          <h2 className="font-display font-bold text-corbeau text-[1.35rem] tracking-[-0.02em] mb-6">
            {m.formHeading}
          </h2>

          {/* Industry + Size selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block font-mono text-[0.68rem] font-semibold uppercase tracking-[1.6px] text-night mb-1.5">
                {m.industryLabel} <span className="text-papaya">*</span>
              </label>
              <select
                value={industryId}
                onChange={(e) => {
                  setIndustryId(e.target.value as IndustryId | "");
                  setExtraModuleIds([]);
                  setRemovedModuleIds(new Set());
                }}
                className="w-full rounded-md border border-corbeau/15 bg-paper px-3.5 py-2.5 text-corbeau focus:outline-none focus:border-papaya focus:ring-2 focus:ring-papaya/20"
              >
                <option value="">{m.industrySelectPlaceholder}</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.id}>{ind.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[0.68rem] font-semibold uppercase tracking-[1.6px] text-night mb-1.5">
                {m.companySizeLabel} <span className="text-papaya">*</span>
              </label>
              <select
                value={companySizeId}
                onChange={(e) => setCompanySizeId(e.target.value as CompanySizeId | "")}
                className="w-full rounded-md border border-corbeau/15 bg-paper px-3.5 py-2.5 text-corbeau focus:outline-none focus:border-papaya focus:ring-2 focus:ring-papaya/20"
              >
                <option value="">{m.companySizeSelectPlaceholder}</option>
                {companySizes.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Best practices callout — visible once industry chosen */}
          {industry && (
            <FadeUp className="rounded-xl bg-gradient-to-br from-canyon/8 to-papaya/8 border-l-[3px] border-canyon p-5 mb-6">
              <p className="font-display font-bold text-canyon text-[1rem] tracking-[-0.015em] mb-2">
                {interpolate(m.bestPracticesTitleTemplate, { industry: industry.label })}
              </p>
              <p className="text-night leading-[1.6] text-[0.94rem] mb-2">
                {industry.bestPractices}
              </p>
              <p className="text-night/80 leading-[1.6] text-[0.9rem]">
                {industry.phasingNarrative}
              </p>
            </FadeUp>
          )}

          {/* Step 1 → Step 2 transition */}
          {step === 1 && (
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetAll}
                disabled={!industryId && !companySizeId}
                className="rounded-md border border-corbeau/15 px-4 py-2.5 text-sm font-semibold text-night/70 hover:border-corbeau/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {m.resetCta}
              </button>
              <button
                type="button"
                onClick={goToStep2}
                disabled={!canGenerate}
                className="inline-flex items-center gap-2 bg-papaya text-corbeau px-6 py-2.5 rounded-[10px] font-display font-bold text-[0.92rem] shadow-[0_4px_18px_rgba(252,152,90,0.25)] hover:bg-[#fda66e] hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(252,152,90,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all"
              >
                {m.generateRecommendationsCta}
                <span aria-hidden>→</span>
              </button>
            </div>
          )}

          {/* Step 2: module tables */}
          {step === 2 && industry && size && (
            <>
              <div className="flex items-baseline justify-between mt-2 mb-5">
                <h3 className="font-display font-bold text-corbeau text-[1.1rem] tracking-[-0.02em]">
                  {m.modulesSelectionHeading}
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[0.78rem] text-corbeau/60 hover:text-papaya transition-colors"
                >
                  {m.changeIndustryOrSizeCta}
                </button>
              </div>

              <ModuleTable title={m.mandatoryModulesTitle} tone="mandatory" rows={mandatoryRows} moduleSingular={m.moduleSingular} modulePlural={m.modulePlural} headers={moduleTableHeaders} />
              <ModuleTable title={m.industryModulesTitle} tone="industry" rows={industryRows} moduleSingular={m.moduleSingular} modulePlural={m.modulePlural} headers={moduleTableHeaders} />
              <ModuleTable title={m.recommendedModulesTitle} tone="recommended" rows={recommendedRows} moduleSingular={m.moduleSingular} modulePlural={m.modulePlural} headers={moduleTableHeaders} />

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-corbeau/8">
                <button
                  type="button"
                  onClick={resetAll}
                  className="rounded-md border border-corbeau/15 px-4 py-2.5 text-sm font-semibold text-night/70 hover:border-corbeau/30 transition-colors"
                >
                  {m.resetCta}
                </button>
                <button
                  type="button"
                  onClick={generateRoadmap}
                  className="inline-flex items-center gap-2 bg-papaya text-corbeau px-6 py-2.5 rounded-[10px] font-display font-bold text-[0.92rem] shadow-[0_4px_18px_rgba(252,152,90,0.25)] hover:bg-[#fda66e] hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(252,152,90,0.35)] transition-all"
                >
                  {m.generateRoadmapCta}
                  <span aria-hidden>→</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Step 3: roadmap output ─────────────────────────────────── */}
      {step === 3 && roadmap && (
        <div className="space-y-10">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FadeUp delay={0}>
              <SummaryCard label={m.summaryTotalDuration} value={interpolate(m.summaryMonthsTemplate, { n: roadmap.totalDurationMonths })} accent="corbeau" />
            </FadeUp>
            <FadeUp delay={80}>
              <SummaryCard label={m.summaryTotalInvestment} value={formatUsd(roadmap.totalInvestment, locale)} accent="papaya" />
            </FadeUp>
            <FadeUp delay={160}>
              <SummaryCard label={m.summaryTeamSize} value={interpolate(m.summaryPeopleTemplate, { n: roadmap.teamSize })} accent="night" />
            </FadeUp>
          </div>

          {/* Implementation timeline */}
          <section>
            <FadeUp>
              <h3 className="font-display font-black text-corbeau text-[1.5rem] tracking-[-0.025em] mb-2">
                {m.timelineHeading}
              </h3>
              <p className="text-night/70 text-[0.95rem] leading-[1.6] mb-6">
                {interpolate(m.timelineCaptionTemplate, {
                  industry: industries.find(i => i.id === roadmap.industryId)?.label ?? "",
                  size: companySizes.find(s => s.id === roadmap.companySizeId)?.label.toLowerCase() ?? "",
                })}
              </p>
            </FadeUp>
            <div className="space-y-6">
              {roadmap.phases.map((p, i) => (
                <PhaseCard
                  key={p.id}
                  phase={p}
                  index={i}
                  locale={locale}
                  focusPrefix={m.phaseFocusPrefix}
                  modulesCaption={m.phaseModulesCaption}
                  monthsTemplate={m.phaseMonthsTemplate}
                />
              ))}
            </div>
          </section>

          {/* Cost breakdown */}
          <section>
            <FadeUp>
              <h3 className="font-display font-black text-corbeau text-[1.5rem] tracking-[-0.025em] mb-2">
                {m.costBreakdownHeading}
              </h3>
              <p className="text-night/70 text-[0.95rem] leading-[1.6] mb-6">
                {interpolate(m.costBreakdownCaptionTemplate, { total: formatUsd(roadmap.totalInvestment, locale) })}
              </p>
            </FadeUp>
            <FadeUp>
              <div className="space-y-3">
                {roadmap.costBreakdown.map((line) => {
                  const pct = (line.share * 100).toFixed(1);
                  return (
                    <div key={line.category}>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="font-display font-semibold text-corbeau text-[0.95rem]">
                          {line.category}
                        </span>
                        <span className="font-mono font-bold text-corbeau text-sm tabular-nums">
                          {formatUsd(line.amount, locale)}
                        </span>
                      </div>
                      <p className="text-[0.8rem] text-night/65 mb-1.5 leading-[1.45]">
                        {line.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-7 bg-bone rounded-md overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-gradient-to-r from-papaya to-[#fda66e] rounded-md flex items-center justify-end pr-2 transition-[width] duration-700 ease-out"
                          >
                            {line.share >= 0.08 && (
                              <span className="font-mono font-bold text-corbeau text-xs tabular-nums">
                                {pct}%
                              </span>
                            )}
                          </div>
                        </div>
                        {line.share < 0.08 && (
                          <span className="font-mono font-bold text-corbeau text-xs tabular-nums w-12 text-right shrink-0">
                            {pct}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </FadeUp>
          </section>

          {/* Implementation team */}
          <section>
            <FadeUp>
              <h3 className="font-display font-black text-corbeau text-[1.5rem] tracking-[-0.025em] mb-2">
                {m.implementationTeamHeading}
              </h3>
              <p className="text-night/70 text-[0.95rem] leading-[1.6] mb-6">
                {interpolate(m.implementationTeamCaptionTemplate, {
                  size: companySizes.find(s => s.id === roadmap.companySizeId)?.label.toLowerCase() ?? "",
                })}
              </p>
            </FadeUp>
            <FadeUp>
              <div className="rounded-xl border border-corbeau/10 bg-paper overflow-x-auto shadow-[0_2px_14px_rgba(14,16,32,0.04)]">
                <table className="min-w-full text-[0.9rem]">
                  <thead className="bg-papaya">
                    <tr>
                      <th className="text-left font-display font-black tracking-[-0.01em] text-corbeau py-3.5 px-5">{m.teamTableRole}</th>
                      <th className="text-left font-display font-black tracking-[-0.01em] text-corbeau py-3.5 px-5">{m.teamTableFunction}</th>
                      <th className="text-right font-display font-black tracking-[-0.01em] text-corbeau py-3.5 px-5">{m.teamTableCount}</th>
                      <th className="text-right font-display font-black tracking-[-0.01em] text-corbeau py-3.5 px-5">{m.teamTableDayRate}</th>
                    </tr>
                  </thead>
                  <tbody className="[&>tr:nth-child(even)]:bg-bone/30 [&>tr]:transition-colors [&>tr:hover]:bg-papaya/[0.06]">
                    {roadmap.team.map((tm) => (
                      <tr key={tm.role}>
                        <td className="py-3 px-5 font-semibold text-corbeau">{tm.role}</td>
                        <td className="py-3 px-5 text-night/80">{tm.function}</td>
                        <td className="py-3 px-5 text-right font-mono font-bold text-corbeau tabular-nums">{tm.count}</td>
                        <td className="py-3 px-5 text-right font-mono text-night/75 tabular-nums whitespace-nowrap">{tm.dayRateBand}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-corbeau/15 bg-bone/40">
                      <td className="py-3.5 px-5 font-display font-bold text-corbeau">{m.teamTableTotal}</td>
                      <td className="py-3.5 px-5"></td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-corbeau tabular-nums">{roadmap.teamSize}</td>
                      <td className="py-3.5 px-5"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </FadeUp>
          </section>

          {/* Actions */}
          <FadeUp>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-corbeau/10">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-md border border-corbeau/15 bg-paper px-5 py-2.5 text-sm font-semibold text-corbeau hover:border-papaya/40 transition-colors"
              >
                {m.printPdfCta}
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-2 bg-papaya text-corbeau px-6 py-2.5 rounded-[10px] font-display font-bold text-[0.92rem] shadow-[0_4px_18px_rgba(252,152,90,0.25)] hover:bg-[#fda66e] hover:-translate-y-px transition-all"
              >
                <span aria-hidden>←</span>
                {m.startOverCta}
              </button>
            </div>
          </FadeUp>
        </div>
      )}
    </div>
  );
}
