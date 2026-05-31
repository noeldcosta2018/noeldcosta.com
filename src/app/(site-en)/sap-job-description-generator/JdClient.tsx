"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import ToolForm, { type FieldDef } from "@/components/tools/ToolForm";
import ToolOutput from "@/components/tools/ToolOutput";
import { isTargetLanguage, type Locale } from "@/lib/locales";
import { useTranslation, stripMarkers } from "@/lib/i18n/useTranslation";

const SLUG = "sap-job-description-generator";

function detectLocale(pathname: string | null): Locale {
  if (!pathname) return "en";
  const path = pathname.startsWith("/intl/") ? pathname.slice(5) : pathname;
  const first = path.split("/").filter(Boolean)[0];
  if (first && isTargetLanguage(first)) return first;
  return "en";
}

// jdGenerator namespace wraps SAP module codes (FI, CO, MM, SD, PP, QM,
// HCM, EWM, TM, ABAP, Fiori, UI5, CPI, BTP, GRC) in <noTranslate> markers
// — strip them at the boundary.
function deepStripMarkers<T>(value: T): T {
  if (typeof value === "string") return stripMarkers(value) as unknown as T;
  if (value === null || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(value as Record<string, unknown>)) {
    out[k] = deepStripMarkers((value as Record<string, unknown>)[k]);
  }
  return out as T;
}

export default function JdClient() {
  const pathname = usePathname();
  const locale = detectLocale(pathname);
  const { messages } = useTranslation(locale);
  const m = useMemo(
    () => deepStripMarkers(messages.jdGenerator),
    [messages.jdGenerator],
  );

  const FIELDS: FieldDef[] = useMemo(
    () => [
      {
        kind: "select",
        name: "roleFamily",
        label: m.roleFamilyLabel,
        options: [
          { value: "functional-fi-co", label: m.roleFamilyOptions.functionalFiCo },
          { value: "functional-mm-sd", label: m.roleFamilyOptions.functionalMmSd },
          { value: "functional-pp-qm", label: m.roleFamilyOptions.functionalPpQm },
          { value: "functional-hcm-successfactors", label: m.roleFamilyOptions.functionalHcmSuccessfactors },
          { value: "functional-ewm-tm", label: m.roleFamilyOptions.functionalEwmTm },
          { value: "technical-abap", label: m.roleFamilyOptions.technicalAbap },
          { value: "technical-basis", label: m.roleFamilyOptions.technicalBasis },
          { value: "technical-fiori-ui5", label: m.roleFamilyOptions.technicalFioriUi5 },
          { value: "technical-integration-cpi", label: m.roleFamilyOptions.technicalIntegrationCpi },
          { value: "technical-btp-developer", label: m.roleFamilyOptions.technicalBtpDeveloper },
          { value: "architect-solution", label: m.roleFamilyOptions.architectSolution },
          { value: "architect-enterprise", label: m.roleFamilyOptions.architectEnterprise },
          { value: "programme-manager", label: m.roleFamilyOptions.programmeManager },
          { value: "data-migration-lead", label: m.roleFamilyOptions.dataMigrationLead },
          { value: "security-grc", label: m.roleFamilyOptions.securityGrc },
          { value: "other", label: m.roleFamilyOptions.other },
        ],
      },
      {
        kind: "text",
        name: "roleTitle",
        label: m.roleTitleLabel,
        placeholder: m.roleTitlePlaceholder,
        maxLength: 160,
        required: true,
      },
      {
        kind: "select",
        name: "seniority",
        label: m.seniorityLabel,
        options: [
          { value: "junior", label: m.seniorityOptions.junior },
          { value: "mid", label: m.seniorityOptions.mid },
          { value: "senior", label: m.seniorityOptions.senior },
          { value: "principal-architect", label: m.seniorityOptions.principalArchitect },
          { value: "manager", label: m.seniorityOptions.manager },
          { value: "director", label: m.seniorityOptions.director },
        ],
      },
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
        name: "region",
        label: m.regionLabel,
        options: [
          { value: "uae", label: m.regionOptions.uae },
          { value: "saudi-arabia", label: m.regionOptions.saudiArabia },
          { value: "gcc-other", label: m.regionOptions.gccOther },
          { value: "united-kingdom", label: m.regionOptions.unitedKingdom },
          { value: "europe-other", label: m.regionOptions.europeOther },
          { value: "north-america", label: m.regionOptions.northAmerica },
          { value: "apac", label: m.regionOptions.apac },
          { value: "africa", label: m.regionOptions.africa },
          { value: "latam", label: m.regionOptions.latam },
        ],
      },
      {
        kind: "select",
        name: "remote",
        label: m.remoteLabel,
        options: [
          { value: "onsite", label: m.remoteOptions.onsite },
          { value: "hybrid", label: m.remoteOptions.hybrid },
          { value: "remote", label: m.remoteOptions.remote },
        ],
      },
      {
        kind: "boolean",
        name: "clearanceRequired",
        label: m.clearanceRequiredLabel,
      },
      {
        kind: "tags",
        name: "certifications",
        label: m.certificationsLabel,
        placeholder: m.certificationsPlaceholder,
      },
      {
        kind: "textarea",
        name: "keyProjects",
        label: m.keyProjectsLabel,
        placeholder: m.keyProjectsPlaceholder,
        maxLength: 1500,
        rows: 3,
      },
      {
        kind: "textarea",
        name: "notes",
        label: m.notesLabel,
        placeholder: m.notesPlaceholder,
        maxLength: 2000,
        rows: 2,
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
