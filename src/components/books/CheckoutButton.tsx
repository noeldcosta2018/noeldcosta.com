"use client";

import { useState } from "react";

/**
 * Checkout button for a paid book tier. POSTs to the stub
 * /api/stripe/create-checkout-session and redirects to the returned URL.
 *
 * No Stripe SDK on the client. The stub backend returns a placeholder
 * URL until real Stripe price IDs and webhooks land. See the API route
 * for the TODO checklist.
 */

export default function CheckoutButton({
  bookSlug,
  tier,
  priceId,
  amount,
  label,
  variant = "primary",
  onDark = false,
}: {
  bookSlug: string;
  tier: string;
  priceId: string | null;
  amount: number;
  label: string;
  variant?: "primary" | "secondary";
  /** When true the secondary variant inverts colours so it is visible on a corbeau surface (PaidBook). */
  onDark?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function onClick() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookSlug, tier, priceId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Checkout is not ready yet.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);

  // Mobile: label · price on one row (flex-row items-baseline gap-2).
  // Desktop (md+): two-line stack (flex-col items-start gap-0.5) for the
  // existing pricing-tile rhythm.
  const baseBtn =
    "inline-flex flex-row items-baseline gap-2 md:flex-col md:items-start md:gap-0.5 text-left px-5 py-3 rounded-[10px] no-underline transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0";
  const primaryBtn =
    "bg-papaya text-corbeau hover:bg-[#fb8843] hover:-translate-y-px";
  // Secondary on a light surface: corbeau text on transparent.
  const secondaryBtnLight =
    "bg-transparent text-corbeau border border-corbeau/[0.2] hover:bg-corbeau/[0.04] hover:-translate-y-px";
  // Secondary on a dark surface (PaidBook corbeau panel): bone text on transparent.
  const secondaryBtnDark =
    "bg-transparent text-bone border border-bone/30 hover:bg-bone/10 hover:border-bone/60 hover:-translate-y-px";
  const secondaryBtn = onDark ? secondaryBtnDark : secondaryBtnLight;

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={`${baseBtn} ${variant === "primary" ? primaryBtn : secondaryBtn}`}
      >
        <span className="font-mono text-[0.68rem] tracking-[1.5px] uppercase opacity-70">
          {label}
        </span>
        <span className="font-display font-bold text-[1rem]">
          {loading ? "Opening…" : formattedAmount}
        </span>
      </button>
      {error && (
        <p role="alert" className="text-canyon text-[0.78rem] mt-1.5 leading-[1.5]">
          {error}
        </p>
      )}
    </div>
  );
}
