"use client";

import { useState, type FormEvent } from "react";
import ModulePicker from "@/components/tools/ModulePicker";
import { getModuleById } from "@/lib/sap-modules";

export type FieldDef =
  | {
      kind: "text";
      name: string;
      label: string;
      placeholder?: string;
      maxLength?: number;
      required?: boolean;
    }
  | {
      kind: "textarea";
      name: string;
      label: string;
      placeholder?: string;
      maxLength?: number;
      rows?: number;
    }
  | {
      kind: "number";
      name: string;
      label: string;
      min?: number;
      max?: number;
      step?: number;
      placeholder?: string;
    }
  | {
      kind: "select";
      name: string;
      label: string;
      options: { value: string; label: string }[];
      /** Defaults to true. Set false for optional dropdowns. */
      required?: boolean;
    }
  | {
      kind: "multiselect";
      name: string;
      label: string;
      options: { value: string; label: string }[];
      /** Defaults to true (matches typical Zod min(1) cap). */
      required?: boolean;
    }
  | {
      kind: "tags";
      name: string;
      label: string;
      placeholder?: string;
    }
  | {
      kind: "boolean";
      name: string;
      label: string;
    }
  | {
      // SAP-specific module picker: search + categorised groups
      // (Finance, Procurement, Supply Chain, Sales/CX, HCM, Projects,
      // Analytics, Platform, Industry). Value is string[] of module
      // IDs. On submit, IDs are converted to human-readable labels
      // (with code where present) for the downstream tool API.
      kind: "modulePicker";
      name: string;
      label: string;
    };

export interface ToolFormProps {
  slug: string;
  fields: FieldDef[];
  submitLabel?: string;
  onResult: (markdown: string) => void;
  onStreamChunk?: (partial: string) => void;
  onError: (msg: string) => void;
  onSubmitting: (isSubmitting: boolean) => void;
}

function initialValue(field: FieldDef): unknown {
  switch (field.kind) {
    case "multiselect":
    case "modulePicker":
      return [];
    case "boolean":
      return false;
    case "number":
      return "";
    default:
      return "";
  }
}

