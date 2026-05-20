"use client";

import { useEffect, useRef, useState } from "react";
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
 *  - Active-filter pills sit below the chip bar with × to remove.
 *  - "All" clears every filter.
 *  - Sort dropdown (Recent / Industry / Region).
 *
 * Glass surface — matches the nav's blur token. Sticks to top: 64
 * (under the fixed Nav) once scrolled past the hero.
 *
 * Mobile (≤ md): chips collapse into a single "Filters" button. Tap
 * opens a bottom sheet listing all options at once.
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
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={[
          "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[0.85rem] font-medium transition-all duration-200 min-h-[44px]",
          count > 0
            ? "border-papaya bg-papaya/10 text-corbeau"
            : "border-corbeau/15 bg-paper text-corbeau hover:border-corbeau/30",
        ].join(" ")}
      >
        {label}
        {count > 0 && (
          <span className="font-mono text-[0.7rem] tabular-nums opacity-70">
            ({count})
          </span>
        )}
        <ChevronDown
          size={14}
          aria-hidden
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable
          aria-label={label}
          className="absolute z-30 mt-2 left-0 w-[260px] rounded-xl border border-corbeau/10 bg-paper shadow-[0_12px_40px_rgba(14,16,32,0.10)] p-1.5"
        >
          {options.map((opt) => {
            const isSel = selected.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-cream/60 transition-colors"
              >
                <input
                  type="checkbox"
                  className="accent-papaya w-4 h-4 cursor-pointer"
                  checked={isSel}
                  onChange={() => toggle(opt.value)}
                />
                <span className="text-corbeau text-[0.88rem]">{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MobileSheet({
  industries,
  services,
  regions,
  onChange,
  onClose,
}: {
  industries: string[];
  services: string[];
  regions: string[];
  onChange: (kind: "industry" | "service" | "region", next: string[]) => void;
  onClose: () => void;
}) {
  // Body scroll lock so the page doesn't drift under the sheet.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const Section = ({
    title,
    options,
    selected,
    onToggle,
  }: {
    title: string;
    options: { value: string; label: string }[];
    selected: string[];
    onToggle: (v: string) => void;
  }) => (
    <div className="px-5 py-4 border-t border-corbeau/8 first:border-t-0">
      <p className="font-mono text-[0.72rem] tracking-[2px] uppercase text-eyebrow mb-3">
        {title}
      </p>
      <div className="grid grid-cols-1 gap-2">
        {options.map((opt) => {
          const isSel = selected.includes(opt.value);
          return (
            <label
              key={opt.value}
              className="flex items-center gap-3 py-2.5 cursor-pointer"
            >
              <input
                type="checkbox"
                className="accent-papaya w-5 h-5 cursor-pointer"
                checked={isSel}
                onChange={() => onToggle(opt.value)}
              />
              <span className="text-corbeau text-[0.95rem]">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col">
      {/* Scrim */}
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="flex-1 bg-corbeau/40 backdrop-blur-sm"
      />
      {/* Sheet */}
      <div className="bg-paper rounded-t-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-corbeau/8 sticky top-0 bg-paper">
          <p className="font-display font-bold text-corbeau text-[1.05rem]">
            Filters
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-cream transition-colors"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <Section
          title="Industry"
          options={INDUSTRIES}
          selected={industries}
          onToggle={(v) =>
            onChange(
              "industry",
              industries.includes(v) ? industries.filter((x) => x !== v) : [...industries, v]
            )
          }
        />
        <Section
          title="Service"
          options={SERVICES}
          selected={services}
          onToggle={(v) =>
            onChange(
              "service",
              services.includes(v) ? services.filter((x) => x !== v) : [...services, v]
            )
          }
        />
        <Section
          title="Region"
          options={REGIONS}
          selected={regions}
          onToggle={(v) =>
            onChange(
              "region",
              regions.includes(v) ? regions.filter((x) => x !== v) : [...regions, v]
            )
          }
        />
        <div className="sticky bottom-0 bg-paper border-t border-corbeau/8 p-4 flex gap-3">
          <button
            type="button"
            onClick={() => {
              onChange("industry", []);
              onChange("service", []);
              onChange("region", []);
            }}
            className="flex-1 py-3 rounded-lg border border-corbeau/15 text-corbeau text-[0.92rem] font-semibold hover:bg-cream transition-colors"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-lg bg-corbeau text-bone text-[0.92rem] font-semibold hover:bg-night transition-colors"
          >
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

  // useRouter.replace avoids polluting history — every checkbox tick
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
      <div
        className="sticky top-16 z-20 border-b border-corbeau/[0.06]"
        style={{
          background: "rgba(244, 237, 228, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-[clamp(1.5rem,5vw,4rem)] py-3 flex items-center justify-between gap-3">
          {/* Desktop chip row */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={clearAll}
              disabled={totalActive === 0}
              className={[
                "inline-flex items-center px-3.5 py-2 rounded-full border text-[0.85rem] font-medium transition-all duration-200 min-h-[44px]",
                totalActive === 0
                  ? "border-corbeau bg-corbeau text-bone cursor-default"
                  : "border-corbeau/15 bg-paper text-corbeau hover:border-corbeau/30",
              ].join(" ")}
            >
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
            className="md:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-corbeau/15 bg-paper text-corbeau text-[0.9rem] font-semibold min-h-[44px]"
          >
            <SlidersHorizontal size={16} aria-hidden />
            Filters
            {totalActive > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-papaya text-corbeau font-mono text-[0.7rem] font-bold">
                {totalActive}
              </span>
            )}
          </button>

          {/* Sort — desktop and mobile both, smaller on mobile */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) => update({ sort: e.target.value === "recent" ? null : e.target.value })}
              aria-label="Sort case studies"
              className="appearance-none bg-paper border border-corbeau/15 rounded-full pl-3.5 pr-8 py-2 text-[0.85rem] font-medium text-corbeau cursor-pointer hover:border-corbeau/30 transition-colors min-h-[44px]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%230e1020' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
              }}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active-filter pill row — only when there's something to show */}
        {totalActive > 0 && (
          <div className="max-w-[1200px] mx-auto px-[clamp(1.5rem,5vw,4rem)] pb-3 flex flex-wrap items-center gap-2">
            {industries.map((v) => (
              <Pill key={`i-${v}`} label={INDUSTRY_LABEL[v as Industry] ?? v} onRemove={() => removePill("industry", v)} />
            ))}
            {services.map((v) => (
              <Pill key={`s-${v}`} label={SERVICE_LABEL[v as Service] ?? v} onRemove={() => removePill("service", v)} />
            ))}
            {regions.map((v) => (
              <Pill key={`r-${v}`} label={REGION_LABEL[v as Region] ?? v} onRemove={() => removePill("region", v)} />
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow hover:text-papaya transition-colors px-2 py-1"
            >
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
          onClose={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-papaya/15 border border-papaya/30 text-corbeau text-[0.78rem] font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-papaya/30 transition-colors"
      >
        <X size={11} aria-hidden />
      </button>
    </span>
  );
}
