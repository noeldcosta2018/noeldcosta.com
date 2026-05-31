"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  SAP_MODULES,
  SAP_MODULE_CATEGORIES,
  getCoreModules,
  getModulesByCategory,
  type SapModule,
  type SapModuleCategory,
} from "@/lib/sap-modules";
import { isTargetLanguage, type Locale } from "@/lib/locales";
import { useTranslation, interpolate, stripMarkers } from "@/lib/i18n/useTranslation";

// Same auto-detect pattern as the other Pass 2a/2b client components.
function detectLocale(pathname: string | null): Locale {
  if (!pathname) return "en";
  const path = pathname.startsWith("/intl/") ? pathname.slice(5) : pathname;
  const first = path.split("/").filter(Boolean)[0];
  if (first && isTargetLanguage(first)) return first;
  return "en";
}

// Strip the inline <noTranslate> markers from each string in the typed
// sub-tree. Same helper used in ErpCostClient.tsx (Pass 2b-1a); promoted
// inline here to keep the picker self-contained. See post-launch-backlog
// for the dedup task that consolidates detectLocale + bcp47 + this helper.
function deepStripMarkers<T>(value: T): T {
  if (typeof value === "string") return stripMarkers(value) as unknown as T;
  if (value === null || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(value as Record<string, unknown>)) {
    out[k] = deepStripMarkers((value as Record<string, unknown>)[k]);
  }
  return out as T;
}

/**
 * SAP module picker designed for CFO / CIO assessing implementation
 * cost. 70+ modules grouped by line of business with search and a
 * one-click "add core finance" preset.
 *
 * Value shape: array of module IDs (strings). On submit, the parent
 * form turns this into a comma-separated string of human-readable
 * labels for downstream consumption by the LLM-driven cost engine,
 * preserving the existing tool contract.
 */
export interface ModulePickerProps {
  name: string;
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
}

const CORE_IDS = getCoreModules().map((m) => m.id);

