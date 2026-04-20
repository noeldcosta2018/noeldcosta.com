"use client";

import { useState } from "react";
import ToolForm, { type FieldDef } from "@/components/tools/ToolForm";
import ToolOutput from "@/components/tools/ToolOutput";

const SLUG = "erp-implementation-cost-calculator";

const FIELDS: FieldDef[] = [
  {
    kind: "select",
    name: "sector",
    label: "Industry sector",
    options: [
      { value: "manufacturing", label: "Manufacturing" },
      { value: "retail", label: "Retail" },
      { value: "finance-banking", label: "Finance & Banking" },
      { value: "aviation-transport", label: "Aviation & Transport" },
      { value: "government-public", label: "Government & Public Sector" },
      { value: "utilities-energy", label: "Utilities & Energy" },
      { value: "telecom", label: "Telecom" },
      { value: "healthcare", label: "Healthcare" },
      { value: "oil-gas", label: "Oil & Gas" },
      { value: "construction-real-estate", label: "Construction & Real Estate" },
      { value: "professional-services", label: "Professional Services" },
      { value: "other", label: "Other" },
    ],
  },
  {
    kind: "select",
    name: "companySize",
    label: "Company size",
    options: [
      { value: "small-50-250", label: "Small (50–250 employees)" },
      { value: "mid-250-1000", label: "Mid-size (250–1,000)" },
      { value: "large-1000-5000", label: "Large (1,000–5,000)" },
      { value: "enterprise-5000-plus", label: "Enterprise (5,000+)" },
    ],
  },
  {
    kind: "text",
    name: "currentSystem",
    label: "Current ERP / system",
    placeholder: "e.g. Oracle EBS R12, legacy custom, Excel",
    maxLength: 120,
    required: true,
  },
  {
    kind: "text",
    name: "targetSystem",
    label: "Target ERP system",
    placeholder: "e.g. SAP S/4HANA, Oracle Fusion, Microsoft D365",
    maxLength: 120,
    required: true,
  },
  {
    kind: "tags",
    name: "modules",
    label: "Modules in scope",
    placeholder: "Finance, Procurement, Manufacturing, HR, Sales, Logistics…",
  },
  {
    kind: "number",
    name: "userCount",
    label: "Named / concurrent user count",
    min: 1,
    max: 500000,
    step: 1,
    placeholder: "e.g. 500",
  },
  {
    kind: "multiselect",
    name: "regions",
    label: "Deployment regions",
    options: [
      { value: "uae", label: "UAE" },
      { value: "saudi-arabia", label: "Saudi Arabia" },
      { value: "gcc-other", label: "GCC (other)" },
      { value: "united-kingdom", label: "UK" },
      { value: "europe-other", label: "Europe (other)" },
      { value: "north-america", label: "North America" },
      { value: "apac", label: "APAC" },
      { value: "africa", label: "Africa" },
      { value: "latam", label: "LATAM" },
    ],
  },
  {
    kind: "number",
    name: "timelineMonths",
    label: "Target go-live timeline (months)",
    min: 3,
    max: 120,
    step: 1,
    placeholder: "e.g. 18",
  },
  {
    kind: "textarea",
    name: "notes",
    label: "Additional context (optional)",
    placeholder: "Integration requirements, compliance constraints, legacy complexity…",
    maxLength: 2000,
    rows: 3,
  },
];

export default function ErpCostClient() {
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
          Enter your programme details
        </h2>
        <ToolForm
          slug={SLUG}
          fields={FIELDS}
          submitLabel="Estimate my ERP cost"
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
