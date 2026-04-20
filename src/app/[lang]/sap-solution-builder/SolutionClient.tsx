"use client";

import { useState } from "react";
import ToolForm, { type FieldDef } from "@/components/tools/ToolForm";
import ToolOutput from "@/components/tools/ToolOutput";

const SLUG = "sap-solution-builder";

const FIELDS: FieldDef[] = [
  {
    kind: "textarea",
    name: "businessProblem",
    label: "Describe your business problem",
    placeholder: "e.g. Our finance close takes 12 days. We have 3 separate ERP systems across business units with no consolidation. Our procurement has no visibility into inventory levels…",
    maxLength: 4000,
    rows: 6,
  },
  {
    kind: "textarea",
    name: "currentLandscape",
    label: "Current technology landscape (optional)",
    placeholder: "e.g. SAP ECC 6.0 for Finance, Oracle for HR, custom WMS, Salesforce CRM, 50+ legacy interfaces…",
    maxLength: 2000,
    rows: 3,
  },
  {
    kind: "textarea",
    name: "constraints",
    label: "Constraints (optional)",
    placeholder: "e.g. Cannot go down for more than 4 hours, must retain 10-year data archive, team of 3 IT staff only…",
    maxLength: 1500,
    rows: 3,
  },
  {
    kind: "textarea",
    name: "regulatoryContext",
    label: "Regulatory / compliance context (optional)",
    placeholder: "e.g. ZATCA e-invoicing (Saudi Arabia), IFRS 16 lease accounting, FDA 21 CFR Part 11…",
    maxLength: 1000,
    rows: 2,
  },
  {
    kind: "select",
    name: "timelinePreference",
    label: "Timeline preference",
    options: [
      { value: "fast-6m", label: "Fast — first value in 6 months" },
      { value: "standard-12-18m", label: "Standard — 12–18 month programme" },
      { value: "strategic-24m-plus", label: "Strategic — 24+ month transformation" },
    ],
  },
  {
    kind: "select",
    name: "budgetBand",
    label: "Budget band",
    options: [
      { value: "under-500k", label: "Under $500K" },
      { value: "500k-2m", label: "$500K – $2M" },
      { value: "2m-10m", label: "$2M – $10M" },
      { value: "10m-plus", label: "$10M+" },
      { value: "unspecified", label: "Not yet defined" },
    ],
  },
  {
    kind: "textarea",
    name: "notes",
    label: "Anything else to consider (optional)",
    placeholder: "Preferred cloud provider, existing SAP licences, partner preferences, political constraints…",
    maxLength: 2000,
    rows: 2,
  },
];

export default function SolutionClient() {
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
          Describe your business problem
        </h2>
        <ToolForm
          slug={SLUG}
          fields={FIELDS}
          submitLabel="Build my SAP solution outline"
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
