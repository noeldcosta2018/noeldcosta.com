"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";
import {
  INDUSTRY_LABEL,
  REGION_LABEL,
  SERVICE_LABEL,
  type Industry,
  type Region,
  type Service,
} from "@/lib/case-studies";

/**
 * Sticky filter bar for the case-study portfolio.
 *
 * Filter UX:
 *  - Three chip dropdowns: Industry, Service, Region. Multi-select.
 *  - Active filters mirror to URL query params (?industry=defence,manufacturing)
 *    so URLs are shareable.
 *  - Active-filter pills sit below the chip bar with a remove button.
 *  - "All" clears every filter.
 *  - Sort dropdown (Recent / Industry / Region).
 *
 * Glass surface matching the nav. Sticks under the fixed nav (top: var(--nav))
 * while the archive is on screen.
 *
 * Mobile (< 768px): chips collapse into a single "Filters" button that opens
 * a bottom sheet listing every option.
 */

const INDUSTRIES: { value: Industry; label: string }[] = (
  Object.keys(INDUSTRY_LABEL) as Industry[]
).map((v) => ({ value: v, label: INDUSTRY_LABEL[v] }));

const SERVICES: { value: Service; label: string }[] = (
  Object.keys(SERVICE_LABEL) as Service[]
).map((v) => ({ value: v, label: SERVICE_LABEL[v] }));

const REGIONS: { value: Region; label: string }[] = (
  Object.keys(REGION_LABEL) as Region[]
).map((v) => ({ value: v, label: REGION_LABEL[v] }));

const SORTS = [
  { value: "recent", label: "Recent" },
  { value: "industry", label: "Industry" },
  { value: "region", label: "Region" },
] as const;

type SortValue = (typeof SORTS)[number]["value"];

function parseCsv(s: string | null): string[] {
  if (!s) return [];
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

/** Update one query param without dropping the others. Empty value
 *  removes the param entirely so URLs stay clean. */
function buildUrl(
  current: URLSearchParams,
  patch: Record<string, string | null>
): string {
  const next = new URLSearchParams(current);
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === "") next.delete(k);
    else next.set(k, v);
  }
  const qs = next.toString();
  return qs ? `?${qs}` : "?";
}

interface PopoverProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}

