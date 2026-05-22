import Image from "next/image";

/**
 * Homepage H-11 — Credentials + Featured On press strip.
 *
 * Editorial column layout (no card chrome) so the credentials read as
 * a serious credibility row, not a SaaS feature grid. Matches the visual
 * weight of ProblemStats: vertical dividers, no backgrounds, larger
 * icons, mono captions in eyebrow style.
 *
 * Press strip: full-colour logos at strict 32px height, even gaps,
 * cream tile behind each logo so multi-colour marks (LinkedIn blue,
 * MSN butterfly) sit on a consistent surface. The Next Disruption is
 * surfaced as "Also published in:" rather than mixed inline with
 * the logos (avoids the broken text-among-logos look).
 */

const CREDS: { label: string; sub: string; icon: React.ReactNode }[] = [
  {
    label: "CIMA & AICPA",
    sub: "Management accounting",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M12 20V10M18 20V4M6 20v-4" />
      </svg>
    ),
  },
  {
    label: "Masters in Accounting",
    sub: "Finance depth, not surface",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 1 4 3 6 3s6-2 6-3v-5" />
      </svg>
    ),
  },
  {
    label: "SAP Certified PM",
    sub: "Activate · SAFe · ITIL",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10" />
      </svg>
    ),
  },
  {
    label: "Solution Architect",
    sub: "Architecture across the stack",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M12 12h.01M17 12h.01M7 12h.01" />
      </svg>
    ),
  },
];

const PRESS: { name: string; src: string }[] = [
  { name: "SAP Press", src: "/press/sap-press.webp" },
  { name: "MSN", src: "/press/msn.webp" },
  { name: "LinkedIn", src: "/press/linkedin.webp" },
  { name: "IPS", src: "/press/ips.webp" },
  { name: "Techbullion", src: "/press/techbullion.webp" },
];

export default function Credentials() {
  return (
    <section
      className="bg-bone"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          [ 08 · Why this works ]
        </p>
        <h2
          aria-label="Senior on the system. Senior on the close."
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          <span aria-hidden>
            {"Senior on the system. "}
            <span className="cc-emphasis-italic">Senior on the close.</span>
          </span>
        </h2>
        <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-14">
          Most SAP consultants understand the system. Few understand the
          business. I have both.
        </p>

        {/* Editorial credential row — no cards, vertical dividers, large icons.
            Same composition rhythm as ProblemStats so the page reads as one
            continuous editorial sheet rather than a deck of marketing cards. */}
        <div className="grid grid-cols-4 max-md:grid-cols-2 max-md:gap-y-10">
          {CREDS.map((c, i) => (
            <div
              key={c.label}
              className={`
                ${i === 0 ? "pl-0" : "pl-[clamp(1rem,2.5vw,2.5rem)] border-l border-corbeau/[0.1]"}
                max-md:pl-0 max-md:border-l-0
                ${i % 2 === 0 ? "max-md:pr-6 max-md:border-r max-md:border-corbeau/[0.1]" : ""}
              `}
            >
              <span className="text-papaya block mb-4" aria-hidden>
                {c.icon}
              </span>
              <h4 className="font-display font-extrabold text-corbeau text-[1.1rem] tracking-[-0.02em] leading-[1.2] mb-1.5">
                {c.label}
              </h4>
              <p className="font-mono text-[0.78rem] text-eyebrow tracking-[0.5px] leading-[1.4]">
                {c.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Featured-on press strip. Full colour, strict 32px height per logo,
            even spacing. Each logo sits inside a cream tile so multi-colour
            marks (LinkedIn blue, MSN butterfly) read against a consistent
            surface. "The Next Disruption" lives below as a separate line so
            we don't mix logo+text in the same row. */}
        <div className="mt-20 pt-10 border-t border-corbeau/[0.1]">
          <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-eyebrow mb-6">
            Featured on
          </p>
          <ul className="flex flex-wrap items-center gap-3 list-none p-0 m-0">
            {PRESS.map((p) => (
              <li
                key={p.name}
                className="bg-paper border border-corbeau/[0.06] rounded-md h-14 px-5 flex items-center transition-colors hover:border-corbeau/[0.15]"
              >
                <Image
                  src={p.src}
                  alt={p.name}
                  width={160}
                  height={32}
                  className="object-contain max-w-[150px]"
                  style={{ height: 32, width: "auto" }}
                />
              </li>
            ))}
          </ul>
          <p className="font-mono text-[0.72rem] text-eyebrow tracking-[0.5px] mt-5">
            Also published in:{" "}
            <span className="text-corbeau/80 font-medium">
              The Next Disruption
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
