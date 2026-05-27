import { type Locale } from "@/lib/locales";
import { getMessages } from "@/lib/i18n/useTranslation";

// TODO F-09: replace text logos with SVG <img> tags when /public/logos/ is populated — see PRD.md F-09
// Client names are proper nouns — do-not-translate per the policy in
// _docs/audits/i18n-strings-audit-2026-05-26.md. They stay inline.
const LOGOS = [
  "EDGE Group",
  "Etihad Airways",
  "DXC Technology",
  "Dept. of Gov. Enablement",
  "Technology Innovation Institute",
  "Protiviti",
  "ADNOC",
  "PIF Entities",
  "Pepsi",
  "P&G",
  "United Arab Bank",
  "Etoile Group",
];

export default function LogoScroll({ locale = "en" }: { locale?: Locale }) {
  const m = getMessages(locale);
  const doubled = [...LOGOS, ...LOGOS];
  return (
    <div
      className="bg-cream border-t border-b border-corbeau/[0.04]"
      style={{ padding: "2.5rem clamp(1.5rem,5vw,4rem)" }}
    >
      <p className="text-center font-mono text-[0.72rem] text-eyebrow tracking-[2.5px] uppercase mb-5">
        {m.logoScroll.eyebrow}
      </p>
      {/* Edge mask fades the logo strip in/out at the sides instead of
          clipping abruptly. group + group-hover pauses the marquee when
          the user reads it. */}
      <div
        className="overflow-hidden group"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div className="flex w-max gap-14 animate-logo-scroll items-center group-hover:[animation-play-state:paused]">
          {doubled.map((name, i) => (
            <span
              key={i}
              className="font-display font-bold text-[0.95rem] text-night whitespace-nowrap opacity-35 hover:opacity-70 transition-opacity tracking-[-0.01em]"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
