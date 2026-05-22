/**
 * Treatment for the paid book — the full playbook.
 *
 * Distinct visual hierarchy from BookCard: darker corbeau panel so the
 * price tiers read as a separate offer rather than another free
 * download. Stripe is not wired yet — see CheckoutButton + the API
 * stub for the wire-up TODO.
 *
 * Pricing layout: three vertical pricing cards (Ebook / Paperback /
 * Hardcover bundle) in a row on desktop, stacked on mobile. The middle
 * "Paperback" tier carries the "Most popular" ribbon.
 *
 * Server component. CheckoutButton(s) are the client islands.
 */

import CheckoutButton from "./CheckoutButton";
import BookCover from "./BookCover";
import StatusBadge from "./StatusBadge";
import type { BookRecord } from "@/types/book";
import { coverExists } from "@/lib/books";

function formatMeta(book: BookRecord) {
  const fm = book.frontmatter;
  const parts: string[] = [];
  if (fm.pages) parts.push(`${fm.pages} pages`);
  if (fm.readingTimeMinutes) {
    const hrs = Math.floor(fm.readingTimeMinutes / 60);
    const mins = fm.readingTimeMinutes % 60;
    if (hrs && mins) parts.push(`${hrs}h ${mins}m read`);
    else if (hrs) parts.push(`${hrs}h read`);
    else parts.push(`${mins} min read`);
  }
  if (fm.formats && fm.formats.length) parts.push(fm.formats.join(" + "));
  if (fm.expectedAt) {
    const d = new Date(fm.expectedAt);
    if (!Number.isNaN(d.getTime())) {
      const month = d.toLocaleString("en-US", { month: "long" });
      parts.push(`Launches ${month} ${d.getFullYear()}`);
    }
  }
  return parts.join(" · ");
}

const VALUE_PROPS: Record<string, string> = {
  ebook: "Read on any device.",
  paperback: "Print copy plus the ebook.",
  hardcoverBundle: "Signed hardcover, ebook, and all updates.",
};

export default function PaidBook({ book }: { book: BookRecord }) {
  const fm = book.frontmatter;
  const hasImage = coverExists(fm.coverImage);
  const meta = formatMeta(book);
  const pricing = fm.pricing;
  const isAvailable = fm.status === "available";

  return (
    <article
      id={`book-${fm.slug}`}
      className="grid grid-cols-[320px_1fr] gap-12 max-lg:grid-cols-1 max-lg:gap-8 bg-corbeau text-bone rounded-2xl p-8 max-md:p-6"
    >
      <div className="max-lg:flex max-lg:justify-start">
        <BookCover book={fm} hasImage={hasImage} size="lg" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <StatusBadge available={isAvailable} surface="dark" />
          <span className="font-mono text-[0.66rem] tracking-[1.5px] uppercase text-papaya">
            Paid · ebook + print
          </span>
        </div>

        <h3
          className="font-display font-black tracking-[-0.03em] leading-[1.05] mb-3"
          style={{ fontSize: "clamp(1.7rem,3.2vw,2.4rem)" }}
        >
          {fm.title}
        </h3>

        {fm.subtitle && (
          <p
            className="font-display text-bone/80 leading-[1.3] mb-4"
            style={{ fontSize: "clamp(1rem,1.6vw,1.2rem)" }}
          >
            {fm.subtitle}
          </p>
        )}

        <p className="text-moon text-[1rem] leading-[1.7] mb-4 max-w-[580px]">
          {fm.summary}
        </p>

        <p className="font-mono text-[0.7rem] tracking-[1px] uppercase text-silver mb-5">
          For:{" "}
          <span className="text-bone normal-case tracking-normal font-sans">
            {fm.audience}
          </span>
        </p>

        {fm.whatsInside.length > 0 && (
          <div className="mb-6">
            <p className="font-mono text-[0.68rem] tracking-[1.5px] uppercase text-papaya mb-2.5">
              What is inside
            </p>
            <ol className="list-decimal pl-5 marker:text-papaya marker:font-mono marker:text-[0.78rem]">
              {fm.whatsInside.map((item, i) => (
                <li
                  key={i}
                  className="text-moon text-[0.92rem] leading-[1.6] mb-1.5"
                >
                  {item}
                </li>
              ))}
            </ol>
          </div>
        )}

        {meta && (
          <p className="font-mono text-[0.72rem] tracking-[1.5px] uppercase text-silver mb-5">
            {meta}
          </p>
        )}

        {pricing && (
          <div className="mt-auto pt-5 border-t border-white/[0.06]">
            <p className="font-mono text-[0.68rem] tracking-[1.5px] uppercase text-papaya mb-4">
              Pick a format
            </p>
            <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
              {pricing.ebook && (
                <PricingCard
                  bookSlug={fm.slug}
                  tier="ebook"
                  priceId={pricing.ebook.stripeId}
                  amount={pricing.ebook.amount}
                  label={pricing.ebook.label}
                  valueProp={VALUE_PROPS.ebook}
                  variant="secondary"
                  popular={false}
                />
              )}
              {pricing.paperback && (
                <PricingCard
                  bookSlug={fm.slug}
                  tier="paperback"
                  priceId={pricing.paperback.stripeId}
                  amount={pricing.paperback.amount}
                  label={pricing.paperback.label}
                  valueProp={VALUE_PROPS.paperback}
                  variant="primary"
                  popular={true}
                />
              )}
              {pricing.hardcoverBundle && (
                <PricingCard
                  bookSlug={fm.slug}
                  tier="hardcoverBundle"
                  priceId={pricing.hardcoverBundle.stripeId}
                  amount={pricing.hardcoverBundle.amount}
                  label={pricing.hardcoverBundle.label}
                  valueProp={VALUE_PROPS.hardcoverBundle}
                  variant="secondary"
                  popular={false}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Vertical pricing tile: label, price, one-line value prop, CTA.
 * The popular tier renders a small papaya ribbon at the top.
 */
function PricingCard({
  bookSlug,
  tier,
  priceId,
  amount,
  label,
  valueProp,
  variant,
  popular,
}: {
  bookSlug: string;
  tier: string;
  priceId: string | null;
  amount: number;
  label: string;
  valueProp: string;
  variant: "primary" | "secondary";
  popular: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-[12px] border p-4 ${
        popular
          ? "border-papaya/60 bg-white/[0.03]"
          : "border-white/[0.08] bg-white/[0.02]"
      }`}
    >
      {popular && (
        <span className="absolute -top-2.5 left-4 inline-flex items-center font-mono text-[0.62rem] tracking-[1.5px] uppercase bg-papaya text-corbeau px-2 py-0.5 rounded-full font-bold">
          Most popular
        </span>
      )}
      <p className="font-mono text-[0.66rem] tracking-[1.5px] uppercase text-papaya mb-2 mt-1">
        {label}
      </p>
      <p
        className="font-display font-black text-bone mb-2"
        style={{ fontSize: "1.6rem", lineHeight: 1 }}
      >
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        }).format(amount)}
      </p>
      <p className="text-moon text-[0.82rem] leading-[1.5] mb-4 min-h-[2.4em]">
        {valueProp}
      </p>
      <div className="mt-auto">
        <CheckoutButton
          bookSlug={bookSlug}
          tier={tier}
          priceId={priceId}
          amount={amount}
          label={label}
          variant={variant}
          onDark={true}
        />
      </div>
    </div>
  );
}
