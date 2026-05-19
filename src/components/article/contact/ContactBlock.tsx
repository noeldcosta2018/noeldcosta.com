import FadeUp from "@/components/article/FadeUp";

/**
 * Structured contact card for the About / story page. Fixes the
 * WordPress-import regressions where the contact section had:
 *   - email rendered as "devslemon997gmail.com" (missing @)
 *   - displayed phone "+1 415 230 2108" linked to "tel:+8801314835789"
 *   - "Website" item that linked to a mailto: URL
 *
 * Each entry has matching href and display text. Inline SVG icons
 * (no icon library) so this stays a zero-dependency component.
 * External links open in a new tab with rel="noopener noreferrer".
 */

type IconKey = "phone" | "mail" | "globe" | "linkedin" | "youtube";

interface ContactItem {
  label: string;
  display: string;
  href: string;
  icon: IconKey;
  external?: boolean;
}

const ITEMS: ContactItem[] = [
  {
    label: "Phone UAE",
    display: "+971 55 9545 609",
    href: "tel:+971559545609",
    icon: "phone",
  },
  {
    label: "Phone US",
    display: "+1 415 230 2108",
    href: "tel:+14152302108",
    icon: "phone",
  },
  {
    label: "Email",
    display: "solutions@noeldcosta.com",
    href: "mailto:solutions@noeldcosta.com",
    icon: "mail",
  },
  {
    label: "Website",
    display: "noeldcosta.com",
    href: "https://noeldcosta.com",
    icon: "globe",
    external: true,
  },
  {
    label: "LinkedIn",
    display: "linkedin.com/in/noeldcosta",
    href: "https://www.linkedin.com/in/noeldcosta/",
    icon: "linkedin",
    external: true,
  },
  {
    label: "YouTube",
    display: "@NoelDCostaERPAI",
    href: "https://www.youtube.com/@NoelDCostaERPAI",
    icon: "youtube",
    external: true,
  },
];

function Icon({ name }: { name: IconKey }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 6-10 7L2 6" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
        </svg>
      );
  }
}

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
            className="group flex items-center gap-3.5 rounded-xl border border-corbeau/10 bg-paper px-4 py-3.5 hover:border-papaya/60 hover:bg-cream transition-colors no-underline"
          >
            <span
              className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-papaya/10 text-papaya group-hover:bg-papaya group-hover:text-corbeau transition-colors"
              aria-hidden
            >
              <Icon name={item.icon} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[0.62rem] tracking-[1.6px] uppercase text-corbeau/50 leading-none mb-1">
                {item.label}
              </p>
              <p className="text-corbeau text-[0.92rem] md:text-[0.96rem] font-semibold group-hover:text-papaya transition-colors break-all leading-tight">
                {item.display}
              </p>
            </div>
          </a>
        ))}
      </div>
    </FadeUp>
  );
}
