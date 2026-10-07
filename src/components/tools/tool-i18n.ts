import { translator } from "@/i18n";
import type { Locale } from "@/lib/content";
import { TOOL_COPY_EN, type ToolCopy, type ToolCopyText } from "./tool-copy";
import type { FieldDef } from "./ToolForm";

// Server only (reads the i18n dictionary). Translates the tool widget text
// for a page locale; the results are passed to the client tool components as
// props. English returns undefined so English pages keep their defaults.

export function toolCopy(locale: Locale): ToolCopy | undefined {
  if (locale === "en") return undefined;
  const tr = translator(locale);
  const copy = {} as ToolCopyText;
  for (const key of Object.keys(TOOL_COPY_EN) as (keyof ToolCopyText)[]) {
    copy[key] = tr(TOOL_COPY_EN[key]);
  }
  return { ...copy, englishLang: "en" };
}

/** Field labels, option labels and placeholders translated; names and values unchanged. */
export function translateFields(fields: readonly FieldDef[], locale: Locale): FieldDef[] | undefined {
  if (locale === "en") return undefined;
  const tr = translator(locale);
  return fields.map((f) => {
    const out = { ...f, label: tr(f.label) } as FieldDef;
    if ("placeholder" in f && f.placeholder) (out as { placeholder?: string }).placeholder = tr(f.placeholder);
    if ("options" in f) {
      (out as { options: { value: string; label: string }[] }).options = f.options.map((o) => ({
        value: o.value,
        label: tr(o.label),
      }));
    }
    return out;
  });
}

/** Every English string a field list shows (for the translation list). */
export function fieldStrings(fields: readonly FieldDef[]): string[] {
  const out: string[] = [];
  for (const f of fields) {
    out.push(f.label);
    if ("placeholder" in f && f.placeholder) out.push(f.placeholder);
    if ("options" in f) for (const o of f.options) out.push(o.label);
  }
  return out;
}