export default function ToolForm({
  slug,
  fields,
  submitLabel = "Generate",
  onResult,
  onStreamChunk,
  onError,
  onSubmitting,
}: ToolFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    for (const f of fields) {
      init[f.name] = initialValue(f);
    }
    return init;
  });
  const [submitting, setSubmitting] = useState(false);

  function set(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function toggleMulti(name: string, value: string) {
    setValues((prev) => {
      const current = (prev[name] as string[]) ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [name]: next };
    });
  }

  function buildInputs(): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = values[field.name];
      if (field.kind === "number") {
        inputs[field.name] = raw === "" ? 0 : Number(raw);
      } else if (field.kind === "tags") {
        const str = (raw as string) || "";
        inputs[field.name] = str
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (field.kind === "modulePicker") {
        // Convert module IDs into human-readable labels (with SAP code
        // where present) so the downstream tool API receives a usable
        // module list. Example: ["fi-gl", "treasury"] →
        // ["Financial Accounting (FI-GL)", "Treasury & Risk Management (TRM)"]
        const ids = (raw as string[]) ?? [];
        inputs[field.name] = ids
          .map((id) => {
            const m = getModuleById(id);
            if (!m) return null;
            return m.code ? `${m.label} (${m.code})` : m.label;
          })
          .filter(Boolean);
      } else {
        inputs[field.name] = raw;
      }
    }
    return inputs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    onSubmitting(true);

    try {
      const res = await fetch(`/api/tools/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: buildInputs() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // Surface zod field-level errors when the API reports them.
        // Without this the user sees "validation failed" with no hint
        // about which field is wrong, which makes the tool feel broken.
        const e = err as {
          error?: string;
          details?: {
            fieldErrors?: Record<string, string[]>;
            formErrors?: string[];
          };
        };
        let message = e.error || `Request failed (${res.status})`;
        const fieldErrs = e.details?.fieldErrors ?? {};
        // Zod "Invalid option" messages dump the entire enum list which
        // is unreadable in a small error banner. Shorten to a clean
        // "Please select an option" so the user just knows the field
        // needs a value.
        const cleanMsg = (msg: string) =>
          msg.startsWith("Invalid option")
            ? "Please select an option"
            : msg.startsWith("Invalid input: expected")
              ? "This field is required"
              : msg;
        const fieldList = Object.entries(fieldErrs)
          .map(([field, errs]) => `${field}: ${errs.map(cleanMsg).join(", ")}`)
          .filter(Boolean);
        if (fieldList.length > 0) {
          message = `${message} — ${fieldList.join("; ")}`;
        } else if (e.details?.formErrors?.length) {
          message = `${message} — ${e.details.formErrors.join("; ")}`;
        }
        onError(message);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        onError("No response stream");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const chunk of lines) {
          const line = chunk.trim();
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;

          let event: { type: string; value?: string; message?: string };
          try {
            event = JSON.parse(jsonStr);
          } catch {
            continue;
          }

          if (event.type === "text" && event.value) {
            accumulated += event.value;
            onStreamChunk?.(accumulated);
          } else if (event.type === "done") {
            onResult(accumulated);
          } else if (event.type === "error") {
            onError(event.message || "Stream error");
            return;
          }
        }
      }
    } catch (err: unknown) {
      onError(
        err instanceof Error ? err.message : "Network error"
      );
    } finally {
      setSubmitting(false);
      onSubmitting(false);
    }
  }

  const inputBase =
    "w-full bg-paper border border-corbeau/15 rounded-lg px-3 py-2 text-corbeau text-sm placeholder:text-silver focus:outline-none focus:border-papaya transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => {
        // A field is "required" by default for selects, multiselects,
        // and texts/numbers explicitly marked required. Required-ness
        // is shown in the label and (for selects) enforced via the
        // browser's native form validation so the user can't reach the
        // server with an empty dropdown.
        const isRequired =
          field.kind === "select"
            ? field.required ?? true
            : field.kind === "multiselect"
              ? field.required ?? true
              : field.kind === "modulePicker"
                ? true
                : field.kind === "text"
                  ? Boolean(field.required)
                  : false;
        return (
        <div key={field.name}>
          {/* ModulePicker renders its own header (label + selected count),
              so suppress the standard uppercase mono label for that kind. */}
          {field.kind !== "modulePicker" && (
            <label className="block font-mono text-[0.72rem] font-semibold uppercase tracking-[1.5px] text-night mb-1.5">
              {field.label}
              {isRequired && (
                <span className="text-papaya ml-1" aria-hidden>*</span>
              )}
            </label>
          )}

          {field.kind === "text" && (
            <input
              type="text"
              className={inputBase}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              required={field.required}
              value={(values[field.name] as string) || ""}
              onChange={(e) => set(field.name, e.target.value)}
            />
          )}

          {field.kind === "textarea" && (
            <textarea
              className={inputBase}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              rows={field.rows ?? 4}
              value={(values[field.name] as string) || ""}
              onChange={(e) => set(field.name, e.target.value)}
            />
          )}

          {field.kind === "number" && (
            <input
              type="number"
              className={inputBase}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
              value={(values[field.name] as string | number) ?? ""}
              onChange={(e) => set(field.name, e.target.value)}
            />
          )}

          {field.kind === "select" && (
            <select
              className={inputBase}
              value={(values[field.name] as string) || ""}
              onChange={(e) => set(field.name, e.target.value)}
              required={isRequired}
            >
              <option value="" disabled>
                Select…
              </option>
              {field.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}

          {field.kind === "multiselect" && (
            <div className="flex flex-wrap gap-2">
              {field.options.map((o) => {
                const selected = (
                  (values[field.name] as string[]) ?? []
                ).includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleMulti(field.name, o.value)}
                    className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium border transition-colors ${
                      selected
                        ? "bg-papaya border-papaya text-corbeau"
                        : "bg-paper border-corbeau/15 text-night hover:border-papaya/50"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          )}

          {field.kind === "tags" && (
            <>
              <input
                type="text"
                className={inputBase}
                placeholder={field.placeholder ?? "Comma-separated values"}
                value={(values[field.name] as string) || ""}
                onChange={(e) => set(field.name, e.target.value)}
              />
              <p className="text-[0.7rem] text-silver mt-1">
                Separate multiple values with commas.
              </p>
            </>
          )}

          {field.kind === "boolean" && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-papaya"
                checked={(values[field.name] as boolean) || false}
                onChange={(e) => set(field.name, e.target.checked)}
              />
              <span className="text-sm text-night">Yes</span>
            </label>
          )}

          {field.kind === "modulePicker" && (
            <ModulePicker
              name={field.name}
              label={field.label}
              value={(values[field.name] as string[]) ?? []}
              onChange={(next) => set(field.name, next)}
            />
          )}
        </div>
        );
      })}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-papaya text-corbeau font-bold text-sm py-3 px-6 rounded-lg transition-all hover:bg-[#fdaa78] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Generating…" : submitLabel}
      </button>
    </form>
  );
}
