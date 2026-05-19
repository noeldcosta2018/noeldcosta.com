"use client";

// ─── Global ERP Business Case & Cost Calculator ───────────────────────────────
// Vendor-agnostic. CFO + CIO views. Multi-country. Fully client-side.

import { useState, useCallback, useId, useMemo, useRef } from "react";
import FadeUp from "@/components/article/FadeUp";
import { calculate, formatCurrency, formatBand } from "@/lib/erp-calculator/calc-engine";
import { COUNTRIES, REGIONS, getCountriesByRegion } from "@/lib/erp-calculator/countries";
import { PRESET_SCENARIOS } from "@/lib/erp-calculator/scenarios";
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

const STEPS = [
  { id: 1, label: "Company",   icon: "🏢" },
  { id: 2, label: "Scope",     icon: "⚙️" },
  { id: 3, label: "Countries", icon: "🌍" },
  { id: 4, label: "Delivery",  icon: "👥" },
  { id: 5, label: "Financials", icon: "💰" },
] as const;

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
    <p className="text-xs text-silver mt-1 leading-relaxed">{children}</p>
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
        <p className="text-xs text-silver mt-0.5 leading-relaxed">{detail}</p>
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

function DisclaimerBanner() {
  return (
    <div className="rounded-lg border border-corbeau/10 bg-cream px-4 py-3 mb-6">
      <p className="text-xs text-night leading-relaxed">
        <span className="font-semibold text-corbeau">Directional estimate only.</span>{" "}
        This tool produces budget ranges based on multiplier-based assumptions, not vendor quotes.
        Use it to frame early business-case conversations. Engage your SI and software vendor for
        programme-specific pricing before committing budget.
      </p>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({
  current,
  onGo,
  completed,
}: {
  current: number;
  onGo: (n: number) => void;
  completed: Set<number>;
}) {
  return (
    <nav aria-label="Calculator steps" className="mb-8">
      <ol className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const done   = completed.has(step.id);
          const active = step.id === current;
          const canNav = done || step.id < current;
          return (
            <li key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => canNav && onGo(step.id)}
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
                      : "border-corbeau/20 bg-bone text-silver"
                  }`}
                >
                  {done && !active ? "✓" : step.id}
                </span>
                <span
                  className={`text-[10px] font-semibold hidden sm:block ${
                    active ? "text-papaya" : done ? "text-night" : "text-silver"
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {idx < STEPS.length - 1 && (
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

const MODULE_OPTIONS: { value: Module; label: string; category: string }[] = [
  { value: "finance",          label: "Finance & Accounting",    category: "Core" },
  { value: "procurement",      label: "Procurement",             category: "Core" },
  { value: "sales",            label: "Sales & Distribution",    category: "Core" },
  { value: "hr",               label: "Human Resources",         category: "Core" },
  { value: "payroll",          label: "Payroll",                 category: "Core" },
  { value: "manufacturing",    label: "Manufacturing / PP",      category: "Operations" },
  { value: "supply-chain",     label: "Supply Chain",            category: "Operations" },
  { value: "warehouse",        label: "Warehouse Management",    category: "Operations" },
  { value: "quality",          label: "Quality Management",      category: "Operations" },
  { value: "project-systems",  label: "Project Systems",         category: "Operations" },
  { value: "crm",              label: "CRM",                     category: "Extended" },
  { value: "analytics",        label: "Analytics & BI",          category: "Extended" },
  { value: "epm",              label: "EPM / Advanced Finance",  category: "Extended" },
];

function ModuleGrid({
  selected,
  onChange,
}: {
  selected: Module[];
  onChange: (v: Module[]) => void;
}) {
  const toggle = (m: Module) => {
    onChange(
      selected.includes(m) ? selected.filter((x) => x !== m) : [...selected, m]
    );
  };
  const categories = ["Core", "Operations", "Extended"] as const;
  return (
    <div className="space-y-4">
      {categories.map((cat) => (
        <div key={cat}>
          <p className="text-xs font-semibold text-silver uppercase tracking-wide mb-2">{cat}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MODULE_OPTIONS.filter((m) => m.category === cat).map((m) => {
              const on = selected.includes(m.value);
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => toggle(m.value)}
                  className={`text-left rounded border px-3 py-2 text-xs font-medium transition-all ${
                    on
                      ? "border-papaya bg-papaya/10 text-papaya"
                      : "border-corbeau/12 text-night hover:border-papaya/40 hover:bg-papaya/4"
                  }`}
                >
                  {m.label}
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
}: {
  entry: CountryEntry;
  onChange: (e: CountryEntry) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-corbeau/12 bg-cream p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <select
          value={entry.countryCode}
          onChange={(e) => onChange({ ...entry, countryCode: e.target.value })}
          className="flex-1 rounded border border-corbeau/15 bg-paper text-corbeau text-sm px-3 py-2 focus:outline-none focus:border-papaya"
          aria-label="Country"
        >
          {REGIONS.map((region) => (
            <optgroup key={region} label={region}>
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
          className="text-silver hover:text-canyon text-sm px-2 py-1 shrink-0"
          aria-label="Remove country"
        >
          ✕
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <p className="text-[10px] text-silver mb-1 font-semibold uppercase tracking-wide">Users</p>
          <input
            type="number"
            value={entry.users}
            min={1}
            onChange={(e) => onChange({ ...entry, users: Math.max(1, Number(e.target.value)) })}
            className="w-full rounded border border-corbeau/15 bg-paper text-corbeau text-sm px-2 py-1.5 focus:outline-none focus:border-papaya"
          />
        </div>
        <div>
          <p className="text-[10px] text-silver mb-1 font-semibold uppercase tracking-wide">Entities</p>
          <input
            type="number"
            value={entry.legalEntities}
            min={1}
            onChange={(e) => onChange({ ...entry, legalEntities: Math.max(1, Number(e.target.value)) })}
            className="w-full rounded border border-corbeau/15 bg-paper text-corbeau text-sm px-2 py-1.5 focus:outline-none focus:border-papaya"
          />
        </div>
        <div>
          <p className="text-[10px] text-silver mb-1 font-semibold uppercase tracking-wide">Local complexity</p>
          <select
            value={entry.localizationComplexity}
            onChange={(e) => onChange({ ...entry, localizationComplexity: e.target.value as ComplexityLevel })}
            className="w-full rounded border border-corbeau/15 bg-paper text-corbeau text-xs px-2 py-1.5 focus:outline-none focus:border-papaya"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <p className="text-[10px] text-silver mb-1 font-semibold uppercase tracking-wide">Wave</p>
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

const CHART_LABELS: Record<string, string> = {
  software:         "Software",
  siServices:       "SI Services",
  internalTeam:     "Internal Team",
  dataMigration:    "Data Migration",
  integration:      "Integration",
  changeAndTraining: "Change & Training",
  testingAndCutover: "Testing & Cutover",
  infrastructure:   "Infrastructure",
  localization:     "Localization",
  pmo:              "PMO & Governance",
  contingency:      "Contingency",
};

function CostBreakdownChart({
  breakdown,
  currency,
}: {
  breakdown: CalculationResult["breakdown"];
  currency: string;
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
              <span className="text-sm font-semibold text-night">{CHART_LABELS[key] ?? key}</span>
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
}: {
  label: string;
  score: number;
  max?: number;
}) {
  const pct = Math.min(100, (score / max) * 100);
  const color =
    pct < 35 ? "#22c55e" : pct < 65 ? "#d97706" : "#ef4444";
  const level = pct < 35 ? "Low" : pct < 65 ? "Medium" : "High";
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

function ExecSummary({ result }: { result: CalculationResult }) {
  const { totalY1, tco3yr, costPerUser, costAsRevenuePct, multiCountryRating, timeline, inputs } = result;
  const currency = inputs.reportingCurrency;

  const multiLabel = {
    "low":       "Single country",
    "moderate":  "2–3 countries",
    "high":      "4–7 countries",
    "very-high": "8+ countries",
  }[multiCountryRating];

  return (
    <div className="rounded-2xl border border-papaya/30 bg-gradient-to-br from-papaya/6 to-transparent p-6 mb-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-papaya mb-1">
            Estimated programme cost
          </p>
          <p className="font-display font-black text-corbeau leading-none tracking-tight"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
            {formatCurrency(totalY1.low, currency, true)}
            <span className="text-silver mx-2 font-normal">–</span>
            {formatCurrency(totalY1.high, currency, true)}
          </p>
          <p className="text-sm text-silver mt-1">
            Expected: <span className="font-semibold text-night">{formatCurrency(totalY1.expected, currency, true)}</span>
            {" "}· Year 1 total
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-mono text-silver uppercase tracking-wide mb-1">Complexity</p>
          <div className="flex items-center gap-1.5 justify-end">
            <div className="w-8 h-8 rounded-full bg-papaya/15 flex items-center justify-center">
              <span className="font-mono font-black text-papaya text-xs">{result.complexityScore}</span>
            </div>
            <span className="text-xs text-night">/100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Timeline (expected)", value: `${timeline.expectedMonths} months`, sub: `${timeline.minimumMonths}–${timeline.maximumMonths} range` },
          { label: "Cost per user",       value: formatCurrency(costPerUser.expected, currency, true), sub: `${formatCurrency(costPerUser.low, currency, true)} – ${formatCurrency(costPerUser.high, currency, true)}` },
          { label: "% of revenue",        value: `${costAsRevenuePct}%`, sub: "year 1 programme cost" },
          { label: "Country scope",       value: multiLabel, sub: `${result.countryResults.length} ${result.countryResults.length === 1 ? "country" : "countries"}` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg bg-paper/80 border border-corbeau/8 px-3 py-3">
            <p className="text-[10px] font-semibold text-silver uppercase tracking-wide mb-1">{stat.label}</p>
            <p className="font-mono font-bold text-corbeau text-base leading-tight">{stat.value}</p>
            <p className="text-[10px] text-silver mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CFO view ─────────────────────────────────────────────────────────────────

function CFOView({ result }: { result: CalculationResult }) {
  const { tco3yr, tco5yr, yearlySpend, inputs, breakdown } = result;
  const currency = inputs.reportingCurrency;
  const maxSpend = Math.max(...yearlySpend);

  return (
    <div className="space-y-8">
      {/* TCO tiles — papaya gradient cards with display-weight numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Year 1 total",  band: result.totalY1, accent: true },
          { label: "3-year TCO",    band: tco3yr,         accent: false },
          { label: "5-year TCO",    band: tco5yr,         accent: false },
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
                Range {formatCurrency(item.band.low, currency, true)} – {formatCurrency(item.band.high, currency, true)}
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
              Annual spend profile
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
            Y1 covers implementation plus software. Y2 onward is AMS support plus software subscription. Figures are directional, not contractual.
          </p>
        </div>
      </FadeUp>

      {/* Budget category summary — papaya-thead table that matches site article style */}
      <FadeUp>
        <div>
          <p className="font-display font-bold text-corbeau text-[1.05rem] tracking-[-0.015em] mb-4">
            Budget allocation, year 1
          </p>
          <div className="not-prose overflow-x-auto rounded-xl border border-corbeau/[0.08] bg-paper shadow-[0_2px_14px_rgba(14,16,32,0.04)]">
            <table className="min-w-full text-[0.92rem] border-collapse">
              <thead className="bg-papaya">
                <tr>
                  <th className="text-left font-display font-black tracking-[-0.01em] text-corbeau text-[0.95rem] py-4 px-5">Category</th>
                  <th className="text-right font-display font-black tracking-[-0.01em] text-corbeau text-[0.95rem] py-4 px-5">Low</th>
                  <th className="text-right font-display font-black tracking-[-0.01em] text-corbeau text-[0.95rem] py-4 px-5">Expected</th>
                  <th className="text-right font-display font-black tracking-[-0.01em] text-corbeau text-[0.95rem] py-4 px-5">High</th>
                </tr>
              </thead>
              <tbody className="[&>tr:nth-child(even)]:bg-bone/30 [&>tr]:transition-colors [&>tr:hover]:bg-papaya/[0.06]">
                {(Object.entries(breakdown) as [string, { low: number; expected: number; high: number }][]).map(([key, b]) => (
                  <tr key={key}>
                    <td className="py-3.5 px-5 text-corbeau font-semibold text-[0.92rem]">{CHART_LABELS[key] ?? key}</td>
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

function CIOView({ result }: { result: CalculationResult }) {
  const { inputs, complexityScore, timeline } = result;

  const risks = [
    { label: "Data migration",      score: { low: 25, medium: 60, high: 90 }[inputs.dataMigrationComplexity] },
    { label: "Integration",         score: { low: 25, medium: 60, high: 90 }[inputs.integrationComplexity] },
    { label: "Change management",   score: { light: 20, standard: 50, heavy: 75 }[inputs.changeMgmtIntensity] },
    { label: "Localisation",        score: result.inputs.countries.length === 0 ? 20 : Math.min(90, result.inputs.countries.length * 18 + 20) },
    { label: "Custom development",  score: { low: 20, medium: 55, high: 88 }[inputs.customizationLevel] },
    { label: "Testing",             score: Math.min(90, complexityScore * 0.85) },
  ];

  const drivers = [
    inputs.modules.length > 6 && "Wide module scope (6+ modules) increases test surface",
    inputs.integrationComplexity === "high" && "High integration complexity — legacy system audit recommended",
    inputs.dataMigrationComplexity === "high" && "High data complexity — data profiling should start in phase 1",
    inputs.customizationLevel === "high" && "High customisation — clean-core strategy review advised",
    inputs.countries.length > 2 && `${inputs.countries.length + 1} countries — wave planning and central governance are critical`,
    inputs.erpMaturity === "spreadsheets" && "Starting from spreadsheets — process definition effort underestimated in most programmes",
    inputs.implementationType === "post-merger" && "Post-merger scope — entity harmonisation is typically the longest workstream",
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
            <p className="font-display font-bold text-corbeau text-lg">Complexity score: {complexityScore}/100</p>
            <p className="text-sm text-night mt-1">
              {complexityScore < 35
                ? "Manageable. Standard delivery model should work."
                : complexityScore < 65
                ? "Moderate. Requires experienced SI and clear programme governance."
                : "High. Needs dedicated programme management and phased delivery."}
            </p>
            <p className="text-xs text-silver mt-1">
              Timeline: <span className="font-semibold text-night">{timeline.minimumMonths}–{timeline.maximumMonths} months</span>
              {" "}(expected {timeline.expectedMonths} months)
            </p>
          </div>
        </div>
      </div>

      {/* Risk heatmap */}
      <div>
        <p className="text-sm font-semibold text-corbeau mb-3">Workstream risk indicators</p>
        <div className="space-y-3">
          {risks.map((r) => (
            <RiskMeter key={r.label} label={r.label} score={r.score} />
          ))}
        </div>
      </div>

      {/* Timeline phases */}
      <div>
        <p className="text-sm font-semibold text-corbeau mb-3">Estimated delivery phases</p>
        <div className="space-y-2">
          {timeline.phases.map((phase, i) => (
            <div key={phase.name} className="flex items-center gap-3">
              <span className="text-xs font-mono text-silver w-4 shrink-0">{i + 1}</span>
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
          <p className="text-sm font-semibold text-corbeau mb-2">Key delivery drivers</p>
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

function CountryTable({ result }: { result: CalculationResult }) {
  const { countryResults, inputs } = result;
  const currency = inputs.reportingCurrency;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-corbeau/10">
            {["Country", "Users", "Entities", "Wave", "Local complexity", "Cost share", "Expected cost"].map((h) => (
              <th key={h} className="text-left text-xs font-semibold text-silver pb-2 pr-3 whitespace-nowrap">
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
              <td className="py-2.5 pr-3 font-mono text-xs text-night">{r.users.toLocaleString()}</td>
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
                  {r.localizationComplexity}
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
                      {new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
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

function AssumptionsPanel({ result }: { result: CalculationResult }) {
  const { assumptionsSummary, inputs } = result;
  const rows = [
    ["Software cost / user / year", `~${formatCurrency(assumptionsSummary.softwareCostPerUserPerYear, "USD")} (${inputs.erpApproach}, ${inputs.deploymentModel})`],
    ["SI base rate / user",          `~${formatCurrency(assumptionsSummary.siBlendedDayRate, "USD")} (${inputs.siPartnerTier}, ${inputs.deliveryModel})`],
    ["Contingency",                  `${assumptionsSummary.contingencyPct}%`],
    ["Total modules in scope",       String(assumptionsSummary.totalModules)],
    ["Countries",                    String(assumptionsSummary.totalCountries)],
    ["Planning horizon",             `${inputs.planningHorizon} years`],
    ["Inflation assumption",         `${inputs.inflationPct}%`],
    ["Internal team rate",           `$${new Intl.NumberFormat("en-US").format(600)}/day (fully loaded)`],
    ["PMO / governance",             "7% of pre-contingency total"],
    ["Ongoing AMS support",          "15% of implementation cost in Y2, 12% Y3+"],
  ];
  return (
    <div className="space-y-4">
      <p className="text-sm text-night leading-relaxed">
        All values below are the directional assumptions used in this estimate.
        They are calibrated to typical market rates — not specific vendor quotes.
        Edit the assumptions source file (<code className="text-xs bg-bone px-1 py-0.5 rounded font-mono">src/lib/erp-calculator/assumptions.ts</code>) to adjust the model.
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
}: {
  saved: SavedScenario[];
  onClear: (id: string) => void;
}) {
  if (saved.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-corbeau/20 py-12 text-center">
        <p className="text-silver text-sm">No saved scenarios yet.</p>
        <p className="text-xs text-moon mt-1">Run a calculation and click "Save scenario" to compare.</p>
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
              <p className="text-xs text-silver">{new Date(s.savedAt).toLocaleString()}</p>
            </div>
            <button
              type="button"
              onClick={() => onClear(s.id)}
              className="text-xs text-silver hover:text-canyon"
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Year 1",    value: formatCurrency(s.result.totalY1.expected, s.result.inputs.reportingCurrency, true) },
              { label: "3-yr TCO", value: formatCurrency(s.result.tco3yr.expected, s.result.inputs.reportingCurrency, true) },
              { label: "Timeline", value: `${s.result.timeline.expectedMonths}m` },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-[10px] text-silver uppercase tracking-wide">{stat.label}</p>
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

const RESULT_TABS = [
  { id: "breakdown",   label: "Cost breakdown" },
  { id: "cfo",        label: "CFO view" },
  { id: "cio",        label: "CIO view" },
  { id: "countries",  label: "Countries" },
  { id: "scenarios",  label: "Scenarios" },
  { id: "assumptions", label: "Assumptions" },
] as const;

type ResultTab = typeof RESULT_TABS[number]["id"];

function ResultsPanel({
  result,
  saved,
  onSave,
  onClearScenario,
  onReset,
}: {
  result: CalculationResult;
  saved: SavedScenario[];
  onSave: () => void;
  onClearScenario: (id: string) => void;
  onReset: () => void;
}) {
  const [tab, setTab] = useState<ResultTab>("breakdown");
  const printRef = useRef<HTMLDivElement>(null);
  const currency = result.inputs.reportingCurrency;

  const handleCopyEmail = useCallback(() => {
    const text = `ERP Programme Estimate — ${new Date().toLocaleDateString()}

Company: ${result.inputs.companyName || "—"}
ERP approach: ${result.inputs.erpApproach} | Deployment: ${result.inputs.deploymentModel}
Countries: ${result.countryResults.length} | Users: ${result.inputs.userCount.toLocaleString()}
Modules: ${result.inputs.modules.length}

Year 1 estimate: ${formatCurrency(result.totalY1.low, currency, true)}–${formatCurrency(result.totalY1.high, currency, true)} (expected: ${formatCurrency(result.totalY1.expected, currency, true)})
3-year TCO: ${formatCurrency(result.tco3yr.expected, currency, true)}
5-year TCO: ${formatCurrency(result.tco5yr.expected, currency, true)}
Implementation timeline: ${result.timeline.minimumMonths}–${result.timeline.maximumMonths} months
Complexity score: ${result.complexityScore}/100

These are directional budget estimates for early business-case planning.
Not a vendor quote. Generated: ${new Date(result.generatedAt).toLocaleString()}`;
    navigator.clipboard.writeText(text).catch(() => {});
  }, [result, currency]);

  return (
    <div ref={printRef}>
      <DisclaimerBanner />

      <ExecSummary result={result} />

      <WarningBanner warnings={result.warnings} />

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-5 mb-6">
        <button
          type="button"
          onClick={onSave}
          disabled={saved.length >= 3}
          className="cc-btn-secondary rounded-md px-4 py-2 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save scenario {saved.length > 0 && `(${saved.length}/3)`}
        </button>
        <button
          type="button"
          onClick={handleCopyEmail}
          className="cc-btn-secondary rounded-md px-4 py-2 text-xs font-semibold"
        >
          Copy summary
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="cc-btn-secondary rounded-md px-4 py-2 text-xs font-semibold"
        >
          Print / export
        </button>
        <button
          type="button"
          onClick={onReset}
          className="ml-auto text-xs text-silver hover:text-canyon px-3 py-2"
        >
          ← Start over
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-corbeau/10 mb-6 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {RESULT_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "border-papaya text-papaya"
                  : "border-transparent text-silver hover:text-night"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {tab === "breakdown" && (
          <CostBreakdownChart breakdown={result.breakdown} currency={currency} />
        )}
        {tab === "cfo" && <CFOView result={result} />}
        {tab === "cio" && <CIOView result={result} />}
        {tab === "countries" && <CountryTable result={result} />}
        {tab === "scenarios" && (
          <ScenarioCompare saved={saved} onClear={onClearScenario} />
        )}
        {tab === "assumptions" && <AssumptionsPanel result={result} />}
      </div>
    </div>
  );
}

// ─── Step 1 — Company profile ─────────────────────────────────────────────────

function Step1({
  inputs,
  set,
}: {
  inputs: CalculatorInputs;
  set: (patch: Partial<CalculatorInputs>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle>Company profile</SectionTitle>

      <FieldWrap>
        <Label htmlFor="cname">Company name <span className="text-moon font-normal">(optional)</span></Label>
        <TextInput id="cname" value={inputs.companyName} onChange={(v) => set({ companyName: v })} placeholder="e.g. Acme Industries" />
      </FieldWrap>

      <FieldWrap>
        <Label>Annual revenue</Label>
        <RadioGroup<RevenueRange>
          value={inputs.revenueRange}
          onChange={(v) => set({ revenueRange: v })}
          options={[
            { value: "under-10m",  label: "Under $10M" },
            { value: "10m-50m",    label: "$10M – $50M" },
            { value: "50m-250m",   label: "$50M – $250M" },
            { value: "250m-1b",    label: "$250M – $1B" },
            { value: "1b-5b",      label: "$1B – $5B" },
            { value: "over-5b",    label: "Over $5B" },
          ]}
          cols={3}
        />
        <Hint>Used to calculate cost as % of revenue — a common board-level metric.</Hint>
      </FieldWrap>

      <div className="grid grid-cols-2 gap-4">
        <FieldWrap>
          <Label>Total employees</Label>
          <Select
            value={String(inputs.employeeCount) as any}
            onChange={(v) => set({ employeeCount: Number(v) })}
            options={[
              { value: "50",     label: "Under 100" },
              { value: "250",    label: "100 – 500" },
              { value: "750",    label: "500 – 1,000" },
              { value: "2000",   label: "1,000 – 3,000" },
              { value: "5000",   label: "3,000 – 10,000" },
              { value: "15000",  label: "10,000+" },
            ]}
          />
        </FieldWrap>

        <FieldWrap>
          <Label htmlFor="users">ERP user count</Label>
          <NumberInput id="users" value={inputs.userCount} onChange={(v) => set({ userCount: v })} min={5} max={100000} placeholder="e.g. 250" />
          <Hint>Named users who will access the system.</Hint>
        </FieldWrap>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldWrap>
          <Label htmlFor="ents">Legal entities</Label>
          <NumberInput id="ents" value={inputs.legalEntities} onChange={(v) => set({ legalEntities: Math.max(1, v) })} min={1} max={500} />
          <Hint>Separate statutory companies, subsidiaries, or JVs.</Hint>
        </FieldWrap>
        <FieldWrap>
          <Label htmlFor="bus">Business units</Label>
          <NumberInput id="bus" value={inputs.businessUnits} onChange={(v) => set({ businessUnits: Math.max(1, v) })} min={1} max={200} />
          <Hint>Divisions or segments needing separate cost centre / P&L views.</Hint>
        </FieldWrap>
      </div>

      <FieldWrap>
        <Label>Industry</Label>
        <Select<Industry>
          value={inputs.industry}
          onChange={(v) => set({ industry: v })}
          options={[
            { value: "manufacturing",       label: "Manufacturing" },
            { value: "retail",              label: "Retail & Distribution" },
            { value: "financial-services",  label: "Financial Services" },
            { value: "aviation-transport",  label: "Aviation & Transport" },
            { value: "government-public",   label: "Government & Public Sector" },
            { value: "utilities-energy",    label: "Utilities & Energy" },
            { value: "oil-gas",             label: "Oil & Gas" },
            { value: "healthcare",          label: "Healthcare" },
            { value: "telecom",             label: "Telecom" },
            { value: "construction",        label: "Construction & Real Estate" },
            { value: "professional-services", label: "Professional Services" },
            { value: "other",               label: "Other" },
          ]}
        />
      </FieldWrap>

      <FieldWrap>
        <Label>Current ERP maturity</Label>
        <RadioGroup<ErpMaturity>
          value={inputs.erpMaturity}
          onChange={(v) => set({ erpMaturity: v })}
          options={[
            { value: "spreadsheets",      label: "Spreadsheets",        detail: "No ERP. Data in Excel / Access." },
            { value: "legacy-erp",        label: "Legacy ERP",          detail: "ECC, EBS R12, Axapta, etc." },
            { value: "mixed-landscape",   label: "Mixed landscape",     detail: "Multiple systems in parallel." },
            { value: "modern-cloud-erp",  label: "Modern cloud ERP",    detail: "S/4HANA, D365, Fusion, etc." },
          ]}
        />
        <Hint>Starting from spreadsheets increases data migration effort significantly.</Hint>
      </FieldWrap>

      <FieldWrap>
        <Label>Implementation type</Label>
        <RadioGroup<ImplementationType>
          value={inputs.implementationType}
          onChange={(v) => set({ implementationType: v })}
          options={[
            { value: "first-time",   label: "First ERP",    detail: "No ERP in place." },
            { value: "reimplementation", label: "Reimplementation", detail: "Replace existing ERP." },
            { value: "consolidation", label: "Consolidation", detail: "Merge multiple ERPs." },
            { value: "carve-out",     label: "Carve-out",    detail: "Separate a division." },
            { value: "post-merger",   label: "Post-merger",  detail: "Harmonise after M&A." },
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
}: {
  inputs: CalculatorInputs;
  set: (patch: Partial<CalculatorInputs>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle>Program scope</SectionTitle>

      <FieldWrap>
        <Label>ERP approach</Label>
        <RadioGroup<ErpApproach>
          value={inputs.erpApproach}
          onChange={(v) => set({ erpApproach: v })}
          options={[
            { value: "sap",              label: "SAP",              detail: "S/4HANA or RISE/GROW" },
            { value: "oracle",           label: "Oracle",           detail: "Fusion Cloud / EBS" },
            { value: "microsoft",        label: "Microsoft",        detail: "Dynamics 365" },
            { value: "infor",            label: "Infor",            detail: "CloudSuite / M3" },
            { value: "other",            label: "Other",            detail: "IFS, NetSuite, etc." },
            { value: "vendor-agnostic",  label: "Not decided",      detail: "Evaluating options" },
          ]}
        />
      </FieldWrap>

      <FieldWrap>
        <Label>Deployment model</Label>
        <RadioGroup<DeploymentModel>
          value={inputs.deploymentModel}
          onChange={(v) => set({ deploymentModel: v })}
          options={[
            { value: "cloud-saas",    label: "Cloud SaaS",      detail: "Multi-tenant. Low infra." },
            { value: "private-cloud", label: "Private cloud",   detail: "Dedicated, managed cloud." },
            { value: "on-premise",    label: "On-premise",      detail: "Own data centre." },
            { value: "hybrid",        label: "Hybrid",          detail: "Mix of above." },
          ]}
        />
        <Hint>Cloud SaaS typically has lower upfront cost but higher ongoing fees. On-premise flips that ratio over 5+ years.</Hint>
      </FieldWrap>

      <FieldWrap>
        <Label>Modules in scope</Label>
        <ModuleGrid selected={inputs.modules} onChange={(v) => set({ modules: v })} />
        <Hint>Select all modules you expect to implement. More modules = longer timeline and higher cost, but not linearly.</Hint>
      </FieldWrap>

      <SectionTitle>Complexity levels</SectionTitle>
      <p className="text-sm text-silver -mt-3 mb-4">
        These four axes are the biggest cost drivers after module count. Be honest — under-scoping complexity is the most common cause of overruns.
      </p>

      {(
        [
          {
            key: "customizationLevel" as const,
            label: "Custom development",
            hint: "Low = standard config only. High = significant ABAP / extensions / custom Fiori.",
          },
          {
            key: "integrationComplexity" as const,
            label: "Integration complexity",
            hint: "Low = few simple integrations. High = 20+ interfaces, legacy systems, B2B partners.",
          },
          {
            key: "dataMigrationComplexity" as const,
            label: "Data migration complexity",
            hint: "Low = clean master data from one source. High = multiple legacy systems, poor data quality.",
          },
          {
            key: "reportingComplexity" as const,
            label: "Reporting & compliance complexity",
            hint: "Low = standard reports suffice. High = complex statutory reporting, multi-GAAP, group consolidation.",
          },
        ] as const
      ).map(({ key, label, hint }) => (
        <FieldWrap key={key}>
          <Label>{label}</Label>
          <RadioGroup<ComplexityLevel>
            value={inputs[key]}
            onChange={(v) => set({ [key]: v })}
            options={[
              { value: "low",    label: "Low",    detail: "Standard scope" },
              { value: "medium", label: "Medium", detail: "Some deviations" },
              { value: "high",   label: "High",   detail: "Significant complexity" },
            ]}
            cols={3}
          />
          <Hint>{hint}</Hint>
        </FieldWrap>
      ))}

      <FieldWrap>
        <Label>Target go-live timeline</Label>
        <Select
          value={String(inputs.targetTimelineMonths) as any}
          onChange={(v) => set({ targetTimelineMonths: Number(v) })}
          options={[
            { value: "6",  label: "6 months" },
            { value: "9",  label: "9 months" },
            { value: "12", label: "12 months" },
            { value: "15", label: "15 months" },
            { value: "18", label: "18 months" },
            { value: "24", label: "24 months" },
            { value: "30", label: "30 months" },
            { value: "36", label: "36 months" },
          ]}
        />
        <Hint>This is your target — the calculator will tell you if it's realistic given your scope.</Hint>
      </FieldWrap>
    </div>
  );
}

// ─── Step 3 — Countries ───────────────────────────────────────────────────────

function Step3({
  inputs,
  set,
}: {
  inputs: CalculatorInputs;
  set: (patch: Partial<CalculatorInputs>) => void;
}) {
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
      <SectionTitle>Country rollout</SectionTitle>

      <FieldWrap>
        <Label>Headquarters country</Label>
        <select
          value={inputs.hqCountryCode}
          onChange={(e) => set({ hqCountryCode: e.target.value })}
          className="w-full rounded border border-corbeau/15 bg-paper text-corbeau text-sm px-3 py-2.5 focus:outline-none focus:border-papaya"
          aria-label="HQ country"
        >
          {REGIONS.map((region) => (
            <optgroup key={region} label={region}>
              {getCountriesByRegion(region).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <Hint>
          The HQ country is your primary go-live location (wave 1). Add rollout countries below.
        </Hint>
      </FieldWrap>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-corbeau">Additional rollout countries</p>
          <button
            type="button"
            onClick={addCountry}
            className="cc-btn-primary rounded-md px-3 py-1.5 text-xs font-semibold"
          >
            + Add country
          </button>
        </div>

        {inputs.countries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-corbeau/20 py-8 text-center">
            <p className="text-sm text-silver">Single-country rollout</p>
            <p className="text-xs text-moon mt-1">Add countries for a multi-country estimate.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inputs.countries.map((ce) => (
              <CountryRow
                key={ce.id}
                entry={ce}
                onChange={(e) => updateCountry(ce.id, e)}
                onRemove={() => removeCountry(ce.id)}
              />
            ))}
          </div>
        )}
      </div>

      {inputs.countries.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
          <p className="font-semibold mb-0.5">Multi-country rollout detected</p>
          <p>
            Country cost indices, localisation complexity, and language requirements are all factored into
            the estimate. Consider wave sequencing — the most complex countries should not all be in wave 1.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Step 4 — Delivery model ──────────────────────────────────────────────────

function Step4({
  inputs,
  set,
}: {
  inputs: CalculatorInputs;
  set: (patch: Partial<CalculatorInputs>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle>Delivery model</SectionTitle>

      <FieldWrap>
        <Label>SI partner tier</Label>
        <RadioGroup<SIPartnerTier>
          value={inputs.siPartnerTier}
          onChange={(v) => set({ siPartnerTier: v })}
          options={[
            { value: "boutique",   label: "Boutique SI",   detail: "Specialised, lower day rate, less process overhead." },
            { value: "mid-tier",   label: "Mid-tier SI",   detail: "Good depth, reasonable structure." },
            { value: "global-si",  label: "Global SI",     detail: "Big 4 / Tier 1. Highest rate, maximum coverage." },
          ]}
          cols={3}
        />
        <Hint>Day rate is not the biggest variable — team quality and methodology are. But partner tier has a direct multiplier on SI fees.</Hint>
      </FieldWrap>

      <FieldWrap>
        <Label>Delivery model</Label>
        <RadioGroup<DeliveryModel>
          value={inputs.deliveryModel}
          onChange={(v) => set({ deliveryModel: v })}
          options={[
            { value: "onshore",   label: "Onshore",  detail: "All consultants co-located." },
            { value: "offshore",  label: "Offshore", detail: "Primarily low-cost delivery centre." },
            { value: "hybrid",    label: "Hybrid",   detail: "Mix of onshore & offshore." },
          ]}
          cols={3}
        />
        <Hint>Offshore delivery significantly reduces day rates but adds coordination overhead. Not recommended for high customisation or complex integrations.</Hint>
      </FieldWrap>

      <FieldWrap>
        <Label htmlFor="int-team">Internal project team size</Label>
        <NumberInput id="int-team" value={inputs.internalTeamSize} onChange={(v) => set({ internalTeamSize: Math.max(1, v) })} min={1} max={200} placeholder="e.g. 10" />
        <Hint>Number of full-time internal staff allocated to the programme (not the SI team). Include project managers, process leads, data owners, and change champions.</Hint>
      </FieldWrap>

      <FieldWrap>
        <Label>Change management intensity</Label>
        <RadioGroup<ChangeMgmtIntensity>
          value={inputs.changeMgmtIntensity}
          onChange={(v) => set({ changeMgmtIntensity: v })}
          options={[
            { value: "light",    label: "Light",    detail: "Comms and basic training." },
            { value: "standard", label: "Standard", detail: "Change network, role-based training, exec sponsorship." },
            { value: "heavy",    label: "Heavy",    detail: "Full OCM: impact assessment, readiness surveys, change agents." },
          ]}
          cols={3}
        />
        <Hint>Post-go-live adoption failure is the most common cause of extended hypercare. Under-investing in change management consistently costs more than the investment would have.</Hint>
      </FieldWrap>

      <FieldWrap>
        <Label>Training model</Label>
        <RadioGroup<TrainingModel>
          value={inputs.trainingModel}
          onChange={(v) => set({ trainingModel: v })}
          options={[
            { value: "train-the-trainer", label: "Train-the-trainer", detail: "Lowest cost. Internal trainers cascade." },
            { value: "role-based",        label: "Role-based",        detail: "All users trained by role." },
            { value: "intensive",         label: "Intensive",         detail: "Multiple sessions, simulations, job aids." },
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
}: {
  inputs: CalculatorInputs;
  set: (patch: Partial<CalculatorInputs>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle>Financial assumptions</SectionTitle>

      <FieldWrap>
        <Label>Planning horizon</Label>
        <RadioGroup<PlanningHorizon>
          value={inputs.planningHorizon}
          onChange={(v) => set({ planningHorizon: v })}
          options={[
            { value: 1, label: "1 year",  detail: "Year 1 only." },
            { value: 3, label: "3 years", detail: "Typical TCO view." },
            { value: 5, label: "5 years", detail: "Full payback horizon." },
          ]}
          cols={3}
        />
        <Hint>Board-level ERP business cases typically use a 5-year TCO horizon. For budget approval, 3 years is common.</Hint>
      </FieldWrap>

      <SliderField
        label="Contingency budget"
        hint="15–20% is standard for well-managed programmes. Under 10% is high risk. Over 25% may indicate scope uncertainty that should be resolved before budgeting."
        value={inputs.contingencyPct}
        onChange={(v) => set({ contingencyPct: v })}
        min={5}
        max={35}
        step={1}
        format={(v) => `${v}%`}
      />

      <SliderField
        label="Annual inflation assumption"
        hint="Applied to ongoing support costs in years 2+. Typical range: 2–4% in stable markets, higher in emerging markets."
        value={inputs.inflationPct}
        onChange={(v) => set({ inflationPct: v })}
        min={0}
        max={15}
        step={0.5}
        format={(v) => `${v}%`}
      />

      <SliderField
        label="Discount rate (for NPV)"
        hint="Used if you want to calculate net present value of the programme. Typical corporate hurdle rate: 8–12%."
        value={inputs.discountRate}
        onChange={(v) => set({ discountRate: v })}
        min={0}
        max={20}
        step={0.5}
        format={(v) => `${v}%`}
      />

      <FieldWrap>
        <Label>Reporting currency</Label>
        <Select
          value={inputs.reportingCurrency as any}
          onChange={(v) => set({ reportingCurrency: v })}
          options={[
            { value: "USD", label: "USD — US Dollar" },
            { value: "EUR", label: "EUR — Euro" },
            { value: "GBP", label: "GBP — British Pound" },
            { value: "AED", label: "AED — UAE Dirham" },
            { value: "SAR", label: "SAR — Saudi Riyal" },
            { value: "INR", label: "INR — Indian Rupee" },
            { value: "AUD", label: "AUD — Australian Dollar" },
            { value: "CAD", label: "CAD — Canadian Dollar" },
            { value: "SGD", label: "SGD — Singapore Dollar" },
          ]}
        />
        <Hint>
          The primary model calculates in USD. Country-level results also show local currency amounts.
          Exchange rates used are approximate fixed rates from the config.
        </Hint>
      </FieldWrap>
    </div>
  );
}

// ─── Preset scenario picker ───────────────────────────────────────────────────

function PresetPicker({ onLoad }: { onLoad: (inputs: CalculatorInputs) => void }) {
  return (
    <div className="mb-8 p-5 rounded-xl bg-cream border border-corbeau/10">
      <p className="text-xs font-semibold text-silver uppercase tracking-widest mb-3">Load a preset scenario</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PRESET_SCENARIOS.map((s) => (
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
            <p className="text-[10px] text-silver mt-1 leading-relaxed">{s.description}</p>
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
}: {
  inputs: CalculatorInputs;
  visible: boolean;
}) {
  const estimate = useMemo(() => {
    if (!visible || inputs.modules.length === 0 || inputs.userCount < 5) return null;
    try {
      return calculate(inputs);
    } catch {
      return null;
    }
  }, [inputs, visible]);

  if (!estimate) return null;

  return (
    <div className="sticky top-0 z-10 -mx-1 mb-6 px-1">
      <div className="rounded-lg border border-papaya/30 bg-papaya/6 px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm backdrop-blur-sm">
        <p className="text-xs text-night">
          Live estimate:
        </p>
        <p className="font-mono font-bold text-papaya text-sm">
          {formatCurrency(estimate.totalY1.low, inputs.reportingCurrency, true)}
          <span className="text-silver mx-1 font-normal">–</span>
          {formatCurrency(estimate.totalY1.high, inputs.reportingCurrency, true)}
        </p>
        <p className="text-[10px] text-silver hidden sm:block">
          {estimate.timeline.expectedMonths}m · {estimate.complexityScore}/100 complexity
        </p>
      </div>
    </div>
  );
}

// ─── Main calculator ──────────────────────────────────────────────────────────

export default function ErpCostClient() {
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
        const res = calculate(inputs);
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
        />
      </div>
    );
  }

  // Show wizard
  return (
    <div ref={containerRef}>
      {/* Preset picker — only on step 1 */}
      {step === 1 && <PresetPicker onLoad={loadPreset} />}

      {/* Live estimate toggle */}
      {step > 1 && (
        <div className="flex items-center justify-end gap-2 mb-4">
          <span className="text-xs text-silver">Live estimate</span>
          <button
            type="button"
            onClick={() => setShowLive(!showLive)}
            aria-label="Toggle live estimate"
            className={`relative w-9 h-5 rounded-full transition-colors ${showLive ? "bg-papaya" : "bg-corbeau/20"}`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showLive ? "translate-x-4" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      )}

      {showLive && step > 1 && <LiveEstimateBadge inputs={inputs} visible />}

      <StepIndicator current={step} onGo={goToStep} completed={completed} />

      {/* Step content */}
      <div className="bg-white rounded-xl border border-corbeau/10 p-6 md:p-8 shadow-sm">
        {step === 1 && <Step1 inputs={inputs} set={set} />}
        {step === 2 && <Step2 inputs={inputs} set={set} />}
        {step === 3 && <Step3 inputs={inputs} set={set} />}
        {step === 4 && <Step4 inputs={inputs} set={set} />}
        {step === 5 && <Step5 inputs={inputs} set={set} />}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-corbeau/8">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 1}
            className="cc-btn-secondary rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          <p className="text-xs text-silver">
            Step {step} of {STEPS.length}
          </p>

          <button
            type="button"
            onClick={goNext}
            className="cc-btn-primary rounded-md px-6 py-2.5 text-sm font-semibold"
          >
            {step < 5 ? "Continue →" : "Calculate →"}
          </button>
        </div>
      </div>
    </div>
  );
}
