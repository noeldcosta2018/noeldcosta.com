"use client";

// ─── Global ERP Business Case & Cost Calculator ───────────────────────────────
// Vendor-agnostic. CFO + CIO views. Multi-country. Fully client-side.

import { useState, useCallback, useId, useMemo, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import FadeUp from "@/components/article/FadeUp";
import { calculate, formatCurrency, formatBand } from "@/lib/erp-calculator/calc-engine";
import { COUNTRIES, REGIONS, getCountriesByRegion, getRegionLabels, type Region } from "@/lib/erp-calculator/countries";
import { getPresetScenarios } from "@/lib/erp-calculator/scenarios";
import type { PresetScenario } from "@/lib/erp-calculator/types";
import { isTargetLanguage, type Locale } from "@/lib/locales";
import { useTranslation, stripMarkers } from "@/lib/i18n/useTranslation";
import type {
  CalculatorInputs,
  CalculationResult,
  CountryEntry,
  Module,
  RevenueRange,
  Industry,
  ErpMaturity,
  ImplementationType,
  ErpApproach,
  DeploymentModel,
  ComplexityLevel,
  SIPartnerTier,
  DeliveryModel,
  ChangeMgmtIntensity,
  TrainingModel,
  PlanningHorizon,
  SavedScenario,
} from "@/lib/erp-calculator/types";

// Messages type — local alias for the calculator namespace. Avoids re-declaring
// the whole interface on every prop signature.
type Msgs = ReturnType<typeof useTranslation>["messages"];
type CalcMsgs = Msgs["calculator"];

// Auto-detect locale from the current URL. Same pattern as Pass 2a-1 onward —
// the calculator route is English-only today, but the helper future-proofs
// the component for /<lang>/erp-implementation-cost-calculator/ should the
// route be translated in a later pass.
function detectLocale(pathname: string | null): Locale {
  if (!pathname) return "en";
  const path = pathname.startsWith("/intl/") ? pathname.slice(5) : pathname;
  const first = path.split("/").filter(Boolean)[0];
  if (first && isTargetLanguage(first)) return first;
  return "en";
}

// Convert our locale codes to BCP-47 tags for Intl.NumberFormat / toLocaleString.
// Mirrors ArticleHero's helper (see _docs/post-launch-backlog.md for the
// dedup task). Locale-aware thousand separators ride on this: "1,000" in en-US,
// "1.000" in de-DE, "١٬٠٠٠" in ar-AE, etc.
function bcp47(locale: Locale): string {
  switch (locale) {
    case "en": return "en-US";
    case "ja": return "ja-JP";
    case "ar": return "ar-AE";
    case "de": return "de-DE";
    case "es": return "es-ES";
    case "fr": return "fr-FR";
    case "it": return "it-IT";
    case "pt": return "pt-BR";
    case "nl": return "nl-NL";
    case "ru": return "ru-RU";
    case "el": return "el-GR";
    case "zh": return "zh-CN";
    case "ko": return "ko-KR";
    case "hi": return "hi-IN";
    case "tr": return "tr-TR";
    default: return "en-US";
  }
}

// Recursively strip `<noTranslate>...</noTranslate>` wrapper tags from every
// string leaf in a typed messages sub-tree. Returns a structurally-identical
// object so callers can index it the same way. The calculator namespace
// contains marker-bearing strings (proper nouns like SAP, Oracle, S/4HANA,
// ECC inside option labels and details); the translation pipeline preserves
// them in the source, but they must not render in the DOM. See
// useTranslation.ts `stripMarkers` for the underlying regex + rationale.
function deepStripMarkers<T>(value: T): T {
  if (typeof value === "string") return stripMarkers(value) as unknown as T;
  if (value === null || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(value as Record<string, unknown>)) {
    out[k] = deepStripMarkers((value as Record<string, unknown>)[k]);
  }
  return out as T;
}

// Tiny token-replacement helper for templated MESSAGES strings.
// Pattern: "{key} foo {other}" + { key: "X", other: "Y" } → "X foo Y".
// Used for the few interpolated strings in the calculator namespace
// (statTimelineSubMonths, driverManyCountries, assumptions value templates,
// etc.). Pass 2b-1b will move calc-engine warnings to this same pattern.
function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

// ─── Default inputs ───────────────────────────────────────────────────────────

const DEFAULT_INPUTS: CalculatorInputs = {
  companyName:              "",
  revenueRange:             "50m-250m",
  employeeCount:            500,
  userCount:                200,
  namedVsConcurrentSplit:   75,
  legalEntities:            2,
  businessUnits:            3,
  industry:                 "manufacturing",
  erpMaturity:              "legacy-erp",
  implementationType:       "first-time",

  erpApproach:              "vendor-agnostic",
  deploymentModel:          "cloud-saas",
  modules:                  ["finance", "procurement"],
  customizationLevel:       "medium",
  integrationComplexity:    "medium",
  dataMigrationComplexity:  "medium",
  reportingComplexity:      "medium",
  targetTimelineMonths:     18,

  countries:                [],
  hqCountryCode:            "US",

  siPartnerTier:            "mid-tier",
  deliveryModel:            "hybrid",
  internalTeamSize:         8,
  changeMgmtIntensity:      "standard",
  trainingModel:            "role-based",

  planningHorizon:          3,
  contingencyPct:           15,
  inflationPct:             3,
  discountRate:             8,
  reportingCurrency:        "USD",
};

// ─── Step definitions ─────────────────────────────────────────────────────────
// Step IDs drive the wizard state. Labels are looked up from MESSAGES at the
// StepIndicator render site via getStepLabel(). Step icons existed in the
// pre-refactor STEPS array but were never actually rendered (the indicator
// shows the step number / a checkmark, not an emoji); removed.

const STEP_IDS = [1, 2, 3, 4, 5] as const;
function getStepLabel(m: CalcMsgs, id: (typeof STEP_IDS)[number]): string {
  switch (id) {
    case 1: return m.stepCompanyLabel;
    case 2: return m.stepScopeLabel;
    case 3: return m.stepCountriesLabel;
    case 4: return m.stepDeliveryLabel;
    case 5: return m.stepFinancialsLabel;
  }
}

// ─── UI primitives ────────────────────────────────────────────────────────────

function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-corbeau mb-1"
    >
      {children}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-eyebrow mt-1 leading-relaxed">{children}</p>
  );
}

function FieldWrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-5 ${className}`}>{children}</div>;
}

function Select<T extends string>({
  id,
  value,
  onChange,
  options,
  className = "",
}: {
  id?: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={`w-full rounded border border-corbeau/15 bg-paper text-corbeau text-sm px-3 py-2.5 focus:outline-none focus:border-papaya focus:ring-2 focus:ring-papaya/15 transition-colors ${className}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function NumberInput({
  id,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  placeholder = "",
}: {
  id?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <input
      id={id}
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      className="w-full rounded border border-corbeau/15 bg-paper text-corbeau text-sm px-3 py-2.5 focus:outline-none focus:border-papaya focus:ring-2 focus:ring-papaya/15 transition-colors"
    />
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder = "",
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded border border-corbeau/15 bg-paper text-corbeau text-sm px-3 py-2.5 focus:outline-none focus:border-papaya focus:ring-2 focus:ring-papaya/15 transition-colors"
    />
  );
}

function RadioCard<T extends string | number>({
  value,
  current,
  label,
  detail,
  onClick,
}: {
  value: T;
  current: T;
  label: string;
  detail?: string;
  onClick: (v: T) => void;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`text-left rounded-lg border px-4 py-3 transition-all ${
        active
          ? "border-papaya bg-papaya/8 ring-1 ring-papaya"
          : "border-corbeau/12 bg-paper hover:border-papaya/50 hover:bg-papaya/4"
      }`}
    >
      <p className={`text-sm font-semibold ${active ? "text-papaya" : "text-corbeau"}`}>
        {label}
      </p>
      {detail && (
        <p className="text-xs text-eyebrow mt-0.5 leading-relaxed">{detail}</p>
      )}
    </button>
  );
}

function RadioGroup<T extends string | number>({
  value,
  onChange,
  options,
  cols = 2,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; detail?: string }[];
  cols?: 2 | 3 | 4;
}) {
  const colClass = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" }[cols];
  return (
    <div className={`grid ${colClass} gap-2`}>
      {options.map((o) => (
        <RadioCard
          key={o.value}
          value={o.value}
          current={value}
          label={o.label}
          detail={o.detail}
          onClick={onChange}
        />
      ))}
    </div>
  );
}

function SliderField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}) {
  const id = useId();
  return (
    <FieldWrap>
      <div className="flex justify-between items-baseline mb-2">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-sm font-mono font-bold text-papaya">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-papaya cursor-pointer"
        aria-label={label}
      />
      {hint && <Hint>{hint}</Hint>}
    </FieldWrap>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display font-bold text-corbeau text-base mb-4 pb-2 border-b border-corbeau/8">
      {children}
    </h3>
  );
}

// ─── Warning banner ───────────────────────────────────────────────────────────

