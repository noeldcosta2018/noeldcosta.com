"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

/**
 * LeadCaptureModal — focused lead capture for both free and paid books.
 *
 * Fields:
 *   - Name (required)
 *   - Email (required, regex validated)
 *   - Consent checkbox (required)
 *
 * UX:
 *   - Backdrop click and Escape close
 *   - Body scroll locked while open
 *   - First input focused on open, focus restored to trigger on close
 *   - role="dialog" aria-modal="true" aria-labelledby
 *
 * Submission:
 *   - POST /api/books/leads
 *   - Free → success message + optional Download now button if signed URL returned
 *   - Paid → if Stripe wired and URL returned, redirect; else graceful fallback
 */

export interface LeadModalContext {
  bookSlug: string;
  bookTitle: string;
  bookType: "free" | "paid";
  price?: number;
}

interface Props {
  open: boolean;
  context: LeadModalContext | null;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

type Status = "idle" | "loading" | "success-free" | "success-paid" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LeadCaptureModal({
  open,
  context,
  onClose,
  triggerRef,
}: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Body scroll lock while open. Mirrors MobileDrawerScrollLock in Nav.tsx.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset form for each new open. Focus the first input.
  useEffect(() => {
    if (open) {
      setStatus("idle");
      setMessage("");
      setDownloadUrl(null);
      setName("");
      setEmail("");
      setConsent(false);
      const id = window.setTimeout(() => firstInputRef.current?.focus(), 20);
      return () => window.clearTimeout(id);
    } else {
      triggerRef.current?.focus?.();
    }
  }, [open, context?.bookSlug, triggerRef]);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !context) return null;

  const isPaid = context.bookType === "paid";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!context) return;
    if (status === "loading") return;

    if (!name.trim()) {
      setStatus("error");
      setMessage("Please enter your name.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    if (!consent) {
      setStatus("error");
      setMessage("Please accept the consent checkbox to continue.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const payload = {
      name: name.trim(),
      email: email.trim(),
      bookSlug: context.bookSlug,
      bookType: context.bookType,
      consentAccepted: true,
    };

    try {
      const res = await fetch("/api/books/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        downloadUrl?: string | null;
        message?: string;
        error?: string;
        checkoutUrl?: string;
      };

      if (!res.ok || !data.success) {
        setStatus("error");
        setMessage(data.error || data.message || "Something went wrong. Please try again.");
        return;
      }

      if (isPaid) {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
        setStatus("success-paid");
        setMessage(
          data.message ||
            "We have your details and will email the download link after payment.",
        );
        return;
      }

      setStatus("success-free");
      setDownloadUrl(data.downloadUrl ?? null);
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: "rgba(14,16,32,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="bg-paper rounded-2xl max-w-md w-full p-7 shadow-[0_24px_60px_rgba(14,16,32,0.25)] relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 w-11 h-11 rounded-full flex items-center justify-center text-corbeau hover:bg-cream transition-colors"
        >
          <span aria-hidden className="text-[1.6rem] leading-none">×</span>
        </button>

        {status === "success-free" ? (
          <div>
            <h2
              id="lead-modal-title"
              className="font-display font-black tracking-[-0.02em] text-corbeau text-[1.4rem] mb-2"
            >
              Sent. Check your inbox.
            </h2>
            <p className="text-night text-[0.95rem] leading-[1.6] mb-4">
              The download link for {context.bookTitle} is on its way.
            </p>
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.95rem] px-5 py-3 min-h-[44px] rounded-[10px] no-underline transition-all hover:bg-[#fb8843]"
              >
                Download now
              </a>
            )}
          </div>
        ) : status === "success-paid" ? (
          <div>
            <h2
              id="lead-modal-title"
              className="font-display font-black tracking-[-0.02em] text-corbeau text-[1.4rem] mb-2"
            >
              We have your details.
            </h2>
            <p className="text-night text-[0.95rem] leading-[1.6]">
              {message}
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <p className="font-mono text-[0.7rem] tracking-[2px] uppercase text-eyebrow mb-1.5">
                Requesting
              </p>
              <h2
                id="lead-modal-title"
                className="font-display font-black tracking-[-0.02em] text-corbeau text-[1.25rem] leading-[1.2]"
              >
                {context.bookTitle}
              </h2>
              {isPaid && typeof context.price === "number" && (
                <p className="font-mono text-[0.8rem] text-night mt-1">
                  ${context.price.toFixed(2)} ebook
                </p>
              )}
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
                Name
              </span>
              <input
                ref={firstInputRef}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="bg-paper border border-corbeau/[0.15] rounded-md px-3 py-3 text-[0.95rem] text-corbeau placeholder:text-silver focus:outline-none focus:border-papaya focus:shadow-[0_0_0_3px_rgba(252,152,90,0.10)] transition-all"
              />
            </label>

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
                className="bg-paper border border-corbeau/[0.15] rounded-md px-3 py-3 text-[0.95rem] text-corbeau placeholder:text-silver focus:outline-none focus:border-papaya focus:shadow-[0_0_0_3px_rgba(252,152,90,0.10)] transition-all"
              />
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#fc985a] cursor-pointer"
              />
              <span className="text-night text-[0.82rem] leading-[1.5]">
                I agree to receive emails from Noel D&apos;Costa related to SAP, ERP, AI, and career resources.
              </span>
            </label>

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.95rem] px-6 py-3 min-h-[44px] rounded-[10px] transition-all hover:bg-[#fb8843] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {status === "loading"
                ? "Sending…"
                : isPaid
                  ? "Continue to checkout"
                  : "Send me the book"}
            </button>

            {status === "error" && message && (
              <p role="alert" className="text-canyon text-[0.85rem] leading-[1.5]">
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
