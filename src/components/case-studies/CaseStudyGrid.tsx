"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
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
 * Empty state: friendly message + "Clear filters" affordance lives in
 * the parent page (not here) so the message can sit in the page rhythm
 * rather than inside the grid container.
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

  const isAnchor = variant === "anchor";

  // Empty state — only fires for filtered grids.
  if (!unfiltered && filtered.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <p className="font-mono text-[0.72rem] tracking-[2px] uppercase text-eyebrow mb-3">
          [ No matches ]
        </p>
        <h3 className="font-display font-bold text-corbeau text-[1.15rem] mb-2">
          No case studies match these filters.
        </h3>
        <p className="text-night text-[0.92rem]">
          Try removing one of the active filters above.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        isAnchor
          ? "grid grid-cols-1 md:grid-cols-2 gap-5"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      }
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {filtered.map((c) => (
          <motion.div
            key={c.slug}
            layout={!reduced}
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