function ChipPopover({ label, options, selected, onChange }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const panelId = useId();

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (v: string) => {
    if (selected.includes(v)) onChange(selected.filter((x) => x !== v));
    else onChange([...selected, v]);
  };

  const count = selected.length;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className={count > 0 ? "nda-fbtn on" : "nda-fbtn"}
      >
        {label}
        {count > 0 && <span className="count">{count}</span>}
        <ChevronDown size={14} aria-hidden />
      </button>

      {open && (
        <div id={panelId} role="group" aria-label={label} className="nda-pop">
          {options.map((opt) => (
            <label key={opt.value} className="nda-opt">
              <input type="checkbox" checked={selected.includes(opt.value)} onChange={() => toggle(opt.value)} />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileFilterSection({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <fieldset className="grp" style={{ border: 0, margin: 0 }}>
      <legend className="nd-label" style={{ padding: "0 0 6px" }}>
        {title}
      </legend>
      {options.map((opt) => (
        <label key={opt.value} className="nda-opt">
          <input type="checkbox" checked={selected.includes(opt.value)} onChange={() => onToggle(opt.value)} />
          <span>{opt.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

function MobileSheet({
  industries,
  services,
  regions,
  onChange,
  onClear,
  onClose,
}: {
  industries: string[];
  services: string[];
  regions: string[];
  onChange: (kind: "industry" | "service" | "region", next: string[]) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  // Body scroll lock so the page doesn't drift under the sheet; Escape closes.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const toggleIn = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  return (
    <div className="nda-sheet" role="dialog" aria-modal="true" aria-label="Filter case studies">
      <button type="button" aria-label="Close filters" onClick={onClose} className="scrim" />
      <div className="panel">
        <div className="top">
          <span className="nd-label" style={{ color: "var(--ink)" }}>
            Filters
          </span>
          <button type="button" onClick={onClose} aria-label="Close filters" className="nda-icon-btn">
            <X size={18} aria-hidden />
          </button>
        </div>
        <MobileFilterSection
          title="Industry"
          options={INDUSTRIES}
          selected={industries}
          onToggle={(v) => onChange("industry", toggleIn(industries, v))}
        />
        <MobileFilterSection
          title="Service"
          options={SERVICES}
          selected={services}
          onToggle={(v) => onChange("service", toggleIn(services, v))}
        />
        <MobileFilterSection
          title="Region"
          options={REGIONS}
          selected={regions}
          onToggle={(v) => onChange("region", toggleIn(regions, v))}
        />
        <div className="bottom">
          <button type="button" onClick={onClear} className="nd-btn nd-btn-secondary">
            Clear all
          </button>
          <button type="button" onClick={onClose} className="nd-btn nd-btn-primary">
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FilterChips() {
  const router = useRouter();
  const params = useSearchParams();

  const industries = parseCsv(params.get("industry"));
  const services = parseCsv(params.get("service"));
  const regions = parseCsv(params.get("region"));
  const sort = (params.get("sort") as SortValue) ?? "recent";

  const totalActive = industries.length + services.length + regions.length;

  const [mobileOpen, setMobileOpen] = useState(false);

  // useRouter.replace avoids polluting history: every checkbox tick
  // shouldn't add a back-button entry.
  const update = (patch: Record<string, string | null>) => {
    const url = buildUrl(new URLSearchParams(params.toString()), patch);
    router.replace(url, { scroll: false });
  };

  const setFilter = (kind: "industry" | "service" | "region", next: string[]) => {
    update({ [kind]: next.length === 0 ? null : next.join(",") });
  };

  const clearAll = () => {
    update({ industry: null, service: null, region: null });
  };

  const removePill = (kind: "industry" | "service" | "region", value: string) => {
    const current = { industry: industries, service: services, region: regions }[kind];
    setFilter(kind, current.filter((v) => v !== value));
  };

  return (
    <>
      <div className="nda-filter">
        <div className="nda-wrap row">
          {/* Desktop chip row */}
          <div className="chips nda-only-d" role="group" aria-label="Filter case studies">
            <span className="lbl">Filter</span>
            <button type="button" onClick={clearAll} aria-pressed={totalActive === 0} className="nda-fbtn">
              All
            </button>
            <ChipPopover
              label="Industry"
              options={INDUSTRIES}
              selected={industries}
              onChange={(next) => setFilter("industry", next)}
            />
            <ChipPopover
              label="Service"
              options={SERVICES}
              selected={services}
              onChange={(next) => setFilter("service", next)}
            />
            <ChipPopover
              label="Region"
              options={REGIONS}
              selected={regions}
              onChange={(next) => setFilter("region", next)}
            />
          </div>

          {/* Mobile single Filters button */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-haspopup="dialog"
            className={totalActive > 0 ? "nda-fbtn on nda-only-m" : "nda-fbtn nda-only-m"}
          >
            <SlidersHorizontal size={16} aria-hidden />
            Filters
            {totalActive > 0 && <span className="badge">{totalActive}</span>}
          </button>

          {/* Sort */}
          <div className="nda-sort">
            <label htmlFor="cs-sort" className="lbl nda-only-d">
              Sort
            </label>
            <select
              id="cs-sort"
              aria-label="Sort"
              value={sort}
              onChange={(e) => update({ sort: e.target.value === "recent" ? null : e.target.value })}
              className="nda-select"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active-filter pills, only when there's something to show */}
        {totalActive > 0 && (
          <div className="nda-wrap nda-active">
            {industries.map((v) => (
              <Pill key={`i-${v}`} label={INDUSTRY_LABEL[v as Industry] ?? v} onRemove={() => removePill("industry", v)} />
            ))}
            {services.map((v) => (
              <Pill key={`s-${v}`} label={SERVICE_LABEL[v as Service] ?? v} onRemove={() => removePill("service", v)} />
            ))}
            {regions.map((v) => (
              <Pill key={`r-${v}`} label={REGION_LABEL[v as Region] ?? v} onRemove={() => removePill("region", v)} />
            ))}
            <button type="button" onClick={clearAll} className="nda-clear">
              Clear all
            </button>
          </div>
        )}
      </div>

      {mobileOpen && (
        <MobileSheet
          industries={industries}
          services={services}
          regions={regions}
          onChange={setFilter}
          onClear={clearAll}
          onClose={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="nda-pill-x">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Remove ${label} filter`}>
        <X size={12} aria-hidden />
      </button>
    </span>
  );
}