export default function ModulePicker({ label, value, onChange }: ModulePickerProps) {
  const pathname = usePathname();
  const locale = detectLocale(pathname);
  const { messages } = useTranslation(locale);
  // Strip <noTranslate> wrapper tags once at the boundary — the picker
  // namespace has them around proper-noun search hints (Treasury, Payroll,
  // EWM, Group Reporting, ariba, etc.). Pass 2b-1a's deepStripMarkers
  // pattern, repeated here. Aliased `t` because the existing component
  // uses `m` extensively as a local for the iterated module object.
  const t = useMemo(
    () => deepStripMarkers(messages.modulePicker),
    [messages.modulePicker],
  );

  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<SapModuleCategory>>(
    // Open Finance by default; the rest collapsed so the page is scannable
    new Set(["finance"])
  );

  const selected = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAP_MODULES;
    return SAP_MODULES.filter((m) =>
      [m.label, m.code ?? "", m.description].some((s) => s.toLowerCase().includes(q))
    );
  }, [query]);

  const byCategory = useMemo(() => {
    const map = new Map<SapModuleCategory, SapModule[]>();
    for (const m of filtered) {
      const arr = map.get(m.category) ?? [];
      arr.push(m);
      map.set(m.category, arr);
    }
    return map;
  }, [filtered]);

  const toggleModule = (id: string) => {
    const next = new Set(value);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  const toggleCategory = (cat: SapModuleCategory) => {
    const next = new Set(expanded);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setExpanded(next);
  };

  /**
   * Bulk toggle every module in a category. If ALL modules in the
   * category are currently selected, deselect them. Otherwise select
   * any that aren't selected (preserving anything already there).
   * Operates on the full category catalogue, not the filtered view,
   * so search state doesn't change the bulk action's behaviour.
   */
  const toggleCategoryAll = (cat: SapModuleCategory) => {
    const catModuleIds = getModulesByCategory(cat).map((m) => m.id);
    const allSelected = catModuleIds.every((id) => selected.has(id));
    const next = new Set(value);
    if (allSelected) {
      for (const id of catModuleIds) next.delete(id);
    } else {
      for (const id of catModuleIds) next.add(id);
    }
    onChange(Array.from(next));
  };

  const addCoreFinance = () => {
    const next = new Set(value);
    for (const id of CORE_IDS) next.add(id);
    onChange(Array.from(next));
  };

  const clearAll = () => onChange([]);

  // While searching, force all matching categories open so results are
  // immediately visible.
  const isOpen = (cat: SapModuleCategory) =>
    query.trim() ? byCategory.has(cat) : expanded.has(cat);

  return (
    <div>
      {/* Label + counters */}
      <div className="flex items-baseline justify-between mb-2.5">
        <label className="font-display font-semibold text-corbeau text-[0.95rem]">
          {label}
        </label>
        <span className="font-mono text-[0.68rem] tracking-[1.6px] uppercase text-corbeau/55">
          {interpolate(t.selectedCountTemplate, { count: value.length })}
        </span>
      </div>

      {/* Search + quick actions */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-md border border-corbeau/15 bg-paper px-3.5 py-2.5 text-sm font-medium text-corbeau placeholder:text-corbeau/35 focus:outline-none focus:border-papaya focus:ring-2 focus:ring-papaya/20 transition-colors"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={addCoreFinance}
            className="rounded-md border border-papaya/40 bg-papaya/8 px-3 py-2 text-xs font-semibold text-papaya hover:bg-papaya/15 transition-colors"
            title={t.addCoreFinanceTitle}
          >
            {t.addCoreFinanceLabel}
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={value.length === 0}
            className="rounded-md border border-corbeau/15 px-3 py-2 text-xs font-semibold text-night/70 hover:border-corbeau/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t.clear}
          </button>
        </div>
      </div>

      {/* Selected chips — quick removal */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4 p-3 rounded-md bg-cream border border-corbeau/8">
          {value.map((id) => {
            const m = SAP_MODULES.find((x) => x.id === id);
            if (!m) return null;
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleModule(id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-papaya text-corbeau text-[0.72rem] font-semibold hover:bg-[#fda66e] transition-colors"
                // NOTE: the variable `m` inside this map callback is the
                // module object from SAP_MODULES.find(); `t` (closure) is the
                // messages alias. Chip-remove tooltip uses the module's label.
                title={interpolate(t.chipRemoveTitleTemplate, { label: m.label })}
              >
                {m.code ? <span className="font-mono text-[0.66rem] opacity-70">{m.code}</span> : null}
                <span>{m.label}</span>
                <span aria-hidden className="text-[0.9em] leading-none">×</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Category groups */}
      <div className="space-y-2">
        {SAP_MODULE_CATEGORIES.map((cat) => {
          const modules = byCategory.get(cat.id) ?? [];
          if (query.trim() && modules.length === 0) return null;

          const selectedInCat = modules.filter((m) => selected.has(m.id)).length;
          // Compute the bulk-select state against the FULL category catalogue,
          // not the filtered view. That way the "Select all" button picks up
          // everything in the category even when the search has hidden some
          // rows. Three states: none, some (indeterminate), all.
          const catTotal = getModulesByCategory(cat.id).length;
          const catSelectedTotal = getModulesByCategory(cat.id)
            .filter((m) => selected.has(m.id)).length;
          const bulkState: "none" | "some" | "all" =
            catSelectedTotal === 0
              ? "none"
              : catSelectedTotal === catTotal
                ? "all"
                : "some";
          const open = isOpen(cat.id);

          return (
            <div
              key={cat.id}
              className="rounded-lg border border-corbeau/10 bg-paper overflow-hidden"
            >
              <div className="flex items-stretch">
                {/* Select-all-in-category control. Separate from the expand
                    button so clicking it doesn't toggle the section open/closed. */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategoryAll(cat.id);
                  }}
                  aria-label={
                    bulkState === "all"
                      ? interpolate(t.categoryDeselectAllAriaTemplate, { label: cat.label })
                      : interpolate(t.categorySelectAllAriaTemplate, { label: cat.label })
                  }
                  title={
                    // Lowercase the label for natural English sentence flow
                    // ("All 12 finance modules…"). Translation pipeline can
                    // adjust per-locale casing if the target language needs it.
                    bulkState === "all"
                      ? interpolate(t.categoryAllSelectedTitleTemplate, { total: catTotal, label: cat.label.toLowerCase() })
                      : interpolate(t.categorySelectAllTitleTemplate, { total: catTotal, label: cat.label.toLowerCase() })
                  }
                  className="shrink-0 flex items-center justify-center px-3 hover:bg-papaya/8 transition-colors group"
                >
                  <span
                    aria-hidden
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      bulkState === "all"
                        ? "bg-papaya border-papaya"
                        : bulkState === "some"
                          ? "bg-papaya/15 border-papaya"
                          : "border-corbeau/25 group-hover:border-papaya/60"
                    }`}
                  >
                    {bulkState === "all" && (
                      <svg viewBox="0 0 12 12" className="w-3 h-3 text-corbeau" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M2 6.5L4.5 9L10 3.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {bulkState === "some" && (
                      <span className="w-2.5 h-0.5 rounded-full bg-papaya" />
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="flex-1 flex items-center justify-between gap-3 px-2 py-3 text-left hover:bg-cream transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-corbeau text-[0.95rem] tracking-[-0.01em]">
                      {cat.label}
                      {selectedInCat > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-papaya text-corbeau font-mono text-[0.68rem] font-bold align-middle">
                          {selectedInCat}
                        </span>
                      )}
                      <span className="ml-2 font-mono text-[0.62rem] font-normal tracking-[1.4px] uppercase text-corbeau/40 align-middle">
                        {interpolate(t.ofTotalTemplate, { total: catTotal })}
                      </span>
                    </p>
                    <p className="text-[0.78rem] text-night/60 mt-0.5">{cat.blurb}</p>
                  </div>
                  <span
                    aria-hidden
                    className={`shrink-0 text-corbeau/40 text-sm transition-transform pr-3 ${open ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </button>
              </div>

              {open && (
                <div className="border-t border-corbeau/8 divide-y divide-corbeau/6">
                  {modules.map((m) => {
                    const isSel = selected.has(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          isSel ? "bg-papaya/5" : "hover:bg-cream"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => toggleModule(m.id)}
                          className="mt-1 accent-papaya w-4 h-4 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="font-display font-semibold text-corbeau text-[0.92rem]">
                              {m.label}
                            </span>
                            {m.code && (
                              <span className="font-mono text-[0.7rem] text-corbeau/55 bg-cream px-1.5 py-0.5 rounded">
                                {m.code}
                              </span>
                            )}
                            {m.core && (
                              <span className="font-mono text-[0.62rem] uppercase tracking-[1.4px] text-papaya">
                                {t.coreBadge}
                              </span>
                            )}
                          </div>
                          <p className="text-[0.8rem] text-night/65 mt-0.5 leading-[1.45]">
                            {m.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {query.trim() && filtered.length === 0 && (
          <div className="rounded-lg border border-corbeau/10 bg-paper px-4 py-6 text-center">
            <p className="text-sm text-night/65">
              {/* The full message is in MESSAGES with the query quoted in
                  place; the trimmed query is interpolated literally. */}
              {interpolate(t.searchNoMatchTemplate, { query })}
            </p>
            <p className="text-[0.78rem] text-night/45 mt-1">
              {t.searchTryShorter}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
