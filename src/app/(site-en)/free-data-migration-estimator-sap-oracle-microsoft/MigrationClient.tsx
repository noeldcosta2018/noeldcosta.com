"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import ToolForm, { type FieldDef } from "@/components/tools/ToolForm";
import ToolOutput from "@/components/tools/ToolOutput";
import { isTargetLanguage, type Locale } from "@/lib/locales";
import { useTranslation, stripMarkers } from "@/lib/i18n/useTranslation";

const SLUG = "free-data-migration-estimator-sap-oracle-microsoft";

function detectLocale(pathname: string | null): Locale {
  if (!pathname) return "en";
  const path = pathname.startsWith("/intl/") ? pathname.slice(5) : pathname;
  const first = path.split("/").filter(Boolean)[0];
  if (first && isTargetLanguage(first)) return first;
  return "en";
}

// migrationEstimator namespace wraps SAP/Oracle/Microsoft product names
// in <noTranslate> markers; strip them at the boundary.
function deepStripMarkers<T>(value: T): T {
  if (typeof value === "string") return stripMarkers(value) as unknown as T;
  if (value === null || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(value as Record<string, unknown>)) {
    out[k] = deepStripMarkers((value as Record<string, unknown>)[k]);
  }
  return out as T;
}

export default function MigrationClient() {
  const pathname = usePathname();
  const locale = detectLocale(pathname);
  const { messages } = useTranslation(locale);
  const m = useMemo(
    () => deepStripMarkers(messages.migrationEstimator),
    [messages.migrationEstimator],
  );

  const FIELDS: FieldDef[] = useMemo(
    () => [
      {
        kind: "select",
        name: "source",
        label: m.sourceLabel,
        options: [
          { value: "sap-ecc", label: m.sourceOptions.sapEcc },
          { value: "sap-s4hana", label: m.sourceOptions.sapS4hana },
          { value: "oracle-ebs", label: m.sourceOptions.oracleEbs },
          { value: "oracle-fusion", label: m.sourceOptions.oracleFusion },
          { value: "microsoft-dynamics-ax", label: m.sourceOptions.microsoftDynamicsAx },
          { value: "microsoft-dynamics-365", label: m.sourceOptions.microsoftDynamics365 },
          { value: "jd-edwards", label: m.sourceOptions.jdEdwards },
          { value: "peoplesoft", label: m.sourceOptions.peoplesoft },
          { value: "ifs", label: m.sourceOptions.ifs },
          { value: "infor", label: m.sourceOptions.infor },
          { value: "custom-legacy", label: m.sourceOptions.customLegacy },
          { value: "other", label: m.sourceOptions.other },
        ],
      },
      {
        kind: "text",
        name: "sourceVersion",
        label: m.sourceVersionLabel,
        placeholder: m.sourceVersionPlaceholder,
        maxLength: 60,
      },
      {
        kind: "select",
        name: "target",
        label: m.targetLabel,
        options: [
          { value: "sap-s4hana-cloud", label: m.targetOptions.sapS4hanaCloud },
          { value: "sap-s4hana-on-prem", label: m.targetOptions.sapS4hanaOnPrem },
          { value: "oracle-fusion-cloud", label: m.targetOptions.oracleFusionCloud },
          { value: "microsoft-dynamics-365", label: m.targetOptions.microsoftDynamics365 },
          { value: "other", label: m.targetOptions.other },
        ],
      },
      {
        kind: "number",
        name: "approximateMasterDataRecords",
        label: m.masterDataRecordsLabel,
        min: 0,
        max: 1000000000,
        step: 1000,
        placeholder: m.masterDataRecordsPlaceholder,
      },
      {
        kind: "number",
        name: "approximateTransactionalRecords",
        label: m.transactionalRecordsLabel,
        min: 0,
        max: 1000000000000,
        step: 100000,
        placeholder: m.transactionalRecordsPlaceholder,
      },
      {
        kind: "number",
        name: "customObjectsCount",
        label: m.customObjectsCountLabel,
        min: 0,
        max: 100000,
        step: 1,
        placeholder: m.customObjectsCountPlaceholder,
      },
      {
        kind: "number",
        name: "historicalYears",
        label: m.historicalYearsLabel,
        min: 0,
        max: 50,
        step: 1,
        placeholder: m.historicalYearsPlaceholder,
      },
      {
        kind: "select",
        name: "dataQuality",
        label: m.dataQualityLabel,
        options: [
          { value: "excellent-clean-documented", label: m.dataQualityOptions.excellent },
          { value: "good-minor-issues", label: m.dataQualityOptions.good },
          { value: "fair-known-gaps", label: m.dataQualityOptions.fair },
          { value: "poor-major-cleanup-needed", label: m.dataQualityOptions.poor },
          { value: "unknown", label: m.dataQualityOptions.unknown },
        ],
      },
      {
        kind: "tags",
        name: "languagesInScope",
        label: m.languagesInScopeLabel,
        placeholder: m.languagesInScopePlaceholder,
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
