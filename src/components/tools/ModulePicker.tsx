"use client";

import { useMemo, useState } from "react";
import {
  SAP_MODULES,
  SAP_MODULE_CATEGORIES,
  getCoreModules,
  type SapModule,
  type SapModuleCategory,
} from "@/lib/sap-modules";

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
          {value.length} selected
        </span>
      </div>

      {/* Search + quick actions */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules (e.g. Treasury, Payroll, EWM, Group Reporting)…"
            className="w-full rounded-md border border-corbeau/15 bg-paper px-3.5 py-2.5 text-sm font-medium text-corbeau placeholder:text-corbeau/35 focus:outline-none focus:border-papaya focus:ring-2 focus:ring-papaya/20 transition-colors"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={addCoreFinance}
            className="rounded-md border border-papaya/40 bg-papaya/8 px-3 py-2 text-xs font-semibold text-papaya hover:bg-papaya/15 transition-colors"
            title="Add the core Finance modules most ERPs start with"
          >
            + Add core finance
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={value.length === 0}
            className="rounded-md border border-corbeau/15 px-3 py-2 text-xs font-semibold text-night/70 hover:border-corbeau/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear
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
                title={`Remove ${m.label}`}
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
          const open = isOpen(cat.id);

          return (
            <div
              key={cat.id}
              className="rounded-lg border border-corbeau/10 bg-paper overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-cream transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-corbeau text-[0.95rem] tracking-[-0.01em]">
                    {cat.label}
                    {selectedInCat > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-papaya text-corbeau font-mono text-[0.68rem] font-bold align-middle">
                        {selectedInCat}
                      </span>
                    )}
                  </p>
                  <p className="text-[0.78rem] text-night/60 mt-0.5">{cat.blurb}</p>
                </div>
                <span
                  aria-hidden
                  className={`shrink-0 text-corbeau/40 text-sm transition-transform ${open ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </button>

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
                                Core
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
              No modules match <span className="font-semibold text-corbeau">&quot;{query}&quot;</span>.
            </p>
            <p className="text-[0.78rem] text-night/45 mt-1">
              Try shorter terms like &quot;treasury&quot;, &quot;payroll&quot;, &quot;ariba&quot;, or &quot;ewm&quot;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
