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
}: {
  bookSlug: string;
  tier: string;
  priceId: string | null;
  amount: number;
  label: string;
  variant?: "primary" | "secondary";
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

  const baseBtn =
    "inline-flex flex-col items-start text-left gap-0.5 px-5 py-3 rounded-[10px] no-underline transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0";
  const primaryBtn =
    "bg-papaya text-corbeau hover:bg-[#fb8843] hover:-translate-y-px";
  const secondaryBtn =
    "bg-transparent text-corbeau border border-corbeau/[0.2] hover:bg-corbeau/[0.04] hover:-translate-y-px";

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
