"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import ToolForm, { type FieldDef } from "@/components/tools/ToolForm";
import ToolOutput from "@/components/tools/ToolOutput";
import { isTargetLanguage, type Locale } from "@/lib/locales";
import { useTranslation, stripMarkers } from "@/lib/i18n/useTranslation";

const SLUG = "sap-implementation-cost-calculator";

// Auto-detect locale — Pass 2a/2b pattern.
function detectLocale(pathname: string | null): Locale {
  if (!pathname) return "en";
  const path = pathname.startsWith("/intl/") ? pathname.slice(5) : pathname;
  const first = path.split("/").filter(Boolean)[0];
  if (first && isTargetLanguage(first)) return first;
  return "en";
}

// Strip <noTranslate> wrapper tags from each string leaf. The
// sapCostCalculator namespace wraps SAP product names (SAP, S/4HANA,
// GROW, RISE, ECC, ABAP, Fiori, plus the region acronyms UAE, GCC, UK,
// APAC, LATAM) so the translation pipeline preserves them verbatim.
// Pass 2b-1a's deepStripMarkers pattern, repeated here.
function deepStripMarkers<T>(value: T): T {
  if (typeof value === "string") return stripMarkers(value) as unknown as T;
  if (value === null || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(value as Record<string, unknown>)) {
    out[k] = deepStripMarkers((value as Record<string, unknown>)[k]);
  }
  return out as T;
}

export default function SapCostClient() {
  const pathname = usePathname();
  const locale = detectLocale(pathname);
  const { messages } = useTranslation(locale);
  const m = useMemo(
    () => deepStripMarkers(messages.sapCostCalculator),
    [messages.sapCostCalculator],
  );

  // FIELDS is locale-dependent — rebuild from m on each locale change.
  // The structure matches the original Pass 1 array verbatim; only the
  // label / placeholder / option-label strings now come from MESSAGES.
  const FIELDS: FieldDef[] = useMemo(
    () => [
      {
        kind: "select",
        name: "sector",
        label: m.sectorLabel,
        options: [
          { value: "manufacturing", label: m.sectorOptions.manufacturing },
          { value: "retail", label: m.sectorOptions.retail },
          { value: "finance-banking", label: m.sectorOptions.financeBanking },
          { value: "aviation-transport", label: m.sectorOptions.aviationTransport },
          { value: "government-public", label: m.sectorOptions.governmentPublic },
          { value: "utilities-energy", label: m.sectorOptions.utilitiesEnergy },
          { value: "telecom", label: m.sectorOptions.telecom },
          { value: "healthcare", label: m.sectorOptions.healthcare },
          { value: "oil-gas", label: m.sectorOptions.oilGas },
          { value: "construction-real-estate", label: m.sectorOptions.constructionRealEstate },
          { value: "professional-services", label: m.sectorOptions.professionalServices },
          { value: "other", label: m.sectorOptions.other },
        ],
      },
      {
        kind: "select",
        name: "companySize",
        label: m.companySizeLabel,
        options: [
          { value: "small-50-250", label: m.companySizeOptions.smallUnder250 },
          { value: "mid-250-1000", label: m.companySizeOptions.midUnder1000 },
          { value: "large-1000-5000", label: m.companySizeOptions.largeUnder5000 },
          { value: "enterprise-5000-plus", label: m.companySizeOptions.enterprise5000Plus },
        ],
      },
      {
        kind: "select",
        name: "edition",
        label: m.editionLabel,
        options: [
          { value: "s4hana-cloud-public-grow", label: m.editionOptions.grow },
          { value: "s4hana-cloud-private-rise", label: m.editionOptions.rise },
          { value: "s4hana-on-premise", label: m.editionOptions.s4Onprem },
          { value: "ecc-brownfield-to-s4hana", label: m.editionOptions.eccBrownfield },
          { value: "unsure", label: m.editionOptions.unsure },
        ],
      },
      {
        kind: "text",
        name: "currentSystem",
        label: m.currentSystemLabel,
        placeholder: m.currentSystemPlaceholder,
        maxLength: 120,
        required: true,
      },
      {
        // SAP-expert module picker: search + categorised groups across
        // Finance, Procurement, Supply Chain, Sales/CX, HCM, Projects,
        // Analytics, Platform, Industry. Replaces the older free-text
        // tags input so the cost estimate is grounded in specific named
        // modules (Group Reporting separate from FI-GL, Treasury separate
        // from FSCM, etc.). The downstream LLM-driven cost estimator
        // receives human-readable module labels with codes.
        kind: "modulePicker",
        name: "modules",
        label: m.modulesLabel,
      },
      {
        kind: "select",
        name: "fioriScope",
        label: m.fioriScopeLabel,
        options: [
          { value: "minimal", label: m.fioriScopeOptions.minimal },
          { value: "selected-personas", label: m.fioriScopeOptions.selected },
          { value: "full-coverage", label: m.fioriScopeOptions.full },
        ],
      },
      {
        kind: "boolean",
        name: "cleanCore",
        label: m.cleanCoreLabel,
      },
      {
        kind: "text",
        name: "industrySolution",
        label: m.industrySolutionLabel,
        placeholder: m.industrySolutionPlaceholder,
        maxLength: 120,
      },
      {
        kind: "number",
        name: "userCount",
        label: m.userCountLabel,
        min: 1,
        max: 500000,
        step: 1,
        placeholder: m.userCountPlaceholder,
      },
      {
        kind: "multiselect",
        name: "regions",
        label: m.regionsLabel,
        options: [
          { value: "uae", label: m.regionsOptions.uae },
          { value: "saudi-arabia", label: m.regionsOptions.saudiArabia },
          { value: "gcc-other", label: m.regionsOptions.gccOther },
          { value: "united-kingdom", label: m.regionsOptions.unitedKingdom },
          { value: "europe-other", label: m.regionsOptions.europeOther },
          { value: "north-america", label: m.regionsOptions.northAmerica },
          { value: "apac", label: m.regionsOptions.apac },
          { value: "africa", label: m.regionsOptions.africa },
          { value: "latam", label: m.regionsOptions.latam },
        ],
      },
      {
        kind: "number",
        name: "timelineMonths",
        label: m.timelineMonthsLabel,
        min: 3,
        max: 120,
        step: 1,
        placeholder: m.timelineMonthsPlaceholder,
      },
      {
        kind: "textarea",
        name: "notes",
        label: m.notesLabel,
        placeholder: m.notesPlaceholder,
        maxLength: 2000,
        rows: 3,
      },
    ],
    [m],
  );

  const [markdown, setMarkdown] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setMarkdown("");
    setStreaming(false);
    setError("");
  }

  return (
    <div>
      <div className="bg-bone border border-corbeau/10 rounded-xl p-6 md:p-8">
        <h2 className="font-display font-bold text-corbeau text-xl tracking-tight mb-6">
          {m.formHeading}
        </h2>
        <ToolForm
          slug={SLUG}
          fields={FIELDS}
          submitLabel={m.submitLabel}
          onResult={(md) => {
            setMarkdown(md);
            setStreaming(false);
          }}
          onStreamChunk={(partial) => {
            setMarkdown(partial);
            setStreaming(true);
          }}
          onError={(msg) => {
            setError(msg);
            setStreaming(false);
          }}
          onSubmitting={(s) => {
            if (s) {
              setMarkdown("");
              setError("");
              setStreaming(false);
            }
          }}
        />
        {error && (
          <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
        )}
      </div>

      {markdown && (
        <ToolOutput
          markdown={markdown}
          isStreaming={streaming}
          onReset={reset}
        />
      )}
    </div>
  );
}
