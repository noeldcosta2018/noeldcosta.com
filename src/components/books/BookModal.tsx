"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

/**
 * BookModal — email capture modal for both free and paid books.
 *
 * Triggered by clicking any book CTA in the BookCarousel. Captures first
 * name + email + hidden metadata (book, type, price, UTM, source page).
 *
 * Behaviour:
 *   - Backdrop click closes
 *   - Escape key closes
 *   - Body scroll locked while open (same pattern as Nav.tsx mobile drawer)
 *   - First input focused on open, focus restored to trigger on close
 *   - ARIA role="dialog" aria-modal="true" labelled by the heading
 *
 * Backend:
 *   - Free books POST to /api/email/subscribe → "Sent. Check your inbox."
 *   - Paid books POST to /api/stripe/create-checkout-session. If Stripe
 *     is not yet wired the modal shows a graceful "available tomorrow"
 *     message rather than an opaque 500.
 */

export interface BookModalContext {
  bookSlug: string;
  bookTitle: string;
  bookType: "free" | "paid";
  /** Cheapest price for paid books. 0 for free. */
  price: number;
}

interface Props {
  open: boolean;
  context: BookModalContext | null;
  onClose: () => void;
  /** The element that opened the modal, so focus can be restored on close. */
  triggerRef: React.RefObject<HTMLElement | null>;
}

type Status = "idle" | "loading" | "success-free" | "success-paid" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Utm {
  source: string;
  medium: string;
  campaign: string;
}

function parseUtm(): Utm {
  if (typeof window === "undefined") {
    return { source: "", medium: "", campaign: "" };
  }
  const p = new URLSearchParams(window.location.search);
  return {
    source: p.get("utm_source") || "",
    medium: p.get("utm_medium") || "",
    campaign: p.get("utm_campaign") || "",
  };
}

export default function BookModal({ open, context, onClose, triggerRef }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  // Body scroll lock while the modal is open. Same pattern as
  // MobileDrawerScrollLock in Nav.tsx.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset form when a new book is selected. Keeps stale state out of
  // the next open.
  useEffect(() => {
    if (open) {
      setStatus("idle");
      setMessage("");
      setFirstName("");
      setEmail("");
      // Focus the first field after the dialog mounts.
      const id = window.setTimeout(() => firstInputRef.current?.focus(), 20);
      return () => window.clearTimeout(id);
    } else {
      // Restore focus to the trigger that opened the modal.
      triggerRef.current?.focus?.();
    }
  }, [open, context?.bookSlug, triggerRef]);

  // Escape to close.
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
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    if (!firstName.trim()) {
      setStatus("error");
      setMessage("Please add your first name.");
      return;
    }
    setStatus("loading");
    setMessage("");

    const utm = parseUtm();
    const payload = {
      firstName: firstName.trim(),
      email: email.trim(),
      bookTitle: context.bookTitle,
      bookSlug: context.bookSlug,
      bookType: context.bookType,
      price: context.price,
      sourcePage: "/books",
      timestamp: new Date().toISOString(),
      utmSource: utm.source,
      utmMedium: utm.medium,
      utmCampaign: utm.campaign,
    };

    const endpoint = isPaid
      ? "/api/stripe/create-checkout-session"
      : "/api/email/subscribe";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        url?: string;
      };
      if (isPaid) {
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setStatus("success-paid");
        setMessage(
          data.message ||
            "Stripe checkout is not yet wired. Your details are saved and we will email you when checkout opens.",
        );
        return;
      }
      if (!res.ok || !data.success) {
        setStatus("error");
        setMessage(data.message || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success-free");
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
      aria-hidden={false}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-modal-title"
        className="bg-paper rounded-2xl max-w-md w-full p-8 shadow-[0_24px_60px_rgba(14,16,32,0.25)] relative"
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
              id="book-modal-title"
              className="font-display font-black tracking-[-0.02em] text-corbeau text-[1.4rem] mb-2"
            >
              Sent. Check your inbox.
            </h2>
            <p className="text-night text-[0.95rem] leading-[1.6] mb-4">
              The download link for {context.bookTitle} is on its way.
            </p>
            <a
              href="/category/agentic-ai"
              className="inline-flex items-center text-papaya font-semibold text-[0.92rem] no-underline hover:underline"
            >
              While you wait, see what else I publish →
            </a>
          </div>
        ) : status === "success-paid" ? (
          <div>
            <h2
              id="book-modal-title"
              className="font-display font-black tracking-[-0.02em] text-corbeau text-[1.4rem] mb-2"
            >
              We have your details.
            </h2>
            <p className="text-night text-[0.95rem] leading-[1.6] mb-3">
              {message}
            </p>
            <p className="text-night/70 text-[0.85rem] leading-[1.55]">
              The book is available tomorrow. You will be first in line.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <p className="font-mono text-[0.7rem] tracking-[2px] uppercase text-eyebrow mb-1.5">
                {isPaid ? "Pre-order" : "Free download"}
              </p>
              <h2
                id="book-modal-title"
                className="font-display font-black tracking-[-0.02em] text-corbeau text-[1.4rem] leading-[1.2]"
              >
                {context.bookTitle}
              </h2>
              <p className="text-night text-[0.88rem] leading-[1.55] mt-1.5">
                {isPaid
                  ? "Tell us where to send the receipt and download link."
                  : "One email with the download link. No newsletter trap."}
              </p>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
                First name
              </span>
              <input
                ref={firstInputRef}
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Noel"
                autoComplete="given-name"
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

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.95rem] px-6 py-3 min-h-[44px] rounded-[10px] no-underline transition-all hover:bg-[#fb8843] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {status === "loading"
                ? "Sending…"
                : isPaid
                  ? "Continue to payment"
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
