// Interface text of the free-tool widgets (form, module picker, result bar).
// Browser-safe: client components import this file, so it must never import
// the i18n dictionary, content.ts or anything that reads the file system.
// Translated pages build a translated copy on the server (tool-i18n.ts) and
// pass it down as a prop; English pages use these defaults unchanged.
// Placeholders such as {count} and {label} are filled with fill().

export const TOOL_COPY_EN = {
  required: "Fields marked * are required.",
  select: "Select…",
  commaPlaceholder: "Comma-separated values",
  commaHint: "Separate multiple values with commas.",
  yes: "Yes",
  generating: "Generating…",
  yourResult: "Your result",
  copy: "Copy as markdown",
  copied: "Copied",
  print: "Print / save as PDF",
  startOver: "Start over",
  checkForm: "Please check the form and try again.",
  checkFormDetail: "Please check the form. {detail}",
  rateLimit: "You have reached the hourly limit for this tool. Please try again a little later.",
  timeout: "The result took longer than expected. Please try again.",
  failed:
    "The generator could not finish this request just now. Please try again in a moment, or get in touch and I will run it for you.",
  selectOption: "Please select an option",
  fieldRequired: "This field is required",
  // Module picker
  selected: "{count} selected",
  search: "Search {label}",
  searchModules: "Search modules (e.g. Treasury, Payroll, EWM, Group Reporting)…",
  addCoreFinance: "+ Add core finance",
  addCoreFinanceTitle: "Add the core Finance modules most ERPs start with",
  clear: "Clear",
  remove: "Remove {label}",
  selectAllIn: "Select all {label} modules",
  deselectAllIn: "Deselect all {label} modules",
  allSelectedTitle: "All {count} {label} modules selected · click to clear",
  selectAllTitle: "Select all {count} {label} modules",
  ofCount: "of {count}",
  core: "Core",
  noMatch: "Try another term for",
  noMatchHint: 'Shorter terms work best, like "treasury", "payroll", "ariba" or "ewm".',
};

export type ToolCopyText = typeof TOOL_COPY_EN;

export type ToolCopy = ToolCopyText & {
  /**
   * "en" on translated pages: set on content that stays English (the SAP
   * module catalogue, the generated result) so it is announced correctly.
   */
  englishLang?: "en";
};

/** Replace {name} placeholders in a translated template. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => (key in vars ? String(vars[key]) : m));
}
