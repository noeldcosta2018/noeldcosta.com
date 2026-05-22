"use client";

import { useState, type FormEvent } from "react";

/**
 * Email capture for a free book. POSTs to /api/email/subscribe (stub).
 *
 * Fields: email (required), first name (optional), experience dropdown
 * (optional). Submit → loading → success state. Success resets after
 * 5 seconds so the form is reusable if the visitor wants a different
 * book later in the page.
 *
 * No icons. Per CLAUDE.md / brief: lucide-react only when an icon is
 * functional, and "Send" doesn't need one.
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
}: {
  bookSlug: string;
  bookTitle: string;
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
      window.setTimeout(() => setStatus("idle"), 5000);
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
        <p className="text-night text-[0.9rem] leading-[1.55]">
          The download link for {bookTitle} is on its way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
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
            className="bg-paper border border-corbeau/[0.15] rounded-md px-3 py-2.5 text-[0.95rem] text-corbeau placeholder:text-silver focus:outline-none focus:border-papaya focus:shadow-[0_0_0_3px_rgba(252,152,90,0.1)] transition-all"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
            First name (optional)
          </span>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Noel"
            autoComplete="given-name"
            className="bg-paper border border-corbeau/[0.15] rounded-md px-3 py-2.5 text-[0.95rem] text-corbeau placeholder:text-silver focus:outline-none focus:border-papaya focus:shadow-[0_0_0_3px_rgba(252,152,90,0.1)] transition-all"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
          Years in ERP (optional)
        </span>
        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="bg-paper border border-corbeau/[0.15] rounded-md px-3 py-2.5 text-[0.95rem] text-corbeau focus:outline-none focus:border-papaya focus:shadow-[0_0_0_3px_rgba(252,152,90,0.1)] transition-all"
        >
          <option value="">Pick a range</option>
          {EXPERIENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center gap-4 flex-wrap mt-1">
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center bg-papaya text-corbeau font-bold text-[0.92rem] px-6 py-3 rounded-[10px] no-underline transition-all hover:bg-[#fb8843] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {status === "loading" ? "Sending…" : "Send me the book"}
        </button>
        <p className="text-night/70 text-[0.78rem] leading-[1.5] max-w-[300px]">
          One email with the download link. No newsletter trap.
        </p>
      </div>

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
