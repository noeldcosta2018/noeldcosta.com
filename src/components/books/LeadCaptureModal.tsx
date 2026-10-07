"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

/**
 * LeadCaptureModal — focused lead capture for both free and paid books.
 *
 * Fields:
 *   - Name (required)
 *   - Email (required, regex validated)
 *   - Data-processing consent (required, GDPR Art. 6(1)(b)/(a))
 *   - Terms acceptance (required)
 *   - Marketing opt-in (optional, GDPR Art. 6(1)(a))
 *
 * Consent text is versioned via CONSENT_TEXT_VERSION. When the text
 * changes, bump the version and old rows remain auditable against the
 * prior wording.
 *
 * Motion: backdrop fades 150ms; dialog scales from 0.95 + fade 180ms.
 * Reverses on close. Disabled under prefers-reduced-motion.
 */

export const CONSENT_TEXT_VERSION = "2026-05-v1";

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

const SERVER_FAULT_MESSAGE =
  "Your request did not go through on my side. Please try again in a moment, or email noel@noeldcosta.com and I'll send it to you directly.";

export default function LeadCaptureModal({
  open,
  context,
  onClose,
  triggerRef,
}: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const reduceMotion = useReducedMotion();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dataConsent, setDataConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const closeAndReset = useCallback(() => {
    onClose();
    setStatus("idle");
    setMessage("");
    setDownloadUrl(null);
    setName("");
    setEmail("");
    setDataConsent(false);
    setTermsAccepted(false);
    setMarketingOptIn(false);
  }, [onClose]);

  // Body scroll lock while open. Mirrors MobileDrawerScrollLock in Nav.tsx.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Manage focus when the modal opens and closes.
  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => firstInputRef.current?.focus(), 20);
      return () => window.clearTimeout(id);
    } else {
      triggerRef.current?.focus?.();
    }
  }, [open, triggerRef]);

  // Escape closes; Tab stays inside the dialog while it is open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeAndReset();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeAndReset, open]);

  const isPaid = context?.bookType === "paid";

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
    if (!dataConsent) {
      setStatus("error");
      setMessage("Please tick the data-processing consent to continue.");
      return;
    }
    if (!termsAccepted) {
      setStatus("error");
      setMessage("Please accept the Terms of Use to continue.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const payload = {
      name: name.trim(),
      email: email.trim(),
      bookSlug: context.bookSlug,
      bookType: context.bookType,
      // consentAccepted preserved for backwards compat = both required boxes
      consentAccepted: dataConsent && termsAccepted,
      termsAccepted,
      marketingOptIn,
      consentTextVersion: CONSENT_TEXT_VERSION,
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
        // Server-side faults are shown as a friendly note; validation
        // messages (4xx) are specific and stay as the API wrote them.
        setMessage(
          res.status >= 500
            ? SERVER_FAULT_MESSAGE
            : data.error || data.message || "Something went wrong. Please try again.",
        );
        return;
      }

      if (isPaid) {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
        setStatus("success-paid");
        setMessage(
          "Paid editions are coming soon. I'll email you as soon as this one is ready.",
        );
        return;
      }

      setStatus("success-free");
      setDownloadUrl(data.downloadUrl ?? null);
    } catch {
      setStatus("error");
      setMessage("The connection dropped before your request arrived. Please try again.");
    }
  }

  return (
    <AnimatePresence>
      {open && context && (
        <motion.div
          key="backdrop"
          className="nda-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAndReset();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-modal-title"
            className="nda-dialog"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <span className="band" aria-hidden="true" />
            <button type="button" onClick={closeAndReset} aria-label="Close" className="close nda-icon-btn">
              <span aria-hidden="true" style={{ fontSize: 22, lineHeight: 1 }}>
                ×
              </span>
            </button>

            {status === "success-free" ? (
              <div role="status">
                <div className="nd-eyebrow">On its way</div>
                <h2 id="lead-modal-title">Sent. Check your inbox.</h2>
                <p className="sub">The download link for {context.bookTitle} is on its way.</p>
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nd-btn nd-btn-primary"
                    style={{ marginTop: 20 }}
                  >
                    Download now <span aria-hidden="true">↓</span>
                  </a>
                )}
              </div>
            ) : status === "success-paid" ? (
              <div role="status">
                <div className="nd-eyebrow">You&apos;re on the list</div>
                <h2 id="lead-modal-title">Thank you. I&apos;ll be in touch.</h2>
                <p className="sub">{message}</p>
              </div>
            ) : (
              <>
                <div className="nd-eyebrow">{isPaid ? "Paid edition" : "Free book"}</div>
                <h2 id="lead-modal-title">{context.bookTitle}</h2>
                {isPaid ? (
                  <p className="sub">
                    Paid editions are coming soon. Leave your email and I&apos;ll send it when it&apos;s ready.
                    {typeof context.price === "number" && ` Launch price $${context.price.toFixed(2)}.`}
                  </p>
                ) : (
                  <p className="sub">Leave your name and email and the PDF arrives in your inbox.</p>
                )}

                <form onSubmit={onSubmit} noValidate>
                  <label className="nda-field">
                    <span>Name</span>
                    <input
                      ref={firstInputRef}
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      className="nda-input"
                    />
                  </label>

                  <label className="nda-field">
                    <span>Email</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      autoComplete="email"
                      className="nda-input"
                    />
                  </label>

                  <div className="nda-checks">
                    <label className="nda-check">
                      <input
                        type="checkbox"
                        required
                        checked={dataConsent}
                        onChange={(e) => setDataConsent(e.target.checked)}
                      />
                      <span>
                        I agree to Noel D&apos;Costa storing my name and email to deliver this book and respond to my
                        request, in line with the <Link href="/privacy/">Privacy Policy</Link>.
                      </span>
                    </label>

                    <label className="nda-check">
                      <input
                        type="checkbox"
                        required
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                      />
                      <span>
                        I have read and accept the <Link href="/terms/">Terms of Use</Link>.
                      </span>
                    </label>

                    <label className="nda-check">
                      <input
                        type="checkbox"
                        checked={marketingOptIn}
                        onChange={(e) => setMarketingOptIn(e.target.checked)}
                      />
                      <span>
                        Send me occasional emails with new SAP, ERP, and AI resources. I can unsubscribe at any time.
                      </span>
                    </label>
                  </div>

                  <button type="submit" disabled={status === "loading"} className="nd-btn nd-btn-primary">
                    {status === "loading"
                      ? "Sending…"
                      : isPaid
                        ? "Notify me when it's ready"
                        : "Send me the book"}
                  </button>

                  {status === "error" && message && (
                    <p role="alert" className="nda-alert">
                      {message}
                    </p>
                  )}
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
