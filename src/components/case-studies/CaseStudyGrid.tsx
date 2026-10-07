"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  type CaseStudy,
  type Industry,
  type Region,
  type Service,
} from "@/lib/case-studies";
import CaseStudyCard from "./CaseStudyCard";

/**
 * Filterable grid for the case-study archive.
 *
 * State source of truth: URL query params (set by FilterChips).
 *   ?industry=defence,manufacturing&service=programme-recovery&region=gcc&sort=industry
 *
 * Layout reflow on filter change:
 *   - AnimatePresence handles enter/exit of filtered-out cards.
 *   - layout prop on each card auto-animates position changes when
 *     remaining cards reflow.
 *   - 400 ms ease-out-quart per the brief.
 *
 * Empty state: a coming-soon note with a "Clear filters" action.
 */

interface Props {
  /** Full archive (or anchor set) to filter against. */
  items: CaseStudy[];
  /** Card variant — "anchor" for the curated row, "compact" for archive. */
  variant: "anchor" | "compact";
  /** Optional: skip URL filtering and just render the given items in
   *  order. Used by the anchor row which is hand-picked. */
  unfiltered?: boolean;
}

type SortValue = "recent" | "industry" | "region";

function parseCsv(s: string | null): string[] {
  if (!s) return [];
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function matches(c: CaseStudy, filters: { industry: string[]; service: string[]; region: string[] }): boolean {
  if (filters.industry.length > 0 && !filters.industry.includes(c.industry)) return false;
  if (filters.region.length > 0 && !filters.region.includes(c.region)) return false;
  if (filters.service.length > 0) {
    // OR-match: a study qualifies if it offers any of the selected services.
    const hit = c.service.some((s) => filters.service.includes(s));
    if (!hit) return false;
  }
  return true;
}

function sortFn(sort: SortValue): (a: CaseStudy, b: CaseStudy) => number {
  if (sort === "industry") {
    return (a, b) => a.industry.localeCompare(b.industry);
  }
  if (sort === "region") {
    return (a, b) => a.region.localeCompare(b.region);
  }
  // recent — newest first by publishedAt
  return (a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0);
}

export default function CaseStudyGrid({ items, variant, unfiltered }: Props) {
  const reduced = useReducedMotion();
  const params = useSearchParams();
  const router = useRouter();

  const filtered = useMemo(() => {
    if (unfiltered) return items;
    const filters = {
      industry: parseCsv(params.get("industry")),
      service: parseCsv(params.get("service")),
      region: parseCsv(params.get("region")),
    };
    const sort = (params.get("sort") as SortValue) ?? "recent";
    return items.filter((c) => matches(c, filters as { industry: Industry[]; service: Service[]; region: Region[] })).sort(sortFn(sort));
  }, [items, params, unfiltered]);

  // Empty state: only for filtered grids. Clearing keeps the sort choice.
  if (!unfiltered && filtered.length === 0) {
    const clear = () => {
      const next = new URLSearchParams(params.toString());
      next.delete("industry");
      next.delete("service");
      next.delete("region");
      const qs = next.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    };
    return (
      <div className="nda-empty" role="status">
        <div className="nd-label">Coming soon</div>
        <h3>More case studies for this mix are on the way.</h3>
        <p>New programmes are being written up. Stay tuned, or clear a filter to see related work now.</p>
        <button type="button" className="nd-btn nd-btn-secondary" onClick={clear}>
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className={`nda-cs-grid ${variant}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        {filtered.map((c) => (
          <motion.div
            key={c.slug}
            layout={!reduced}
            style={{ display: "flex", minWidth: 0 }}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
            transition={{
              duration: reduced ? 0 : 0.4,
              ease: [0.22, 1, 0.36, 1],
              layout: { duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] },
            }}
          >
            <CaseStudyCard c={c} variant={variant} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
