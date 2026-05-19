import FadeUp from "@/components/article/FadeUp";

/**
 * Structured contact card for the About / story page. Fixes the
 * WordPress-import regressions where the contact section had:
 *   - email rendered as "devslemon997gmail.com" (missing @)
 *   - displayed phone "+1 415 230 2108" linked to "tel:+8801314835789"
 *   - "Website" item that linked to a mailto: URL
 *
 * Each entry has matching href and display text. All links open in a
 * new tab where it's an external destination. No new colors / fonts —
 * uses existing tokens (paper, corbeau, papaya, night).
 */

interface ContactItem {
  label: string;
  display: string;
  href: string;
  external?: boolean;
}

const ITEMS: ContactItem[] = [
  {
    label: "Phone UAE",
    display: "+971 55 9545 609",
    href: "tel:+971559545609",
  },
  {
    label: "Phone US",
    display: "+1 415 230 2108",
    href: "tel:+14152302108",
  },
  {
    label: "Email",
    display: "solutions@noeldcosta.com",
    href: "mailto:solutions@noeldcosta.com",
  },
  {
    label: "Website",
    display: "noeldcosta.com",
    href: "https://noeldcosta.com",
    external: true,
  },
  {
    label: "LinkedIn",
    display: "linkedin.com/in/noeldcosta",
    href: "https://www.linkedin.com/in/noeldcosta/",
    external: true,
  },
  {
    label: "YouTube",
    display: "@NoelDCostaERPAI",
    href: "https://www.youtube.com/@NoelDCostaERPAI",
    external: true,
  },
];

export default function ContactBlock() {
  return (
    <FadeUp as="section" className="not-prose my-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            {...(item.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="group flex items-baseline gap-3 rounded-xl border border-corbeau/10 bg-paper px-4 py-3.5 hover:border-papaya/60 hover:bg-cream transition-colors no-underline"
          >
            <span className="font-mono text-[0.62rem] tracking-[1.6px] uppercase text-papaya shrink-0 w-[80px]">
              {item.label}
            </span>
            <span className="text-corbeau text-[0.94rem] md:text-[0.98rem] font-medium group-hover:text-papaya transition-colors break-all">
              {item.display}
            </span>
          </a>
        ))}
      </div>
    </FadeUp>
  );
}