function WarningBanner({
  warnings,
}: {
  warnings: CalculationResult["warnings"];
}) {
  if (warnings.length === 0) return null;

  const critical = warnings.filter((w) => w.severity === "critical");
  const regular  = warnings.filter((w) => w.severity !== "critical");

  return (
    <div className="mt-6 space-y-3">
      {[...critical, ...regular].map((w, i) => (
        <div
          key={i}
          className={`rounded-lg border px-4 py-3 ${
            w.severity === "critical"
              ? "border-red-200 bg-red-50"
              : w.severity === "warning"
              ? "border-amber-200 bg-amber-50"
              : "border-blue-200 bg-blue-50"
          }`}
        >
          <div className="flex gap-2 items-start">
            <span className="text-base shrink-0 mt-0.5">
              {w.severity === "critical" ? "🔴" : w.severity === "warning" ? "⚠️" : "ℹ️"}
            </span>
            <div>
              <p className={`text-sm font-semibold ${
                w.severity === "critical" ? "text-red-700" : w.severity === "warning" ? "text-amber-700" : "text-blue-700"
              }`}>
                {w.workstream}: {w.message}
              </p>
              <p className="text-xs text-night mt-0.5 leading-relaxed">{w.detail}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Disclaimer banner ────────────────────────────────────────────────────────

function DisclaimerBanner({ m }: { m: CalcMsgs }) {
  return (
    <div className="rounded-lg border border-corbeau/10 bg-cream px-4 py-3 mb-6">
      <p className="text-xs text-night leading-relaxed">
        <span className="font-semibold text-corbeau">{m.disclaimerPrefix}</span>{" "}
        {m.disclaimerBody}
      </p>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({
  current,
  onGo,
  completed,
  m,
}: {
  current: number;
  onGo: (n: number) => void;
  completed: Set<number>;
  m: CalcMsgs;
}) {
  return (
    <nav aria-label={m.wizardStepIndicatorAria} className="mb-8">
      <ol className="flex items-center gap-0">
        {STEP_IDS.map((id, idx) => {
          const done   = completed.has(id);
          const active = id === current;
          const canNav = done || id < current;
          return (
            <li key={id} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => canNav && onGo(id)}
                disabled={!canNav}
                aria-current={active ? "step" : undefined}
                className={`flex flex-col items-center gap-1 focus:outline-none group disabled:cursor-default ${canNav ? "cursor-pointer" : ""}`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    active
                      ? "border-papaya bg-papaya text-white"
                      : done
                      ? "border-papaya bg-papaya/15 text-papaya"
                      : "border-corbeau/20 bg-bone text-eyebrow"
                  }`}
                >
                  {done && !active ? "✓" : id}
                </span>
                <span
                  className={`text-[10px] font-semibold hidden sm:block ${
                    active ? "text-papaya" : done ? "text-night" : "text-eyebrow"
                  }`}
                >
                  {getStepLabel(m, id)}
                </span>
              </button>
              {idx < STEP_IDS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 ${
                    done ? "bg-papaya/40" : "bg-corbeau/10"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── Module grid ──────────────────────────────────────────────────────────────

// Module → category mapping. Labels are looked up from MESSAGES at render time.
type ModuleCategory = "core" | "operations" | "extended";
const MODULE_CATEGORY: Record<Module, ModuleCategory> = {
  "finance":         "core",
  "procurement":     "core",
  "sales":           "core",
  "hr":              "core",
  "payroll":         "core",
  "manufacturing":   "operations",
  "supply-chain":    "operations",
  "warehouse":       "operations",
  "quality":         "operations",
  "project-systems": "operations",
  "crm":             "extended",
  "analytics":       "extended",
  "epm":             "extended",
};
const MODULE_ORDER: Module[] = [
  "finance",
  "procurement",
  "sales",
  "hr",
  "payroll",
  "manufacturing",
  "supply-chain",
  "warehouse",
  "quality",
  "project-systems",
  "crm",
  "analytics",
  "epm",
];

// MESSAGES key matching the typed Module union. <noTranslate> markers
// in the messages (e.g. `m.modules.crm = "<noTranslate>CRM</noTranslate>"`)
// are stripped at render via stripMarkers in useTranslation.
function moduleLabel(m: CalcMsgs, mod: Module): string {
  switch (mod) {
    case "finance":         return m.modules.finance;
    case "procurement":     return m.modules.procurement;
    case "sales":           return m.modules.sales;
    case "hr":              return m.modules.hr;
    case "payroll":         return m.modules.payroll;
    case "manufacturing":   return m.modules.manufacturing;
    case "supply-chain":    return m.modules.supplyChain;
    case "warehouse":       return m.modules.warehouse;
    case "quality":         return m.modules.quality;
    case "project-systems": return m.modules.projectSystems;
    case "crm":             return m.modules.crm;
    case "analytics":       return m.modules.analytics;
    case "epm":             return m.modules.epm;
  }
}
function moduleCategoryLabel(m: CalcMsgs, cat: ModuleCategory): string {
  switch (cat) {
    case "core":       return m.modules.categoryCore;
    case "operations": return m.modules.categoryOperations;
    case "extended":   return m.modules.categoryExtended;
  }
}

function ModuleGrid({
  selected,
  onChange,
  m,
}: {
  selected: Module[];
  onChange: (v: Module[]) => void;
  m: CalcMsgs;
}) {
  const toggle = (mod: Module) => {
    onChange(
      selected.includes(mod) ? selected.filter((x) => x !== mod) : [...selected, mod]
    );
  };
  const categories: ModuleCategory[] = ["core", "operations", "extended"];
  return (
    <div className="space-y-4">
      {categories.map((cat) => (
        <div key={cat}>
          <p className="text-xs font-semibold text-eyebrow uppercase tracking-wide mb-2">
            {moduleCategoryLabel(m, cat)}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MODULE_ORDER.filter((mod) => MODULE_CATEGORY[mod] === cat).map((mod) => {
              const on = selected.includes(mod);
              return (
                <button
                  key={mod}
                  type="button"
                  onClick={() => toggle(mod)}
                  className={`text-left rounded border px-3 py-2 text-xs font-medium transition-all ${
                    on
                      ? "border-papaya bg-papaya/10 text-papaya"
                      : "border-corbeau/12 text-night hover:border-papaya/40 hover:bg-papaya/4"
                  }`}
                >
                  {moduleLabel(m, mod)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Country selector row ─────────────────────────────────────────────────────

function CountryRow({
  entry,
  onChange,
  onRemove,
  m,
  regionLabels,
}: {
  entry: CountryEntry;
  onChange: (e: CountryEntry) => void;
  onRemove: () => void;
  m: CalcMsgs;
  regionLabels: Record<Region, string>;
}) {
  return (
    <div className="rounded-lg border border-corbeau/12 bg-cream p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <select
          value={entry.countryCode}
          onChange={(e) => onChange({ ...entry, countryCode: e.target.value })}
          className="flex-1 rounded border border-corbeau/15 bg-paper text-corbeau text-sm px-3 py-2 focus:outline-none focus:border-papaya"
          aria-label={m.step3.rowCountryAria}
        >
          {REGIONS.map((region) => (
            // Region label is localised; the underlying join key stays
            // English (REGIONS literals match c.region on each entry).
            // Individual country names are proper nouns — kept inline.
            <optgroup key={region} label={regionLabels[region]}>
              {getCountriesByRegion(region).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="text-eyebrow hover:text-canyon text-sm px-2 py-1 shrink-0"
          aria-label={m.step3.rowRemoveAria}
        >
          ✕
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <p className="text-[10px] text-eyebrow mb-1 font-semibold uppercase tracking-wide">{m.step3.rowUsersLabel}</p>
          <input
            type="number"
            value={entry.users}
            min={1}
            onChange={(e) => onChange({ ...entry, users: Math.max(1, Number(e.target.value)) })}
            className="w-full rounded border border-corbeau/15 bg-paper text-corbeau text-sm px-2 py-1.5 focus:outline-none focus:border-papaya"
          />
        </div>
        <div>
          <p className="text-[10px] text-eyebrow mb-1 font-semibold uppercase tracking-wide">{m.step3.rowEntitiesLabel}</p>
          <input
            type="number"
            value={entry.legalEntities}
            min={1}
            onChange={(e) => onChange({ ...entry, legalEntities: Math.max(1, Number(e.target.value)) })}
            className="w-full rounded border border-corbeau/15 bg-paper text-corbeau text-sm px-2 py-1.5 focus:outline-none focus:border-papaya"
          />
        </div>
        <div>
          <p className="text-[10px] text-eyebrow mb-1 font-semibold uppercase tracking-wide">{m.step3.rowLocalComplexityLabel}</p>
          <select
            value={entry.localizationComplexity}
            onChange={(e) => onChange({ ...entry, localizationComplexity: e.target.value as ComplexityLevel })}
            className="w-full rounded border border-corbeau/15 bg-paper text-corbeau text-xs px-2 py-1.5 focus:outline-none focus:border-papaya"
          >
            <option value="low">{m.step3.rowComplexityLow}</option>
            <option value="medium">{m.step3.rowComplexityMedium}</option>
            <option value="high">{m.step3.rowComplexityHigh}</option>
          </select>
        </div>
        <div>
          <p className="text-[10px] text-eyebrow mb-1 font-semibold uppercase tracking-wide">{m.step3.rowWaveLabel}</p>
          <input
            type="number"
            value={entry.wave}
            min={1}
            max={10}
            onChange={(e) => onChange({ ...entry, wave: Math.max(1, Number(e.target.value)) })}
            className="w-full rounded border border-corbeau/15 bg-paper text-corbeau text-sm px-2 py-1.5 focus:outline-none focus:border-papaya"
          />
        </div>
      </div>
    </div>
  );
}

// ─── SVG bar chart ────────────────────────────────────────────────────────────

const CHART_COLORS = [
  "#fc985a", // papaya — software
  "#e2826b", // canyon — SI
  "#282937", // haiti — internal
  "#4c4d59", // night — data
  "#7e7e87", // silver — integration
  "#a6a6ac", // moon — change
  "#0D9488", // teal — testing
  "#2C6FBF", // blue — infrastructure
  "#7B61A8", // purple — localization
  "#d97706", // amber — PMO
  "#ef4444", // red — contingency
];

// Chart labels — looked up at render time from MESSAGES.calculator.chart.
// Key set matches the result.breakdown object literally.
function chartLabel(m: CalcMsgs, key: string): string {
  const map: Record<string, string> = {
    software:          m.chart.software,
    siServices:        m.chart.siServices,
    internalTeam:      m.chart.internalTeam,
    dataMigration:     m.chart.dataMigration,
    integration:       m.chart.integration,
    changeAndTraining: m.chart.changeAndTraining,
    testingAndCutover: m.chart.testingAndCutover,
    infrastructure:    m.chart.infrastructure,
    localization:      m.chart.localization,
    pmo:               m.chart.pmo,
    contingency:       m.chart.contingency,
  };
  return map[key] ?? key;
}

function CostBreakdownChart({
  breakdown,
  currency,
  m,
}: {
  breakdown: CalculationResult["breakdown"];
  currency: string;
  m: CalcMsgs;
}) {
  const items = Object.entries(breakdown) as [string, { low: number; expected: number; high: number }][];
  const total = items.reduce((s, [, b]) => s + b.expected, 0);
  if (total === 0) return null;

  const sorted = [...items].sort((a, b) => b[1].expected - a[1].expected);

  return (
    <div className="space-y-4">
      {sorted.map(([key, b], i) => {
        const pct = total > 0 ? (b.expected / total) * 100 : 0;
        const color = CHART_COLORS[i % CHART_COLORS.length];
        // Place the percentage label INSIDE the bar when there's room,
        // OUTSIDE on a separate token when the bar is too narrow.
        // Threshold around 12% — below that the label clips and
        // becomes unreadable.
        const labelInside = pct >= 12;
        return (
          <div key={key}>
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-sm font-semibold text-night">{chartLabel(m, key)}</span>
              <span className="font-mono font-bold text-corbeau text-sm">
                {formatCurrency(b.expected, currency, true)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-8 bg-bone rounded-md overflow-hidden relative">
                <div
                  style={{ width: `${pct}%`, backgroundColor: color }}
                  className="h-full rounded-md transition-[width] duration-700 ease-out flex items-center justify-end pr-2.5"
                >
                  {labelInside && (
                    <span className="font-mono font-bold text-corbeau text-xs tabular-nums">
                      {pct.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              {!labelInside && (
                <span className="font-mono font-bold text-corbeau text-xs tabular-nums w-12 text-right shrink-0">
                  {pct.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Risk heatmap ─────────────────────────────────────────────────────────────

function RiskMeter({
  label,
  score,
  max = 100,
  m,
}: {
  label: string;
  score: number;
  max?: number;
  m: CalcMsgs;
}) {
  const pct = Math.min(100, (score / max) * 100);
  const color =
    pct < 35 ? "#22c55e" : pct < 65 ? "#d97706" : "#ef4444";
  const level = pct < 35 ? m.cio.riskLevelLow : pct < 65 ? m.cio.riskLevelMedium : m.cio.riskLevelHigh;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-semibold text-night">{label}</span>
        <span className="text-xs font-mono" style={{ color }}>
          {level}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-bone overflow-hidden">
        <div
          style={{ width: `${pct}%`, backgroundColor: color }}
          className="h-full rounded-full transition-all duration-700"
        />
      </div>
    </div>
  );
}

// ─── Executive summary card ───────────────────────────────────────────────────

function ExecSummary({ result, m }: { result: CalculationResult; m: CalcMsgs }) {
  const { totalY1, tco3yr, costPerUser, costAsRevenuePct, multiCountryRating, timeline, inputs } = result;
  const currency = inputs.reportingCurrency;

  const multiLabel = {
    "low":       m.exec.multiCountryLow,
    "moderate":  m.exec.multiCountryModerate,
    "high":      m.exec.multiCountryHigh,
    "very-high": m.exec.multiCountryVeryHigh,
  }[multiCountryRating];

  const nCountries = result.countryResults.length;
  const countryScopeSub = nCountries === 1
    ? fmt(m.exec.statCountryScopeSingle, { n: nCountries })
    : fmt(m.exec.statCountryScopePlural, { n: nCountries });

  return (
    <div className="rounded-2xl border border-papaya/30 bg-gradient-to-br from-papaya/6 to-transparent p-6 mb-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-papaya mb-1">
            {m.exec.estimatedCostEyebrow}
          </p>
          <p className="font-display font-black text-corbeau leading-none tracking-tight"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
            {formatCurrency(totalY1.low, currency, true)}
            <span className="text-eyebrow mx-2 font-normal">–</span>
            {formatCurrency(totalY1.high, currency, true)}
          </p>
          <p className="text-sm text-eyebrow mt-1">
            {m.exec.expectedPrefix} <span className="font-semibold text-night">{formatCurrency(totalY1.expected, currency, true)}</span>
            {" "}{m.exec.year1TotalSuffix}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-mono text-eyebrow uppercase tracking-wide mb-1">{m.exec.complexityEyebrow}</p>
          <div className="flex items-center gap-1.5 justify-end">
            <div className="w-8 h-8 rounded-full bg-papaya/15 flex items-center justify-center">
              <span className="font-mono font-black text-papaya text-xs">{result.complexityScore}</span>
            </div>
            <span className="text-xs text-night">{m.exec.scoreSuffix}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: m.exec.statTimeline, value: fmt(m.exec.statTimelineSubMonths, { months: timeline.expectedMonths }), sub: fmt(m.exec.statTimelineSubRange, { min: timeline.minimumMonths, max: timeline.maximumMonths }) },
          { label: m.exec.statCostPerUser, value: formatCurrency(costPerUser.expected, currency, true), sub: `${formatCurrency(costPerUser.low, currency, true)} – ${formatCurrency(costPerUser.high, currency, true)}` },
          { label: m.exec.statPctOfRevenue, value: `${costAsRevenuePct}%`, sub: m.exec.statPctOfRevenueSub },
          { label: m.exec.statCountryScope, value: multiLabel, sub: countryScopeSub },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg bg-paper/80 border border-corbeau/8 px-3 py-3">
            <p className="text-[10px] font-semibold text-eyebrow uppercase tracking-wide mb-1">{stat.label}</p>
            <p className="font-mono font-bold text-corbeau text-base leading-tight">{stat.value}</p>
            <p className="text-[10px] text-eyebrow mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CFO view ─────────────────────────────────────────────────────────────────

function CFOView({ result, m }: { result: CalculationResult; m: CalcMsgs }) {
  const { tco3yr, tco5yr, yearlySpend, inputs, breakdown } = result;
  const currency = inputs.reportingCurrency;
  const maxSpend = Math.max(...yearlySpend);

  return (
    <div className="space-y-8">
      {/* TCO tiles — papaya gradient cards with display-weight numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: m.cfo.tileY1,     band: result.totalY1, accent: true },
          { label: m.cfo.tileTco3yr, band: tco3yr,         accent: false },
          { label: m.cfo.tileTco5yr, band: tco5yr,         accent: false },
        ].map((item, i) => (
          <FadeUp key={item.label} delay={i * 80} className="">
            <div
              className={`relative rounded-2xl px-6 py-6 overflow-hidden transition-all duration-300 hover:-translate-y-px ${
                item.accent
                  ? "bg-gradient-to-br from-papaya to-[#fda66e] text-corbeau shadow-[0_8px_32px_rgba(252,152,90,0.25)]"
                  : "bg-paper border border-corbeau/10 shadow-[0_2px_14px_rgba(14,16,32,0.04)]"
              }`}
            >
              <p
                className={`font-mono font-semibold uppercase tracking-[2px] mb-3 ${
                  item.accent ? "text-corbeau/70 text-[0.65rem]" : "text-papaya text-[0.65rem]"
                }`}
              >
                {item.label}
              </p>
              <p
                className={`font-display font-black tabular-nums tracking-tight leading-none ${
                  item.accent ? "text-corbeau" : "text-corbeau"
                }`}
                style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)" }}
              >
                {formatCurrency(item.band.expected, currency, true)}
              </p>
              <p
                className={`mt-3 text-[0.78rem] font-mono tabular-nums ${
                  item.accent ? "text-corbeau/80" : "text-night/70"
                }`}
              >
                {m.cfo.rangeLabel} {formatCurrency(item.band.low, currency, true)} – {formatCurrency(item.band.high, currency, true)}
              </p>
            </div>
          </FadeUp>
        ))}
      </div>

      {/* Annual cash-flow bar chart — gradient bars with prominent labels */}
      <FadeUp>
        <div className="rounded-2xl bg-paper border border-corbeau/[0.08] p-6 shadow-[0_2px_14px_rgba(14,16,32,0.04)]">
          <div className="flex items-baseline justify-between mb-5">
            <p className="font-display font-bold text-corbeau text-[1.05rem] tracking-[-0.015em]">
              {m.cfo.annualSpendTitle}
            </p>
            <p className="font-mono text-[0.62rem] uppercase tracking-[1.6px] text-corbeau/50">
              {currency}
            </p>
          </div>
          <div className="flex items-end gap-3 h-44">
            {yearlySpend.map((v, i) => {
              const h = maxSpend > 0 ? (v / maxSpend) * 100 : 0;
              const isImpl = i === 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="font-mono font-bold text-corbeau text-[0.78rem] tabular-nums">
                    {formatCurrency(v, currency, true)}
                  </span>
                  <div
                    style={{ height: `${Math.max(4, h)}%` }}
                    className={`w-full rounded-t-lg transition-[height] duration-700 ease-out shadow-[inset_0_-2px_8px_rgba(14,16,32,0.05)] ${
                      isImpl
                        ? "bg-gradient-to-b from-papaya to-[#fda66e]"
                        : "bg-gradient-to-b from-papaya/55 to-papaya/30"
                    }`}
                  />
                  <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[1.4px] text-corbeau/60">
                    Y{i + 1}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-[0.75rem] text-night/65 leading-[1.55]">
            {m.cfo.annualSpendNote}
          </p>
        </div>
      </FadeUp>

      {/* Budget category summary — papaya-thead table that matches site article style */}
      <FadeUp>
        <div>
          <p className="font-display font-bold text-corbeau text-[1.05rem] tracking-[-0.015em] mb-4">
            {m.cfo.budgetAllocationY1}
          </p>
          <div className="not-prose overflow-x-auto rounded-xl border border-corbeau/[0.08] bg-paper shadow-[0_2px_14px_rgba(14,16,32,0.04)]">
            <table className="min-w-full text-[0.92rem] border-collapse">
              <thead className="bg-papaya">
                <tr>
                  <th className="text-left font-display font-black tracking-[-0.01em] text-corbeau text-[0.95rem] py-4 px-5">{m.cfo.tableCategory}</th>
                  <th className="text-right font-display font-black tracking-[-0.01em] text-corbeau text-[0.95rem] py-4 px-5">{m.cfo.tableLow}</th>
                  <th className="text-right font-display font-black tracking-[-0.01em] text-corbeau text-[0.95rem] py-4 px-5">{m.cfo.tableExpected}</th>
                  <th className="text-right font-display font-black tracking-[-0.01em] text-corbeau text-[0.95rem] py-4 px-5">{m.cfo.tableHigh}</th>
                </tr>
              </thead>
              <tbody className="[&>tr:nth-child(even)]:bg-bone/30 [&>tr]:transition-colors [&>tr:hover]:bg-papaya/[0.06]">
                {(Object.entries(breakdown) as [string, { low: number; expected: number; high: number }][]).map(([key, b]) => (
                  <tr key={key}>
                    <td className="py-3.5 px-5 text-corbeau font-semibold text-[0.92rem]">{chartLabel(m, key)}</td>
                    <td className="py-3.5 px-5 text-right font-mono tabular-nums text-night/70">{formatCurrency(b.low, currency, true)}</td>
                    <td className="py-3.5 px-5 text-right font-mono tabular-nums font-bold text-corbeau">{formatCurrency(b.expected, currency, true)}</td>
                    <td className="py-3.5 px-5 text-right font-mono tabular-nums text-night/70">{formatCurrency(b.high, currency, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeUp>
    </div>
  );
}

// ─── CIO view ─────────────────────────────────────────────────────────────────

function CIOView({ result, m }: { result: CalculationResult; m: CalcMsgs }) {
  const { inputs, complexityScore, timeline } = result;

  const risks = [
    { label: m.cio.riskDataMigration,    score: { low: 25, medium: 60, high: 90 }[inputs.dataMigrationComplexity] },
    { label: m.cio.riskIntegration,      score: { low: 25, medium: 60, high: 90 }[inputs.integrationComplexity] },
    { label: m.cio.riskChangeManagement, score: { light: 20, standard: 50, heavy: 75 }[inputs.changeMgmtIntensity] },
    { label: m.cio.riskLocalisation,     score: result.inputs.countries.length === 0 ? 20 : Math.min(90, result.inputs.countries.length * 18 + 20) },
    { label: m.cio.riskCustomDevelopment, score: { low: 20, medium: 55, high: 88 }[inputs.customizationLevel] },
    { label: m.cio.riskTesting,          score: Math.min(90, complexityScore * 0.85) },
  ];

  const drivers = [
    inputs.modules.length > 6 && m.cio.driverWideModule,
    inputs.integrationComplexity === "high" && m.cio.driverHighIntegration,
    inputs.dataMigrationComplexity === "high" && m.cio.driverHighDataComplexity,
    inputs.customizationLevel === "high" && m.cio.driverHighCustomisation,
    inputs.countries.length > 2 && fmt(m.cio.driverManyCountries, { n: inputs.countries.length + 1 }),
    inputs.erpMaturity === "spreadsheets" && m.cio.driverSpreadsheetsStart,
    inputs.implementationType === "post-merger" && m.cio.driverPostMerger,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {/* Complexity score */}
      <div className="rounded-xl border border-corbeau/10 bg-paper px-5 py-5">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(14,16,32,0.08)" strokeWidth="6" />
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke={complexityScore < 40 ? "#22c55e" : complexityScore < 70 ? "#d97706" : "#ef4444"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(complexityScore / 100) * 175.9} 175.9`}
                strokeDashoffset="43.98"
                transform="rotate(-90 32 32)"
              />
              <text x="32" y="36" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0e1020" fontFamily="monospace">
                {complexityScore}
              </text>
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-corbeau text-lg">{fmt(m.cio.complexityScoreLabel, { score: complexityScore })}</p>
            <p className="text-sm text-night mt-1">
              {complexityScore < 35
                ? m.cio.interpretationLow
                : complexityScore < 65
                ? m.cio.interpretationMedium
                : m.cio.interpretationHigh}
            </p>
            <p className="text-xs text-eyebrow mt-1">
              {m.cio.timelinePrefix} <span className="font-semibold text-night">{fmt(m.cio.timelineRangeSuffix, { min: timeline.minimumMonths, max: timeline.maximumMonths })}</span>
              {" "}{fmt(m.cio.timelineExpectedSuffix, { n: timeline.expectedMonths })}
            </p>
          </div>
        </div>
      </div>

      {/* Risk heatmap */}
      <div>
        <p className="text-sm font-semibold text-corbeau mb-3">{m.cio.riskIndicatorsHeading}</p>
        <div className="space-y-3">
          {risks.map((r) => (
            <RiskMeter key={r.label} label={r.label} score={r.score} m={m} />
          ))}
        </div>
      </div>

      {/* Timeline phases */}
      <div>
        <p className="text-sm font-semibold text-corbeau mb-3">{m.cio.deliveryPhasesHeading}</p>
        <div className="space-y-2">
          {timeline.phases.map((phase, i) => (
            <div key={phase.name} className="flex items-center gap-3">
              <span className="text-xs font-mono text-eyebrow w-4 shrink-0">{i + 1}</span>
              <div className="flex-1 h-6 bg-bone rounded overflow-hidden">
                <div
                  style={{
                    width: `${(phase.durationMonths / timeline.expectedMonths) * 100}%`,
                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                  }}
                  className="h-full rounded flex items-center"
                >
                  <span className="pl-2 text-[10px] text-white font-semibold whitespace-nowrap overflow-hidden">
                    {phase.durationMonths}m
                  </span>
                </div>
              </div>
              <span className="text-xs text-night w-36 shrink-0">{phase.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key delivery drivers */}
      {drivers.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-corbeau mb-2">{m.cio.keyDriversHeading}</p>
          <ul className="space-y-1.5">
            {drivers.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-night">
                <span className="text-papaya shrink-0 mt-0.5">→</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Country breakdown table ──────────────────────────────────────────────────

function CountryTable({
  result,
  m,
  locale,
}: {
  result: CalculationResult;
  m: CalcMsgs;
  locale: Locale;
}) {
  const { countryResults, inputs } = result;
  const currency = inputs.reportingCurrency;
  const tag = bcp47(locale);

  // Localised badge labels keyed by ComplexityLevel.
  const complexityBadge = (c: ComplexityLevel) =>
    c === "high" ? m.step3.rowComplexityHigh
      : c === "medium" ? m.step3.rowComplexityMedium
      : m.step3.rowComplexityLow;

  const headers = [
    m.countryTable.country,
    m.countryTable.users,
    m.countryTable.entities,
    m.countryTable.wave,
    m.countryTable.localComplexity,
    m.countryTable.costShare,
    m.countryTable.expectedCost,
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-corbeau/10">
            {headers.map((h) => (
              <th key={h} className="text-left text-xs font-semibold text-eyebrow pb-2 pr-3 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {countryResults.map((r) => (
            <tr key={r.countryCode} className="border-b border-corbeau/6 hover:bg-cream transition-colors">
              <td className="py-2.5 pr-3">
                <span className="font-semibold text-corbeau text-xs">{r.countryName}</span>
                <span className="text-[10px] text-moon block">{r.countryCode}</span>
              </td>
              <td className="py-2.5 pr-3 font-mono text-xs text-night">{r.users.toLocaleString(tag)}</td>
              <td className="py-2.5 pr-3 font-mono text-xs text-night">{r.legalEntities}</td>
              <td className="py-2.5 pr-3 font-mono text-xs text-night">{r.wave}</td>
              <td className="py-2.5 pr-3">
                <span
                  className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    r.localizationComplexity === "high"
                      ? "bg-red-100 text-red-700"
                      : r.localizationComplexity === "medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {complexityBadge(r.localizationComplexity)}
                </span>
              </td>
              <td className="py-2.5 pr-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 rounded-full bg-papaya/20 w-16">
                    <div
                      className="h-2 rounded-full bg-papaya"
                      style={{ width: `${r.costSharePct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-night">{r.costSharePct}%</span>
                </div>
              </td>
              <td className="py-2.5">
                <span className="font-mono text-xs font-semibold text-corbeau">
                  {formatCurrency(r.expectedCostUSD.expected, currency, true)}
                </span>
                <span className="text-[10px] text-moon block">
                  {r.localCurrencyCode !== currency && (
                    <>
                      ≈{r.localCurrencyCode}{" "}
                      {new Intl.NumberFormat(tag, { maximumFractionDigits: 0 }).format(
                        r.localCurrencyAmount.expected
                      )}
                    </>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Assumptions panel ────────────────────────────────────────────────────────

function AssumptionsPanel({
  result,
  m,
  locale,
}: {
  result: CalculationResult;
  m: CalcMsgs;
  locale: Locale;
}) {
  const { assumptionsSummary, inputs } = result;
  const tag = bcp47(locale);
  // Humanise enum input values for display. m comes pre-stripped by
  // deepStripMarkers at the top of ErpCostClient, so SAP / Oracle /
  // Cloud SaaS / etc. render clean. Pass 2b-1b.
  const approachLabel = m.enumLabels.erpApproach[inputs.erpApproach];
  const deploymentLabel = m.enumLabels.deploymentModel[inputs.deploymentModel];
  const siTierLabel = m.enumLabels.siPartnerTier[inputs.siPartnerTier];
  const deliveryLabel = m.enumLabels.deliveryModel[inputs.deliveryModel];
  const rows: [string, string][] = [
    [m.assumptions.softwareLabel,    fmt(m.assumptions.softwareValueTemplate, { rate: formatCurrency(assumptionsSummary.softwareCostPerUserPerYear, "USD"), approach: approachLabel, deployment: deploymentLabel })],
    [m.assumptions.siBaseLabel,      fmt(m.assumptions.siBaseValueTemplate,   { rate: formatCurrency(assumptionsSummary.siBlendedDayRate, "USD"), tier: siTierLabel, model: deliveryLabel })],
    [m.assumptions.contingencyLabel, fmt(m.assumptions.contingencyValueTemplate, { pct: assumptionsSummary.contingencyPct })],
    [m.assumptions.totalModulesLabel, String(assumptionsSummary.totalModules)],
    [m.assumptions.countriesLabel,   String(assumptionsSummary.totalCountries)],
    [m.assumptions.horizonLabel,     fmt(m.assumptions.horizonValueTemplate, { n: inputs.planningHorizon })],
    [m.assumptions.inflationLabel,   fmt(m.assumptions.inflationValueTemplate, { pct: inputs.inflationPct })],
    [m.assumptions.internalTeamRateLabel, fmt(m.assumptions.internalTeamRateValueTemplate, { rate: new Intl.NumberFormat(tag).format(600) })],
    [m.assumptions.pmoLabel,         m.assumptions.pmoValue],
    [m.assumptions.amsLabel,         m.assumptions.amsValue],
  ];
  return (
    <div className="space-y-4">
      {/* Intro mentions the source file path inline as code (do-not-translate).
          Path is appended in parentheses after the translated intro body. */}
      <p className="text-sm text-night leading-relaxed">
        {m.assumptions.introBody}{" "}
        (<code className="text-xs bg-bone px-1 py-0.5 rounded font-mono">src/lib/erp-calculator/assumptions.ts</code>)
      </p>
      <div className="rounded-xl border border-corbeau/10 overflow-hidden">
        {rows.map(([label, value], i) => (
          <div
            key={i}
            className={`flex items-start justify-between gap-4 px-4 py-2.5 text-sm ${
              i % 2 === 0 ? "bg-paper" : "bg-cream"
            }`}
          >
            <span className="text-night">{label}</span>
            <span className="font-mono text-xs text-corbeau font-semibold shrink-0 text-right">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Scenario save/compare ────────────────────────────────────────────────────

function ScenarioCompare({
  saved,
  onClear,
  m,
  locale,
}: {
  saved: SavedScenario[];
  onClear: (id: string) => void;
  m: CalcMsgs;
  locale: Locale;
}) {
  const tag = bcp47(locale);
  if (saved.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-corbeau/20 py-12 text-center">
        <p className="text-eyebrow text-sm">{m.scenario.emptyTitle}</p>
        <p className="text-xs text-moon mt-1">{m.scenario.emptyBody}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {saved.map((s) => (
        <div key={s.id} className="rounded-xl border border-corbeau/10 bg-paper p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="font-display font-bold text-corbeau text-sm">{s.label}</p>
              <p className="text-xs text-eyebrow">{new Date(s.savedAt).toLocaleString(tag)}</p>
            </div>
            <button
              type="button"
              onClick={() => onClear(s.id)}
              className="text-xs text-eyebrow hover:text-canyon"
            >
              {m.scenario.removeCta}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: m.scenario.statY1,       value: formatCurrency(s.result.totalY1.expected, s.result.inputs.reportingCurrency, true) },
              { label: m.scenario.statTco3yr,  value: formatCurrency(s.result.tco3yr.expected, s.result.inputs.reportingCurrency, true) },
              { label: m.scenario.statTimeline, value: `${s.result.timeline.expectedMonths}m` },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-[10px] text-eyebrow uppercase tracking-wide">{stat.label}</p>
                <p className="font-mono font-bold text-corbeau text-sm">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Results panel ────────────────────────────────────────────────────────────

// Tab ID stays static (used in state). Labels resolved from MESSAGES at render.
type ResultTab = "breakdown" | "cfo" | "cio" | "countries" | "scenarios" | "assumptions";
const RESULT_TAB_IDS: ResultTab[] = ["breakdown", "cfo", "cio", "countries", "scenarios", "assumptions"];
function resultTabLabel(m: CalcMsgs, id: ResultTab): string {
  switch (id) {
    case "breakdown":   return m.tabs.breakdown;
    case "cfo":         return m.tabs.cfo;
    case "cio":         return m.tabs.cio;
    case "countries":   return m.tabs.countries;
    case "scenarios":   return m.tabs.scenarios;
    case "assumptions": return m.tabs.assumptions;
  }
}

function ResultsPanel({
  result,
  saved,
  onSave,
  onClearScenario,
  onReset,
  m,
  locale,
}: {
  result: CalculationResult;
  saved: SavedScenario[];
  onSave: () => void;
  onClearScenario: (id: string) => void;
  onReset: () => void;
  m: CalcMsgs;
  locale: Locale;
}) {
  const [tab, setTab] = useState<ResultTab>("breakdown");
  const printRef = useRef<HTMLDivElement>(null);
  const currency = result.inputs.reportingCurrency;
  const tag = bcp47(locale);

  const handleCopyEmail = useCallback(() => {
    // Build the email body from per-locale MESSAGES so the share copy reads
    // in the user's language. Variables (currency values, counts, dates)
    // stay numeric / locale-formatted.
    const userCountFmt = result.inputs.userCount.toLocaleString(tag);
    const expectedInline = fmt(m.email.expectedInlineTemplate, {
      value: formatCurrency(result.totalY1.expected, currency, true),
    });
    // Humanise the enum values for the share-summary readout.
    const approachLabel = m.enumLabels.erpApproach[result.inputs.erpApproach];
    const deploymentLabel = m.enumLabels.deploymentModel[result.inputs.deploymentModel];
    const text = `${m.email.titlePrefix} — ${new Date().toLocaleDateString(tag)}

${m.email.companyPrefix} ${result.inputs.companyName || m.email.companyDefault}
${m.email.erpApproachPrefix} ${approachLabel} | ${m.email.deploymentLabel} ${deploymentLabel}
${m.email.countriesPrefix} ${result.countryResults.length} | ${m.email.usersLabel} ${userCountFmt}
${m.email.modulesPrefix} ${result.inputs.modules.length}

${m.email.y1EstimatePrefix} ${formatCurrency(result.totalY1.low, currency, true)}–${formatCurrency(result.totalY1.high, currency, true)} ${expectedInline}
${m.email.tco3yrPrefix} ${formatCurrency(result.tco3yr.expected, currency, true)}
${m.email.tco5yrPrefix} ${formatCurrency(result.tco5yr.expected, currency, true)}
${m.email.timelinePrefix} ${result.timeline.minimumMonths}–${result.timeline.maximumMonths} ${m.email.monthsSuffix}
${m.email.complexityPrefix} ${result.complexityScore}${m.exec.scoreSuffix}

${m.email.disclaimerLine}
${m.email.generatedPrefix} ${new Date(result.generatedAt).toLocaleString(tag)}`;
    navigator.clipboard.writeText(text).catch(() => {});
  }, [result, currency, m, tag]);

  return (
    <div ref={printRef}>
      <DisclaimerBanner m={m} />

      <ExecSummary result={result} m={m} />

      <WarningBanner warnings={result.warnings} />

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-5 mb-6">
        <button
          type="button"
          onClick={onSave}
          disabled={saved.length >= 3}
          className="cc-btn-secondary rounded-md px-4 py-2 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {m.actions.saveScenario} {saved.length > 0 && fmt(m.actions.saveScenarioCountTemplate, { n: saved.length })}
        </button>
        <button
          type="button"
          onClick={handleCopyEmail}
          className="cc-btn-secondary rounded-md px-4 py-2 text-xs font-semibold"
        >
          {m.actions.copySummary}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="cc-btn-secondary rounded-md px-4 py-2 text-xs font-semibold"
        >
          {m.actions.printExport}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="ml-auto inline-flex items-center gap-1 text-xs text-eyebrow hover:text-canyon px-3 py-2"
        >
          <ArrowLeft size={12} className="rtl:-scale-x-100" aria-hidden />
          {m.actions.startOver}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-corbeau/10 mb-6 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {RESULT_TAB_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === id
                  ? "border-papaya text-papaya"
                  : "border-transparent text-eyebrow hover:text-night"
              }`}
            >
              {resultTabLabel(m, id)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {tab === "breakdown" && (
          <CostBreakdownChart breakdown={result.breakdown} currency={currency} m={m} />
        )}
        {tab === "cfo" && <CFOView result={result} m={m} />}
        {tab === "cio" && <CIOView result={result} m={m} />}
        {tab === "countries" && <CountryTable result={result} m={m} locale={locale} />}
        {tab === "scenarios" && (
          <ScenarioCompare saved={saved} onClear={onClearScenario} m={m} locale={locale} />
        )}
        {tab === "assumptions" && <AssumptionsPanel result={result} m={m} locale={locale} />}
      </div>
    </div>
  );
}

// ─── Step 1 — Company profile ─────────────────────────────────────────────────

function Step1({
  inputs,
  set,
  m,
}: {
  inputs: CalculatorInputs;
  set: (patch: Partial<CalculatorInputs>) => void;
  m: CalcMsgs;
}) {
  const s = m.step1;
  return (
    <div className="space-y-6">
      <SectionTitle>{m.section.companyProfile}</SectionTitle>

      <FieldWrap>
        <Label htmlFor="cname">{s.companyNameLabel} <span className="text-moon font-normal">{s.companyNameOptional}</span></Label>
        <TextInput id="cname" value={inputs.companyName} onChange={(v) => set({ companyName: v })} placeholder={s.companyNamePlaceholder} />
      </FieldWrap>

      <FieldWrap>
        <Label>{s.revenueLabel}</Label>
        <RadioGroup<RevenueRange>
          value={inputs.revenueRange}
          onChange={(v) => set({ revenueRange: v })}
          options={[
            { value: "under-10m",  label: s.revenueUnder10m },
            { value: "10m-50m",    label: s.revenue10m50m },
            { value: "50m-250m",   label: s.revenue50m250m },
            { value: "250m-1b",    label: s.revenue250m1b },
            { value: "1b-5b",      label: s.revenue1b5b },
            { value: "over-5b",    label: s.revenueOver5b },
          ]}
          cols={3}
        />
        <Hint>{s.revenueHint}</Hint>
      </FieldWrap>

      <div className="grid grid-cols-2 gap-4">
        <FieldWrap>
          <Label>{s.employeesLabel}</Label>
          <Select
            value={String(inputs.employeeCount) as any}
            onChange={(v) => set({ employeeCount: Number(v) })}
            options={[
              { value: "50",     label: s.employeesUnder100 },
              { value: "250",    label: s.employees100to500 },
              { value: "750",    label: s.employees500to1000 },
              { value: "2000",   label: s.employees1000to3000 },
              { value: "5000",   label: s.employees3000to10000 },
              { value: "15000",  label: s.employeesOver10000 },
            ]}
          />
        </FieldWrap>

        <FieldWrap>
          <Label htmlFor="users">{s.userCountLabel}</Label>
          <NumberInput id="users" value={inputs.userCount} onChange={(v) => set({ userCount: v })} min={5} max={100000} placeholder={s.userCountPlaceholder} />
          <Hint>{s.userCountHint}</Hint>
        </FieldWrap>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldWrap>
          <Label htmlFor="ents">{s.legalEntitiesLabel}</Label>
          <NumberInput id="ents" value={inputs.legalEntities} onChange={(v) => set({ legalEntities: Math.max(1, v) })} min={1} max={500} />
          <Hint>{s.legalEntitiesHint}</Hint>
        </FieldWrap>
        <FieldWrap>
          <Label htmlFor="bus">{s.businessUnitsLabel}</Label>
          <NumberInput id="bus" value={inputs.businessUnits} onChange={(v) => set({ businessUnits: Math.max(1, v) })} min={1} max={200} />
          <Hint>{s.businessUnitsHint}</Hint>
        </FieldWrap>
      </div>

      <FieldWrap>
        <Label>{s.industryLabel}</Label>
        <Select<Industry>
          value={inputs.industry}
          onChange={(v) => set({ industry: v })}
          options={[
            { value: "manufacturing",       label: s.industryManufacturing },
            { value: "retail",              label: s.industryRetail },
            { value: "financial-services",  label: s.industryFinancial },
            { value: "aviation-transport",  label: s.industryAviation },
            { value: "government-public",   label: s.industryGovernment },
            { value: "utilities-energy",    label: s.industryUtilities },
            { value: "oil-gas",             label: s.industryOilGas },
            { value: "healthcare",          label: s.industryHealthcare },
            { value: "telecom",             label: s.industryTelecom },
            { value: "construction",        label: s.industryConstruction },
            { value: "professional-services", label: s.industryProfessional },
            { value: "other",               label: s.industryOther },
          ]}
        />
      </FieldWrap>

      <FieldWrap>
        <Label>{s.maturityLabel}</Label>
        <RadioGroup<ErpMaturity>
          value={inputs.erpMaturity}
          onChange={(v) => set({ erpMaturity: v })}
          options={[
            { value: "spreadsheets",      label: s.maturitySpreadsheetsLabel, detail: s.maturitySpreadsheetsDetail },
            { value: "legacy-erp",        label: s.maturityLegacyLabel,        detail: s.maturityLegacyDetail },
            { value: "mixed-landscape",   label: s.maturityMixedLabel,         detail: s.maturityMixedDetail },
            { value: "modern-cloud-erp",  label: s.maturityModernLabel,        detail: s.maturityModernDetail },
          ]}
        />
        <Hint>{s.maturityHint}</Hint>
      </FieldWrap>

      <FieldWrap>
        <Label>{s.implTypeLabel}</Label>
        <RadioGroup<ImplementationType>
          value={inputs.implementationType}
          onChange={(v) => set({ implementationType: v })}
          options={[
            { value: "first-time",       label: s.implTypeFirstLabel,      detail: s.implTypeFirstDetail },
            { value: "reimplementation", label: s.implTypeReimplLabel,     detail: s.implTypeReimplDetail },
            { value: "consolidation",    label: s.implTypeConsolLabel,     detail: s.implTypeConsolDetail },
            { value: "carve-out",        label: s.implTypeCarveLabel,      detail: s.implTypeCarveDetail },
            { value: "post-merger",      label: s.implTypePostMergerLabel, detail: s.implTypePostMergerDetail },
          ]}
        />
      </FieldWrap>
    </div>
  );
}

// ─── Step 2 — Program scope ───────────────────────────────────────────────────

function Step2({
  inputs,
  set,
  m,
}: {
  inputs: CalculatorInputs;
  set: (patch: Partial<CalculatorInputs>) => void;
  m: CalcMsgs;
}) {
  const s = m.step2;
  return (
    <div className="space-y-6">
      <SectionTitle>{m.section.programScope}</SectionTitle>

      <FieldWrap>
        <Label>{s.erpApproachLabel}</Label>
        <RadioGroup<ErpApproach>
          value={inputs.erpApproach}
          onChange={(v) => set({ erpApproach: v })}
          options={[
            { value: "sap",              label: s.erpApproachSapLabel,       detail: s.erpApproachSapDetail },
            { value: "oracle",           label: s.erpApproachOracleLabel,    detail: s.erpApproachOracleDetail },
            { value: "microsoft",        label: s.erpApproachMicrosoftLabel, detail: s.erpApproachMicrosoftDetail },
            { value: "infor",            label: s.erpApproachInforLabel,     detail: s.erpApproachInforDetail },
            { value: "other",            label: s.erpApproachOtherLabel,     detail: s.erpApproachOtherDetail },
            { value: "vendor-agnostic",  label: s.erpApproachAgnosticLabel,  detail: s.erpApproachAgnosticDetail },
          ]}
        />
      </FieldWrap>

      <FieldWrap>
        <Label>{s.deploymentLabel}</Label>
        <RadioGroup<DeploymentModel>
          value={inputs.deploymentModel}
          onChange={(v) => set({ deploymentModel: v })}
          options={[
            { value: "cloud-saas",    label: s.deploymentCloudLabel,   detail: s.deploymentCloudDetail },
            { value: "private-cloud", label: s.deploymentPrivateLabel, detail: s.deploymentPrivateDetail },
            { value: "on-premise",    label: s.deploymentOnPremLabel,  detail: s.deploymentOnPremDetail },
            { value: "hybrid",        label: s.deploymentHybridLabel,  detail: s.deploymentHybridDetail },
          ]}
        />
        <Hint>{s.deploymentHint}</Hint>
      </FieldWrap>

      <FieldWrap>
        <Label>{s.modulesLabel}</Label>
        <ModuleGrid selected={inputs.modules} onChange={(v) => set({ modules: v })} m={m} />
        <Hint>{s.modulesHint}</Hint>
      </FieldWrap>

      <SectionTitle>{m.section.complexityLevels}</SectionTitle>
      <p className="text-sm text-eyebrow -mt-3 mb-4">
        {m.section.complexityIntro}
      </p>

      {(
        [
          { key: "customizationLevel" as const,     label: s.customizationLevelLabel, hint: s.customizationLevelHint },
          { key: "integrationComplexity" as const,  label: s.integrationLabel,        hint: s.integrationHint },
          { key: "dataMigrationComplexity" as const, label: s.dataMigrationLabel,     hint: s.dataMigrationHint },
          { key: "reportingComplexity" as const,    label: s.reportingLabel,          hint: s.reportingHint },
        ] as const
      ).map(({ key, label, hint }) => (
        <FieldWrap key={key}>
          <Label>{label}</Label>
          <RadioGroup<ComplexityLevel>
            value={inputs[key]}
            onChange={(v) => set({ [key]: v })}
            options={[
              { value: "low",    label: s.complexityLow,    detail: s.complexityLowDetail },
              { value: "medium", label: s.complexityMedium, detail: s.complexityMediumDetail },
              { value: "high",   label: s.complexityHigh,   detail: s.complexityHighDetail },
            ]}
            cols={3}
          />
          <Hint>{hint}</Hint>
        </FieldWrap>
      ))}

      <FieldWrap>
        <Label>{s.timelineLabel}</Label>
        <Select
          value={String(inputs.targetTimelineMonths) as any}
          onChange={(v) => set({ targetTimelineMonths: Number(v) })}
          options={[
            { value: "6",  label: s.timeline6m },
            { value: "9",  label: s.timeline9m },
            { value: "12", label: s.timeline12m },
            { value: "15", label: s.timeline15m },
            { value: "18", label: s.timeline18m },
            { value: "24", label: s.timeline24m },
            { value: "30", label: s.timeline30m },
            { value: "36", label: s.timeline36m },
          ]}
        />
        <Hint>{s.timelineHint}</Hint>
      </FieldWrap>
    </div>
  );
}

// ─── Step 3 — Countries ───────────────────────────────────────────────────────

function Step3({
  inputs,
  set,
  m,
  regionLabels,
}: {
  inputs: CalculatorInputs;
  set: (patch: Partial<CalculatorInputs>) => void;
  m: CalcMsgs;
  regionLabels: Record<Region, string>;
}) {
  const s = m.step3;
  const addCountry = () => {
    const newEntry: CountryEntry = {
      id:                     Math.random().toString(36).slice(2),
      countryCode:            "GB",
      users:                  50,
      legalEntities:          1,
      localizationComplexity: "medium",
      languageCount:          1,
      wave:                   inputs.countries.length + 2,
    };
    set({ countries: [...inputs.countries, newEntry] });
  };

  const updateCountry = (id: string, patch: CountryEntry) => {
    set({ countries: inputs.countries.map((c) => (c.id === id ? patch : c)) });
  };

  const removeCountry = (id: string) => {
    set({ countries: inputs.countries.filter((c) => c.id !== id) });
  };

  return (
    <div className="space-y-6">
      <SectionTitle>{m.section.countryRollout}</SectionTitle>

      <FieldWrap>
        <Label>{s.hqCountryLabel}</Label>
        <select
          value={inputs.hqCountryCode}
          onChange={(e) => set({ hqCountryCode: e.target.value })}
          className="w-full rounded border border-corbeau/15 bg-paper text-corbeau text-sm px-3 py-2.5 focus:outline-none focus:border-papaya"
          aria-label={s.hqCountryAria}
        >
          {/* HQ country selector. Localised region group labels via
              regionLabels prop (Pass 2b-1b). Country names stay inline. */}
          {REGIONS.map((region) => (
            <optgroup key={region} label={regionLabels[region]}>
              {getCountriesByRegion(region).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <Hint>{s.hqCountryHint}</Hint>
      </FieldWrap>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-corbeau">{s.additionalCountries}</p>
          <button
            type="button"
            onClick={addCountry}
            className="cc-btn-primary rounded-md px-3 py-1.5 text-xs font-semibold"
          >
            {s.addCountryCta}
          </button>
        </div>

        {inputs.countries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-corbeau/20 py-8 text-center">
            <p className="text-sm text-eyebrow">{s.emptyTitle}</p>
            <p className="text-xs text-moon mt-1">{s.emptyHint}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inputs.countries.map((ce) => (
              <CountryRow
                key={ce.id}
                entry={ce}
                onChange={(e) => updateCountry(ce.id, e)}
                onRemove={() => removeCountry(ce.id)}
                m={m}
                regionLabels={regionLabels}
              />
            ))}
          </div>
        )}
      </div>

      {inputs.countries.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
          <p className="font-semibold mb-0.5">{s.multiDetectedTitle}</p>
          <p>{s.multiDetectedBody}</p>
        </div>
      )}
    </div>
  );
}

// ─── Step 4 — Delivery model ──────────────────────────────────────────────────

function Step4({
  inputs,
  set,
  m,
}: {
  inputs: CalculatorInputs;
  set: (patch: Partial<CalculatorInputs>) => void;
  m: CalcMsgs;
}) {
  const s = m.step4;
  return (
    <div className="space-y-6">
      <SectionTitle>{m.section.deliveryModel}</SectionTitle>

      <FieldWrap>
        <Label>{s.siTierLabel}</Label>
        <RadioGroup<SIPartnerTier>
          value={inputs.siPartnerTier}
          onChange={(v) => set({ siPartnerTier: v })}
          options={[
            { value: "boutique",   label: s.siTierBoutiqueLabel, detail: s.siTierBoutiqueDetail },
            { value: "mid-tier",   label: s.siTierMidLabel,      detail: s.siTierMidDetail },
            { value: "global-si",  label: s.siTierGlobalLabel,   detail: s.siTierGlobalDetail },
          ]}
          cols={3}
        />
        <Hint>{s.siTierHint}</Hint>
      </FieldWrap>

      <FieldWrap>
        <Label>{s.deliveryLabel}</Label>
        <RadioGroup<DeliveryModel>
          value={inputs.deliveryModel}
          onChange={(v) => set({ deliveryModel: v })}
          options={[
            { value: "onshore",   label: s.deliveryOnshoreLabel,  detail: s.deliveryOnshoreDetail },
            { value: "offshore",  label: s.deliveryOffshoreLabel, detail: s.deliveryOffshoreDetail },
            { value: "hybrid",    label: s.deliveryHybridLabel,   detail: s.deliveryHybridDetail },
          ]}
          cols={3}
        />
        <Hint>{s.deliveryHint}</Hint>
      </FieldWrap>

      <FieldWrap>
        <Label htmlFor="int-team">{s.internalTeamLabel}</Label>
        <NumberInput id="int-team" value={inputs.internalTeamSize} onChange={(v) => set({ internalTeamSize: Math.max(1, v) })} min={1} max={200} placeholder={s.internalTeamPlaceholder} />
        <Hint>{s.internalTeamHint}</Hint>
      </FieldWrap>

      <FieldWrap>
        <Label>{s.changeMgmtLabel}</Label>
        <RadioGroup<ChangeMgmtIntensity>
          value={inputs.changeMgmtIntensity}
          onChange={(v) => set({ changeMgmtIntensity: v })}
          options={[
            { value: "light",    label: s.changeMgmtLightLabel,    detail: s.changeMgmtLightDetail },
            { value: "standard", label: s.changeMgmtStandardLabel, detail: s.changeMgmtStandardDetail },
            { value: "heavy",    label: s.changeMgmtHeavyLabel,    detail: s.changeMgmtHeavyDetail },
          ]}
          cols={3}
        />
        <Hint>{s.changeMgmtHint}</Hint>
      </FieldWrap>

      <FieldWrap>
        <Label>{s.trainingLabel}</Label>
        <RadioGroup<TrainingModel>
          value={inputs.trainingModel}
          onChange={(v) => set({ trainingModel: v })}
          options={[
            { value: "train-the-trainer", label: s.trainingT3Label,        detail: s.trainingT3Detail },
            { value: "role-based",        label: s.trainingRoleLabel,      detail: s.trainingRoleDetail },
            { value: "intensive",         label: s.trainingIntensiveLabel, detail: s.trainingIntensiveDetail },
          ]}
          cols={3}
        />
      </FieldWrap>
    </div>
  );
}

// ─── Step 5 — Financial assumptions ──────────────────────────────────────────

function Step5({
  inputs,
  set,
  m,
}: {
  inputs: CalculatorInputs;
  set: (patch: Partial<CalculatorInputs>) => void;
  m: CalcMsgs;
}) {
  const s = m.step5;
  return (
    <div className="space-y-6">
      <SectionTitle>{m.section.financialAssumptions}</SectionTitle>

      <FieldWrap>
        <Label>{s.horizonLabel}</Label>
        <RadioGroup<PlanningHorizon>
          value={inputs.planningHorizon}
          onChange={(v) => set({ planningHorizon: v })}
          options={[
            { value: 1, label: s.horizon1Label, detail: s.horizon1Detail },
            { value: 3, label: s.horizon3Label, detail: s.horizon3Detail },
            { value: 5, label: s.horizon5Label, detail: s.horizon5Detail },
          ]}
          cols={3}
        />
        <Hint>{s.horizonHint}</Hint>
      </FieldWrap>

      <SliderField
        label={s.contingencyLabel}
        hint={s.contingencyHint}
        value={inputs.contingencyPct}
        onChange={(v) => set({ contingencyPct: v })}
        min={5}
        max={35}
        step={1}
        format={(v) => `${v}%`}
      />

      <SliderField
        label={s.inflationLabel}
        hint={s.inflationHint}
        value={inputs.inflationPct}
        onChange={(v) => set({ inflationPct: v })}
        min={0}
        max={15}
        step={0.5}
        format={(v) => `${v}%`}
      />

      <SliderField
        label={s.discountLabel}
        hint={s.discountHint}
        value={inputs.discountRate}
        onChange={(v) => set({ discountRate: v })}
        min={0}
        max={20}
        step={0.5}
        format={(v) => `${v}%`}
      />

      <FieldWrap>
        <Label>{s.reportingCurrencyLabel}</Label>
        <Select
          value={inputs.reportingCurrency as any}
          onChange={(v) => set({ reportingCurrency: v })}
          options={[
            { value: "USD", label: s.currencyUsd },
            { value: "EUR", label: s.currencyEur },
            { value: "GBP", label: s.currencyGbp },
            { value: "AED", label: s.currencyAed },
            { value: "SAR", label: s.currencySar },
            { value: "INR", label: s.currencyInr },
            { value: "AUD", label: s.currencyAud },
            { value: "CAD", label: s.currencyCad },
            { value: "SGD", label: s.currencySgd },
          ]}
        />
        <Hint>{s.reportingCurrencyHint}</Hint>
      </FieldWrap>
    </div>
  );
}

// ─── Preset scenario picker ───────────────────────────────────────────────────

function PresetPicker({
  onLoad,
  m,
  locale,
}: {
  onLoad: (inputs: CalculatorInputs) => void;
  m: CalcMsgs;
  locale: Locale;
}) {
  // Locale-aware preset list. Recomputed on locale change; trivial cost
  // (3 entries with string lookups) so no useMemo needed.
  const presets: PresetScenario[] = getPresetScenarios(locale);
  return (
    <div className="mb-8 p-5 rounded-xl bg-cream border border-corbeau/10">
      <p className="text-xs font-semibold text-eyebrow uppercase tracking-widest mb-3">{m.presetEyebrow}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {presets.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onLoad(s.inputs)}
            className="text-left rounded-lg border border-corbeau/12 bg-paper hover:border-papaya/50 hover:bg-papaya/4 px-4 py-3 transition-all group"
          >
            <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-papaya/15 text-papaya px-2 py-0.5 rounded-full mb-1.5">
              {s.badge}
            </span>
            <p className="font-semibold text-corbeau text-xs group-hover:text-papaya transition-colors">{s.name}</p>
            <p className="text-[10px] text-eyebrow mt-1 leading-relaxed">{s.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Live estimate badge ──────────────────────────────────────────────────────

function LiveEstimateBadge({
  inputs,
  visible,
  m,
  locale,
}: {
  inputs: CalculatorInputs;
  visible: boolean;
  m: CalcMsgs;
  locale: Locale;
}) {
  const estimate = useMemo(() => {
    if (!visible || inputs.modules.length === 0 || inputs.userCount < 5) return null;
    try {
      return calculate(inputs, locale);
    } catch {
      return null;
    }
  }, [inputs, visible, locale]);

  if (!estimate) return null;

  return (
    <div className="sticky top-0 z-10 -mx-1 mb-6 px-1">
      <div className="rounded-lg border border-papaya/30 bg-papaya/6 px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm backdrop-blur-sm">
        <p className="text-xs text-night">
          {m.wizardLiveEstimatePrefix}
        </p>
        <p className="font-mono font-bold text-papaya text-sm">
          {formatCurrency(estimate.totalY1.low, inputs.reportingCurrency, true)}
          <span className="text-eyebrow mx-1 font-normal">–</span>
          {formatCurrency(estimate.totalY1.high, inputs.reportingCurrency, true)}
        </p>
        <p className="text-[10px] text-eyebrow hidden sm:block">
          {fmt(m.wizardLiveEstimateMetricsSuffix, { months: estimate.timeline.expectedMonths, complexity: estimate.complexityScore })}
        </p>
      </div>
    </div>
  );
}

// ─── Main calculator ──────────────────────────────────────────────────────────

export default function ErpCostClient() {
  const pathname = usePathname();
  const locale = detectLocale(pathname);
  const { messages } = useTranslation(locale);
  // Strip the inline <noTranslate> wrapper tags once at the top of the
  // component. Every consumer downstream sees the cleaned strings without
  // having to remember to call stripMarkers at every render site.
  const m = useMemo(() => deepStripMarkers(messages.calculator), [messages.calculator]);
  // Locale-aware region display labels (Pass 2b-1b). Keyed by the
  // English region literals so REGIONS.map(region => labels[region])
  // resolves cleanly. Cheap; memoised on locale only.
  const regionLabels = useMemo(() => getRegionLabels(locale), [locale]);

  const [inputs, setInputsRaw] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [saved, setSaved] = useState<SavedScenario[]>([]);
  const [showLive, setShowLive] = useState(false);
  // Container ref. Step navigation scrolls TO this ref (the calculator's
  // top) rather than to the page top, so the reader is anchored on the
  // wizard not bounced into the hero on every Continue click.
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollToCalculator = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    // Anchor with a small offset so the sticky nav doesn't obscure the
    // step indicator at the top of the wizard.
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, []);

  const set = useCallback((patch: Partial<CalculatorInputs>) => {
    setInputsRaw((prev) => ({ ...prev, ...patch }));
  }, []);

  const goToStep = (n: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(step);
      return next;
    });
    setStep(n);
    scrollToCalculator();
  };

  const goNext = () => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(step);
      return next;
    });
    if (step < 5) {
      setStep(step + 1);
      scrollToCalculator();
    } else {
      // Run calculation
      try {
        const res = calculate(inputs, locale);
        setResult(res);
        setCompleted(new Set([1, 2, 3, 4, 5]));
        setTimeout(() => scrollToCalculator(), 50);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const goPrev = () => {
    if (step > 1) {
      setStep(step - 1);
      scrollToCalculator();
    }
  };

  const reset = () => {
    setResult(null);
    setStep(1);
    setCompleted(new Set());
    setInputsRaw(DEFAULT_INPUTS);
    setShowLive(false);
    scrollToCalculator();
  };

  const saveScenario = () => {
    if (!result || saved.length >= 3) return;
    setSaved((prev) => [
      ...prev,
      {
        id:       Math.random().toString(36).slice(2),
        label:    `Scenario ${prev.length + 1}${inputs.companyName ? ` — ${inputs.companyName}` : ""}`,
        result,
        savedAt:  new Date().toISOString(),
      },
    ]);
  };

  const clearScenario = (id: string) => {
    setSaved((prev) => prev.filter((s) => s.id !== id));
  };

  const loadPreset = (presetInputs: CalculatorInputs) => {
    setInputsRaw(presetInputs);
    setResult(null);
    setStep(1);
    setCompleted(new Set());
  };

  // Show results
  if (result) {
    return (
      <div ref={containerRef}>
        <ResultsPanel
          result={result}
          saved={saved}
          onSave={saveScenario}
          onClearScenario={clearScenario}
          onReset={reset}
          m={m}
          locale={locale}
        />
      </div>
    );
  }

  // Show wizard
  return (
    <div ref={containerRef}>
      {/* Preset picker — only on step 1.
          Preset scenario name/description/badge strings stay inline for
          Pass 2b-1a; they live in scenarios.ts and will be externalised
          in Pass 2b-1b along with calc-engine warnings. */}
      {step === 1 && <PresetPicker onLoad={loadPreset} m={m} locale={locale} />}

      {/* Live estimate toggle */}
      {step > 1 && (
        <div className="flex items-center justify-end gap-2 mb-4">
          <span className="text-xs text-eyebrow">{m.wizardLiveEstimateLabel}</span>
          <button
            type="button"
            onClick={() => setShowLive(!showLive)}
            aria-label={m.wizardToggleLiveAria}
            className={`relative w-9 h-5 rounded-full transition-colors ${showLive ? "bg-papaya" : "bg-corbeau/20"}`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showLive ? "translate-x-4" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      )}

      {showLive && step > 1 && <LiveEstimateBadge inputs={inputs} visible m={m} locale={locale} />}

      <StepIndicator current={step} onGo={goToStep} completed={completed} m={m} />

      {/* Step content */}
      <div className="bg-white rounded-xl border border-corbeau/10 p-6 md:p-8 shadow-sm">
        {step === 1 && <Step1 inputs={inputs} set={set} m={m} />}
        {step === 2 && <Step2 inputs={inputs} set={set} m={m} />}
        {step === 3 && <Step3 inputs={inputs} set={set} m={m} regionLabels={regionLabels} />}
        {step === 4 && <Step4 inputs={inputs} set={set} m={m} />}
        {step === 5 && <Step5 inputs={inputs} set={set} m={m} />}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-corbeau/8">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 1}
            className="cc-btn-secondary inline-flex items-center gap-1.5 rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={14} className="rtl:-scale-x-100" aria-hidden />
            {m.wizardNavBack}
          </button>

          <p className="text-xs text-eyebrow">
            {fmt(m.wizardStepOfLabel, { step, total: STEP_IDS.length })}
          </p>

          <button
            type="button"
            onClick={goNext}
            className="cc-btn-primary inline-flex items-center gap-1.5 rounded-md px-6 py-2.5 text-sm font-semibold"
          >
            {step < 5 ? m.wizardNavContinue : m.wizardNavCalculate}
            <ArrowRight size={14} className="rtl:-scale-x-100" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
