import type { FieldDef } from "@/components/tools/ToolForm";

// SAP Job Description Generator: page text and form fields.
// Browser-safe (the client widget imports it) and server-importable (the
// English and translated routes read it; the server translates the labels
// for translated pages). Field names and option values are the tool API
// contract and never change with the locale.

export const TOOL = {
  slug: "sap-job-description-generator",
  label: "SAP Job Description Generator",
  description:
    "Role-accurate SAP job descriptions with compensation bands and interview focus areas, calibrated to seniority, region and the specific SAP role family.",
  title: "SAP job description",
  highlight: "generator.",
  group: "Generators",
};

export const HEADING = "Describe the role";
export const SUBMIT = "Generate job description";

export const FIELDS: FieldDef[] = [
  {
    kind: "select",
    name: "roleFamily",
    label: "Role family",
    options: [
      { value: "functional-fi-co", label: "Functional: FI / CO (Finance & Controlling)" },
      { value: "functional-mm-sd", label: "Functional: MM / SD (Materials & Sales)" },
      { value: "functional-pp-qm", label: "Functional: PP / QM (Production & Quality)" },
      { value: "functional-hcm-successfactors", label: "Functional: HCM / SuccessFactors" },
      { value: "functional-ewm-tm", label: "Functional: EWM / TM (Warehouse & Transport)" },
      { value: "technical-abap", label: "Technical: ABAP Developer" },
      { value: "technical-basis", label: "Technical: Basis / System Admin" },
      { value: "technical-fiori-ui5", label: "Technical: Fiori / UI5 Developer" },
      { value: "technical-integration-cpi", label: "Technical: Integration / CPI" },
      { value: "technical-btp-developer", label: "Technical: BTP Developer" },
      { value: "architect-solution", label: "Solution Architect" },
      { value: "architect-enterprise", label: "Enterprise Architect" },
      { value: "programme-manager", label: "Programme Manager" },
      { value: "data-migration-lead", label: "Data Migration Lead" },
      { value: "security-grc", label: "Security / GRC" },
      { value: "other", label: "Other" },
    ],
  },
  {
    kind: "text",
    name: "roleTitle",
    label: "Specific job title",
    placeholder: "e.g. Senior SAP FI/CO Consultant, SAP ABAP Developer",
    maxLength: 160,
    required: true,
  },
  {
    kind: "select",
    name: "seniority",
    label: "Seniority level",
    options: [
      { value: "junior", label: "Junior (2–4 years)" },
      { value: "mid", label: "Mid-level (4–7 years)" },
      { value: "senior", label: "Senior (7–12 years)" },
      { value: "principal-architect", label: "Principal / Architect (12+ years)" },
      { value: "manager", label: "Manager" },
      { value: "director", label: "Director" },
    ],
  },
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
    name: "region",
    label: "Hiring region",
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
    kind: "select",
    name: "remote",
    label: "Work arrangement",
    options: [
      { value: "onsite", label: "On-site" },
      { value: "hybrid", label: "Hybrid" },
      { value: "remote", label: "Remote" },
    ],
  },
  {
    kind: "boolean",
    name: "clearanceRequired",
    label: "Security clearance required",
  },
  {
    kind: "tags",
    name: "certifications",
    label: "Certifications to require or prefer",
    placeholder: "e.g. SAP Certified Application Associate FI, SAP BTP Developer",
  },
  {
    kind: "textarea",
    name: "keyProjects",
    label: "Key project context (optional)",
    placeholder: "e.g. S/4HANA greenfield implementation in manufacturing, RISE with SAP migration, Centre of Excellence setup…",
    maxLength: 1500,
    rows: 3,
  },
  {
    kind: "textarea",
    name: "notes",
    label: "Additional requirements (optional)",
    placeholder: "Language requirements, visa eligibility, team size, reporting line…",
    maxLength: 2000,
    rows: 2,
  },
];
