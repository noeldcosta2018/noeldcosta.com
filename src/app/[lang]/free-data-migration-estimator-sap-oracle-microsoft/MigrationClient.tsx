"use client";

import { useState } from "react";
import ToolForm, { type FieldDef } from "@/components/tools/ToolForm";
import ToolOutput from "@/components/tools/ToolOutput";

const SLUG = "free-data-migration-estimator-sap-oracle-microsoft";

const FIELDS: FieldDef[] = [
  {
    kind: "select",
    name: "source",
    label: "Source system",
    options: [
      { value: "sap-ecc", label: "SAP ECC" },
      { value: "sap-s4hana", label: "SAP S/4HANA" },
      { value: "oracle-ebs", label: "Oracle EBS" },
      { value: "oracle-fusion", label: "Oracle Fusion Cloud" },
      { value: "microsoft-dynamics-ax", label: "Microsoft Dynamics AX" },
      { value: "microsoft-dynamics-365", label: "Microsoft Dynamics 365" },
      { value: "jd-edwards", label: "JD Edwards" },
      { value: "peoplesoft", label: "PeopleSoft" },
      { value: "ifs", label: "IFS" },
      { value: "infor", label: "Infor" },
      { value: "custom-legacy", label: "Custom / legacy system" },
      { value: "other", label: "Other" },
    ],
  },
  {
    kind: "text",
    name: "sourceVersion",
    label: "Source system version (optional)",
    placeholder: "e.g. ECC 6.0 EhP8, AX 2012 R3",
    maxLength: 60,
  },
  {
    kind: "select",
    name: "target",
    label: "Target system",
    options: [
      { value: "sap-s4hana-cloud", label: "SAP S/4HANA Cloud" },
      { value: "sap-s4hana-on-prem", label: "SAP S/4HANA On-Premise" },
      { value: "oracle-fusion-cloud", label: "Oracle Fusion Cloud" },
      { value: "microsoft-dynamics-365", label: "Microsoft Dynamics 365" },
      { value: "other", label: "Other" },
    ],
  },
  {
    kind: "number",
    name: "approximateMasterDataRecords",
    label: "Approximate master data records",
    min: 0,
    max: 1000000000,
    step: 1000,
    placeholder: "e.g. 250000 (customers + materials + vendors combined)",
  },
  {
    kind: "number",
    name: "approximateTransactionalRecords",
    label: "Approximate transactional records",
    min: 0,
    max: 1000000000000,
    step: 100000,
    placeholder: "e.g. 5000000 (open + historical documents)",
  },
  {
    kind: "number",
    name: "customObjectsCount",
    label: "Number of custom objects / Z-tables / non-standard entities",
    min: 0,
    max: 100000,
    step: 1,
    placeholder: "e.g. 40",
  },
  {
    kind: "number",
    name: "historicalYears",
    label: "Years of historical data to carry forward",
    min: 0,
    max: 50,
    step: 1,
    placeholder: "e.g. 7",
  },
  {
    kind: "select",
    name: "dataQuality",
    label: "Self-assessed data quality",
    options: [
      { value: "excellent-clean-documented", label: "Excellent — clean, documented, consistent" },
      { value: "good-minor-issues", label: "Good — minor issues, mostly clean" },
      { value: "fair-known-gaps", label: "Fair — known gaps and inconsistencies" },
      { value: "poor-major-cleanup-needed", label: "Poor — major cleanup required" },
      { value: "unknown", label: "Unknown / not yet assessed" },
    ],
  },
  {
    kind: "tags",
    name: "languagesInScope",
    label: "Languages in scope",
    placeholder: "EN, AR, FR, DE, ZH… (ISO codes, comma-separated)",
  },
  {
    kind: "textarea",
    name: "notes",
    label: "Additional context (optional)",
    placeholder: "Cutover constraints, parallel-run requirements, regulatory archiving needs…",
    maxLength: 2000,
    rows: 3,
  },
];

export default function MigrationClient() {
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
          Enter your migration details
        </h2>
        <ToolForm
          slug={SLUG}
          fields={FIELDS}
          submitLabel="Estimate migration effort"
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
