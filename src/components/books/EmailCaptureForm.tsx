"use client";

import { useState, type FormEvent } from "react";

/**
 * Email capture for a free book. POSTs to /api/email/subscribe (stub).
 *
 * Progressive disclosure: only the email + submit button render by
 * default. The "Add your role (optional)" toggle expands the first
 * name + experience fields. The POST body always includes every
 * field — empty strings when unfilled — so the backend log shape lets
 * us track email-only vs expanded conversion later.
 *
 * Touch targets meet the 44px minimum (py-3 inputs, py-3 button).
 *
 * No icons. Per CLAUDE.md / brief: lucide-react only when an icon is
 * functional, and the toggle marker is the native triangle.
 */

type Status = "idle" | "loading" | "success" | "error";

const EXPERIENCE_OPTIONS: { value: string; label: string }[] = [
  { value: "1-3", label: "1 to 3 years" },
  { value: "4-7", label: "4 to 7 years" },
  { value: "8-15", label: "8 to 15 years" },
  { value: "15+", label: "15+ years" },
];

export default function EmailCaptureForm({
  bookSlug,
  bookTitle,
  submitLabel = "Send me the book",
  helperText = "One email with the download link. No newsletter trap.",
  relatedCategory = "/category/agentic-ai",
}: {
  bookSlug: string;
  bookTitle: string;
  /** Submit button label. Featured book passes "Send me the PDF"; waitlist books pass "Notify me when it ships." */
  submitLabel?: string;
  /** Helper text shown below the submit button. */
  helperText?: string;
  /** Path the success-state inline link points to. Defaults to /category/agentic-ai. */
  relatedCategory?: string;
}) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [experience, setExperience] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, experience, bookSlug }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setEmail("");
      setFirstName("");
      setExperience("");
      window.setTimeout(() => setStatus("idle"), 8000);
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-corbeau/[0.08] bg-paper p-5">
        <p className="font-display font-bold text-corbeau text-[1rem] leading-[1.4] mb-1">
          Sent. Check your inbox.
        </p>
        <p className="text-night text-[0.9rem] leading-[1.55] mb-3">
          The download link for {bookTitle} is on its way.
        </p>
        <a
          href={relatedCategory}
          className="inline-flex items-center text-papaya font-semibold text-[0.88rem] no-underline hover:underline"
        >
          While you wait, see what else I publish →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
          Email
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          className="bg-paper border border-corbeau/[0.15] rounded-md px-3 py-3 text-[0.95rem] text-corbeau placeholder:text-silver focus:outline-none focus:border-papaya focus:shadow-[0_0_0_3px_rgba(252,152,90,0.1)] transition-all"
        />
      </label>

      <div className="flex flex-col gap-2 mt-1">
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.92rem] px-6 py-3 rounded-[10px] no-underline transition-all hover:bg-[#fb8843] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 self-start"
        >
          {status === "loading" ? "Sending…" : submitLabel}
        </button>
        <p className="text-night/70 text-[0.78rem] leading-[1.5] max-w-[360px]">
          {helperText}
        </p>
      </div>

      <details className="group mt-1 [&_summary::-webkit-details-marker]:hidden [&_summary]:list-none">
        <summary className="cursor-pointer font-mono text-[0.72rem] tracking-[1.5px] uppercase text-eyebrow hover:text-corbeau transition-colors select-none inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-flex w-3.5 h-3.5 rounded-full border border-current items-center justify-center text-[0.65rem] leading-none transition-transform group-open:rotate-45"
          >
            +
          </span>
          Add your role (optional)
        </summary>
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1 mt-3">
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
              First name
            </span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Noel"
              autoComplete="given-name"
              className="bg-paper border border-corbeau/[0.15] rounded-md px-3 py-3 text-[0.95rem] text-corbeau placeholder:text-silver focus:outline-none focus:border-papaya focus:shadow-[0_0_0_3px_rgba(252,152,90,0.1)] transition-all"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
              Years in ERP
            </span>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="bg-paper border border-corbeau/[0.15] rounded-md px-3 py-3 text-[0.95rem] text-corbeau focus:outline-none focus:border-papaya focus:shadow-[0_0_0_3px_rgba(252,152,90,0.1)] transition-all"
            >
              <option value="">Pick a range</option>
              {EXPERIENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </details>

      {status === "error" && errorMsg && (
        <p
          role="alert"
          className="text-canyon text-[0.85rem] leading-[1.5] mt-1"
        >
          {errorMsg}
        </p>
      )}
    </form>
  );
}
