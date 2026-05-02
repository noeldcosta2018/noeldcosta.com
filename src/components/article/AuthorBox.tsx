import Image from "next/image";
import Link from "next/link";

/**
 * Combined end-of-article author + advisory CTA card.
 *
 * Single papaya-gradient card so the reader gets one clear signal:
 * "here's the person who wrote this, here's how to talk to them."
 *
 * Layout:
 *   - Left  → headshot, "Written by" eyebrow, name, short bio, secondary links
 *   - Right → CTA headline, one-liner body, primary dark button + secondary link
 *   - Mobile → stacked vertically (left above right)
 *
 * The card uses a warm papaya→canyon gradient so it reads as papaya-brand
 * without clashing with any inline papaya buttons in the article body.
 */
export default function AuthorBox({
  localePrefix,
  ctaTitle = "Running an ERP programme right now?",
  ctaBody = "If this article touched on a programme you are live in right now, a 30-minute conversation usually gets further than another week of internal analysis.",
}: {
  localePrefix: string;
  ctaTitle?: string;
  ctaBody?: string;
}) {
  return (
    <section
      className="mt-16 rounded-[20px] overflow-hidden shadow-[0_12px_40px_rgba(252,152,90,0.28)]"
      style={{ background: "linear-gradient(135deg, #fc985a 0%, #d9704a 100%)" }}
    >
      <div className="flex flex-col md:flex-row">
        {/* ── Left: author identity ── */}
        <div className="flex-1 p-8 md:p-10 md:border-r border-corbeau/[0.15]">
          <div className="flex items-center gap-4 mb-5">
            <div
              className="relative w-[72px] h-[72px] rounded-xl overflow-hidden border-2 flex-shrink-0"
              style={{ borderColor: "rgba(14,16,32,0.18)" }}
            >
              <Image
                src="/headshot.png"
                alt="Noel D'Costa"
                fill
                sizes="72px"
                className="object-cover object-top"
              />
            </div>
            <div>
              <p
                className="font-mono text-[0.65rem] font-medium tracking-[2.2px] uppercase mb-1"
                style={{ color: "rgba(14,16,32,0.55)" }}
              >
                Written by
              </p>
              <h3
                className="font-display font-black text-[1.25rem] tracking-[-0.03em] leading-[1.1]"
                style={{ color: "#0e1020" }}
              >
                Noel D&apos;Costa
              </h3>
            </div>
          </div>

          <p
            className="leading-[1.72] text-[0.95rem] mb-6 max-w-[34rem]"
            style={{ color: "rgba(14,16,32,0.75)" }}
          >
            25 years across SAP and Oracle ERP programmes in aviation,
            government, finance, retail, and manufacturing. Finance background.
            I help leadership teams scope transformations honestly, recover
            programmes in trouble, and build systems that survive their first
            year in production.
          </p>

          {/* Secondary mono links */}
          <div
            className="flex flex-wrap items-center gap-x-1 gap-y-1 font-mono text-[0.68rem] uppercase tracking-[1.6px]"
            style={{ color: "rgba(14,16,32,0.55)" }}
          >
            <Link
              href={`${localePrefix}/about`}
              className="px-2 py-1 rounded-md transition-colors hover:bg-corbeau/10"
              style={{ color: "inherit" }}
            >
              About Noel
            </Link>
            <span aria-hidden style={{ color: "rgba(14,16,32,0.3)" }}>·</span>
            <a
              href="https://www.linkedin.com/in/noeldcosta/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded-md transition-colors hover:bg-corbeau/10"
              style={{ color: "inherit" }}
            >
              LinkedIn
            </a>
            <span aria-hidden style={{ color: "rgba(14,16,32,0.3)" }}>·</span>
            <a
              href="https://www.youtube.com/@NoelDCostaERPAI"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded-md transition-colors hover:bg-corbeau/10"
              style={{ color: "inherit" }}
            >
              YouTube
            </a>
          </div>
        </div>

        {/* ── Right: advisory CTA ── */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          <h3
            className="font-display font-black text-[1.35rem] md:text-[1.55rem] tracking-[-0.03em] leading-[1.15] mb-4"
            style={{ color: "#0e1020" }}
          >
            {ctaTitle}
          </h3>
          <p
            className="leading-[1.72] text-[0.97rem] mb-7 max-w-[30rem]"
            style={{ color: "rgba(14,16,32,0.72)" }}
          >
            {ctaBody}
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <a
              href="https://calendly.com/noeldcosta/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] font-display font-bold text-[0.92rem] transition-all hover:-translate-y-px"
              style={{
                background: "#0e1020",
                color: "#f4ede4",
                boxShadow: "0 4px 18px rgba(14,16,32,0.28)",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 8px 28px rgba(14,16,32,0.4)";
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "#1c1e2e";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 4px 18px rgba(14,16,32,0.28)";
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "#0e1020";
              }}
            >
              Book a 30-min call
              <span aria-hidden className="text-[1.1em] leading-none">→</span>
            </a>

            <Link
              href={`${localePrefix}/category/case-studies`}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] font-semibold text-[0.92rem] transition-all hover:-translate-y-px"
              style={{
                background: "rgba(14,16,32,0.12)",
                color: "#0e1020",
                border: "1.5px solid rgba(14,16,32,0.2)",
              }}
            >
              See case studies
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
